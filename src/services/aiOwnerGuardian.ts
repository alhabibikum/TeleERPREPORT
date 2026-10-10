import {
  AIAnomalyRecord,
  AIAuditTrailEntry,
  AnomalySeverity,
  AnomalyType,
  CorrectionStatus,
  FinancialAnomalySummary,
  SmartValidationCorrection,
  SmartValidationResult,
  UserErrorProfile,
  VoiceFeedbackConfig
} from '../types/guardian';
import { Customer, JournalEntry, Product, Sale, User } from '../types';

class AIOwnerGuardianService {
  private lastSpokenMap: Map<string, number> = new Map();

  // --- 1. VOICE-BASED AI FEEDBACK SYSTEM (Web Speech API) ---
  public speak(
    text: string,
    config: VoiceFeedbackConfig,
    options?: { urgent?: boolean; debounceSeconds?: number }
  ): void {
    if (!config.enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    const debounceMs = (options?.debounceSeconds ?? 5) * 1000;
    const lastSpoken = this.lastSpokenMap.get(text) || 0;

    // Prevent annoying repetition unless urgent
    if (!options?.urgent && now - lastSpoken < debounceMs) {
      return;
    }
    this.lastSpokenMap.set(text, now);

    try {
      // Cancel previous utterance if urgent
      if (options?.urgent) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = config.volume ?? 1.0;
      utterance.rate = config.rate ?? 0.95;

      // Select Bengali voice if possible
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(
        v => v.lang.startsWith('bn') || v.lang.includes('BD') || v.lang.includes('IN')
      );
      if (bnVoice) {
        utterance.voice = bnVoice;
        utterance.lang = bnVoice.lang;
      } else {
        utterance.lang = config.language || 'bn-BD';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('AI Guardian Speech Synthesis fallback/error:', e);
    }
  }

  // --- 2. HISTORICAL DATA ANALYSIS & PRICE BOUNDS ---
  public calculateProductBounds(
    product: Product,
    historicalSales: Sale[]
  ): {
    minSafePrice: number;
    maxSafePrice: number;
    historicalAvg: number;
    wholesaleSafePrice: number;
    retailSafePrice: number;
  } {
    const cost = product.cost_price || 0;
    const mrp = product.mrp || product.selling_price || cost * 1.2;

    // Filter historical items for this product
    const historicalItems: number[] = [];
    historicalSales.forEach(sale => {
      if (sale.status === 'posted') {
        sale.items.forEach(it => {
          if (it.product_id === product.id && it.unit_price > 0) {
            historicalItems.push(it.unit_price);
          }
        });
      }
    });

    const historicalAvg =
      historicalItems.length > 0
        ? historicalItems.reduce((a, b) => a + b, 0) / historicalItems.length
        : product.selling_price || cost * 1.15;

    // Safe bounds
    const minSafePrice = Math.max(cost, Math.round(cost * 1.02)); // Never sell below cost + 2%
    const maxSafePrice = Math.round(Math.max(mrp * 1.1, historicalAvg * 1.3));
    const wholesaleSafePrice = Math.round(cost * 1.06);
    const retailSafePrice = product.selling_price || Math.round(cost * 1.18);

    return {
      minSafePrice,
      maxSafePrice,
      historicalAvg: Math.round(historicalAvg),
      wholesaleSafePrice,
      retailSafePrice
    };
  }

  // --- 3. SMART DATA ENTRY VALIDATION (PRE-SUBMIT) ---
  public validateSaleDraft(params: {
    items: Array<{
      product: Product;
      quantity: number;
      unit_price: number;
      discount: number;
      selectedImeiId?: string;
    }>;
    customer: Customer;
    currentUser: User;
    userProfile?: UserErrorProfile;
    historicalSales: Sale[];
    allProducts: Product[];
  }): SmartValidationResult {
    const { items, customer, currentUser, userProfile, historicalSales } = params;
    const warnings: string[] = [];
    const corrections: SmartValidationCorrection[] = [];
    let severity: AnomalySeverity = 'low';
    let isLossSale = false;
    let isWholesaleMismatch = false;
    let isAbnormalDiscount = false;
    let voiceAlert = '';

    // Check if customer is wholesale
    const isWholesaleCustomer =
      customer.name.toLowerCase().includes('telecom') ||
      customer.name.toLowerCase().includes('enterprise') ||
      customer.name.toLowerCase().includes('wholesale') ||
      customer.code.includes('WHOLESALE') ||
      customer.credit_limit >= 100000;

    items.forEach((item, idx) => {
      const p = item.product;
      const bounds = this.calculateProductBounds(p, historicalSales);
      const effectivePrice = item.unit_price - item.discount / (item.quantity || 1);

      // Check 1: Loss Sale (selling price < cost price)
      if (effectivePrice < p.cost_price) {
        isLossSale = true;
        severity = 'critical';
        const lossAmount = (p.cost_price - effectivePrice) * item.quantity;
        warnings.push(
          `আইটেম #${idx + 1} (${p.name}): বিক্রয়মূল্য (৳${effectivePrice.toLocaleString('en-IN')}) ক্রয়মূল্যের (৳${p.cost_price.toLocaleString('en-IN')}) চেয়ে কম! ক্ষতি: ৳${lossAmount.toLocaleString('en-IN')}`
        );
        corrections.push({
          field: `items[${idx}].unit_price`,
          current_val: item.unit_price,
          suggested_val: bounds.minSafePrice,
          reason: `ক্রয়মূল্য ৳${p.cost_price} থেকে ন্যূনতম লাভজনক মূল্য ৳${bounds.minSafePrice}`,
          rule: 'RULE_NO_NEGATIVE_MARGIN'
        });
      }

      // Check 2: Customer Tier Pricing
      if (isWholesaleCustomer && item.unit_price > bounds.wholesaleSafePrice * 1.15) {
        // Charging wholesale customer regular retail price
        isWholesaleMismatch = true;
        if (severity !== 'critical') severity = 'medium';
        warnings.push(
          `হোলসেল কাস্টমার (${customer.name})-এর জন্য অনুমোদিত হোলসেল রেটের চেয়ে বেশি মূল্য ধরা হয়েছে (প্রস্তাবিত: ৳${bounds.wholesaleSafePrice.toLocaleString('en-IN')})`
        );
        corrections.push({
          field: `items[${idx}].unit_price`,
          current_val: item.unit_price,
          suggested_val: bounds.wholesaleSafePrice,
          reason: 'অনুমোদিত হোলসেল পলিসি অনুযায়ী মূল্য নির্ধারণ',
          rule: 'RULE_WHOLESALE_TIER_POLICY'
        });
      } else if (!isWholesaleCustomer && item.unit_price <= bounds.wholesaleSafePrice) {
        // Giving retail walk-in customer wholesale deep discount
        isWholesaleMismatch = true;
        if (severity !== 'critical') severity = 'high';
        warnings.push(
          `খুচরা গ্রাহককে অনুমতি ছাড়া হোলসেল বা অস্বাভাবিক কম মূল্যে বিক্রয় করা হচ্ছে (স্বাভাবিক রিটেল: ৳${bounds.retailSafePrice.toLocaleString('en-IN')})`
        );
        corrections.push({
          field: `items[${idx}].unit_price`,
          current_val: item.unit_price,
          suggested_val: bounds.retailSafePrice,
          reason: 'খুচরা গ্রাহকের জন্য স্ট্যান্ডার্ড বিক্রয়মূল্য নির্ধারণ',
          rule: 'RULE_RETAIL_TIER_PROTECTION'
        });
      }

      // Check 3: Abnormal Discount (>15% or discount > total margin)
      const maxAllowedDiscount = (item.unit_price - p.cost_price) * 0.5;
      if (item.discount > maxAllowedDiscount && item.discount > 500) {
        isAbnormalDiscount = true;
        if (severity === 'low') severity = 'medium';
        warnings.push(
          `আইটেম #${idx + 1} (${p.name}): অতিরিক্ত ছাড় ৳${item.discount.toLocaleString('en-IN')} যা নির্ধারিত মার্জিনের চেয়ে বেশি!`
        );
        corrections.push({
          field: `items[${idx}].discount`,
          current_val: item.discount,
          suggested_val: Math.max(0, Math.round(maxAllowedDiscount)),
          reason: 'নির্ধারিত মার্জিনের সর্বোচ্চ ৫০% পর্যন্ত অনুমোদিত ছাড়',
          rule: 'RULE_MAX_DISCOUNT_CAP'
        });
      }

      // Check 4: Out of bounds (e.g. typing 100 instead of 1000 or 10000)
      if (item.unit_price < bounds.historicalAvg * 0.4 || item.unit_price > bounds.historicalAvg * 2.5) {
        if (severity !== 'critical') severity = 'high';
        warnings.push(
          `ঐতিহাসিক গড় মূল্যের (৳${bounds.historicalAvg.toLocaleString('en-IN')}) সাথে বর্তমান মূল্যের (৳${item.unit_price.toLocaleString('en-IN')}) বড় ফারাক রয়েছে!`
        );
      }
    });

    // Escalating Warning System based on User Error Profile
    const prevMistakes = userProfile?.total_mistakes || 0;
    let warningLevel: 1 | 2 | 3 | 4 = 1;
    const isRecurrent = prevMistakes > 0 && (isLossSale || isWholesaleMismatch || isAbnormalDiscount);

    if (isLossSale) {
      warningLevel = 4; // Block submit for severe financial losses
      voiceAlert = 'সতর্কতা! আপনি পণ্যের বিক্রয়মূল্য অস্বাভাবিকভাবে কম দিয়েছেন যা প্রতিষ্ঠানের লোকসান করবে।';
    } else if (isRecurrent && prevMistakes >= 3) {
      warningLevel = 3; // Firm directive & notify owner
      voiceAlert = 'একই ধরনের ভুল বারবার হচ্ছে। অনুগ্রহ করে তথ্য যাচাই করুন এবং নিয়ম মেনে চালান করুন।';
    } else if (isRecurrent && prevMistakes >= 1) {
      warningLevel = 2; // Second time warning
      voiceAlert = 'সতর্কতা! এই লেনদেনে সম্ভাব্য মূল্য বা ছাড়ের অসংগতি রয়েছে। সংশোধন করুন।';
    } else if (warnings.length > 0) {
      warningLevel = 1; // Informative first time
      voiceAlert = 'আপনার এন্ট্রিতে একটি সম্ভাব্য ভুল শনাক্ত হয়েছে। অনুগ্রহ করে যাচাই করুন।';
    }

    const blocked = warningLevel === 4;

    return {
      is_valid: warnings.length === 0,
      blocked,
      severity,
      warning_level: warningLevel,
      warnings,
      voice_alert: voiceAlert,
      recommended_corrections: corrections,
      recurrent_mistake_detected: isRecurrent,
      user_error_profile: userProfile
    };
  }

  // --- 4. GENERAL LEDGER INTEGRITY AUDIT ---
  public auditGeneralLedger(
    journals: JournalEntry[]
  ): {
    unbalancedJournals: Array<{ id: string; entry_no: string; debit: number; credit: number; diff: number }>;
    duplicateEntries: Array<{ id: string; refId: string; entry_no: string }>;
    totalJournalsChecked: number;
    isHealthy: boolean;
  } {
    const unbalanced: Array<{ id: string; entry_no: string; debit: number; credit: number; diff: number }> = [];
    const seenRefs = new Map<string, string>();
    const duplicates: Array<{ id: string; refId: string; entry_no: string }> = [];

    journals.forEach(j => {
      const diff = Math.abs(j.total_debit - j.total_credit);
      if (diff > 0.05) {
        unbalanced.push({
          id: j.id,
          entry_no: j.entry_no,
          debit: j.total_debit,
          credit: j.total_credit,
          diff
        });
      }

      if (j.reference_id && j.reference_type !== 'manual') {
        const key = `${j.reference_type}_${j.reference_id}`;
        if (seenRefs.has(key)) {
          duplicates.push({ id: j.id, refId: j.reference_id, entry_no: j.entry_no });
        } else {
          seenRefs.set(key, j.entry_no);
        }
      }
    });

    return {
      unbalancedJournals: unbalanced,
      duplicateEntries: duplicates,
      totalJournalsChecked: journals.length,
      isHealthy: unbalanced.length === 0 && duplicates.length === 0
    };
  }

  // --- 5. FINANCIAL ANOMALY REPORT COMPILER ---
  public generateAnomalyReport(params: {
    anomalies: AIAnomalyRecord[];
    auditTrail: AIAuditTrailEntry[];
    journals: JournalEntry[];
    sales: Sale[];
    period: 'today' | 'weekly' | 'monthly' | 'all';
  }): FinancialAnomalySummary {
    const { anomalies, journals, sales, period } = params;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();

    const filteredAnomalies = anomalies.filter(a => {
      if (period === 'today') return a.created_at.startsWith(todayStr);
      if (period === 'weekly') return a.created_at >= oneWeekAgo;
      if (period === 'monthly') return a.created_at >= oneMonthAgo;
      return true;
    });

    const totalDetected = filteredAnomalies.length;
    const totalAutoCorrected = filteredAnomalies.filter(a => a.status === 'auto_corrected').length;
    const pendingApprovals = filteredAnomalies.filter(a => a.status === 'pending_approval' || a.status === 'detected').length;
    const totalLossPrevented = filteredAnomalies.reduce((sum, a) => sum + (a.financial_impact || 0), 0);

    const glAudit = this.auditGeneralLedger(journals);
    const voidedCount = sales.filter(s => s.status === 'voided').length;
    const restoredCount = sales.filter(s => !!s.restored_at).length;

    // User mistake rankings
    const userMistakeMap = new Map<
      string,
      { count: number; highest_severity: AnomalySeverity; common_error: string }
    >();

    filteredAnomalies.forEach(a => {
      const uName = a.user_name || 'System User';
      const existing = userMistakeMap.get(uName) || {
        count: 0,
        highest_severity: 'low' as AnomalySeverity,
        common_error: a.title
      };
      existing.count += 1;
      if (a.severity === 'critical') existing.highest_severity = 'critical';
      else if (a.severity === 'high' && existing.highest_severity !== 'critical') existing.highest_severity = 'high';
      else if (a.severity === 'medium' && existing.highest_severity === 'low') existing.highest_severity = 'medium';
      existing.common_error = a.title;
      userMistakeMap.set(uName, existing);
    });

    const userMistakesRanking = Array.from(userMistakeMap.entries())
      .map(([user_name, data]) => ({
        user_name,
        count: data.count,
        highest_severity: data.highest_severity,
        common_error: data.common_error
      }))
      .sort((a, b) => b.count - a.count);

    // Category discrepancies
    const categoryMap = new Map<string, { count: number; impact: number }>();
    filteredAnomalies.forEach(a => {
      const mod = a.module ? a.module.toUpperCase() : 'GENERAL';
      const existing = categoryMap.get(mod) || { count: 0, impact: 0 };
      existing.count += 1;
      existing.impact += a.financial_impact || 0;
      categoryMap.set(mod, existing);
    });

    const categoryDiscrepancies = Array.from(categoryMap.entries()).map(([cat, data]) => ({
      category_name: cat,
      anomaly_count: data.count,
      financial_impact: data.impact
    }));

    const unresolvedRecurrent = filteredAnomalies.filter(
      a => a.is_recurrent && (a.status === 'detected' || a.status === 'pending_approval')
    );

    return {
      period,
      total_anomalies_detected: totalDetected,
      total_auto_corrected: totalAutoCorrected,
      pending_manual_approvals: pendingApprovals,
      total_loss_prevented: totalLossPrevented,
      unbalanced_journals_count: glAudit.unbalancedJournals.length,
      voided_transactions_count: voidedCount,
      restored_transactions_count: restoredCount,
      user_mistakes_ranking: userMistakesRanking,
      category_discrepancies: categoryDiscrepancies,
      unresolved_recurrent_issues: unresolvedRecurrent
    };
  }
}

export const aiOwnerGuardian = new AIOwnerGuardianService();

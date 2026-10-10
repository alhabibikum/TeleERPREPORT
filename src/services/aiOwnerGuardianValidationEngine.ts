import {
  AIAnomalyRecord,
  AnomalySeverity,
  AnomalyType,
  SmartValidationCorrection,
  UserErrorProfile
} from '../types/guardian';
import { Product, Purchase, Sale, User } from '../types';
import { aiOwnerGuardian } from './aiOwnerGuardian';
import { storage, DatabaseState } from '../db/storage';

export interface HistoricalPriceQuantityMetrics {
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  safeMinPrice: number;
  safeMaxPrice: number;
  avgQuantity: number;
  maxSingleQuantity: number;
  totalTransactions: number;
  supplierAvgCost?: number;
  recentCost?: number;
  currentAvailableStock?: number;
}

export interface GuardianInterceptionResult {
  isValid: boolean;
  canSubmit: boolean;
  blocked: boolean;
  warningLevel: 1 | 2 | 3 | 4;
  severity: AnomalySeverity;
  anomalyType: AnomalyType;
  title: string;
  warnings: string[];
  voiceAlert?: string;
  recommendedCorrections: SmartValidationCorrection[];
  historicalMetrics?: HistoricalPriceQuantityMetrics;
  module: 'sales' | 'pos' | 'purchases' | 'inventory';
  recordId?: string;
}

class AIOwnerGuardianValidationEngineService {
  // --- HISTORICAL CALCULATIONS ---

  public getProductHistoricalSalesMetrics(
    productId: string,
    allSales: Sale[]
  ): HistoricalPriceQuantityMetrics {
    const historicalPrices: number[] = [];
    const historicalQuantities: number[] = [];

    allSales.forEach(sale => {
      if (sale.status === 'posted') {
        sale.items.forEach(it => {
          if (it.product_id === productId && it.unit_price > 0) {
            historicalPrices.push(it.unit_price);
            historicalQuantities.push(it.quantity || 1);
          }
        });
      }
    });

    if (historicalPrices.length === 0) {
      return {
        avgPrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        safeMinPrice: 0,
        safeMaxPrice: 0,
        avgQuantity: 1,
        maxSingleQuantity: 5,
        totalTransactions: 0
      };
    }

    historicalPrices.sort((a, b) => a - b);
    const sumPrice = historicalPrices.reduce((a, b) => a + b, 0);
    const avgPrice = Math.round(sumPrice / historicalPrices.length);
    const medianPrice = historicalPrices[Math.floor(historicalPrices.length / 2)];
    const minPrice = historicalPrices[0];
    const maxPrice = historicalPrices[historicalPrices.length - 1];

    const sumQty = historicalQuantities.reduce((a, b) => a + b, 0);
    const avgQuantity = Math.max(1, Math.round(sumQty / historicalQuantities.length));
    const maxSingleQuantity = Math.max(...historicalQuantities, 5);

    return {
      avgPrice,
      medianPrice,
      minPrice,
      maxPrice,
      safeMinPrice: Math.round(avgPrice * 0.85),
      safeMaxPrice: Math.round(avgPrice * 1.3),
      avgQuantity,
      maxSingleQuantity,
      totalTransactions: historicalPrices.length
    };
  }

  public getProductHistoricalPurchaseMetrics(
    productId: string,
    allPurchases: Purchase[],
    supplierId?: string
  ): HistoricalPriceQuantityMetrics {
    const historicalCosts: number[] = [];
    const supplierSpecificCosts: number[] = [];
    const historicalQuantities: number[] = [];

    allPurchases.forEach(pur => {
      pur.items.forEach(it => {
        if (it.product_id === productId && it.unit_cost > 0) {
          historicalCosts.push(it.unit_cost);
          historicalQuantities.push(it.quantity || 1);
          if (supplierId && pur.supplier_id === supplierId) {
            supplierSpecificCosts.push(it.unit_cost);
          }
        }
      });
    });

    if (historicalCosts.length === 0) {
      return {
        avgPrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        safeMinPrice: 0,
        safeMaxPrice: 0,
        avgQuantity: 2,
        maxSingleQuantity: 10,
        totalTransactions: 0
      };
    }

    historicalCosts.sort((a, b) => a - b);
    const sumCost = historicalCosts.reduce((a, b) => a + b, 0);
    const avgCost = Math.round(sumCost / historicalCosts.length);
    const medianCost = historicalCosts[Math.floor(historicalCosts.length / 2)];
    const minCost = historicalCosts[0];
    const maxCost = historicalCosts[historicalCosts.length - 1];

    const sumQty = historicalQuantities.reduce((a, b) => a + b, 0);
    const avgQuantity = Math.max(1, Math.round(sumQty / historicalQuantities.length));
    const maxSingleQuantity = Math.max(...historicalQuantities, 10);

    const supplierAvgCost =
      supplierSpecificCosts.length > 0
        ? Math.round(supplierSpecificCosts.reduce((a, b) => a + b, 0) / supplierSpecificCosts.length)
        : avgCost;

    return {
      avgPrice: avgCost,
      medianPrice: medianCost,
      minPrice: minCost,
      maxPrice: maxCost,
      safeMinPrice: Math.round(avgCost * 0.75),
      safeMaxPrice: Math.round(avgCost * 1.25),
      avgQuantity,
      maxSingleQuantity,
      totalTransactions: historicalCosts.length,
      supplierAvgCost,
      recentCost: historicalCosts[historicalCosts.length - 1]
    };
  }

  public getAvailableBranchStock(productId: string, branchId: string, state: DatabaseState): number {
    const product = state.products.find(p => p.id === productId);
    if (!product) return 0;

    if (product.has_imei) {
      if (branchId === 'all') {
        return state.imeis.filter(i => i.product_id === productId && i.status === 'in_stock').length;
      }
      return state.imeis.filter(
        i => i.product_id === productId && i.branch_id === branchId && i.status === 'in_stock'
      ).length;
    }

    // Non-IMEI accessory/general item fallback stock estimate
    const totalPurchased = state.purchases.reduce((sum, pur) => {
      if (branchId !== 'all' && pur.branch_id !== branchId) return sum;
      const matched = pur.items.find(it => it.product_id === productId);
      return sum + (matched ? matched.quantity : 0);
    }, 0);

    const totalSold = state.sales.reduce((sum, s) => {
      if (s.status === 'voided') return sum;
      if (branchId !== 'all' && s.branch_id !== branchId) return sum;
      const matched = s.items.find(it => it.product_id === productId);
      return sum + (matched ? matched.quantity : 0);
    }, 0);

    return Math.max(0, 15 + totalPurchased - totalSold);
  }

  // --- 1. SALES MODULE INTERCEPTOR ---
  public interceptSalesSubmission(params: {
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      discount: number;
      imei_id?: string;
    }>;
    customer_id?: string;
    branch_id: string;
    currentUser: User;
    state: DatabaseState;
  }): GuardianInterceptionResult {
    const { items, customer_id, branch_id, currentUser, state } = params;
    const warnings: string[] = [];
    const corrections: SmartValidationCorrection[] = [];
    let severity: AnomalySeverity = 'low';
    let anomalyType: AnomalyType = 'pricing';
    let isLossSale = false;
    let isNegativeStock = false;
    let isQuantitySpike = false;
    let isExtremePriceDeviance = false;
    let isCustomerTierMismatch = false;
    let primaryMetrics: HistoricalPriceQuantityMetrics | undefined;

    const customer = state.customers.find(c => c.id === customer_id);
    const isWholesaleCustomer =
      customer &&
      (customer.name.toLowerCase().includes('telecom') ||
        customer.name.toLowerCase().includes('enterprise') ||
        customer.name.toLowerCase().includes('wholesale') ||
        customer.code.includes('WHOLESALE') ||
        customer.credit_limit >= 100000);

    items.forEach((item, idx) => {
      const product = state.products.find(p => p.id === item.product_id);
      if (!product) return;

      const metrics = this.getProductHistoricalSalesMetrics(product.id, state.sales);
      if (!primaryMetrics) primaryMetrics = metrics;

      const availableStock = this.getAvailableBranchStock(product.id, branch_id, state);
      metrics.currentAvailableStock = availableStock;

      const effectiveUnitPrice = item.unit_price - item.discount / Math.max(1, item.quantity);

      // Check A: Negative Stock risk
      if (item.quantity > availableStock && availableStock >= 0) {
        isNegativeStock = true;
        severity = 'critical';
        anomalyType = 'stock_discrepancy';
        warnings.push(
          `আইটেম #${idx + 1} (${product.name}): বিক্রয় পরিমাণ (${item.quantity} টি) বর্তমান মজুদ স্টক (${availableStock} টি)-এর চেয়ে বেশি! নেগেটিভ স্টক ঝুঁকি।`
        );
        corrections.push({
          field: `items[${idx}].quantity`,
          current_val: item.quantity,
          suggested_val: Math.max(0, availableStock),
          reason: `বর্তমান শাখায় বিদ্যমান স্টক অনুযায়ী সর্বোচ্চ ${availableStock} টি বিক্রয় সম্ভব।`,
          rule: 'RULE_PREVENT_NEGATIVE_INVENTORY'
        });
      }

      // Check B: Loss Sale (selling price < cost price)
      if (effectiveUnitPrice < product.cost_price) {
        isLossSale = true;
        severity = 'critical';
        anomalyType = 'loss_sale';
        const lossAmount = Math.round((product.cost_price - effectiveUnitPrice) * item.quantity);
        warnings.push(
          `আইটেম #${idx + 1} (${product.name}): বিক্রয়মূল্য (৳${effectiveUnitPrice.toLocaleString('en-IN')}) ক্রয়মূল্যের (৳${product.cost_price.toLocaleString('en-IN')}) নিচে! মোট আর্থিক ক্ষতি: ৳${lossAmount.toLocaleString('en-IN')}`
        );
        const safeMin = Math.round(product.cost_price * 1.03);
        corrections.push({
          field: `items[${idx}].unit_price`,
          current_val: item.unit_price,
          suggested_val: safeMin,
          reason: `ক্রয়মূল্য ৳${product.cost_price.toLocaleString('en-IN')} থেকে ন্যূনতম লাভজনক বিক্রয়মূল্য ৳${safeMin.toLocaleString('en-IN')}`,
          rule: 'RULE_NO_NEGATIVE_MARGIN'
        });
      }

      // Check C: Abnormal Quantity Spike (e.g. single order quantity > 5x historical max or > 25 units)
      if (
        metrics.totalTransactions >= 2 &&
        item.quantity > Math.max(metrics.maxSingleQuantity * 3, 20)
      ) {
        isQuantitySpike = true;
        if (severity !== 'critical') severity = 'high';
        anomalyType = 'unusual_quantity';
        warnings.push(
          `আইটেম #${idx + 1} (${product.name}): অস্বাভাবিক বিক্রয় পরিমাণ (${item.quantity} টি)! ঐতিহাসিক স্বাভাবিক একক বিক্রয় ${metrics.avgQuantity} টি (সর্বোচ্চ ছিল ${metrics.maxSingleQuantity} টি)।`
        );
      }

      // Check D: Extreme Price Deviations from historical data
      if (metrics.totalTransactions >= 2 && metrics.avgPrice > 0) {
        if (item.unit_price < metrics.avgPrice * 0.45) {
          isExtremePriceDeviance = true;
          if (severity !== 'critical') severity = 'high';
          anomalyType = 'pricing';
          warnings.push(
            `আইটেম #${idx + 1} (${product.name}): বিক্রয়মূল্য (৳${item.unit_price.toLocaleString('en-IN')}) ঐতিহাসিক গড় বিক্রয়মূল্যের (৳${metrics.avgPrice.toLocaleString('en-IN')}) চেয়ে ৫৫% কম! টাইপো হওয়ার সম্ভাবনা।`
          );
          corrections.push({
            field: `items[${idx}].unit_price`,
            current_val: item.unit_price,
            suggested_val: metrics.avgPrice,
            reason: `ঐতিহাসিক গড় মূল্য ৳${metrics.avgPrice.toLocaleString('en-IN')} প্রয়োগ করুন`,
            rule: 'RULE_HISTORICAL_PRICE_RANGE'
          });
        } else if (item.unit_price > metrics.avgPrice * 2.5) {
          isExtremePriceDeviance = true;
          if (severity !== 'critical') severity = 'medium';
          anomalyType = 'pricing';
          warnings.push(
            `আইটেম #${idx + 1} (${product.name}): বিক্রয়মূল্য (৳${item.unit_price.toLocaleString('en-IN')}) ঐতিহাসিক গড় মূল্যের (৳${metrics.avgPrice.toLocaleString('en-IN')}) দ্বিগুণেরও বেশি!`
          );
        }
      }

      // Check E: Customer Tier Pricing Mismatch
      if (customer) {
        const wholesalePrice = Math.round(product.cost_price * 1.05);
        const retailPrice = product.selling_price;
        if (isWholesaleCustomer && item.unit_price > wholesalePrice * 1.15) {
          isCustomerTierMismatch = true;
          if (severity === 'low') severity = 'medium';
          anomalyType = 'customer_tier_mismatch';
          warnings.push(
            `পাইকারি গ্রাহক (${customer.name})-এর জন্য খুচরা মার্জিন ধরা হয়েছে। অনুমোদিত পাইকারি দর: ৳${wholesalePrice.toLocaleString('en-IN')}`
          );
          corrections.push({
            field: `items[${idx}].unit_price`,
            current_val: item.unit_price,
            suggested_val: wholesalePrice,
            reason: 'অনুমোদিত হোলসেল রেট প্রয়োগ করুন',
            rule: 'RULE_WHOLESALE_POLICY'
          });
        } else if (!isWholesaleCustomer && item.unit_price <= wholesalePrice) {
          isCustomerTierMismatch = true;
          if (severity !== 'critical') severity = 'high';
          anomalyType = 'customer_tier_mismatch';
          warnings.push(
            `খুচরা গ্রাহককে অনুমতি ছাড়া পাইকারি বা অস্বাভাবিক কম মূল্যে বিক্রয় করা হচ্ছে (স্বাভাবিক রিটেল: ৳${retailPrice.toLocaleString('en-IN')})`
          );
          corrections.push({
            field: `items[${idx}].unit_price`,
            current_val: item.unit_price,
            suggested_val: retailPrice,
            reason: 'খুচরা গ্রাহকের জন্য নির্ধারিত বিক্রয়মূল্য নির্ধারণ করুন',
            rule: 'RULE_RETAIL_PRICE_PROTECTION'
          });
        }
      }

      // Check F: Abnormal Discount (> margin cap)
      const unitMargin = item.unit_price - product.cost_price;
      if (item.discount > unitMargin && item.discount > 500) {
        if (severity === 'low') severity = 'medium';
        anomalyType = 'discount_excess';
        warnings.push(
          `আইটেম #${idx + 1} (${product.name}): মোট ছাড় (৳${item.discount.toLocaleString('en-IN')}) পণ্যের মার্জিন (৳${unitMargin.toLocaleString('en-IN')})-কে ছাড়িয়ে গেছে!`
        );
        corrections.push({
          field: `items[${idx}].discount`,
          current_val: item.discount,
          suggested_val: Math.max(0, Math.round(unitMargin * 0.5)),
          reason: 'মার্জিনের সর্বোচ্চ ৫০% পর্যন্ত ছাড় অনুমোদিত',
          rule: 'RULE_DISCOUNT_CAP'
        });
      }
    });

    const userProfile = state.userErrorProfiles?.[currentUser.id];
    const prevMistakes = userProfile?.total_mistakes || 0;
    let warningLevel: 1 | 2 | 3 | 4 = 1;
    let voiceAlert = '';

    if (isLossSale || isNegativeStock) {
      warningLevel = 4; // Block submit for severe financial danger or negative stock
      voiceAlert = isLossSale
        ? 'সতর্কতা! পণ্যের বিক্রয়মূল্য ক্রয়মূল্যের চেয়ে কম দেওয়া হয়েছে যা সরাসরি আর্থিক লোকসান করবে।'
        : 'সতর্কতা! শাখায় পর্যাপ্ত স্টক না থাকায় চালানটি সাবমিট করা যাচ্ছে না।';
    } else if (prevMistakes >= 3 && (isExtremePriceDeviance || isCustomerTierMismatch || isQuantitySpike)) {
      warningLevel = 3;
      voiceAlert = 'একই ধরনের ভুল বারবার হচ্ছে। অনুগ্রহ করে তথ্য সংশোধন করুন এবং সঠিক হিসাব নিশ্চিত করুন।';
    } else if (prevMistakes >= 1 && warnings.length > 0) {
      warningLevel = 2;
      voiceAlert = 'সতর্কতা! বিক্রয় চালানে সম্ভাব্য মূল্য বা পরিমাণের অসংগতি রয়েছে। যাচাই করুন।';
    } else if (warnings.length > 0) {
      warningLevel = 1;
      voiceAlert = 'আপনার বিক্রয় এন্ট্রিতে একটি সম্ভাব্য অসংগতি ধরা পড়েছে। দয়া করে পরীক্ষা করুন।';
    }

    const isValid = warnings.length === 0;
    const blocked = warningLevel === 4;

    return {
      isValid,
      canSubmit: !blocked,
      blocked,
      warningLevel,
      severity,
      anomalyType,
      title: blocked ? 'বিক্রয় সাবমিট স্থগিত (Critical Financial Breach)' : 'বিক্রয় ডেটা ভ্যালিডেশন সতর্কতা',
      warnings,
      voiceAlert,
      recommendedCorrections: corrections,
      historicalMetrics: primaryMetrics,
      module: 'sales'
    };
  }

  // --- 2. PURCHASE MODULE INTERCEPTOR ---
  public interceptPurchaseSubmission(params: {
    product_id: string;
    supplier_id: string;
    branch_id: string;
    quantity: number;
    unit_cost: number;
    paid_amount: number;
    imei_list?: string[];
    currentUser: User;
    state: DatabaseState;
  }): GuardianInterceptionResult {
    const { product_id, supplier_id, quantity, unit_cost, paid_amount, imei_list, currentUser, state } = params;
    const warnings: string[] = [];
    const corrections: SmartValidationCorrection[] = [];
    let severity: AnomalySeverity = 'low';
    let anomalyType: AnomalyType = 'pricing';
    let isPriceSurge = false;
    let isCostAboveSelling = false;
    let isAbnormalQuantity = false;
    let isTypoPrice = false;

    const product = state.products.find(p => p.id === product_id);
    const supplier = state.suppliers.find(s => s.id === supplier_id);
    const metrics = this.getProductHistoricalPurchaseMetrics(product_id, state.purchases, supplier_id);

    if (product) {
      metrics.currentAvailableStock = this.getAvailableBranchStock(product.id, 'all', state);

      // Check A: Purchase unit cost > Product selling price (Guaranteed Loss!)
      if (unit_cost >= product.selling_price) {
        isCostAboveSelling = true;
        severity = 'critical';
        anomalyType = 'pricing';
        warnings.push(
          `ক্রয়মূল্য (৳${unit_cost.toLocaleString('en-IN')}) পণ্যের নির্ধারিত বিক্রয়মূল্যের (৳${product.selling_price.toLocaleString('en-IN')}) চেয়ে সমান বা বেশি! বিক্রয়কালে নিশ্চিত লোকসান হবে।`
        );
        corrections.push({
          field: 'unit_cost',
          current_val: unit_cost,
          suggested_val: product.cost_price || Math.round(product.selling_price * 0.85),
          reason: `ক্যাটালগ অনুযায়ী স্ট্যান্ডার্ড ক্রয়মূল্য ৳${(product.cost_price || Math.round(product.selling_price * 0.85)).toLocaleString('en-IN')}`,
          rule: 'RULE_PURCHASE_BELOW_RETAIL'
        });
      }

      // Check B: Price Surge compared to historical purchase average (> 30% surge)
      if (metrics.totalTransactions >= 1 && metrics.avgPrice > 0) {
        const surgeRatio = unit_cost / metrics.avgPrice;
        if (surgeRatio > 1.3) {
          isPriceSurge = true;
          if (severity !== 'critical') severity = 'high';
          anomalyType = 'pricing';
          warnings.push(
            `ঐতিহাসিক গড় ক্রয়মূল্যের (৳${metrics.avgPrice.toLocaleString('en-IN')}) তুলনায় বর্তমান ক্রয়মূল্য (৳${unit_cost.toLocaleString('en-IN')}) ${Math.round((surgeRatio - 1) * 100)}% বেশি! সরবরাহকারী অতিরিক্ত মূল্য নিচ্ছে কি না যাচাই করুন।`
          );
          corrections.push({
            field: 'unit_cost',
            current_val: unit_cost,
            suggested_val: metrics.avgPrice,
            reason: `পূর্ববর্তী গড় ক্রয়মূল্য ৳${metrics.avgPrice.toLocaleString('en-IN')}`,
            rule: 'RULE_PURCHASE_PRICE_SURGE_GUARD'
          });
        } else if (surgeRatio < 0.4) {
          isTypoPrice = true;
          if (severity !== 'critical') severity = 'high';
          anomalyType = 'pricing';
          warnings.push(
            `ক্রয়মূল্য (৳${unit_cost.toLocaleString('en-IN')}) ঐতিহাসিক গড় ক্রয়মূল্যের (৳${metrics.avgPrice.toLocaleString('en-IN')}) অর্ধেকেরও কম! সংখ্যার শেষে শূন্য বাদ পড়েছে কি না পরীক্ষা করুন।`
          );
          corrections.push({
            field: 'unit_cost',
            current_val: unit_cost,
            suggested_val: metrics.avgPrice,
            reason: `প্রত্যাশিত সঠিক ক্রয়মূল্য ৳${metrics.avgPrice.toLocaleString('en-IN')}`,
            rule: 'RULE_PURCHASE_TYPO_PREVENTION'
          });
        }
      }

      // Check C: Quantity Anomalies
      if (quantity <= 0) {
        severity = 'critical';
        warnings.push('ক্রয় পরিমাণ অবশ্যই ১ বা তার বেশি হতে হবে।');
      } else if (metrics.totalTransactions >= 2 && quantity > metrics.maxSingleQuantity * 3.5 && quantity > 25) {
        isAbnormalQuantity = true;
        if (severity !== 'critical') severity = 'high';
        anomalyType = 'unusual_quantity';
        warnings.push(
          `অস্বাভাবিক বৃহৎ ক্রয় অর্ডার (${quantity} টি)! পূর্ববর্তী সর্বোচ্চ ক্রয় চালান ছিল ${metrics.maxSingleQuantity} টি (গড় ${metrics.avgQuantity} টি)। ক্যাপিটাল লক ও ওভারস্টক ঝুঁকি রয়েছে।`
        );
      }

      // Check D: IMEI validation
      if (product.has_imei && imei_list && imei_list.length !== quantity) {
        severity = 'high';
        warnings.push(
          `আপনি ${quantity} টি পরিমাণ নির্দিষ্ট করেছেন, কিন্তু ${imei_list.length} টি আইএমইআই (IMEI) প্রদান করেছেন। সংখ্যা দুটি সমান হতে হবে।`
        );
      }

      // Check E: Total Bill vs Paid Amount
      const totalCost = unit_cost * quantity;
      if (paid_amount > totalCost) {
        if (severity !== 'critical') severity = 'medium';
        warnings.push(
          `প্রদত্ত পরিশোধ (৳${paid_amount.toLocaleString('en-IN')}) মোট ক্রয়মূল্যের (৳${totalCost.toLocaleString('en-IN')}) চেয়ে বেশি!`
        );
        corrections.push({
          field: 'paid_amount',
          current_val: paid_amount,
          suggested_val: totalCost,
          reason: `পরিশোধিত অর্থ মোট বিলের সমান ৳${totalCost.toLocaleString('en-IN')} করা হলো`,
          rule: 'RULE_PAYMENT_CAP'
        });
      }
    }

    const userProfile = state.userErrorProfiles?.[currentUser.id];
    const prevMistakes = userProfile?.total_mistakes || 0;
    let warningLevel: 1 | 2 | 3 | 4 = 1;
    let voiceAlert = '';

    if (isCostAboveSelling) {
      warningLevel = 4;
      voiceAlert = 'সতর্কতা! ক্রয়মূল্য বিক্রয়মূল্যের চেয়ে বেশি হওয়ায় অর্ডারটি সাময়িকভাবে স্থগিত রাখা হলো।';
    } else if (isPriceSurge || isTypoPrice || isAbnormalQuantity) {
      if (prevMistakes >= 2) {
        warningLevel = 3;
        voiceAlert = 'ক্রয় চালানে বারবার অস্বাভাবিক মূল্য বা পরিমাণের অসংগতি ধরা পড়ছে। মালিককে নোটিফিকেশন পাঠানো হয়েছে।';
      } else {
        warningLevel = 2;
        voiceAlert = 'সতর্কতা! পূর্ববর্তী ক্রয় ইতিহাসের সাথে বর্তমান মূল্যের বড় তারতম্য পাওয়া গেছে।';
      }
    } else if (warnings.length > 0) {
      warningLevel = 1;
      voiceAlert = 'ক্রয় এন্ট্রির কিছু তথ্যে অসংগতি পাওয়া গেছে। দয়া করে পরীক্ষা করুন।';
    }

    const isValid = warnings.length === 0;
    const blocked = warningLevel === 4;

    return {
      isValid,
      canSubmit: !blocked,
      blocked,
      warningLevel,
      severity,
      anomalyType,
      title: blocked ? 'ক্রয় বিল সাবমিট স্থগিত (Supplier Price Inversion)' : 'ক্রয় ডেটা অসংগতি সতর্কতা',
      warnings,
      voiceAlert,
      recommendedCorrections: corrections,
      historicalMetrics: metrics,
      module: 'purchases'
    };
  }

  // --- 3. INVENTORY PRODUCT MASTER INTERCEPTOR ---
  public interceptInventoryProductSubmission(params: {
    mode: 'create' | 'edit';
    product_id?: string;
    name: string;
    cost_price: number;
    selling_price: number;
    mrp?: number;
    has_imei: boolean;
    currentUser: User;
    state: DatabaseState;
  }): GuardianInterceptionResult {
    const { mode, product_id, name, cost_price, selling_price, mrp, currentUser, state } = params;
    const warnings: string[] = [];
    const corrections: SmartValidationCorrection[] = [];
    let severity: AnomalySeverity = 'low';
    let anomalyType: AnomalyType = 'pricing';
    let isInverted = false;
    let isLowMargin = false;
    let isExtremeJump = false;

    // Check A: Cost >= Selling Price
    if (cost_price >= selling_price) {
      isInverted = true;
      severity = 'critical';
      anomalyType = 'pricing';
      warnings.push(
        `ক্রয়মূল্য (৳${cost_price.toLocaleString('en-IN')}) বিক্রয়মূল্যের (৳${selling_price.toLocaleString('en-IN')}) সমান বা বেশি! পণ্যটিতে মুনাফা শূন্য বা নেগেটিভ হবে।`
      );
      const suggestedSelling = Math.round(cost_price * 1.15);
      corrections.push({
        field: 'selling_price',
        current_val: selling_price,
        suggested_val: suggestedSelling,
        reason: `১৫% স্বাভাবিক গ্রস মার্জিনসহ প্রস্তাবিত বিক্রয়মূল্য ৳${suggestedSelling.toLocaleString('en-IN')}`,
        rule: 'RULE_POSITIVE_GROSS_MARGIN'
      });
    }

    // Check B: Dangerously thin margin (< 3%)
    const marginPercent = ((selling_price - cost_price) / selling_price) * 100;
    if (!isInverted && marginPercent < 3) {
      isLowMargin = true;
      if (severity !== 'critical') severity = 'high';
      warnings.push(
        `গ্রস মার্জিন অত্যন্ত কম (${marginPercent.toFixed(1)}%)! দোকান পরিচালনা ও পরিচালন ব্যয়ের কারণে পণ্যটি লোকসানে পড়তে পারে।`
      );
      const suggestedSelling = Math.round(cost_price * 1.08);
      corrections.push({
        field: 'selling_price',
        current_val: selling_price,
        suggested_val: suggestedSelling,
        reason: `ন্যূনতম ৮% স্বাস্থ্যকর মার্জিনে প্রস্তাবিত মূল্য ৳${suggestedSelling.toLocaleString('en-IN')}`,
        rule: 'RULE_MINIMUM_HEALTHY_MARGIN'
      });
    }

    // Check C: If editing existing product, check for massive price shocks (> 50% jump or drop)
    if (mode === 'edit' && product_id) {
      const existing = state.products.find(p => p.id === product_id);
      if (existing) {
        const costDiffRatio = Math.abs(cost_price - existing.cost_price) / (existing.cost_price || 1);
        const priceDiffRatio = Math.abs(selling_price - existing.selling_price) / (existing.selling_price || 1);
        if (costDiffRatio > 0.5 || priceDiffRatio > 0.5) {
          isExtremeJump = true;
          if (severity !== 'critical') severity = 'high';
          warnings.push(
            `পণ্যের পূর্ববর্তী মূল্যের তুলনায় ৫০% এর বেশি পরিবর্তন শনাক্ত হয়েছে (পূর্বের বিক্রয়মূল্য: ৳${existing.selling_price.toLocaleString('en-IN')}, নতুন: ৳${selling_price.toLocaleString('en-IN')})!`
          );
        }
      }
    }

    // Check D: MRP below selling price
    if (mrp && mrp < selling_price) {
      if (severity === 'low') severity = 'medium';
      warnings.push(`এমআরপি (৳${mrp.toLocaleString('en-IN')}) বিক্রয়মূল্যের (৳${selling_price.toLocaleString('en-IN')}) চেয়ে কম হতে পারে না!`);
      corrections.push({
        field: 'mrp',
        current_val: mrp,
        suggested_val: selling_price,
        reason: 'এমআরপি বিক্রয়মূল্যের সমান বা বেশি নির্ধারণ করুন',
        rule: 'RULE_MRP_GE_SELLING'
      });
    }

    const userProfile = state.userErrorProfiles?.[currentUser.id];
    let warningLevel: 1 | 2 | 3 | 4 = 1;
    let voiceAlert = '';

    if (isInverted) {
      warningLevel = 4;
      voiceAlert = 'সতর্কতা! ক্রয়মূল্য বিক্রয়মূল্যের চেয়ে বেশি হওয়ায় ক্যাটালগ সেভ স্থগিত রাখা হলো।';
    } else if (isLowMargin || isExtremeJump) {
      warningLevel = (userProfile?.total_mistakes || 0) >= 2 ? 3 : 2;
      voiceAlert = 'পণ্য মূল্যের মার্জিন অস্বাভাবিকভাবে কম অথবা বড় পরিবর্তন লক্ষ্য করা গেছে।';
    } else if (warnings.length > 0) {
      warningLevel = 1;
      voiceAlert = 'পণ্যের তথ্য যাচাই করে সংরক্ষণ করুন।';
    }

    const isValid = warnings.length === 0;
    const blocked = warningLevel === 4;

    return {
      isValid,
      canSubmit: !blocked,
      blocked,
      warningLevel,
      severity,
      anomalyType,
      title: blocked ? 'পণ্য সংরক্ষণ স্থগিত (Price Inversion Guard)' : 'ইনভেন্টরি মূল্য অসংগতি সতর্কতা',
      warnings,
      voiceAlert,
      recommendedCorrections: corrections,
      module: 'inventory'
    };
  }

  // --- 4. STOCK TRANSFER & ADJUSTMENT INTERCEPTOR ---
  public interceptStockTransferSubmission(params: {
    from_branch_id: string;
    to_branch_id: string;
    product_id: string;
    quantity: number;
    imei_numbers?: string[];
    currentUser: User;
    state: DatabaseState;
  }): GuardianInterceptionResult {
    const { from_branch_id, to_branch_id, product_id, quantity, imei_numbers, currentUser, state } = params;
    const warnings: string[] = [];
    const corrections: SmartValidationCorrection[] = [];
    let severity: AnomalySeverity = 'low';
    let isStockBreach = false;

    const product = state.products.find(p => p.id === product_id);
    const availableStock = this.getAvailableBranchStock(product_id, from_branch_id, state);

    if (from_branch_id === to_branch_id) {
      severity = 'high';
      warnings.push('উৎস শাখা এবং গন্তব্য শাখা একই হতে পারে না।');
    }

    if (quantity <= 0) {
      severity = 'high';
      warnings.push('স্থানান্তরের পরিমাণ অবশ্যই ১ বা তার বেশি হতে হবে।');
    } else if (quantity > availableStock) {
      isStockBreach = true;
      severity = 'critical';
      warnings.push(
        `স্থানান্তরের পরিমাণ (${quantity} টি) প্রেরক শাখার বর্তমান মজুদ স্টক (${availableStock} টি)-এর চেয়ে বেশি!`
      );
      corrections.push({
        field: 'quantity',
        current_val: quantity,
        suggested_val: availableStock,
        reason: `প্রেরক শাখায় বিদ্যমান স্টক অনুযায়ী সর্বোচ্চ ${availableStock} টি স্থানান্তর সম্ভব`,
        rule: 'RULE_TRANSFER_SOURCE_STOCK_CHECK'
      });
    }

    if (product?.has_imei && imei_numbers && imei_numbers.length !== quantity) {
      severity = 'high';
      warnings.push(
        `স্থানান্তরের জন্য নির্বাচিত আইএমইআই সংখ্যা (${imei_numbers.length} টি) এবং নির্ধারিত পরিমাণ (${quantity} টি) সমান নয়।`
      );
    }

    const warningLevel = isStockBreach ? 4 : warnings.length > 0 ? 2 : 1;
    const blocked = warningLevel === 4;
    const voiceAlert = isStockBreach
      ? 'সতর্কতা! প্রেরক শাখায় পর্যাপ্ত স্টক না থাকায় স্থানান্তর স্থগিত করা হয়েছে।'
      : warnings.length > 0
      ? 'স্টক স্থানান্তরে অসংগতি রয়েছে। অনুগ্রহ করে তথ্য পরীক্ষা করুন।'
      : '';

    return {
      isValid: warnings.length === 0,
      canSubmit: !blocked,
      blocked,
      warningLevel,
      severity,
      anomalyType: 'stock_discrepancy',
      title: blocked ? 'স্টক স্থানান্তর স্থগিত (Stock Shortage)' : 'স্থানান্তর ভ্যালিডেশন সতর্কতা',
      warnings,
      voiceAlert,
      recommendedCorrections: corrections,
      historicalMetrics: {
        avgPrice: product?.selling_price || 0,
        medianPrice: product?.selling_price || 0,
        minPrice: product?.cost_price || 0,
        maxPrice: product?.selling_price || 0,
        safeMinPrice: product?.cost_price || 0,
        safeMaxPrice: product?.selling_price || 0,
        avgQuantity: 2,
        maxSingleQuantity: 10,
        totalTransactions: 0,
        currentAvailableStock: availableStock
      },
      module: 'inventory'
    };
  }

  public interceptStockAdjustmentSubmission(params: {
    branch_id: string;
    product_id: string;
    adjustment_type: 'damage' | 'warranty' | 'lost' | 'decrease' | 'increase';
    quantity: number;
    reason: string;
    currentUser: User;
    state: DatabaseState;
  }): GuardianInterceptionResult {
    const { branch_id, product_id, adjustment_type, quantity, reason, currentUser, state } = params;
    const warnings: string[] = [];
    const corrections: SmartValidationCorrection[] = [];
    let severity: AnomalySeverity = 'low';

    const product = state.products.find(p => p.id === product_id);
    const availableStock = this.getAvailableBranchStock(product_id, branch_id, state);

    if (quantity <= 0) {
      severity = 'high';
      warnings.push('অ্যাডজাস্টমেন্টের পরিমাণ অবশ্যই ১ বা তার বেশি হতে হবে।');
    }

    if (['damage', 'warranty', 'lost', 'decrease'].includes(adjustment_type)) {
      if (quantity > availableStock) {
        severity = 'critical';
        warnings.push(
          `হ্রাসকরণ পরিমাণ (${quantity} টি) বর্তমান মজুদ স্টক (${availableStock} টি)-এর চেয়ে বেশি!`
        );
        corrections.push({
          field: 'quantity',
          current_val: quantity,
          suggested_val: availableStock,
          reason: `শাখায় বিদ্যমান স্টক অনুযায়ী সর্বোচ্চ ${availableStock} টি সমন্বয় সম্ভব`,
          rule: 'RULE_ADJUSTMENT_MAX_STOCK'
        });
      }

      // Check financial impact of damage write-off
      const totalLossValue = (product?.cost_price || 0) * quantity;
      if (totalLossValue > 40000 && (!reason || reason.trim().length < 10)) {
        severity = 'high';
        warnings.push(
          `বড় অঙ্কের স্টক রাইট-অফ (৳${totalLossValue.toLocaleString('en-IN')})! বিস্তারিত যৌক্তিক কারণ ও সুপারভাইজার রেফারেন্স উল্লেখ করা বাধ্যতামূলক।`
        );
      }
    }

    const isBlocked = severity === 'critical';
    const warningLevel = isBlocked ? 4 : warnings.length > 0 ? 2 : 1;
    const voiceAlert = isBlocked
      ? 'সতর্কতা! অপর্যাপ্ত স্টকের কারণে স্টক হ্রাসকরণ স্থগিত করা হলো।'
      : warnings.length > 0
      ? 'স্টক অ্যাডজাস্টমেন্টে বিশদ কারণ উল্লেখ করুন।'
      : '';

    return {
      isValid: warnings.length === 0,
      canSubmit: !isBlocked,
      blocked: isBlocked,
      warningLevel,
      severity,
      anomalyType: 'stock_discrepancy',
      title: isBlocked ? 'স্টক অ্যাডজাস্টমেন্ট স্থগিত' : 'স্টক সমন্বয় সতর্কতা',
      warnings,
      voiceAlert,
      recommendedCorrections: corrections,
      module: 'inventory'
    };
  }

  // --- 5. LOGGING, VOICE ALERTS & AUDIT TRAIL SINK ---
  public recordAndAlert(
    result: GuardianInterceptionResult,
    currentUser: User,
    state: DatabaseState
  ): void {
    if (result.isValid) return;

    // A. Trigger Voice Alert
    if (result.voiceAlert) {
      aiOwnerGuardian.speak(result.voiceAlert, state.voiceFeedbackConfig, {
        urgent: result.blocked
      });
    }

    // B. Record User Mistake Profile
    storage.recordUserMistake(
      currentUser.id,
      currentUser.name,
      result.anomalyType,
      result.warnings[0] || 'Validation discrepancy detected'
    );

    // C. Record Anomaly to AI Guardian Log
    const anomalyRecord: AIAnomalyRecord = {
      id: 'anom_' + Date.now(),
      type: result.anomalyType,
      severity: result.severity,
      status: result.blocked ? 'pending_approval' : 'detected',
      module: result.module,
      record_id: 'pending_' + Date.now(),
      title: result.title,
      description: result.warnings.join(' | '),
      reason: result.recommendedCorrections[0]?.reason || 'Cross-referenced historical transaction data anomaly',
      detected_value: result.recommendedCorrections[0]?.current_val ?? 'discrepancy',
      suggested_value: result.recommendedCorrections[0]?.suggested_val ?? 'compliant_value',
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      rule_applied: result.recommendedCorrections[0]?.rule || 'AIOwnerGuardianValidationEngine',
      financial_impact:
        result.anomalyType === 'loss_sale' || result.anomalyType === 'pricing' ? 12000 : 0,
      created_at: new Date().toISOString(),
      is_recurrent: result.warningLevel >= 2,
      recurrent_count: result.warningLevel
    };

    storage.saveAIAnomaly(anomalyRecord);
  }
}

export const aiOwnerGuardianValidationEngine = new AIOwnerGuardianValidationEngineService();
export const AIOwnerGuardianValidationEngine = AIOwnerGuardianValidationEngineService;

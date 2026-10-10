export type AnomalyType =
  | 'pricing'
  | 'loss_sale'
  | 'discount_excess'
  | 'customer_tier_mismatch'
  | 'stock_discrepancy'
  | 'ledger_unbalanced'
  | 'duplicate_journal'
  | 'unmapped_account'
  | 'recurrent_user_error'
  | 'unusual_quantity'
  | 'cash_shortage';

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export type CorrectionStatus =
  | 'detected'
  | 'auto_corrected'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'reversed'
  | 'restored';

export interface AIAnomalyRecord {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  status: CorrectionStatus;
  module: 'sales' | 'pos' | 'purchases' | 'inventory' | 'accounting' | 'expenses' | 'customers';
  record_id: string;
  reference_no?: string;
  title: string;
  description: string;
  reason: string;
  detected_value: any;
  suggested_value: any;
  applied_value?: any;
  user_id: string;
  user_name: string;
  user_role: string;
  rule_applied: string;
  financial_impact: number; // positive = potential loss prevented or corrected
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  reversal_entry_id?: string;
  is_recurrent: boolean;
  recurrent_count: number;
}

export interface AIAuditTrailEntry {
  id: string;
  anomaly_id?: string;
  original_trx_id: string;
  trx_type: 'sale' | 'purchase' | 'journal' | 'expense' | 'inventory' | 'customer';
  module: string;
  field: string;
  old_value: string;
  new_value: string;
  detected_reason: string;
  ai_decision: string;
  business_rule: string;
  is_auto_corrected: boolean;
  approver_name?: string;
  timestamp: string;
  user_name: string;
  reversal_ref_id?: string;
  restore_history?: Array<{
    timestamp: string;
    restored_by: string;
    reason: string;
  }>;
}

export interface VoiceFeedbackConfig {
  enabled: boolean;
  language: 'bn-BD' | 'en-US';
  volume: number; // 0.0 - 1.0
  rate: number; // 0.5 - 1.5
  autoSpeakAlerts: boolean;
}

export interface UserErrorProfile {
  user_id: string;
  user_name: string;
  total_mistakes: number;
  recurrent_types: Record<string, number>;
  current_warning_level: 1 | 2 | 3 | 4; // 1: Info, 2: Warning, 3: Directive/Notify, 4: Critical Block
  last_warning_text: string;
  last_mistake_at: string;
}

export interface SmartValidationCorrection {
  field: string;
  current_val: any;
  suggested_val: any;
  reason: string;
  rule: string;
}

export interface SmartValidationResult {
  is_valid: boolean;
  blocked: boolean; // if critical severity requires supervisor authorization
  severity: AnomalySeverity;
  warning_level: 1 | 2 | 3 | 4;
  warnings: string[];
  voice_alert?: string;
  recommended_corrections: SmartValidationCorrection[];
  recurrent_mistake_detected: boolean;
  user_error_profile?: UserErrorProfile;
}

export interface FinancialAnomalySummary {
  period: 'today' | 'weekly' | 'monthly' | 'all';
  total_anomalies_detected: number;
  total_auto_corrected: number;
  pending_manual_approvals: number;
  total_loss_prevented: number;
  unbalanced_journals_count: number;
  voided_transactions_count: number;
  restored_transactions_count: number;
  user_mistakes_ranking: Array<{
    user_name: string;
    count: number;
    highest_severity: AnomalySeverity;
    common_error: string;
  }>;
  category_discrepancies: Array<{
    category_name: string;
    anomaly_count: number;
    financial_impact: number;
  }>;
  unresolved_recurrent_issues: AIAnomalyRecord[];
}

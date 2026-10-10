export type Role =
  | 'super_admin'
  | 'owner'
  | 'general_manager'
  | 'branch_manager'
  | 'accountant'
  | 'sales_manager'
  | 'sales_executive'
  | 'inventory_manager'
  | 'warehouse_manager'
  | 'cashier'
  | 'hr'
  | 'auditor'
  | 'viewer';

export type Permission =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'post'
  | 'print'
  | 'export'
  | 'close_period'
  | 'manage_users'
  | 'manage_settings';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  branch_id?: string; // undefined means all branches (e.g. Owner/Super Admin)
  avatar?: string;
  active: boolean;
  permissions: Permission[];
}

export interface Company {
  id: string;
  name: string;
  legal_name: string;
  bin_number: string;
  vat_registration: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  currency: string;
  currency_symbol: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  bn_name: string;
  address: string;
  phone: string;
  manager_id: string;
  manager_name: string;
  cash_balance: number;
  is_warehouse?: boolean;
  is_head_office?: boolean;
  opening_time?: string;
  closing_time?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  has_imei: boolean;
}

export interface Brand {
  id: string;
  name: string;
  origin_country?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  brand_id: string;
  brand_name: string;
  category_id: string;
  category_name: string;
  has_imei: boolean;
  model: string;
  color?: string;
  storage?: string;
  ram?: string;
  barcode: string;
  cost_price: number;
  selling_price: number;
  mrp: number;
  min_stock_level: number;
  warranty_months: number;
  image?: string;
}

export type IMEIStatus =
  | 'in_stock'
  | 'sold'
  | 'returned'
  | 'warranty'
  | 'damaged'
  | 'missing'
  | 'transferred'
  | 'reserved';

export interface IMEIDevice {
  id: string;
  imei1: string;
  imei2?: string;
  serial_number?: string;
  product_id: string;
  product_name: string;
  brand_name: string;
  model: string;
  color: string;
  storage?: string;
  ram?: string;
  cost_price: number;
  selling_price: number;
  supplier_id: string;
  supplier_name: string;
  purchase_invoice_id: string;
  branch_id: string;
  branch_name: string;
  current_location: string;
  status: IMEIStatus;
  sold_at?: string;
  sale_invoice_id?: string;
  customer_id?: string;
  customer_name?: string;
  warranty_expire_date?: string;
  created_at: string;
}

export interface IMEIMovement {
  id: string;
  imei1: string;
  product_name: string;
  from_status: IMEIStatus;
  to_status: IMEIStatus;
  from_branch_id?: string;
  to_branch_id?: string;
  from_branch_name?: string;
  to_branch_name?: string;
  reference_type: 'purchase' | 'sale' | 'transfer' | 'return' | 'warranty' | 'adjustment';
  reference_id: string;
  notes: string;
  created_by_name: string;
  created_at: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  credit_limit: number;
  current_balance: number; // positive = customer owes money (receivable)
  opening_balance: number;
  branch_id: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  opening_payable: number;
  current_payable: number; // positive = we owe supplier (payable)
  created_at: string;
}

export type PaymentMethod =
  | 'cash'
  | 'bank'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'credit'
  | 'split';

export interface PaymentSplitDetail {
  method: 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'credit';
  amount: number;
  reference?: string; // Trx ID or Cheque No
  account_id?: string;
}

export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  model: string;
  has_imei: boolean;
  imei_id?: string;
  imei1?: string;
  imei2?: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  subtotal: number;
  warranty_months: number;
}

export interface Sale {
  id: string;
  invoice_no: string;
  branch_id: string;
  branch_name: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  vat_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method: PaymentMethod;
  splits?: PaymentSplitDetail[];
  status: 'draft' | 'posted' | 'returned' | 'cancelled' | 'voided';
  sales_rep_id: string;
  sales_rep_name: string;
  journal_entry_id?: string;
  notes?: string;
  void_reason?: string;
  voided_by?: string;
  voided_at?: string;
  restored_by?: string;
  restored_at?: string;
  restore_reason?: string;
  linked_correction_id?: string;
  created_at: string;
}

export * from './guardian';

export interface PurchaseItem {
  id: string;
  product_id: string;
  product_name: string;
  model: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  imei_list?: string[]; // comma/newline parsed
}

export interface Purchase {
  id: string;
  purchase_no: string;
  bill_no: string;
  supplier_id: string;
  supplier_name: string;
  branch_id: string;
  branch_name: string;
  items: PurchaseItem[];
  total_cost: number;
  paid_amount: number;
  due_amount: number;
  payment_method: PaymentMethod;
  splits?: PaymentSplitDetail[];
  status: 'received' | 'draft' | 'returned';
  journal_entry_id?: string;
  received_date: string;
  created_at: string;
}

export interface StockTransfer {
  id: string;
  transfer_no: string;
  from_branch_id: string;
  from_branch_name: string;
  to_branch_id: string;
  to_branch_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  imei_ids?: string[];
  imei_numbers?: string[];
  status: 'pending' | 'in_transit' | 'received' | 'rejected';
  sent_by_name: string;
  received_by_name?: string;
  created_at: string;
  received_at?: string;
}

export interface StockAdjustment {
  id: string;
  adjustment_no: string;
  branch_id: string;
  branch_name: string;
  product_id: string;
  product_name: string;
  adjustment_type: 'increase' | 'decrease' | 'damage' | 'warranty' | 'lost';
  quantity: number;
  imei_id?: string;
  imei1?: string;
  reason: string;
  approved_by?: string;
  created_by: string;
  created_at: string;
}

// Accounting
export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'cogs'
  | 'expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  bn_name?: string;
  type: AccountType;
  category: string;
  balance: number;
  is_active: boolean;
}

export interface JournalLine {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  branch_id?: string;
  description: string;
}

export interface JournalEntry {
  id: string;
  entry_no: string;
  date: string;
  reference_type:
    | 'sale'
    | 'purchase'
    | 'payment'
    | 'collection'
    | 'expense'
    | 'adjustment'
    | 'manual'
    | 'return';
  reference_id: string;
  branch_id: string;
  branch_name: string;
  narration: string;
  lines: JournalLine[];
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  created_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  voucher_no: string;
  branch_id: string;
  branch_name: string;
  category:
    | 'Shop Rent'
    | 'Staff Salaries'
    | 'Electricity & Utilities'
    | 'Internet & Software'
    | 'Transport & Courier'
    | 'Marketing & Promotion'
    | 'Office Maintenance'
    | 'Entertainment'
    | 'Miscellaneous';
  amount: number;
  payment_method: 'cash' | 'bank' | 'bkash' | 'nagad';
  account_id: string;
  paid_to: string;
  description: string;
  approved_by?: string;
  created_by: string;
  created_at: string;
}

export interface Employee {
  id: string;
  emp_id: string;
  name: string;
  phone: string;
  designation: string;
  branch_id: string;
  branch_name: string;
  salary: number;
  monthly_target: number;
  monthly_sales: number;
  achievement_rate: number;
  rating: 'A' | 'B' | 'C' | 'D';
  status: 'active' | 'on_leave' | 'terminated';
  joining_date: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  branch_id: string;
  date: string;
  status: 'present' | 'late' | 'absent' | 'leave';
  in_time?: string;
  out_time?: string;
  notes?: string;
}

// Daily Management Models
export interface DailyDenomination {
  note_1000: number;
  note_500: number;
  note_200: number;
  note_100: number;
  note_50: number;
  note_20: number;
  note_10: number;
  coins: number;
  total_physical_cash: number;
}

export interface DailyReport {
  id: string;
  report_date: string;
  branch_id: string;
  branch_name: string;
  target_sales: number;
  actual_sales: number;
  achievement_pct: number;
  // Cash control
  opening_cash: number;
  cash_sales: number;
  cash_collections: number;
  cash_expenses: number;
  cash_deposits: number;
  expected_closing_cash: number;
  physical_closing_cash: number;
  cash_difference: number;
  denomination?: DailyDenomination;
  mfs_bkash_sales: number;
  mfs_nagad_sales: number;
  bank_sales: number;
  credit_sales: number;
  // Checklist states
  opening_checklist: {
    store_opened_on_time: boolean;
    employee_attendance_checked: boolean;
    opening_cash_verified: boolean;
    previous_closing_verified: boolean;
    pos_software_ready: boolean;
    internet_verified: boolean;
    display_stock_checked: boolean;
    pending_issues_reviewed: boolean;
  };
  closing_checklist: {
    sales_reconciled: boolean;
    cash_counted: boolean;
    stock_issues_verified: boolean;
    imei_scanned_verified: boolean;
    all_expenses_entered: boolean;
    pending_tasks_logged: boolean;
    report_submitted: boolean;
  };
  // Monitoring details
  employee_attendance_count: { present: number; late: number; absent: number };
  customer_complaints_count: number;
  imei_mismatch_count: number;
  problems_logged: string[];
  manager_notes: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'locked';
  submitted_by: string;
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
}

// Weekly Management Report
export interface TopSellingModel {
  rank: number;
  product_name: string;
  category: string;
  quantity_sold: number;
  sales_value: number;
  profit: number;
}

export interface SlowMovingStockItem {
  id: string;
  product_name: string;
  stock_quantity: number;
  days_in_stock: number;
  stock_value: number;
  recommended_action: 'Promotion' | 'Discount' | 'Branch Transfer' | 'Supplier Return' | 'Bundle Offer';
}

export interface WeeklyReport {
  id: string;
  week_label: string;
  start_date: string;
  end_date: string;
  branch_id: string; // 'all' or specific
  branch_name: string;
  total_sales: number;
  target_sales: number;
  achievement_pct: number;
  growth_pct: number;
  top_models: TopSellingModel[];
  slow_moving_stock: SlowMovingStockItem[];
  stock_control: {
    total_stock_value: number;
    physical_stock_diff: number;
    imei_mismatch: number;
    damaged_stock_qty: number;
    warranty_stock_qty: number;
    returned_stock_qty: number;
  };
  cash_accounts: {
    total_collection: number;
    total_expense: number;
    outstanding_collection: number;
    supplier_payable: number;
    cash_difference: number;
  };
  problems: string[];
  actions_taken: string[];
  next_week_plan: {
    sales: string;
    stock: string;
    employee: string;
    customer: string;
    cost_control: string;
  };
  manager_comments: {
    best_achievement: string;
    biggest_problem: string;
    most_important_action: string;
    owner_decision_required: string;
  };
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'locked';
  submitted_by: string;
  submitted_at: string;
  approved_by?: string;
}

// Monthly Management Report
export interface MonthlyReport {
  id: string;
  month_label: string; // e.g. "October 2026"
  year: number;
  month: number;
  branch_id: string;
  branch_name: string;
  summary: {
    total_sales: number;
    gross_profit: number;
    net_profit: number;
    total_stock_value: number;
    cash_and_bank: number;
    customer_outstanding: number;
    major_achievement: string;
    major_issue: string;
  };
  branch_sales_breakdown: Array<{
    branch_name: string;
    target: number;
    actual: number;
    achievement_pct: number;
    growth_pct: number;
  }>;
  profit_analysis: Array<{
    category: 'Mobile' | 'Accessories' | 'Other' | 'Total';
    sales: number;
    cost: number;
    gross_profit: number;
    margin_pct: number;
  }>;
  expenses_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  stock_reconciliation: {
    opening_stock: number;
    purchases: number;
    sales_cost: number;
    transfers_net: number;
    returns_net: number;
    closing_stock: number;
    dead_slow_stock_value: number;
  };
  imei_audit: {
    total_imei: number;
    matched: number;
    mismatch: number;
    missing: number;
    warranty: number;
    returned: number;
  };
  customer_outstanding: {
    opening: number;
    new_credit: number;
    collected: number;
    closing: number;
    major_debtors: Array<{
      customer_name: string;
      amount: number;
      age_days: number;
      action: string;
    }>;
  };
  supplier_payable: {
    opening: number;
    new_credit: number;
    paid: number;
    closing: number;
  };
  branch_rankings: Array<{
    rank: number;
    branch_name: string;
    sales: number;
    profit: number;
    turnover: number;
    collection: number;
    score: number;
  }>;
  major_problems: string[];
  solutions_implemented: string[];
  recommendations: {
    sales_increase: string;
    stock_improvement: string;
    employee_improvement: string;
    cost_reduction: string;
    customer_service: string;
  };
  next_month_targets: {
    sales: number;
    profit: number;
    collection: number;
    stock: number;
    outstanding_reduction: number;
  };
  owner_decisions: string[];
  manager_final_comment: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'locked';
  submitted_by: string;
  submitted_at: string;
  approved_by?: string;
}

export interface AlertNotification {
  id: string;
  type: 'stock' | 'cash' | 'credit' | 'imei' | 'approval' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  branch_id?: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  request_type:
    | 'discount_override'
    | 'credit_limit_override'
    | 'stock_adjustment'
    | 'sales_return'
    | 'expense_large'
    | 'manual_journal';
  reference_id: string;
  branch_id: string;
  branch_name: string;
  requester_name: string;
  amount?: number;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_name?: string;
  action_date?: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  role: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'post' | 'reverse' | 'login';
  module: string;
  record_id: string;
  summary: string;
  old_value?: string;
  new_value?: string;
  ip_address: string;
  created_at: string;
}

export interface AIInsight {
  id: string;
  category: 'sales' | 'inventory' | 'margin' | 'debtor' | 'anomaly';
  type: 'fact' | 'recommendation' | 'alert';
  headline: string;
  detail: string;
  metric?: string;
  confidence: number;
  action_suggestion?: string;
}

export interface WarrantyCase {
  id: string;
  ticket_no: string;
  imei: string;
  product_name: string;
  brand_name: string;
  customer_name: string;
  customer_phone: string;
  branch_id: string;
  branch_name: string;
  issue_description: string;
  status: 'received' | 'sent_to_brand' | 'repaired' | 'replaced' | 'delivered';
  received_date: string;
  expected_return_date?: string;
  resolved_date?: string;
  service_charge: number;
  notes?: string;
}

export interface CustomerComplaint {
  id: string;
  ticket_no: string;
  customer_name: string;
  customer_phone: string;
  branch_id: string;
  branch_name: string;
  category: 'device_fault' | 'billing' | 'staff_behavior' | 'delayed_warranty' | 'other';
  subject: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Quotation {
  id: string;
  quotation_no: string;
  customer_name: string;
  customer_phone: string;
  company_name?: string;
  branch_id: string;
  branch_name: string;
  items: Array<{
    product_id: string;
    product_name: string;
    model: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total_amount: number;
  valid_until: string;
  notes?: string;
  status: 'active' | 'converted' | 'expired';
  created_by: string;
  created_at: string;
}

export interface SalesReturn {
  id: string;
  return_no: string;
  invoice_no: string;
  customer_name: string;
  customer_phone: string;
  branch_id: string;
  branch_name: string;
  items: Array<{
    product_id: string;
    product_name: string;
    imei1?: string;
    quantity: number;
    refund_unit_price: number;
    subtotal: number;
  }>;
  total_refund: number;
  refund_method: 'cash' | 'bkash' | 'credit_note';
  reason: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
}

export interface BankReconciliationRecord {
  id: string;
  account_id: string;
  account_name: string;
  statement_date: string;
  book_balance: number;
  bank_statement_balance: number;
  variance: number;
  status: 'matched' | 'unreconciled';
  notes?: string;
  reconciled_by: string;
  created_at: string;
}

export interface SMSNotificationLog {
  id: string;
  recipient_phone: string;
  customer_name: string;
  template_type: 'sale_invoice' | 'payment_receipt' | 'due_reminder' | 'warranty_update';
  message: string;
  channel: 'sms' | 'whatsapp';
  status: 'sent' | 'delivered';
  created_at: string;
}

export interface InstallmentScheduleItem {
  installment_no: number;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_date?: string;
  paid_amount?: number;
  payment_method?: 'cash' | 'bkash' | 'bank';
  receipt_no?: string;
}

export interface InstallmentAgreement {
  id: string;
  agreement_no: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_nid: string;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_relation: string;
  guarantor_nid?: string;
  product_id: string;
  product_name: string;
  imei: string;
  branch_id: string;
  branch_name: string;
  cash_price: number;
  down_payment: number;
  financed_amount: number;
  interest_rate_percent: number;
  total_installments: number;
  monthly_amount: number;
  total_payable: number;
  total_paid: number;
  remaining_due: number;
  start_date: string;
  status: 'active' | 'completed' | 'overdue';
  schedule: InstallmentScheduleItem[];
  created_at: string;
}

export interface DatabaseSnapshot {
  id: string;
  name: string;
  timestamp: string;
  size_kb: number;
  record_counts: {
    products: number;
    imeis: number;
    sales: number;
    purchases: number;
    journals: number;
    customers: number;
    suppliers: number;
  };
  data: any;
}



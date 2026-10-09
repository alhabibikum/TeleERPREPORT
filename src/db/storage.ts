import {
  Company,
  Branch,
  User,
  ProductCategory,
  Brand,
  Product,
  IMEIDevice,
  IMEIMovement,
  Customer,
  Supplier,
  Account,
  Sale,
  Purchase,
  Expense,
  Employee,
  AttendanceRecord,
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  AlertNotification,
  ApprovalRequest,
  AuditLog,
  JournalEntry,
  StockTransfer,
  StockAdjustment,
  PaymentSplitDetail,
  IMEIStatus,
  WarrantyCase,
  CustomerComplaint,
  Quotation,
  SalesReturn,
  BankReconciliationRecord,
  SMSNotificationLog,
  InstallmentAgreement,
  DatabaseSnapshot
} from '../types';

import {
  initialCompany,
  initialBranches,
  initialUsers,
  initialCategories,
  initialBrands,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialAccounts,
  initialIMEIs,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialEmployees,
  initialAttendance,
  initialJournals,
  initialTransfers,
  initialAlerts,
  initialApprovals,
  initialAuditLogs,
  initialDailyReport,
  initialWeeklyReport,
  initialMonthlyReport,
  initialWarranties,
  initialComplaints,
  initialQuotations,
  initialSalesReturns,
  initialBankReconciliations,
  initialSMSLogs,
  initialInstallments
} from './initialData';

export interface DatabaseState {
  company: Company;
  branches: Branch[];
  users: User[];
  categories: ProductCategory[];
  brands: Brand[];
  products: Product[];
  imeis: IMEIDevice[];
  imei_movements: IMEIMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  accounts: Account[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  journals: JournalEntry[];
  transfers: StockTransfer[];
  adjustments: StockAdjustment[];
  alerts: AlertNotification[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  dailyReports: DailyReport[];
  weeklyReports: WeeklyReport[];
  monthlyReports: MonthlyReport[];
  warranties: WarrantyCase[];
  complaints: CustomerComplaint[];
  quotations: Quotation[];
  salesReturns: SalesReturn[];
  bankReconciliations: BankReconciliationRecord[];
  smsLogs: SMSNotificationLog[];
  installments: InstallmentAgreement[];
}

const STORAGE_KEY = 'telecom_erp_v1_db';

class StorageService {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          company: parsed.company || initialCompany,
          branches: Array.isArray(parsed.branches) && parsed.branches.length > 0 ? parsed.branches : initialBranches,
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : initialUsers,
          categories: Array.isArray(parsed.categories) ? parsed.categories : initialCategories,
          brands: Array.isArray(parsed.brands) ? parsed.brands : initialBrands,
          products: Array.isArray(parsed.products) ? parsed.products : initialProducts,
          imeis: Array.isArray(parsed.imeis) ? parsed.imeis : initialIMEIs,
          imei_movements: Array.isArray(parsed.imei_movements) ? parsed.imei_movements : [],
          customers: Array.isArray(parsed.customers) ? parsed.customers : initialCustomers,
          suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : initialSuppliers,
          accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0 ? parsed.accounts : initialAccounts,
          sales: Array.isArray(parsed.sales) ? parsed.sales : initialSales,
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : initialPurchases,
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : initialExpenses,
          employees: Array.isArray(parsed.employees) ? parsed.employees : initialEmployees,
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : initialAttendance,
          journals: Array.isArray(parsed.journals) ? parsed.journals : initialJournals,
          transfers: Array.isArray(parsed.transfers) ? parsed.transfers : initialTransfers,
          adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
          alerts: Array.isArray(parsed.alerts) ? parsed.alerts : initialAlerts,
          approvals: Array.isArray(parsed.approvals) ? parsed.approvals : initialApprovals,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : initialAuditLogs,
          dailyReports: Array.isArray(parsed.dailyReports) ? parsed.dailyReports : [initialDailyReport],
          weeklyReports: Array.isArray(parsed.weeklyReports) ? parsed.weeklyReports : [initialWeeklyReport],
          monthlyReports: Array.isArray(parsed.monthlyReports) ? parsed.monthlyReports : [initialMonthlyReport],
          warranties: Array.isArray(parsed.warranties) ? parsed.warranties : initialWarranties,
          complaints: Array.isArray(parsed.complaints) ? parsed.complaints : initialComplaints,
          quotations: Array.isArray(parsed.quotations) ? parsed.quotations : initialQuotations,
          salesReturns: Array.isArray(parsed.salesReturns) ? parsed.salesReturns : initialSalesReturns,
          bankReconciliations: Array.isArray(parsed.bankReconciliations) ? parsed.bankReconciliations : initialBankReconciliations,
          smsLogs: Array.isArray(parsed.smsLogs) ? parsed.smsLogs : initialSMSLogs,
          installments: Array.isArray(parsed.installments) ? parsed.installments : initialInstallments
        };
      }
    } catch (e) {
      console.error('Failed to load DB state, resetting to initial', e);
    }

    return {
      company: initialCompany,
      branches: initialBranches,
      users: initialUsers,
      categories: initialCategories,
      brands: initialBrands,
      products: initialProducts,
      imeis: initialIMEIs,
      imei_movements: [
        {
          id: 'mov_init_1',
          imei1: '358249110294825',
          product_name: 'Samsung Galaxy S24 Ultra 5G',
          from_status: 'in_stock',
          to_status: 'sold',
          from_branch_id: 'br_1',
          from_branch_name: 'Motijheel Flagship Store',
          reference_type: 'sale',
          reference_id: 'INV-2026-089',
          notes: 'Sold to Tanvir Hossain via POS',
          created_by_name: 'Mehedi Hasan',
          created_at: '2026-10-06T14:30:00'
        }
      ],
      customers: initialCustomers,
      suppliers: initialSuppliers,
      accounts: initialAccounts,
      sales: initialSales,
      purchases: initialPurchases,
      expenses: initialExpenses,
      employees: initialEmployees,
      attendance: initialAttendance,
      journals: initialJournals,
      transfers: initialTransfers,
      adjustments: [],
      alerts: initialAlerts,
      approvals: initialApprovals,
      auditLogs: initialAuditLogs,
      dailyReports: [initialDailyReport],
      weeklyReports: [initialWeeklyReport],
      monthlyReports: [initialMonthlyReport],
      warranties: initialWarranties,
      complaints: initialComplaints,
      quotations: initialQuotations,
      salesReturns: initialSalesReturns,
      bankReconciliations: initialBankReconciliations,
      smsLogs: initialSMSLogs,
      installments: initialInstallments
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Listener notification error', err);
      }
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // --- 360-DEGREE BACKUP, RESTORE & SNAPSHOTS ---
  public exportBackup(): string {
    const meta = {
      app: 'TelecomERP Pro',
      version: '1.2.0',
      exported_at: new Date().toISOString(),
      counts: this.getRecordCounts()
    };
    return JSON.stringify({ meta, data: this.state }, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; message: string; counts?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingState: DatabaseState = parsed.data ? parsed.data : parsed;

      if (!incomingState.company || !Array.isArray(incomingState.branches) || !Array.isArray(incomingState.products)) {
        return { success: false, message: 'Invalid database backup structure: missing company, branches, or products table.' };
      }

      // Safety: create an automatic emergency rollback snapshot before importing
      this.createSnapshot('Pre-Restore Auto Snapshot (' + new Date().toLocaleTimeString() + ')');

      this.state = {
        ...this.state,
        ...incomingState,
        // Guarantee all arrays are defined
        branches: incomingState.branches || initialBranches,
        products: incomingState.products || [],
        imeis: incomingState.imeis || [],
        customers: incomingState.customers || [],
        suppliers: incomingState.suppliers || [],
        sales: incomingState.sales || [],
        purchases: incomingState.purchases || [],
        journals: incomingState.journals || [],
        accounts: incomingState.accounts || initialAccounts,
        expenses: incomingState.expenses || [],
        employees: incomingState.employees || [],
        attendance: incomingState.attendance || [],
        transfers: incomingState.transfers || [],
        adjustments: incomingState.adjustments || [],
        alerts: incomingState.alerts || [],
        approvals: incomingState.approvals || [],
        auditLogs: incomingState.auditLogs || [],
        dailyReports: incomingState.dailyReports || [],
        weeklyReports: incomingState.weeklyReports || [],
        monthlyReports: incomingState.monthlyReports || [],
        warranties: incomingState.warranties || [],
        complaints: incomingState.complaints || [],
        quotations: incomingState.quotations || [],
        salesReturns: incomingState.salesReturns || [],
        bankReconciliations: incomingState.bankReconciliations || [],
        smsLogs: incomingState.smsLogs || [],
        installments: incomingState.installments || []
      };

      this.state.auditLogs.unshift({
        id: 'aud_' + Date.now(),
        user_name: 'System Admin',
        role: 'super_admin',
        action: 'create',
        module: 'Database Restore',
        record_id: 'RESTORE-' + Date.now(),
        summary: 'Database successfully restored from external JSON backup.',
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString()
      });

      this.persist();
      return { success: true, message: 'Database restored successfully!', counts: this.getRecordCounts() };
    } catch (e: any) {
      console.error('Import parse error', e);
      return { success: false, message: 'JSON Parse Error: ' + (e?.message || 'Invalid format') };
    }
  }

  // --- BROWSER LOCAL STORAGE SNAPSHOTS ---
  public getSnapshots(): DatabaseSnapshot[] {
    try {
      const saved = localStorage.getItem('telecom_erp_snapshots_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load snapshots', e);
    }
    return [];
  }

  public createSnapshot(name: string): DatabaseSnapshot {
    const snapshots = this.getSnapshots();
    const str = JSON.stringify(this.state);
    const sizeKb = Math.round((str.length * 2) / 1024);

    const newSnapshot: DatabaseSnapshot = {
      id: 'snap_' + Date.now(),
      name: name.trim() || 'Manual Snapshot ' + new Date().toLocaleString(),
      timestamp: new Date().toISOString(),
      size_kb: sizeKb,
      record_counts: {
        products: this.state.products.length,
        imeis: this.state.imeis.length,
        sales: this.state.sales.length,
        purchases: this.state.purchases.length,
        journals: this.state.journals.length,
        customers: this.state.customers.length,
        suppliers: this.state.suppliers.length
      },
      data: JSON.parse(str)
    };

    // Keep up to 10 latest snapshots
    snapshots.unshift(newSnapshot);
    if (snapshots.length > 10) snapshots.pop();

    try {
      localStorage.setItem('telecom_erp_snapshots_v1', JSON.stringify(snapshots));
    } catch (e) {
      console.warn('Storage quota warning for snapshots', e);
    }

    return newSnapshot;
  }

  public restoreSnapshot(id: string): boolean {
    const snapshots = this.getSnapshots();
    const snap = snapshots.find(s => s.id === id);
    if (!snap || !snap.data) return false;

    // Auto-save current before rollback
    this.createSnapshot('Safety Pre-Rollback Snapshot');

    this.state = snap.data;
    this.persist();
    return true;
  }

  public deleteSnapshot(id: string): boolean {
    let snapshots = this.getSnapshots();
    snapshots = snapshots.filter(s => s.id !== id);
    try {
      localStorage.setItem('telecom_erp_snapshots_v1', JSON.stringify(snapshots));
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- 360-DEGREE SELECTIVE RESETS ---
  public resetToDemo(): void {
    this.state = {
      company: { ...initialCompany },
      branches: JSON.parse(JSON.stringify(initialBranches)),
      users: JSON.parse(JSON.stringify(initialUsers)),
      categories: JSON.parse(JSON.stringify(initialCategories)),
      brands: JSON.parse(JSON.stringify(initialBrands)),
      products: JSON.parse(JSON.stringify(initialProducts)),
      imeis: JSON.parse(JSON.stringify(initialIMEIs)),
      imei_movements: [
        {
          id: 'mov_init_1',
          imei1: '358249110294825',
          product_name: 'Samsung Galaxy S24 Ultra 5G',
          from_status: 'in_stock',
          to_status: 'sold',
          from_branch_id: 'br_1',
          from_branch_name: 'Motijheel Flagship Store',
          reference_type: 'sale',
          reference_id: 'INV-2026-089',
          notes: 'Sold to Tanvir Hossain via POS',
          created_by_name: 'Mehedi Hasan',
          created_at: '2026-10-06T14:30:00'
        }
      ],
      customers: JSON.parse(JSON.stringify(initialCustomers)),
      suppliers: JSON.parse(JSON.stringify(initialSuppliers)),
      accounts: JSON.parse(JSON.stringify(initialAccounts)),
      sales: JSON.parse(JSON.stringify(initialSales)),
      purchases: JSON.parse(JSON.stringify(initialPurchases)),
      expenses: JSON.parse(JSON.stringify(initialExpenses)),
      employees: JSON.parse(JSON.stringify(initialEmployees)),
      attendance: JSON.parse(JSON.stringify(initialAttendance)),
      journals: JSON.parse(JSON.stringify(initialJournals)),
      transfers: JSON.parse(JSON.stringify(initialTransfers)),
      adjustments: [],
      alerts: JSON.parse(JSON.stringify(initialAlerts)),
      approvals: JSON.parse(JSON.stringify(initialApprovals)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
      dailyReports: [JSON.parse(JSON.stringify(initialDailyReport))],
      weeklyReports: [JSON.parse(JSON.stringify(initialWeeklyReport))],
      monthlyReports: [JSON.parse(JSON.stringify(initialMonthlyReport))],
      warranties: JSON.parse(JSON.stringify(initialWarranties)),
      complaints: JSON.parse(JSON.stringify(initialComplaints)),
      quotations: JSON.parse(JSON.stringify(initialQuotations)),
      salesReturns: JSON.parse(JSON.stringify(initialSalesReturns)),
      bankReconciliations: JSON.parse(JSON.stringify(initialBankReconciliations)),
      smsLogs: JSON.parse(JSON.stringify(initialSMSLogs)),
      installments: JSON.parse(JSON.stringify(initialInstallments))
    };
    this.persist();
  }

  public resetTransactionsOnly(): void {
    // Keep master catalogs: company, branches, users, categories, brands, products, customers, suppliers, accounts, employees
    this.state.sales = [];
    this.state.purchases = [];
    this.state.expenses = [];
    this.state.installments = [];
    this.state.quotations = [];
    this.state.salesReturns = [];
    this.state.warranties = [];
    this.state.complaints = [];
    this.state.bankReconciliations = [];
    this.state.smsLogs = [];
    this.state.approvals = [];
    this.state.adjustments = [];
    this.state.transfers = [];

    // Reset all IMEIs to in_stock
    this.state.imeis.forEach(i => {
      i.status = 'in_stock';
      i.sale_invoice_id = undefined;
    });
    this.state.imei_movements = [];

    // Reset customer & supplier balances to 0
    this.state.customers.forEach(c => (c.current_balance = 0));
    this.state.suppliers.forEach(s => (s.current_payable = 0));

    // Reset branch cash balances to default ৳100,000 opening float
    this.state.branches.forEach(b => (b.cash_balance = 100000));

    // Reset journal entries to opening balances
    this.state.journals = initialJournals.slice(0, 3);

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: 'Owner / Super Admin',
      role: 'super_admin',
      action: 'delete',
      module: 'System Reset',
      record_id: 'RESET-TX-' + Date.now(),
      summary: 'All transaction history cleared. Master products and customer directories preserved.',
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    });

    this.persist();
  }

  public resetToFreshBlank(): void {
    // 100% COMPLETE BLANK CLEAN SLATE - Every single page becomes 0 records!
    this.state.products = [];
    this.state.imeis = [];
    this.state.imei_movements = [];
    this.state.sales = [];
    this.state.purchases = [];
    this.state.expenses = [];
    this.state.installments = [];
    this.state.quotations = [];
    this.state.salesReturns = [];
    this.state.warranties = [];
    this.state.complaints = [];
    this.state.bankReconciliations = [];
    this.state.smsLogs = [];
    this.state.approvals = [];
    this.state.adjustments = [];
    this.state.transfers = [];
    this.state.customers = []; // Fully 0 records
    this.state.suppliers = []; // Fully 0 records
    this.state.employees = []; // Fully 0 records
    this.state.attendance = []; // Fully 0 records
    this.state.journals = []; // Fully 0 records
    this.state.dailyReports = []; // Fully 0 records
    this.state.weeklyReports = []; // Fully 0 records
    this.state.monthlyReports = []; // Fully 0 records
    this.state.alerts = []; // Fully 0 records
    this.state.categories = []; // Fully 0 records
    this.state.brands = []; // Fully 0 records

    // Reset branch cash balances to 0
    this.state.branches.forEach(b => (b.cash_balance = 0));

    // Reset all account balances to 0 in chart of accounts
    this.state.accounts.forEach(a => {
      a.balance = 0;
    });

    this.state.auditLogs = [
      {
        id: 'aud_' + Date.now(),
        user_name: 'Owner / Super Admin',
        role: 'super_admin',
        action: 'delete',
        module: 'System Reset',
        record_id: 'RESET-BLANK-' + Date.now(),
        summary: 'Database 100% completely blanked and cleaned. All pages and tables have 0 records.',
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString()
      }
    ];

    this.persist();
  }

  // --- RECORD COUNTS & INTEGRITY CHECK ---
  public getRecordCounts() {
    return {
      products: this.state.products.length,
      imeis: this.state.imeis.length,
      sales: this.state.sales.length,
      purchases: this.state.purchases.length,
      customers: this.state.customers.length,
      suppliers: this.state.suppliers.length,
      journals: this.state.journals.length,
      accounts: this.state.accounts.length,
      branches: this.state.branches.length,
      installments: this.state.installments.length,
      warranties: this.state.warranties.length,
      expenses: this.state.expenses.length
    };
  }

  public verifyIntegrity() {
    const issues: string[] = [];

    // 1. Check double entry balanced in all journals
    let unbalancedJournals = 0;
    this.state.journals.forEach(j => {
      const dr = j.lines.reduce((s, l) => s + (l.debit || 0), 0);
      const cr = j.lines.reduce((s, l) => s + (l.credit || 0), 0);
      if (Math.abs(dr - cr) > 0.01) {
        unbalancedJournals++;
        issues.push(`Journal #${j.entry_no} is unbalanced (Dr: ৳${dr}, Cr: ৳${cr})`);
      }
    });

    // 2. Check orphan IMEIs
    let orphanImeis = 0;
    this.state.imeis.forEach(im => {
      const prodExists = this.state.products.some(p => p.id === im.product_id);
      if (!prodExists) {
        orphanImeis++;
        issues.push(`IMEI ${im.imei1} references missing Product ID: ${im.product_id}`);
      }
    });

    // 3. Size calculation
    const jsonStr = JSON.stringify(this.state);
    const sizeKb = Math.round((jsonStr.length * 2) / 1024);

    return {
      isHealthy: issues.length === 0,
      issues,
      stats: {
        totalRecords:
          this.state.products.length +
          this.state.imeis.length +
          this.state.sales.length +
          this.state.purchases.length +
          this.state.customers.length +
          this.state.journals.length,
        tableCounts: this.getRecordCounts(),
        storageSizeKB: sizeKb,
        unbalancedJournals,
        orphanImeis
      }
    };
  }

  // --- ATOMIC TRANSACTION: CREATE SALE ---
  public createSale(params: {
    branch_id: string;
    customer_id: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      discount: number;
      imei_id?: string;
    }>;
    payment_method: 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'credit' | 'split';
    splits?: PaymentSplitDetail[];
    sales_rep_id: string;
    sales_rep_name: string;
    notes?: string;
  }): { success: boolean; sale?: Sale; error?: string } {
    const branch = this.state.branches.find(b => b.id === params.branch_id);
    if (!branch) return { success: false, error: 'Invalid branch ID' };

    let customer = this.state.customers.find(c => c.id === params.customer_id);
    if (!customer) {
      customer = this.state.customers[0];
      if (!customer) {
        customer = {
          id: 'cust_walkin',
          code: 'CUST-001',
          name: 'Walk-in Retail Customer',
          phone: '01700-000000',
          address: 'Counter Cash Sale',
          credit_limit: 0,
          current_balance: 0,
          opening_balance: 0,
          branch_id: branch.id,
          created_at: new Date().toISOString()
        };
        this.state.customers.push(customer);
      }
    }

    // 1. Validate IMEIs & Stock
    const saleItems = [];
    let subtotal = 0;
    let totalDiscount = 0;
    let totalCost = 0;

    const imeisToUpdate: IMEIDevice[] = [];

    for (const item of params.items) {
      const prod = this.state.products.find(p => p.id === item.product_id);
      if (!prod) return { success: false, error: `Product not found: ${item.product_id}` };

      let imeiDevice: IMEIDevice | undefined;
      if (prod.has_imei) {
        if (!item.imei_id) {
          return { success: false, error: `IMEI selection is required for mobile handset: ${prod.name}` };
        }
        imeiDevice = this.state.imeis.find(im => im.id === item.imei_id);
        if (!imeiDevice) {
          return { success: false, error: `IMEI ID not found in database: ${item.imei_id}` };
        }
        if (imeiDevice.status !== 'in_stock') {
          return { success: false, error: `Device ${imeiDevice.imei1} is currently ${imeiDevice.status}, cannot sell!` };
        }
        if (imeiDevice.branch_id !== params.branch_id) {
          return {
            success: false,
            error: `Device ${imeiDevice.imei1} belongs to ${imeiDevice.branch_name}, not this branch (${branch.name})!`
          };
        }
        imeisToUpdate.push(imeiDevice);
      }

      const itemSubtotal = (item.unit_price - item.discount) * item.quantity;
      subtotal += item.unit_price * item.quantity;
      totalDiscount += item.discount * item.quantity;
      totalCost += prod.cost_price * item.quantity;

      saleItems.push({
        id: 'sitem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        product_id: prod.id,
        product_name: prod.name,
        model: prod.model,
        has_imei: prod.has_imei,
        imei_id: imeiDevice?.id,
        imei1: imeiDevice?.imei1,
        imei2: imeiDevice?.imei2,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: prod.cost_price,
        discount: item.discount,
        subtotal: itemSubtotal,
        warranty_months: prod.warranty_months
      });
    }

    const totalAmount = subtotal - totalDiscount;

    // Determine paid and due amounts
    let paidAmount = 0;
    let dueAmount = 0;

    if (params.payment_method === 'credit') {
      dueAmount = totalAmount;
      paidAmount = 0;
    } else if (params.payment_method === 'split' && params.splits && params.splits.length > 0) {
      paidAmount = params.splits
        .filter(s => s.method !== 'credit')
        .reduce((sum, s) => sum + s.amount, 0);
      const creditSplit = params.splits.find(s => s.method === 'credit');
      dueAmount = creditSplit ? creditSplit.amount : Math.max(0, totalAmount - paidAmount);
    } else {
      paidAmount = totalAmount;
      dueAmount = 0;
    }

    // Check customer credit limit
    if (dueAmount > 0) {
      if (customer.credit_limit > 0 && customer.current_balance + dueAmount > customer.credit_limit) {
        return {
          success: false,
          error: `Credit limit exceeded! Customer limit: ৳${customer.credit_limit.toLocaleString('en-IN')}, Current balance: ৳${customer.current_balance.toLocaleString('en-IN')}, Requested due: ৳${dueAmount.toLocaleString('en-IN')}`
        };
      }
    }

    const invoiceNo = 'INV-' + new Date().getFullYear() + '-' + String(this.state.sales.length + 101).padStart(3, '0');
    const saleId = 'sale_' + Date.now();
    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(this.state.journals.length + 201).padStart(3, '0');

    // 2. Build Double-Entry Accounting Journal
    const journalLines = [];
    let drTotal = 0;
    let crTotal = 0;

    // Debits: Cash / Bank / MFS / Receivable
    if (params.payment_method === 'split' && params.splits) {
      for (const split of params.splits) {
        if (split.amount <= 0) continue;
        let accCode = '1010'; // default motijheel cash
        let accName = 'Cash in Hand';
        if (split.method === 'cash') {
          if (branch.id === 'br_2') {
            accCode = '1011';
            accName = 'Cash in Hand - Bashundhara';
          } else if (branch.id === 'br_3') {
            accCode = '1012';
            accName = 'Cash in Hand - Uttara';
          } else {
            accCode = '1010';
            accName = 'Cash in Hand - Motijheel';
          }
        } else if (split.method === 'bank') {
          accCode = '1020';
          accName = 'City Bank Ltd. Current A/C';
        } else if (split.method === 'bkash') {
          accCode = '1030';
          accName = 'bKash Merchant Account';
        } else if (split.method === 'nagad') {
          accCode = '1031';
          accName = 'Nagad Merchant Account';
        } else if (split.method === 'rocket') {
          accCode = '1032';
          accName = 'Rocket Merchant Account';
        } else if (split.method === 'credit') {
          accCode = '1100';
          accName = 'Accounts Receivable (Customer Ledger)';
        }

        journalLines.push({
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + accCode,
          account_code: accCode,
          account_name: accName,
          debit: split.amount,
          credit: 0,
          branch_id: branch.id,
          description: `Sale ${invoiceNo} receipt via ${split.method.toUpperCase()} ${split.reference || ''}`
        });
        drTotal += split.amount;
      }
    } else if (params.payment_method === 'credit') {
      journalLines.push({
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_1100',
        account_code: '1100',
        account_name: 'Accounts Receivable (Customer Ledger)',
        debit: totalAmount,
        credit: 0,
        branch_id: branch.id,
        description: `Credit sale ${invoiceNo} to ${customer.name}`
      });
      drTotal += totalAmount;
    } else {
      // Single full payment
      let accCode = '1010';
      let accName = 'Cash in Hand';
      if (params.payment_method === 'cash') {
        accCode = branch.id === 'br_2' ? '1011' : branch.id === 'br_3' ? '1012' : '1010';
        accName = `Cash in Hand - ${branch.name}`;
      } else if (params.payment_method === 'bank') {
        accCode = '1020';
        accName = 'City Bank Ltd. Current A/C';
      } else if (params.payment_method === 'bkash') {
        accCode = '1030';
        accName = 'bKash Merchant Account';
      } else if (params.payment_method === 'nagad') {
        accCode = '1031';
        accName = 'Nagad Merchant Account';
      } else if (params.payment_method === 'rocket') {
        accCode = '1032';
        accName = 'Rocket Merchant Account';
      }

      journalLines.push({
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_' + accCode,
        account_code: accCode,
        account_name: accName,
        debit: totalAmount,
        credit: 0,
        branch_id: branch.id,
        description: `Sale ${invoiceNo} receipt via ${params.payment_method.toUpperCase()}`
      });
      drTotal += totalAmount;
    }

    // Credits: Sales Revenue
    journalLines.push({
      id: 'jl_' + Math.random().toString(36).slice(2, 8),
      account_id: 'acc_4010',
      account_code: '4010',
      account_name: 'Mobile Phone & Accessory Sales Revenue',
      debit: 0,
      credit: totalAmount,
      branch_id: branch.id,
      description: `Revenue for invoice ${invoiceNo}`
    });
    crTotal += totalAmount;

    // COGS and Inventory Reduction
    if (totalCost > 0) {
      journalLines.push({
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_5010',
        account_code: '5010',
        account_name: 'Cost of Goods Sold (COGS)',
        debit: totalCost,
        credit: 0,
        branch_id: branch.id,
        description: `Cost of goods for invoice ${invoiceNo}`
      });
      journalLines.push({
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_1200',
        account_code: '1200',
        account_name: 'Inventory Asset',
        debit: 0,
        credit: totalCost,
        branch_id: branch.id,
        description: `Inventory reduction for invoice ${invoiceNo}`
      });
      drTotal += totalCost;
      crTotal += totalCost;
    }

    // Double-entry balancing assertion: Dr must equal Cr!
    if (Math.abs(drTotal - crTotal) > 0.01) {
      return {
        success: false,
        error: `Accounting journal unbalanced! Dr: ৳${drTotal} != Cr: ৳${crTotal}. Transaction aborted for safety.`
      };
    }

    // 3. Mark IMEIs as SOLD and record movements
    const nowIso = new Date().toISOString();
    for (const dev of imeisToUpdate) {
      dev.status = 'sold';
      dev.sold_at = nowIso;
      dev.sale_invoice_id = invoiceNo;
      dev.customer_id = customer.id;
      dev.customer_name = customer.name;
      dev.warranty_expire_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      this.state.imei_movements.unshift({
        id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        imei1: dev.imei1,
        product_name: dev.product_name,
        from_status: 'in_stock',
        to_status: 'sold',
        from_branch_id: branch.id,
        from_branch_name: branch.name,
        reference_type: 'sale',
        reference_id: invoiceNo,
        notes: `Sold to ${customer.name} (Inv: ${invoiceNo})`,
        created_by_name: params.sales_rep_name,
        created_at: nowIso
      });
    }

    // 4. Update customer balance
    if (dueAmount > 0) {
      customer.current_balance += dueAmount;
    }

    // 5. Update branch cash if cash received
    if (params.payment_method === 'cash') {
      branch.cash_balance += paidAmount;
    } else if (params.splits) {
      const cashSplit = params.splits.find(s => s.method === 'cash');
      if (cashSplit) branch.cash_balance += cashSplit.amount;
    }

    // 6. Record Journal Entry
    const journalEntry: JournalEntry = {
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'sale',
      reference_id: invoiceNo,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `POS Sale ${invoiceNo} to ${customer.name}`,
      lines: journalLines,
      total_debit: drTotal,
      total_credit: crTotal,
      is_posted: true,
      created_by: params.sales_rep_name,
      created_at: nowIso
    };
    this.state.journals.unshift(journalEntry);

    // 7. Record Sale object
    const newSale: Sale = {
      id: saleId,
      invoice_no: invoiceNo,
      branch_id: branch.id,
      branch_name: branch.name,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      items: saleItems,
      subtotal,
      discount: totalDiscount,
      vat_amount: 0,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      payment_method: params.payment_method,
      splits: params.splits,
      status: 'posted',
      sales_rep_id: params.sales_rep_id,
      sales_rep_name: params.sales_rep_name,
      journal_entry_id: jrnNo,
      notes: params.notes,
      created_at: nowIso
    };
    this.state.sales.unshift(newSale);

    // 8. Add Audit Log
    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.sales_rep_name,
      role: 'cashier',
      action: 'post',
      module: 'POS / Sales',
      record_id: invoiceNo,
      summary: `Completed sale ${invoiceNo} for ৳${totalAmount.toLocaleString('en-IN')}`,
      ip_address: '103.145.12.89',
      created_at: nowIso
    });

    // 9. Persist atomically
    this.persist();

    return { success: true, sale: newSale };
  }

  // --- ATOMIC TRANSACTION: CREATE PURCHASE ---
  public createPurchase(params: {
    bill_no: string;
    supplier_id: string;
    branch_id: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_cost: number;
      imei_list?: string[];
    }>;
    paid_amount: number;
    payment_method: 'cash' | 'bank' | 'credit' | 'split';
    user_name: string;
  }): { success: boolean; purchase?: Purchase; error?: string } {
    const supplier = this.state.suppliers.find(s => s.id === params.supplier_id);
    if (!supplier) return { success: false, error: 'Supplier not found' };

    const branch = this.state.branches.find(b => b.id === params.branch_id);
    if (!branch) return { success: false, error: 'Branch/Warehouse not found' };

    let totalCost = 0;
    const purchaseItems = [];
    const newImeis: IMEIDevice[] = [];
    const nowIso = new Date().toISOString();

    for (const item of params.items) {
      const prod = this.state.products.find(p => p.id === item.product_id);
      if (!prod) return { success: false, error: `Product not found: ${item.product_id}` };

      const subtotal = item.quantity * item.unit_cost;
      totalCost += subtotal;

      // Validate duplicate IMEIs if provided
      if (prod.has_imei && item.imei_list) {
        for (const imeiNum of item.imei_list) {
          const cleanImei = imeiNum.trim();
          if (!cleanImei) continue;
          const existing = this.state.imeis.find(i => i.imei1 === cleanImei || i.imei2 === cleanImei);
          if (existing) {
            return {
              success: false,
              error: `IMEI ${cleanImei} already exists in database (Current Status: ${existing.status})! Duplicate not allowed.`
            };
          }

          newImeis.push({
            id: 'imei_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            imei1: cleanImei,
            serial_number: 'SN-' + cleanImei.slice(-6),
            product_id: prod.id,
            product_name: prod.name,
            brand_name: prod.brand_name,
            model: prod.model,
            color: prod.color || 'Standard',
            storage: prod.storage,
            ram: prod.ram,
            cost_price: item.unit_cost,
            selling_price: prod.selling_price,
            supplier_id: supplier.id,
            supplier_name: supplier.name,
            purchase_invoice_id: params.bill_no,
            branch_id: branch.id,
            branch_name: branch.name,
            current_location: branch.is_warehouse ? 'Warehouse Receiving Bay' : 'Store Stock Room',
            status: 'in_stock',
            created_at: nowIso
          });
        }
      }

      purchaseItems.push({
        id: 'pitem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        product_id: prod.id,
        product_name: prod.name,
        model: prod.model,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        subtotal,
        imei_list: item.imei_list
      });
    }

    const dueAmount = Math.max(0, totalCost - params.paid_amount);
    const purchaseNo = 'PUR-' + new Date().getFullYear() + '-' + String(this.state.purchases.length + 101).padStart(3, '0');
    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(this.state.journals.length + 201).padStart(3, '0');

    // Add new IMEIs
    for (const im of newImeis) {
      this.state.imeis.unshift(im);
      this.state.imei_movements.unshift({
        id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        imei1: im.imei1,
        product_name: im.product_name,
        from_status: 'in_stock',
        to_status: 'in_stock',
        to_branch_id: branch.id,
        to_branch_name: branch.name,
        reference_type: 'purchase',
        reference_id: purchaseNo,
        notes: `Received from supplier ${supplier.name} via bill ${params.bill_no}`,
        created_by_name: params.user_name,
        created_at: nowIso
      });
    }

    // Update supplier payable
    if (dueAmount > 0) {
      supplier.current_payable += dueAmount;
    }

    // Create journal entry: Dr Inventory, Cr Cash/Bank/Payable
    const journalLines = [
      {
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_1200',
        account_code: '1200',
        account_name: 'Inventory Asset',
        debit: totalCost,
        credit: 0,
        branch_id: branch.id,
        description: `Goods receipt from ${supplier.name} (${purchaseNo})`
      }
    ];

    if (params.paid_amount > 0) {
      journalLines.push({
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_1020',
        account_code: '1020',
        account_name: 'City Bank Ltd. Current A/C',
        debit: 0,
        credit: params.paid_amount,
        branch_id: branch.id,
        description: `Payment for purchase ${purchaseNo}`
      });
    }

    if (dueAmount > 0) {
      journalLines.push({
        id: 'jl_' + Math.random().toString(36).slice(2, 8),
        account_id: 'acc_2010',
        account_code: '2010',
        account_name: 'Accounts Payable (Supplier Ledger)',
        debit: 0,
        credit: dueAmount,
        branch_id: branch.id,
        description: `Payable due to ${supplier.name}`
      });
    }

    this.state.journals.unshift({
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'purchase',
      reference_id: purchaseNo,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `Purchase from ${supplier.name} (Bill ${params.bill_no})`,
      lines: journalLines,
      total_debit: totalCost,
      total_credit: totalCost,
      is_posted: true,
      created_by: params.user_name,
      created_at: nowIso
    });

    const newPurchase: Purchase = {
      id: 'pur_' + Date.now(),
      purchase_no: purchaseNo,
      bill_no: params.bill_no,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      branch_id: branch.id,
      branch_name: branch.name,
      items: purchaseItems,
      total_cost: totalCost,
      paid_amount: params.paid_amount,
      due_amount: dueAmount,
      payment_method: params.payment_method,
      status: 'received',
      journal_entry_id: jrnNo,
      received_date: nowIso.split('T')[0],
      created_at: nowIso
    };
    this.state.purchases.unshift(newPurchase);

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.user_name,
      role: 'inventory_manager',
      action: 'post',
      module: 'Purchase',
      record_id: purchaseNo,
      summary: `Received purchase ${purchaseNo} (Cost: ৳${totalCost.toLocaleString('en-IN')})`,
      ip_address: '103.145.12.90',
      created_at: nowIso
    });

    this.persist();
    return { success: true, purchase: newPurchase };
  }

  // --- ATOMIC TRANSACTION: CREATE EXPENSE ---
  public createExpense(params: {
    branch_id: string;
    category: Expense['category'];
    amount: number;
    payment_method: 'cash' | 'bank' | 'bkash' | 'nagad';
    paid_to: string;
    description: string;
    user_name: string;
    approved_by?: string;
  }): { success: boolean; expense?: Expense; error?: string } {
    const branch = this.state.branches.find(b => b.id === params.branch_id);
    if (!branch) return { success: false, error: 'Branch not found' };

    const voucherNo = 'EXP-' + new Date().getFullYear() + '-' + String(this.state.expenses.length + 101).padStart(3, '0');
    const nowIso = new Date().toISOString();

    // Map expense category to COA
    let expAccCode = '6070';
    let expAccName = 'Office Maintenance & Tea/Snacks';
    if (params.category === 'Shop Rent') {
      expAccCode = '6010';
      expAccName = 'Showroom & Warehouse Rent';
    } else if (params.category === 'Staff Salaries') {
      expAccCode = '6020';
      expAccName = 'Staff Salaries & Allowances';
    } else if (params.category === 'Electricity & Utilities') {
      expAccCode = '6030';
      expAccName = 'Electricity, Generator & Utilities';
    } else if (params.category === 'Internet & Software') {
      expAccCode = '6040';
      expAccName = 'Internet, ERP Software & Cloud Hosting';
    } else if (params.category === 'Transport & Courier') {
      expAccCode = '6050';
      expAccName = 'Transport, Delivery & Courier Charges';
    } else if (params.category === 'Marketing & Promotion') {
      expAccCode = '6060';
      expAccName = 'Marketing, Social Media & Promotion';
    }

    // Cash/Bank account credit
    let crAccCode = '1010';
    let crAccName = 'Cash in Hand';
    if (params.payment_method === 'cash') {
      crAccCode = branch.id === 'br_2' ? '1011' : branch.id === 'br_3' ? '1012' : '1010';
      crAccName = `Cash in Hand - ${branch.name}`;
      branch.cash_balance -= params.amount;
    } else if (params.payment_method === 'bank') {
      crAccCode = '1020';
      crAccName = 'City Bank Ltd. Current A/C';
    } else if (params.payment_method === 'bkash') {
      crAccCode = '1030';
      crAccName = 'bKash Merchant Account';
    } else if (params.payment_method === 'nagad') {
      crAccCode = '1031';
      crAccName = 'Nagad Merchant Account';
    }

    // Journal Entry
    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(this.state.journals.length + 201).padStart(3, '0');
    this.state.journals.unshift({
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'expense',
      reference_id: voucherNo,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `Expense payment: ${params.category} to ${params.paid_to}`,
      lines: [
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + expAccCode,
          account_code: expAccCode,
          account_name: expAccName,
          debit: params.amount,
          credit: 0,
          branch_id: branch.id,
          description: params.description
        },
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + crAccCode,
          account_code: crAccCode,
          account_name: crAccName,
          debit: 0,
          credit: params.amount,
          branch_id: branch.id,
          description: `Disbursed via ${params.payment_method.toUpperCase()}`
        }
      ],
      total_debit: params.amount,
      total_credit: params.amount,
      is_posted: true,
      created_by: params.user_name,
      created_at: nowIso
    });

    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      voucher_no: voucherNo,
      branch_id: branch.id,
      branch_name: branch.name,
      category: params.category,
      amount: params.amount,
      payment_method: params.payment_method,
      account_id: 'acc_' + expAccCode,
      paid_to: params.paid_to,
      description: params.description,
      approved_by: params.approved_by,
      created_by: params.user_name,
      created_at: nowIso
    };
    this.state.expenses.unshift(newExpense);

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.user_name,
      role: 'accountant',
      action: 'create',
      module: 'Expenses',
      record_id: voucherNo,
      summary: `Created expense voucher ${voucherNo} for ৳${params.amount.toLocaleString('en-IN')}`,
      ip_address: '103.145.12.91',
      created_at: nowIso
    });

    this.persist();
    return { success: true, expense: newExpense };
  }

  // --- ATOMIC TRANSACTION: CUSTOMER PAYMENT COLLECTION ---
  public collectCustomerPayment(params: {
    customer_id: string;
    branch_id: string;
    amount: number;
    payment_method: 'cash' | 'bank' | 'bkash' | 'nagad';
    reference?: string;
    user_name: string;
  }): { success: boolean; error?: string } {
    const customer = this.state.customers.find(c => c.id === params.customer_id);
    if (!customer) return { success: false, error: 'Customer not found' };
    const branch = this.state.branches.find(b => b.id === params.branch_id);
    if (!branch) return { success: false, error: 'Branch not found' };

    customer.current_balance = Math.max(0, customer.current_balance - params.amount);

    if (params.payment_method === 'cash') {
      branch.cash_balance += params.amount;
    }

    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(this.state.journals.length + 201).padStart(3, '0');
    const nowIso = new Date().toISOString();

    let drAccCode = '1010';
    let drAccName = `Cash in Hand - ${branch.name}`;
    if (params.payment_method === 'bank') {
      drAccCode = '1020';
      drAccName = 'City Bank Ltd. Current A/C';
    } else if (params.payment_method === 'bkash') {
      drAccCode = '1030';
      drAccName = 'bKash Merchant Account';
    } else if (params.payment_method === 'nagad') {
      drAccCode = '1031';
      drAccName = 'Nagad Merchant Account';
    }

    this.state.journals.unshift({
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'collection',
      reference_id: customer.code,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `Customer payment received from ${customer.name} (Ref: ${params.reference || 'N/A'})`,
      lines: [
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + drAccCode,
          account_code: drAccCode,
          account_name: drAccName,
          debit: params.amount,
          credit: 0,
          branch_id: branch.id,
          description: `Received via ${params.payment_method.toUpperCase()}`
        },
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_1100',
          account_code: '1100',
          account_name: 'Accounts Receivable (Customer Ledger)',
          debit: 0,
          credit: params.amount,
          branch_id: branch.id,
          description: `Credit reduction for customer ${customer.name}`
        }
      ],
      total_debit: params.amount,
      total_credit: params.amount,
      is_posted: true,
      created_by: params.user_name,
      created_at: nowIso
    });

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.user_name,
      role: 'cashier',
      action: 'post',
      module: 'Customer Collection',
      record_id: customer.code,
      summary: `Collected ৳${params.amount.toLocaleString('en-IN')} from ${customer.name}`,
      ip_address: '103.145.12.89',
      created_at: nowIso
    });

    this.persist();
    return { success: true };
  }

  // --- ATOMIC TRANSACTION: SUPPLIER PAYMENT ---
  public paySupplier(params: {
    supplier_id: string;
    branch_id: string;
    amount: number;
    payment_method: 'bank' | 'cash' | 'bkash';
    reference?: string;
    user_name: string;
  }): { success: boolean; error?: string } {
    const supplier = this.state.suppliers.find(s => s.id === params.supplier_id);
    if (!supplier) return { success: false, error: 'Supplier not found' };
    const branch = this.state.branches.find(b => b.id === params.branch_id);
    if (!branch) return { success: false, error: 'Branch not found' };

    supplier.current_payable = Math.max(0, supplier.current_payable - params.amount);
    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(this.state.journals.length + 201).padStart(3, '0');
    const nowIso = new Date().toISOString();

    let crAccCode = '1020';
    let crAccName = 'City Bank Ltd. Current A/C';
    if (params.payment_method === 'cash') {
      crAccCode = branch.id === 'br_2' ? '1011' : branch.id === 'br_3' ? '1012' : '1010';
      crAccName = `Cash in Hand - ${branch.name}`;
      branch.cash_balance -= params.amount;
    } else if (params.payment_method === 'bkash') {
      crAccCode = '1030';
      crAccName = 'bKash Merchant Account';
    }

    this.state.journals.unshift({
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'payment',
      reference_id: supplier.code,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `Supplier payment disbursed to ${supplier.name} (Ref: ${params.reference || 'N/A'})`,
      lines: [
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_2010',
          account_code: '2010',
          account_name: 'Accounts Payable (Supplier Ledger)',
          debit: params.amount,
          credit: 0,
          branch_id: branch.id,
          description: `Discharge of payable to ${supplier.name}`
        },
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + crAccCode,
          account_code: crAccCode,
          account_name: crAccName,
          debit: 0,
          credit: params.amount,
          branch_id: branch.id,
          description: `Paid via ${params.payment_method.toUpperCase()}`
        }
      ],
      total_debit: params.amount,
      total_credit: params.amount,
      is_posted: true,
      created_by: params.user_name,
      created_at: nowIso
    });

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.user_name,
      role: 'accountant',
      action: 'post',
      module: 'Supplier Payment',
      record_id: supplier.code,
      summary: `Paid ৳${params.amount.toLocaleString('en-IN')} to supplier ${supplier.name}`,
      ip_address: '103.145.12.92',
      created_at: nowIso
    });

    this.persist();
    return { success: true };
  }

  // --- ATOMIC TRANSACTION: STOCK TRANSFER ---
  public createStockTransfer(params: {
    from_branch_id: string;
    to_branch_id: string;
    product_id: string;
    imei_numbers?: string[];
    quantity: number;
    user_name: string;
  }): { success: boolean; transfer?: StockTransfer; error?: string } {
    const fromBranch = this.state.branches.find(b => b.id === params.from_branch_id);
    const toBranch = this.state.branches.find(b => b.id === params.to_branch_id);
    const product = this.state.products.find(p => p.id === params.product_id);

    if (!fromBranch || !toBranch || !product) {
      return { success: false, error: 'Invalid transfer branches or product' };
    }

    const nowIso = new Date().toISOString();
    const transferNo = 'TRF-' + new Date().getFullYear() + '-' + String(this.state.transfers.length + 101).padStart(3, '0');

    // If device has IMEI, transfer each IMEI
    if (product.has_imei && params.imei_numbers) {
      for (const imeiNum of params.imei_numbers) {
        const dev = this.state.imeis.find(i => i.imei1 === imeiNum || i.imei2 === imeiNum);
        if (!dev) return { success: false, error: `IMEI ${imeiNum} not found` };
        if (dev.branch_id !== fromBranch.id) {
          return { success: false, error: `IMEI ${imeiNum} is not currently at ${fromBranch.name}` };
        }
        if (dev.status !== 'in_stock') {
          return { success: false, error: `IMEI ${imeiNum} is not available (Status: ${dev.status})` };
        }

        dev.branch_id = toBranch.id;
        dev.branch_name = toBranch.name;
        dev.current_location = 'Transferred Shelf';

        this.state.imei_movements.unshift({
          id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          imei1: dev.imei1,
          product_name: dev.product_name,
          from_status: 'in_stock',
          to_status: 'in_stock',
          from_branch_id: fromBranch.id,
          to_branch_id: toBranch.id,
          from_branch_name: fromBranch.name,
          to_branch_name: toBranch.name,
          reference_type: 'transfer',
          reference_id: transferNo,
          notes: `Branch transfer: ${fromBranch.name} -> ${toBranch.name}`,
          created_by_name: params.user_name,
          created_at: nowIso
        });
      }
    }

    const transfer: StockTransfer = {
      id: 'trf_' + Date.now(),
      transfer_no: transferNo,
      from_branch_id: fromBranch.id,
      from_branch_name: fromBranch.name,
      to_branch_id: toBranch.id,
      to_branch_name: toBranch.name,
      product_id: product.id,
      product_name: product.name,
      quantity: params.quantity,
      imei_numbers: params.imei_numbers,
      status: 'received',
      sent_by_name: params.user_name,
      received_by_name: toBranch.manager_name,
      created_at: nowIso,
      received_at: nowIso
    };

    this.state.transfers.unshift(transfer);

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.user_name,
      role: 'warehouse_manager',
      action: 'post',
      module: 'Stock Transfer',
      record_id: transferNo,
      summary: `Transferred ${params.quantity}x ${product.name} from ${fromBranch.name} to ${toBranch.name}`,
      ip_address: '103.145.12.90',
      created_at: nowIso
    });

    this.persist();
    return { success: true, transfer };
  }

  // --- ATOMIC TRANSACTION: STOCK ADJUSTMENT (DAMAGE, WARRANTY, MISSING) ---
  public createStockAdjustment(params: {
    branch_id: string;
    product_id: string;
    adjustment_type: 'damage' | 'warranty' | 'lost' | 'decrease' | 'increase';
    quantity: number;
    imei_id?: string;
    reason: string;
    user_name: string;
  }): { success: boolean; error?: string } {
    const branch = this.state.branches.find(b => b.id === params.branch_id);
    const product = this.state.products.find(p => p.id === params.product_id);
    if (!branch || !product) return { success: false, error: 'Branch or product not found' };

    const adjNo = 'ADJ-' + new Date().getFullYear() + '-' + String((this.state.adjustments?.length || 0) + 101).padStart(3, '0');
    const nowIso = new Date().toISOString();

    let imei1Str = '';
    if (params.imei_id) {
      const dev = this.state.imeis.find(i => i.id === params.imei_id);
      if (dev) {
        imei1Str = dev.imei1;
        if (params.adjustment_type === 'damage') dev.status = 'damaged';
        else if (params.adjustment_type === 'warranty') dev.status = 'warranty';
        else if (params.adjustment_type === 'lost') dev.status = 'missing';

        this.state.imei_movements.unshift({
          id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          imei1: dev.imei1,
          product_name: dev.product_name,
          from_status: 'in_stock',
          to_status: dev.status,
          from_branch_id: branch.id,
          from_branch_name: branch.name,
          reference_type: 'adjustment',
          reference_id: adjNo,
          notes: `Stock adjustment: ${params.reason}`,
          created_by_name: params.user_name,
          created_at: nowIso
        });
      }
    }

    const adjustment: StockAdjustment = {
      id: 'adj_' + Date.now(),
      adjustment_no: adjNo,
      branch_id: branch.id,
      branch_name: branch.name,
      product_id: product.id,
      product_name: product.name,
      adjustment_type: params.adjustment_type,
      quantity: params.quantity,
      imei_id: params.imei_id,
      imei1: imei1Str,
      reason: params.reason,
      created_by: params.user_name,
      created_at: nowIso
    };

    if (!this.state.adjustments) this.state.adjustments = [];
    this.state.adjustments.unshift(adjustment);

    this.persist();
    return { success: true };
  }

  // --- SAVE / UPDATE REPORTS ---
  public saveDailyReport(report: DailyReport) {
    const idx = this.state.dailyReports.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      this.state.dailyReports[idx] = report;
    } else {
      this.state.dailyReports.unshift(report);
    }
    this.persist();
  }

  public saveWeeklyReport(report: WeeklyReport) {
    const idx = this.state.weeklyReports.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      this.state.weeklyReports[idx] = report;
    } else {
      this.state.weeklyReports.unshift(report);
    }
    this.persist();
  }

  public saveMonthlyReport(report: MonthlyReport) {
    const idx = this.state.monthlyReports.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      this.state.monthlyReports[idx] = report;
    } else {
      this.state.monthlyReports.unshift(report);
    }
    this.persist();
  }

  // --- APPROVAL WORKFLOW ---
  public updateApproval(id: string, status: 'approved' | 'rejected', approver: string, notes?: string) {
    const item = this.state.approvals.find(a => a.id === id);
    if (item) {
      item.status = status;
      item.approver_name = approver;
      item.action_date = new Date().toISOString();
      item.notes = notes;
      this.persist();
    }
  }

  public addApprovalRequest(req: Omit<ApprovalRequest, 'id' | 'created_at'>) {
    const newReq: ApprovalRequest = {
      ...req,
      id: 'appr_' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.state.approvals.unshift(newReq);
    this.persist();
    return newReq;
  }

  public markAlertAsRead(id: string) {
    const alert = this.state.alerts.find(a => a.id === id);
    if (alert) {
      alert.is_read = true;
      this.persist();
    }
  }

  public addAlert(alert: Omit<AlertNotification, 'id' | 'created_at' | 'is_read'>) {
    this.state.alerts.unshift({
      ...alert,
      id: 'alt_' + Date.now(),
      is_read: false,
      created_at: new Date().toISOString()
    });
    this.persist();
  }

  public addProduct(product: Omit<Product, 'id'>) {
    const newProduct: Product = {
      ...product,
      id: 'prd_' + Date.now()
    };
    this.state.products.push(newProduct);
    this.persist();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): boolean {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.state.products[idx] = { ...this.state.products[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteProduct(id: string): { success: boolean; message: string } {
    const prod = this.state.products.find(p => p.id === id);
    if (!prod) return { success: false, message: 'Product not found' };
    this.state.products = this.state.products.filter(p => p.id !== id);
    this.state.imeis = this.state.imeis.filter(i => i.product_id !== id);
    this.persist();
    return { success: true, message: 'Product removed from catalog' };
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'code' | 'created_at'>) {
    const code = 'CUST-' + String(this.state.customers.length + 1).padStart(3, '0');
    const newCust: Customer = {
      ...customer,
      id: 'cust_' + Date.now(),
      code,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.state.customers.push(newCust);
    this.persist();
    return newCust;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): boolean {
    const idx = this.state.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.state.customers[idx] = { ...this.state.customers[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteCustomer(id: string): { success: boolean; message: string } {
    const cust = this.state.customers.find(c => c.id === id);
    if (!cust) return { success: false, message: 'Customer not found' };
    this.state.customers = this.state.customers.filter(c => c.id !== id);
    this.persist();
    return { success: true, message: 'Customer deleted successfully' };
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'code' | 'created_at'>) {
    const code = 'SUP-' + String(this.state.suppliers.length + 1).padStart(3, '0');
    const newSup: Supplier = {
      ...supplier,
      id: 'sup_' + Date.now(),
      code,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.state.suppliers.push(newSup);
    this.persist();
    return newSup;
  }

  public updateSupplier(id: string, updates: Partial<Supplier>): boolean {
    const idx = this.state.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.state.suppliers[idx] = { ...this.state.suppliers[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteSupplier(id: string): { success: boolean; message: string } {
    const sup = this.state.suppliers.find(s => s.id === id);
    if (!sup) return { success: false, message: 'Supplier not found' };
    this.state.suppliers = this.state.suppliers.filter(s => s.id !== id);
    this.persist();
    return { success: true, message: 'Supplier deleted successfully' };
  }

  public addEmployee(emp: Omit<Employee, 'id' | 'emp_id'>) {
    const empId = 'EMP-' + String(this.state.employees.length + 1).padStart(3, '0');
    const newEmp: Employee = {
      ...emp,
      id: 'emp_' + Date.now(),
      emp_id: empId
    };
    this.state.employees.push(newEmp);
    this.persist();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): boolean {
    const idx = this.state.employees.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.state.employees[idx] = { ...this.state.employees[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteEmployee(id: string): { success: boolean; message: string } {
    const emp = this.state.employees.find(e => e.id === id);
    if (!emp) return { success: false, message: 'Employee not found' };
    this.state.employees = this.state.employees.filter(e => e.id !== id);
    this.persist();
    return { success: true, message: 'Employee deleted successfully' };
  }

  public addBranch(branch: Omit<Branch, 'id'>): Branch {
    const newBranch: Branch = {
      ...branch,
      id: 'br_' + Date.now()
    };
    this.state.branches.push(newBranch);
    this.persist();
    return newBranch;
  }

  public updateBranch(id: string, updates: Partial<Branch>): boolean {
    const idx = this.state.branches.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.state.branches[idx] = { ...this.state.branches[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteBranch(id: string): { success: boolean; message: string } {
    if (this.state.branches.length <= 1) {
      return { success: false, message: 'Cannot delete the only branch' };
    }
    const b = this.state.branches.find(x => x.id === id);
    if (b?.is_head_office) {
      return { success: false, message: 'Head office branch cannot be deleted' };
    }
    this.state.branches = this.state.branches.filter(x => x.id !== id);
    this.persist();
    return { success: true, message: 'Branch removed successfully' };
  }

  public updateExpense(id: string, updates: Partial<Expense>): boolean {
    const idx = this.state.expenses.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.state.expenses[idx] = { ...this.state.expenses[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteExpense(id: string): { success: boolean; message: string } {
    const exp = this.state.expenses.find(e => e.id === id);
    if (!exp) return { success: false, message: 'Expense voucher not found' };
    if (exp.payment_method === 'cash') {
      const br = this.state.branches.find(b => b.id === exp.branch_id);
      if (br) br.cash_balance += exp.amount;
    }
    this.state.expenses = this.state.expenses.filter(e => e.id !== id);
    this.persist();
    return { success: true, message: 'Expense voucher deleted successfully' };
  }

  public deleteSale(id: string): { success: boolean; message: string } {
    const sale = this.state.sales.find(s => s.id === id);
    if (!sale) return { success: false, message: 'Sale invoice not found' };
    sale.items.forEach(item => {
      if (item.imei_id) {
        const im = this.state.imeis.find(i => i.id === item.imei_id);
        if (im) {
          im.status = 'in_stock';
          im.sale_invoice_id = undefined;
        }
      }
    });
    if (sale.due_amount > 0) {
      const cust = this.state.customers.find(c => c.id === sale.customer_id);
      if (cust) {
        cust.current_balance = Math.max(0, cust.current_balance - sale.due_amount);
      }
    }
    if (sale.paid_amount > 0 && sale.payment_method === 'cash') {
      const br = this.state.branches.find(b => b.id === sale.branch_id);
      if (br) br.cash_balance = Math.max(0, br.cash_balance - sale.paid_amount);
    }
    this.state.sales = this.state.sales.filter(s => s.id !== id);
    this.persist();
    return { success: true, message: 'Sale invoice deleted and inventory reverted' };
  }

  public deletePurchase(id: string): { success: boolean; message: string } {
    const pur = this.state.purchases.find(p => p.id === id);
    if (!pur) return { success: false, message: 'Purchase not found' };
    if (pur.due_amount > 0) {
      const sup = this.state.suppliers.find(s => s.id === pur.supplier_id);
      if (sup) {
        sup.current_payable = Math.max(0, sup.current_payable - pur.due_amount);
      }
    }
    this.state.purchases = this.state.purchases.filter(p => p.id !== id);
    this.persist();
    return { success: true, message: 'Purchase bill removed successfully' };
  }

  public updateQuotation(id: string, updates: Partial<Quotation>): boolean {
    const idx = this.state.quotations.findIndex(q => q.id === id);
    if (idx === -1) return false;
    this.state.quotations[idx] = { ...this.state.quotations[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteQuotation(id: string): { success: boolean; message: string } {
    this.state.quotations = this.state.quotations.filter(q => q.id !== id);
    this.persist();
    return { success: true, message: 'Quotation deleted successfully' };
  }

  public deleteInstallmentAgreement(id: string): { success: boolean; message: string } {
    this.state.installments = this.state.installments.filter(i => i.id !== id);
    this.persist();
    return { success: true, message: 'Installment agreement deleted' };
  }

  public updateWarrantyCase(id: string, updates: Partial<WarrantyCase>): boolean {
    const idx = this.state.warranties.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.state.warranties[idx] = { ...this.state.warranties[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteWarrantyCase(id: string): { success: boolean; message: string } {
    this.state.warranties = this.state.warranties.filter(w => w.id !== id);
    this.persist();
    return { success: true, message: 'Warranty record removed' };
  }

  public deleteSalesReturn(id: string): { success: boolean; message: string } {
    this.state.salesReturns = this.state.salesReturns.filter(r => r.id !== id);
    this.persist();
    return { success: true, message: 'Sales return record deleted' };
  }

  public updateCustomerComplaint(id: string, updates: Partial<CustomerComplaint>): boolean {
    const idx = this.state.complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.state.complaints[idx] = { ...this.state.complaints[idx], ...updates };
    this.persist();
    return true;
  }

  public deleteCustomerComplaint(id: string): { success: boolean; message: string } {
    this.state.complaints = this.state.complaints.filter(c => c.id !== id);
    this.persist();
    return { success: true, message: 'Complaint ticket deleted' };
  }

  public deleteBankReconciliation(id: string): { success: boolean; message: string } {
    this.state.bankReconciliations = this.state.bankReconciliations.filter(b => b.id !== id);
    this.persist();
    return { success: true, message: 'Reconciliation record deleted' };
  }

  public deleteSMSNotification(id: string): { success: boolean; message: string } {
    this.state.smsLogs = this.state.smsLogs.filter(s => s.id !== id);
    this.persist();
    return { success: true, message: 'SMS log deleted' };
  }

  public addJournalEntry(journal: Omit<JournalEntry, 'id'>) {
    const newEntry: JournalEntry = {
      ...journal,
      id: 'jrn_' + Date.now()
    };
    this.state.journals.unshift(newEntry);
    this.persist();
    return newEntry;
  }

  public deleteJournalEntry(id: string): { success: boolean; message: string } {
    this.state.journals = this.state.journals.filter(j => j.id !== id);
    this.persist();
    return { success: true, message: 'Journal entry deleted' };
  }

  public addAccount(account: Omit<Account, 'id'>) {
    const newAcc: Account = {
      ...account,
      id: 'acc_' + Date.now()
    };
    this.state.accounts.push(newAcc);
    this.persist();
    return newAcc;
  }

  public updateAccount(id: string, updates: Partial<Account>) {
    const acc = this.state.accounts.find(a => a.id === id);
    if (acc) {
      Object.assign(acc, updates);
      this.persist();
    }
    return acc;
  }

  public deleteAccount(id: string): { success: boolean; message: string } {
    this.state.accounts = this.state.accounts.filter(a => a.id !== id);
    this.persist();
    return { success: true, message: 'Account deleted' };
  }

  public recordAttendance(employeeId: string, status: AttendanceRecord['status'], inTime?: string) {
    const emp = this.state.employees.find(e => e.id === employeeId);
    if (!emp) return;
    const today = new Date().toISOString().split('T')[0];
    const existing = this.state.attendance.find(a => a.employee_id === employeeId && a.date === today);

    if (existing) {
      existing.status = status;
      if (inTime) existing.in_time = inTime;
    } else {
      this.state.attendance.unshift({
        id: 'att_' + Date.now(),
        employee_id: emp.id,
        employee_name: emp.name,
        branch_id: emp.branch_id,
        date: today,
        status,
        in_time: inTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    this.persist();
  }

  // --- SALES RETURN & REFUND WORKFLOW ---
  public createSalesReturn(params: {
    invoice_no: string;
    customer_name: string;
    customer_phone: string;
    branch_id: string;
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
    user_name: string;
  }): { success: boolean; returnDoc?: SalesReturn; error?: string } {
    const branch = this.state.branches.find(b => b.id === params.branch_id) || this.state.branches[0];
    const returnNo = 'RET-' + new Date().getFullYear() + '-' + String(this.state.salesReturns.length + 101).padStart(3, '0');
    const nowIso = new Date().toISOString();
    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(this.state.journals.length + 201).padStart(3, '0');

    // 1. If handset IMEI returned, restore status to 'returned'
    for (const item of params.items) {
      if (item.imei1) {
        const dev = this.state.imeis.find(i => i.imei1 === item.imei1 || i.imei2 === item.imei1);
        if (dev) {
          dev.status = 'returned';
          this.state.imei_movements.unshift({
            id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            imei1: dev.imei1,
            product_name: dev.product_name,
            from_status: 'sold',
            to_status: 'returned',
            from_branch_id: branch.id,
            from_branch_name: branch.name,
            reference_type: 'return',
            reference_id: returnNo,
            notes: `Customer return: ${params.reason}`,
            created_by_name: params.user_name,
            created_at: nowIso
          });
        }
      }
    }

    // 2. Adjust payment / ledger
    let crAccCode = '1010';
    let crAccName = 'Cash in Hand';
    if (params.refund_method === 'cash') {
      crAccCode = branch.id === 'br_2' ? '1011' : branch.id === 'br_3' ? '1012' : '1010';
      crAccName = `Cash in Hand - ${branch.name}`;
      branch.cash_balance = Math.max(0, branch.cash_balance - params.total_refund);
    } else if (params.refund_method === 'bkash') {
      crAccCode = '1030';
      crAccName = 'bKash Merchant Account';
    } else if (params.refund_method === 'credit_note') {
      crAccCode = '1100';
      crAccName = 'Accounts Receivable (Customer Ledger)';
      const customer = this.state.customers.find(c => c.name.toLowerCase() === params.customer_name.toLowerCase());
      if (customer) {
        customer.current_balance = Math.max(0, customer.current_balance - params.total_refund);
      }
    }

    // 3. Balanced Accounting Entry: Dr Sales Return (4010/4020 contra), Cr Cash/Receivable
    this.state.journals.unshift({
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'return',
      reference_id: returnNo,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `Sales Return ${returnNo} (Invoice: ${params.invoice_no}) - Reason: ${params.reason}`,
      lines: [
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_4010',
          account_code: '4010',
          account_name: 'Sales Returns & Allowances',
          debit: params.total_refund,
          credit: 0,
          branch_id: branch.id,
          description: `Customer refund for ${returnNo}`
        },
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + crAccCode,
          account_code: crAccCode,
          account_name: crAccName,
          debit: 0,
          credit: params.total_refund,
          branch_id: branch.id,
          description: `Refund payout via ${params.refund_method.toUpperCase()}`
        }
      ],
      total_debit: params.total_refund,
      total_credit: params.total_refund,
      is_posted: true,
      created_by: params.user_name,
      created_at: nowIso
    });

    const returnDoc: SalesReturn = {
      id: 'ret_' + Date.now(),
      return_no: returnNo,
      invoice_no: params.invoice_no,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      branch_id: branch.id,
      branch_name: branch.name,
      items: params.items,
      total_refund: params.total_refund,
      refund_method: params.refund_method,
      reason: params.reason,
      journal_entry_id: jrnNo,
      created_by: params.user_name,
      created_at: nowIso
    };

    this.state.salesReturns.unshift(returnDoc);

    this.state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: params.user_name,
      role: 'cashier',
      action: 'reverse',
      module: 'Sales Returns',
      record_id: returnNo,
      summary: `Processed return ${returnNo} for invoice ${params.invoice_no} (Refund: ৳${params.total_refund.toLocaleString('en-IN')})`,
      ip_address: '103.145.12.89',
      created_at: nowIso
    });

    this.persist();
    return { success: true, returnDoc };
  }

  // --- WARRANTY WORKFLOW ---
  public createWarrantyCase(params: Omit<WarrantyCase, 'id' | 'ticket_no' | 'received_date'>): WarrantyCase {
    const ticketNo = 'WAR-' + new Date().getFullYear() + '-' + String(this.state.warranties.length + 101).padStart(3, '0');
    const newCase: WarrantyCase = {
      ...params,
      id: 'war_' + Date.now(),
      ticket_no: ticketNo,
      received_date: new Date().toISOString().split('T')[0]
    };
    this.state.warranties.unshift(newCase);
    this.persist();
    return newCase;
  }

  public updateWarrantyStatus(id: string, status: WarrantyCase['status'], notes?: string, charge?: number) {
    const c = this.state.warranties.find(w => w.id === id);
    if (c) {
      c.status = status;
      if (notes) c.notes = notes;
      if (charge !== undefined) c.service_charge = charge;
      if (status === 'delivered') {
        c.resolved_date = new Date().toISOString().split('T')[0];
      }
      this.persist();
    }
  }

  // --- COMPLAINTS WORKFLOW ---
  public createCustomerComplaint(params: Omit<CustomerComplaint, 'id' | 'ticket_no' | 'created_at'>): CustomerComplaint {
    const ticketNo = 'CMP-' + new Date().getFullYear() + '-' + String(this.state.complaints.length + 101).padStart(3, '0');
    const newCmp: CustomerComplaint = {
      ...params,
      id: 'cmp_' + Date.now(),
      ticket_no: ticketNo,
      created_at: new Date().toISOString()
    };
    this.state.complaints.unshift(newCmp);
    this.persist();
    return newCmp;
  }

  public resolveComplaint(id: string, notes: string) {
    const c = this.state.complaints.find(cmp => cmp.id === id);
    if (c) {
      c.status = 'resolved';
      c.resolution_notes = notes;
      c.resolved_at = new Date().toISOString();
      this.persist();
    }
  }

  // --- QUOTATION WORKFLOW ---
  public createQuotation(params: Omit<Quotation, 'id' | 'quotation_no' | 'created_at'>): Quotation {
    const quotNo = 'QUOT-' + new Date().getFullYear() + '-' + String(this.state.quotations.length + 101).padStart(3, '0');
    const newQuot: Quotation = {
      ...params,
      id: 'quot_' + Date.now(),
      quotation_no: quotNo,
      created_at: new Date().toISOString()
    };
    this.state.quotations.unshift(newQuot);
    this.persist();
    return newQuot;
  }

  // --- BANK RECONCILIATION ---
  public createBankReconciliation(params: Omit<BankReconciliationRecord, 'id' | 'created_at'>): BankReconciliationRecord {
    const record: BankReconciliationRecord = {
      ...params,
      id: 'recon_' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.state.bankReconciliations.unshift(record);
    this.persist();
    return record;
  }

  // --- SMS NOTIFICATION DISPATCH ---
  public sendSMSNotification(params: Omit<SMSNotificationLog, 'id' | 'created_at'>): SMSNotificationLog {
    const log: SMSNotificationLog = {
      ...params,
      id: 'sms_' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.state.smsLogs.unshift(log);
    this.persist();
    return log;
  }

  // --- INSTALLMENT / EMI SALES ---
  public createInstallmentAgreement(params: Omit<InstallmentAgreement, 'id' | 'agreement_no' | 'created_at'>): InstallmentAgreement {
    const agNo = 'EMI-' + new Date().getFullYear() + '-' + String(this.state.installments.length + 101).padStart(3, '0');
    const newAg: InstallmentAgreement = {
      ...params,
      id: 'inst_' + Date.now(),
      agreement_no: agNo,
      created_at: new Date().toISOString()
    };
    this.state.installments.unshift(newAg);

    // Update IMEI status to sold
    const imeiRecord = this.state.imeis.find(i => i.imei1 === params.imei);
    if (imeiRecord) {
      imeiRecord.status = 'sold';
      imeiRecord.sale_invoice_id = agNo;
    }

    this.persist();
    return newAg;
  }

  public collectInstallmentPayment(
    agreementId: string,
    installmentNo: number,
    amount: number,
    paymentMethod: 'cash' | 'bkash' | 'bank',
    receiptNo?: string
  ): InstallmentAgreement | null {
    const agreement = this.state.installments.find(a => a.id === agreementId);
    if (!agreement) return null;

    const item = agreement.schedule.find(s => s.installment_no === installmentNo);
    if (item) {
      item.status = 'paid';
      item.paid_date = new Date().toISOString().split('T')[0];
      item.paid_amount = amount;
      item.payment_method = paymentMethod;
      item.receipt_no = receiptNo || 'REC-' + Math.floor(100000 + Math.random() * 900000);
    }

    agreement.total_paid += amount;
    agreement.remaining_due = Math.max(0, agreement.total_payable - agreement.total_paid);

    if (agreement.remaining_due <= 0) {
      agreement.status = 'completed';
    }

    // Add cash or bank balance
    const branch = this.state.branches.find(b => b.id === agreement.branch_id) || this.state.branches[0];
    if (paymentMethod === 'cash') {
      branch.cash_balance += amount;
    }

    this.persist();
    return agreement;
  }
}

export const storage = new StorageService();

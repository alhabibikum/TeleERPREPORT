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
  IMEIStatus
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
  initialMonthlyReport
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
          branches: parsed.branches || initialBranches,
          users: parsed.users || initialUsers,
          categories: parsed.categories || initialCategories,
          brands: parsed.brands || initialBrands,
          products: parsed.products || initialProducts,
          imeis: parsed.imeis || initialIMEIs,
          imei_movements: parsed.imei_movements || [],
          customers: parsed.customers || initialCustomers,
          suppliers: parsed.suppliers || initialSuppliers,
          accounts: parsed.accounts || initialAccounts,
          sales: parsed.sales || initialSales,
          purchases: parsed.purchases || initialPurchases,
          expenses: parsed.expenses || initialExpenses,
          employees: parsed.employees || initialEmployees,
          attendance: parsed.attendance || initialAttendance,
          journals: parsed.journals || initialJournals,
          transfers: parsed.transfers || initialTransfers,
          adjustments: parsed.adjustments || [],
          alerts: parsed.alerts || initialAlerts,
          approvals: parsed.approvals || initialApprovals,
          auditLogs: parsed.auditLogs || initialAuditLogs,
          dailyReports: parsed.dailyReports || [initialDailyReport],
          weeklyReports: parsed.weeklyReports || [initialWeeklyReport],
          monthlyReports: parsed.monthlyReports || [initialMonthlyReport]
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
      monthlyReports: [initialMonthlyReport]
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

  public resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.persist();
  }

  public exportBackup(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.company && parsed.branches && parsed.products) {
        this.state = parsed;
        this.persist();
        return true;
      }
    } catch (e) {
      console.error('Import parse error', e);
    }
    return false;
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

    const customer = this.state.customers.find(c => c.id === params.customer_id);
    if (!customer) return { success: false, error: 'Invalid customer ID' };

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
}

export const storage = new StorageService();

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Building2,
  Users,
  CreditCard,
  Barcode,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Smartphone
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { state, activeBranchId, t } = useApp();

  // Branch filter
  const sales = state.sales.filter(s => {
    if (activeBranchId !== 'all' && s.branch_id !== activeBranchId) return false;
    return s.status === 'posted';
  });

  const todayStr = '2026-10-07'; // or current date
  const todaySales = sales.filter(s => s.created_at.startsWith(todayStr));
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);

  // Today's Profit: Revenue - COGS
  let todayProfit = 0;
  for (const s of todaySales) {
    for (const it of s.items) {
      todayProfit += it.subtotal - it.cost_price * it.quantity;
    }
  }

  // Monthly Sales & Profit
  const monthlySalesTotal = sales.reduce((sum, s) => sum + s.total_amount, 0);
  let monthlyProfit = 0;
  for (const s of sales) {
    for (const it of s.items) {
      monthlyProfit += it.subtotal - it.cost_price * it.quantity;
    }
  }

  // Cash in Hand
  const cashBalance = state.branches.reduce((sum, b) => {
    if (activeBranchId !== 'all' && b.id !== activeBranchId) return sum;
    return sum + b.cash_balance;
  }, 0);

  // Bank & MFS
  const bankBalance = (state.accounts.find(a => a.code === '1020')?.balance || 0) + (state.accounts.find(a => a.code === '1021')?.balance || 0);
  const mfsBalance = (state.accounts.find(a => a.code === '1030')?.balance || 0) + (state.accounts.find(a => a.code === '1031')?.balance || 0) + (state.accounts.find(a => a.code === '1032')?.balance || 0);

  // Customer Outstanding & Supplier Payable
  const customerOutstanding = state.customers.reduce((sum, c) => {
    if (activeBranchId !== 'all' && c.branch_id !== activeBranchId) return sum;
    return sum + c.current_balance;
  }, 0);

  const supplierPayable = state.suppliers.reduce((sum, s) => sum + s.current_payable, 0);

  // Stock valuation
  const inStockImeis = state.imeis.filter(i => {
    if (activeBranchId !== 'all' && i.branch_id !== activeBranchId) return false;
    return i.status === 'in_stock';
  });
  const nonImeiStock = state.products.filter(p => !p.has_imei).reduce((sum, p) => sum + (p.cost_price * 10), 0);
  const stockValuation = inStockImeis.reduce((sum, i) => sum + i.cost_price, 0) + (state.products.length > 0 ? nonImeiStock : 0);

  // Low stock items count
  const lowStockCount = state.products.filter(p => {
    const qty = p.has_imei ? inStockImeis.filter(i => i.product_id === p.id).length : 15;
    return qty <= p.min_stock_level;
  }).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('Executive Management Dashboard', 'নির্বাহী ব্যবস্থাপনা ড্যাশবোর্ড')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {state.company.name} • {activeBranchId === 'all' ? 'Consolidated Business View (3 Branches)' : 'Branch Filter Applied'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Real-Time DB Sync
          </span>
        </div>
      </div>

      {/* Top Financial KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t("Today's Sales", 'আজকের বিক্রয়')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            ৳{todaySalesTotal.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+12.4% vs yesterday</span>
          </div>
        </div>

        {/* Today's Gross Profit */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t("Today's Profit", 'আজকের মুনাফা')}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            ৳{todayProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Margin: <strong>{todaySalesTotal > 0 ? ((todayProfit / todaySalesTotal) * 100).toFixed(1) : 0}%</strong>
          </div>
        </div>

        {/* Customer Outstanding */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t('Customer Outstanding', 'গ্রাহক দেনাদার বকেয়া')}</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-rose-600 dark:text-rose-400">
            ৳{customerOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            5 Active Credit Accounts
          </div>
        </div>

        {/* Supplier Payable */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t('Supplier Payables', 'সরবরাহকারী পাওনাদার')}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-amber-600 dark:text-amber-400">
            ৳{supplierPayable.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Next settlement in 7 days
          </div>
        </div>
      </div>

      {/* Liquidity Triad & Inventory Valuation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Cash in Hand */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>{t('Cash in Drawer', 'নগদ ক্যাশ ব্যালেন্স')}</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
            ৳{cashBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Physical store registries</p>
        </div>

        {/* Bank Balances */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <CreditCard className="w-4 h-4 text-blue-500" />
            <span>{t('Bank Balances', 'ব্যাংক হিসাব')}</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
            ৳{bankBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">City Bank & BRAC Bank Corporate</p>
        </div>

        {/* MFS Balances */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Smartphone className="w-4 h-4 text-pink-500" />
            <span>{t('MFS Accounts', 'বিকাশ / নগদ / রকেট')}</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
            ৳{mfsBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Merchant collection wallets</p>
        </div>

        {/* Stock Valuation */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Package className="w-4 h-4 text-indigo-500" />
            <span>{t('Stock Valuation', 'মোট মজুদ পণ্যের মূল্য')}</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
            ৳{stockValuation.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{inStockImeis.length} Active IMEIs tracked</p>
        </div>
      </div>

      {/* Visual Analytics Grid (Responsive SVG Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Branch Performance Comparison Bar Chart */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('Branch Sales Comparison (Month-to-Date)', 'শাখা অনুযায়ী বিক্রয় তুলনা')}
            </h3>
            <span className="text-[11px] text-slate-400">Target vs Actual</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Motijheel Flagship Store', actual: 2150000, target: 2000000, pct: 107.5 },
              { name: 'Bashundhara City Mega Mall', actual: 1890000, target: 1800000, pct: 105.0 },
              { name: 'Uttara Sector-7 Hub', actual: 810000, target: 1000000, pct: 81.0 }
            ].map((br, bIdx) => (
              <div key={bIdx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{br.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ৳{br.actual.toLocaleString('en-IN')} ({br.pct}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      br.pct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, br.pct)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Modes Distribution */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('Payment Channel Distribution (BDT)', 'পেমেন্ট চ্যানেল অনুপাত')}
            </h3>
            <span className="text-[11px] text-slate-400">Bangladesh Retail</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'bKash / Nagad (MFS)', pct: 42, color: 'bg-pink-500', amount: '৳ 1,028,949' },
              { label: 'Cash in Hand', pct: 31, color: 'bg-emerald-500', amount: '৳ 759,000' },
              { label: 'Bank Card / POS Swipe', pct: 18, color: 'bg-blue-500', amount: '৳ 440,798' },
              { label: 'Customer Due / Credit', pct: 9, color: 'bg-amber-500', amount: '৳ 221,253' }
            ].map((ch, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${ch.color}`}></span>
                  <span>{ch.label}</span>
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {ch.amount}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{ch.pct}% of total transaction volume</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Operational Flags */}
      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
        <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Operational Watchlist & Stock Alerts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900">
            <span className="text-slate-500 block text-[11px]">Low Stock Threshold</span>
            <strong className="text-slate-900 dark:text-white">{lowStockCount} Handset Models</strong> below safety minimum.
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900">
            <span className="text-slate-500 block text-[11px]">Slow-Moving Inventory</span>
            <strong className="text-slate-900 dark:text-white">4x Realme 12 Pro+</strong> idle &gt; 48 days.
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900">
            <span className="text-slate-500 block text-[11px]">Pending Warranty Items</span>
            <strong className="text-slate-900 dark:text-white">1 Device</strong> under customer service inspection.
          </div>
        </div>
      </div>
    </div>
  );
};

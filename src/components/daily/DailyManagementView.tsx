import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { DailyReport, DailyDenomination } from '../../types';
import {
  CalendarCheck,
  CheckSquare,
  DollarSign,
  AlertTriangle,
  Lock,
  Send,
  Printer,
  Calculator,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const DailyManagementView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const effectiveBranchId = activeBranchId === 'all' ? 'br_1' : activeBranchId;
  const fallbackBranch = {
    id: 'br_1',
    name: 'Main Flagship Store',
    bn_name: 'প্রধান শাখা',
    code: 'BR-01',
    address: 'Dhaka',
    phone: '01711-000001',
    manager_name: 'Store Manager',
    cash_balance: 0,
    is_warehouse: false,
    created_at: new Date().toISOString()
  };
  const currentBranch = state.branches.find(b => b.id === effectiveBranchId) || state.branches[0] || fallbackBranch;

  const todayStr = '2026-10-08';

  // Find or initialize today's daily report for this branch
  const existingReport = state.dailyReports.find(
    r => r.branch_id === currentBranch.id && r.report_date === todayStr
  );

  // Auto calculate database metrics for this branch today
  const branchSales = state.sales.filter(
    s => s.branch_id === currentBranch.id && s.created_at.startsWith(todayStr) && s.status === 'posted'
  );
  const actualSales = branchSales.reduce((sum, s) => sum + s.total_amount, 0);
  const targetSales = 120000;
  const achievementPct = targetSales > 0 ? (actualSales / targetSales) * 100 : 0;

  const cashSales = branchSales.filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + s.paid_amount, 0);
  const bkashSales = branchSales.filter(s => s.payment_method === 'bkash').reduce((sum, s) => sum + s.paid_amount, 0);
  const nagadSales = branchSales.filter(s => s.payment_method === 'nagad').reduce((sum, s) => sum + s.paid_amount, 0);
  const bankSales = branchSales.filter(s => s.payment_method === 'bank').reduce((sum, s) => sum + s.paid_amount, 0);
  const creditSales = branchSales.filter(s => s.payment_method === 'credit').reduce((sum, s) => sum + s.due_amount, 0);

  const branchExpenses = state.expenses.filter(
    e => e.branch_id === currentBranch.id && e.created_at.startsWith(todayStr)
  );
  const cashExpenses = branchExpenses.filter(e => e.payment_method === 'cash').reduce((sum, e) => sum + e.amount, 0);

  const openingCash = 50000;
  const cashCollections = 0;
  const cashDeposits = 0;
  const expectedClosing = openingCash + cashSales + cashCollections - cashExpenses - cashDeposits;

  // Local state for interactive checklists & denomination counter
  const [openingChecks, setOpeningChecks] = useState(
    existingReport?.opening_checklist || {
      store_opened_on_time: true,
      employee_attendance_checked: true,
      opening_cash_verified: true,
      previous_closing_verified: true,
      pos_software_ready: true,
      internet_verified: true,
      display_stock_checked: true,
      pending_issues_reviewed: true
    }
  );

  const [closingChecks, setClosingChecks] = useState(
    existingReport?.closing_checklist || {
      sales_reconciled: false,
      cash_counted: false,
      stock_issues_verified: false,
      imei_scanned_verified: false,
      all_expenses_entered: false,
      pending_tasks_logged: false,
      report_submitted: false
    }
  );

  // Cash denomination notes
  const [denom, setDenom] = useState<DailyDenomination>(
    existingReport?.denomination || {
      note_1000: Math.floor(expectedClosing / 1000),
      note_500: 0,
      note_200: 0,
      note_100: 0,
      note_50: 0,
      note_20: 0,
      note_10: 0,
      coins: 0,
      total_physical_cash: expectedClosing
    }
  );

  const [managerNotes, setManagerNotes] = useState(existingReport?.manager_notes || '');
  const [problemLog, setProblemLog] = useState<string[]>(existingReport?.problems_logged || ['Minor generator delay at 2 PM']);
  const [newProblem, setNewProblem] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute denomination physical cash
  const physicalTotal =
    (denom.note_1000 || 0) * 1000 +
    (denom.note_500 || 0) * 500 +
    (denom.note_200 || 0) * 200 +
    (denom.note_100 || 0) * 100 +
    (denom.note_50 || 0) * 50 +
    (denom.note_20 || 0) * 20 +
    (denom.note_10 || 0) * 10 +
    (denom.coins || 0);

  const cashDifference = physicalTotal - expectedClosing;

  const handleDenomChange = (key: keyof DailyDenomination, val: number) => {
    const updated = { ...denom, [key]: Math.max(0, val) };
    const newPhysical =
      (key === 'note_1000' ? val : updated.note_1000) * 1000 +
      (key === 'note_500' ? val : updated.note_500) * 500 +
      (key === 'note_200' ? val : updated.note_200) * 200 +
      (key === 'note_100' ? val : updated.note_100) * 100 +
      (key === 'note_50' ? val : updated.note_50) * 50 +
      (key === 'note_20' ? val : updated.note_20) * 20 +
      (key === 'note_10' ? val : updated.note_10) * 10 +
      (key === 'coins' ? val : updated.coins);

    updated.total_physical_cash = newPhysical;
    setDenom(updated);
  };

  const handleAddProblem = () => {
    if (!newProblem.trim()) return;
    setProblemLog([...problemLog, newProblem.trim()]);
    setNewProblem('');
  };

  const handleSubmitReport = (targetStatus: DailyReport['status']) => {
    const reportData: DailyReport = {
      id: existingReport?.id || `drep_${todayStr.replace(/-/g, '_')}_${currentBranch.id}`,
      report_date: todayStr,
      branch_id: currentBranch.id,
      branch_name: currentBranch.name,
      target_sales: targetSales,
      actual_sales: actualSales,
      achievement_pct: Number(achievementPct.toFixed(1)),
      opening_cash: openingCash,
      cash_sales: cashSales,
      cash_collections: cashCollections,
      cash_expenses: cashExpenses,
      cash_deposits: cashDeposits,
      expected_closing_cash: expectedClosing,
      physical_closing_cash: physicalTotal,
      cash_difference: cashDifference,
      denomination: { ...denom, total_physical_cash: physicalTotal },
      mfs_bkash_sales: bkashSales,
      mfs_nagad_sales: nagadSales,
      bank_sales: bankSales,
      credit_sales: creditSales,
      opening_checklist: openingChecks,
      closing_checklist: closingChecks,
      employee_attendance_count: { present: 4, late: 0, absent: 0 },
      customer_complaints_count: 0,
      imei_mismatch_count: 0,
      problems_logged: problemLog,
      manager_notes: managerNotes,
      status: targetStatus,
      submitted_by: currentUser.name,
      submitted_at: new Date().toISOString()
    };

    storage.saveDailyReport(reportData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Daily Store Management & Verification', 'দৈনিক স্টোর ব্যবস্থাপনা ও নিরীক্ষা')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Branch: <strong>{currentBranch.name}</strong> • Date: <strong>{todayStr}</strong> • Status:{' '}
            <span className="uppercase font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {existingReport?.status || 'Active In-Progress'}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => handleSubmitReport('submitted')}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Daily Report</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Daily management report successfully saved and committed to database!</span>
        </div>
      )}

      {/* 1. Daily Opening Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-emerald-500" />
          <span>1. MORNING STORE OPENING CHECKLIST (10:00 AM)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {[
            { key: 'store_opened_on_time' as const, label: 'Store opened on time (10:00 AM)' },
            { key: 'employee_attendance_checked' as const, label: 'Employee biometric/attendance checked' },
            { key: 'opening_cash_verified' as const, label: 'Opening cash verified in drawer' },
            { key: 'previous_closing_verified' as const, label: 'Previous night closing cash matched' },
            { key: 'pos_software_ready' as const, label: 'POS software and barcode printer ready' },
            { key: 'internet_verified' as const, label: 'Primary & backup internet verified' },
            { key: 'display_stock_checked' as const, label: 'Display handsets wiped & secured' },
            { key: 'pending_issues_reviewed' as const, label: 'Prior day unresolved customer items reviewed' }
          ].map(chk => (
            <label
              key={chk.key}
              className={`p-2.5 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition ${
                openingChecks[chk.key]
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <input
                type="checkbox"
                checked={openingChecks[chk.key]}
                onChange={e => setOpeningChecks({ ...openingChecks, [chk.key]: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs leading-snug">{chk.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Automated Sales & Cash Flow Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Achievement Tracker */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>2. REAL-TIME SALES MONITOR (DATABASE GENERATED)</span>
          </h2>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Today Target</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">৳{targetSales.toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Today Actual</span>
              <strong className="text-sm font-black text-emerald-600">৳{actualSales.toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Achievement</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{achievementPct.toFixed(1)}%</strong>
            </div>
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Cash Sales:</span>
              <strong className="text-slate-900 dark:text-white">৳{cashSales.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">bKash Sales:</span>
              <strong className="text-slate-900 dark:text-white">৳{bkashSales.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Nagad Sales:</span>
              <strong className="text-slate-900 dark:text-white">৳{nagadSales.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Bank Card Sales:</span>
              <strong className="text-slate-900 dark:text-white">৳{bankSales.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Credit / Due Sales:</span>
              <strong className="text-rose-500">৳{creditSales.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Cash Drawer Control & Denomination Counter */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-indigo-500" />
              <span>3. CASH RECONCILIATION & DENOMINATIONS</span>
            </h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              cashDifference === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              Diff: ৳{cashDifference.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Opening Cash:</span>
              <strong>৳{openingCash.toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Cash Expenses:</span>
              <strong className="text-rose-500">-৳{cashExpenses.toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Expected Closing:</span>
              <strong className="text-indigo-600">৳{expectedClosing.toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Physical Count:</span>
              <strong className="text-emerald-600">৳{physicalTotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Denominations table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5 text-xs">
            <span className="font-bold text-[11px] text-slate-600 dark:text-slate-300 block">
              Physical Note Breakdown:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">৳1,000 Notes</span>
                <input
                  type="number"
                  value={denom.note_1000}
                  onChange={e => handleDenomChange('note_1000', Number(e.target.value))}
                  className="w-full p-1 bg-white dark:bg-slate-900 border rounded text-right font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">৳500 Notes</span>
                <input
                  type="number"
                  value={denom.note_500}
                  onChange={e => handleDenomChange('note_500', Number(e.target.value))}
                  className="w-full p-1 bg-white dark:bg-slate-900 border rounded text-right font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">৳200 Notes</span>
                <input
                  type="number"
                  value={denom.note_200}
                  onChange={e => handleDenomChange('note_200', Number(e.target.value))}
                  className="w-full p-1 bg-white dark:bg-slate-900 border rounded text-right font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">৳100 Notes</span>
                <input
                  type="number"
                  value={denom.note_100}
                  onChange={e => handleDenomChange('note_100', Number(e.target.value))}
                  className="w-full p-1 bg-white dark:bg-slate-900 border rounded text-right font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Problems Logged & Manager Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          4. PROBLEMS, ANOMALIES & MANAGER SUMMARY COMMENTS
        </h2>

        <div className="space-y-2">
          {problemLog.map((prob, idx) => (
            <div key={idx} className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span>• {prob}</span>
              <button
                onClick={() => setProblemLog(problemLog.filter((_, i) => i !== idx))}
                className="text-amber-500 hover:text-rose-600 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={newProblem}
              onChange={e => setNewProblem(e.target.value)}
              placeholder="Record any power cut, customer dispute, system glitch..."
              className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
            />
            <button
              onClick={handleAddProblem}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
            >
              Add Problem
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Manager Evening Final Remarks
          </label>
          <textarea
            rows={2}
            value={managerNotes}
            onChange={e => setManagerNotes(e.target.value)}
            placeholder="Summary of footfall, staff performance, customer feedback..."
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
          />
        </div>
      </div>

      {/* 5. Evening Store Closing Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>5. EVENING STORE CLOSING & LOCK CHECKLIST (08:30 PM)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {[
            { key: 'sales_reconciled' as const, label: 'Sales register reconciled with POS batch' },
            { key: 'cash_counted' as const, label: 'Cash counted & locked inside fireproof vault' },
            { key: 'stock_issues_verified' as const, label: 'High-value flagship phones double-checked in glass case' },
            { key: 'imei_scanned_verified' as const, label: 'All sold handsets have IMEI recorded on invoices' },
            { key: 'all_expenses_entered' as const, label: 'All shop expenses entered with signed vouchers' },
            { key: 'pending_tasks_logged' as const, label: 'Tomorrow morning customer tasks scheduled' },
            { key: 'report_submitted' as const, label: 'Daily manager report submitted to Head Office' }
          ].map(chk => (
            <label
              key={chk.key}
              className={`p-2.5 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition ${
                closingChecks[chk.key]
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <input
                type="checkbox"
                checked={closingChecks[chk.key]}
                onChange={e => setClosingChecks({ ...closingChecks, [chk.key]: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs leading-snug">{chk.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

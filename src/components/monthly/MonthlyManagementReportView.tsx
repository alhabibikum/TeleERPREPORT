import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { initialMonthlyReport } from '../../db/initialData';
import { MonthlyReport } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Building,
  CheckCircle,
  Save,
  Award,
  AlertTriangle
} from 'lucide-react';

export const MonthlyManagementReportView: React.FC = () => {
  const { state, currentUser, t } = useApp();

  const report = state.monthlyReports[0] || initialMonthlyReport;

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [managerSign, setManagerSign] = useState(report?.manager_final_comment || '');

  const handleSave = (status: MonthlyReport['status']) => {
    const updated: MonthlyReport = {
      ...report,
      manager_final_comment: managerSign,
      status
    };
    storage.saveMonthlyReport(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Monthly Business Management Report', 'মাসিক সার্বিক ব্যবসায়িক প্রতিবেদন')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Month: <strong>{report?.month_label}</strong> • Organization: <strong>{state.company.name}</strong> • Status:{' '}
            <span className="uppercase font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
              {report?.status}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
          <button
            onClick={() => handleSave('approved')}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Sign Report</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Monthly report updated and approved!</span>
        </div>
      )}

      {/* 1. Executive Summary Strip */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          EXECUTIVE MONTHLY SUMMARY
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase block">Total Sales</span>
            <strong className="text-sm font-black text-white">৳{report?.summary.total_sales.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase block">Gross Profit</span>
            <strong className="text-sm font-black text-emerald-400">৳{report?.summary.gross_profit.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase block">Net Profit</span>
            <strong className="text-sm font-black text-emerald-300">৳{report?.summary.net_profit.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase block">Closing Stock</span>
            <strong className="text-sm font-black text-white">৳{report?.summary.total_stock_value.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase block">Cash & Bank</span>
            <strong className="text-sm font-black text-white">৳{report?.summary.cash_and_bank.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase block">Customer Due</span>
            <strong className="text-sm font-black text-rose-400">৳{report?.summary.customer_outstanding.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* 2. Profit Analysis & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Profit Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            CATEGORY PROFIT ANALYSIS
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-2">Category</th>
                  <th className="p-2 text-right">Sales (BDT)</th>
                  <th className="p-2 text-right">Cost (BDT)</th>
                  <th className="p-2 text-right">Gross Profit</th>
                  <th className="p-2 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report?.profit_analysis.map((p, idx) => (
                  <tr key={idx} className={p.category === 'Total' ? 'font-black bg-slate-50 dark:bg-slate-800' : ''}>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2 text-right font-mono">৳{p.sales.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono text-slate-500">৳{p.cost.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-600">৳{p.gross_profit.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-bold">{p.margin_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            MONTHLY OPERATING EXPENSES (TOTAL: ৳301,500)
          </h2>
          <div className="space-y-2">
            {report?.expenses_breakdown.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{exp.category}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ৳{exp.amount.toLocaleString('en-IN')} ({exp.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${exp.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Branch Composite KPI Ranking */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>BRANCH RANKING (WEIGHTED KPI: SALES 30%, MARGIN 25%, TURNOVER 20%, COLLECTION 15%, AUDIT 10%)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-2.5">Rank</th>
                <th className="p-2.5">Branch Name</th>
                <th className="p-2.5 text-right">Monthly Sales</th>
                <th className="p-2.5 text-right">Gross Profit</th>
                <th className="p-2.5 text-right">Stock Turnover</th>
                <th className="p-2.5 text-right">Collection Rate</th>
                <th className="p-2.5 text-right">Overall Composite Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report?.branch_rankings.map(br => (
                <tr key={br.rank}>
                  <td className="p-2.5 font-bold text-slate-500">#{br.rank}</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{br.branch_name}</td>
                  <td className="p-2.5 text-right font-mono">৳{br.sales.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600">৳{br.profit.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-mono">{br.turnover}x</td>
                  <td className="p-2.5 text-right font-mono">{br.collection}%</td>
                  <td className="p-2.5 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                    {br.score} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Customer Outstanding Aging & Supplier Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Major Customer Debtors */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
            MAJOR CUSTOMER RECEIVABLES & RECOVERY ACTIONS
          </h2>
          <div className="space-y-2 text-xs">
            {report?.customer_outstanding.major_debtors.map((deb, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">{deb.customer_name}</span>
                  <span className="text-rose-500">৳{deb.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Age: <strong>{deb.age_days} Days</strong></span>
                  <span className="text-slate-600 dark:text-slate-300 italic">{deb.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock & IMEI Audit Status */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            STOCK RECONCILIATION & IMEI AUDIT
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Total Active Handset IMEIs</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">{report?.imei_audit.total_imei} Units</strong>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Barcode Scanned Matched</span>
              <strong className="text-sm font-bold text-emerald-600">100% (0 Mismatch)</strong>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Opening Inventory Value</span>
              <strong>৳{report?.stock_reconciliation.opening_stock.toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Closing Inventory Value</span>
              <strong className="text-indigo-600">৳{report?.stock_reconciliation.closing_stock.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Next Month Targets & General Manager Sign-off */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          GENERAL MANAGER EVALUATION & OWNER SIGN-OFF
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded">
            <span className="text-[10px] text-slate-500 block">Target Sales</span>
            <strong className="font-bold text-emerald-700">৳{report?.next_month_targets.sales.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded">
            <span className="text-[10px] text-slate-500 block">Target Profit</span>
            <strong className="font-bold text-emerald-700">৳{report?.next_month_targets.profit.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded">
            <span className="text-[10px] text-slate-500 block">Debt Recovery</span>
            <strong className="font-bold text-emerald-700">৳{report?.next_month_targets.collection.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 border rounded">
            <span className="text-[10px] text-slate-500 block">Inventory Ceiling</span>
            <strong className="font-bold">৳{report?.next_month_targets.stock.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 border rounded">
            <span className="text-[10px] text-slate-500 block">Overdue Reduction</span>
            <strong className="font-bold text-rose-600">৳{report?.next_month_targets.outstanding_reduction.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Manager Review & Closing Signature
          </label>
          <textarea
            rows={3}
            value={managerSign}
            onChange={e => setManagerSign(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800 gap-2">
          <span>Prepared by: <strong>Kamrul Hasan (General Manager)</strong></span>
          <span>Reviewed & Signed: <strong>Al-Amin Chowdhury (Chairman & Managing Director)</strong></span>
          <span>Date: <strong>02-October-2026</strong></span>
        </div>
      </div>
    </div>
  );
};

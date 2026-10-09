import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { initialWeeklyReport } from '../../db/initialData';
import { WeeklyReport } from '../../types';
import {
  CalendarRange,
  Printer,
  TrendingUp,
  Package,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
  Save,
  Send
} from 'lucide-react';

export const WeeklyManagementReportView: React.FC = () => {
  const { state, currentUser, t } = useApp();

  const report = state.weeklyReports[0] || initialWeeklyReport;

  const [actions, setActions] = useState<string[]>(report?.actions_taken || []);
  const [newAction, setNewAction] = useState('');
  const [problems, setProblems] = useState<string[]>(report?.problems || []);
  const [newProblem, setNewProblem] = useState('');

  const [nextPlan, setNextPlan] = useState(
    report?.next_week_plan || {
      sales: 'Achieve ৳1,250,000 weekly target',
      stock: 'Complete physical IMEI scanning audit',
      employee: 'Conduct upselling training',
      customer: 'Follow up on major receivables',
      cost_control: 'Audit showroom electricity consumption'
    }
  );

  const [comments, setComments] = useState(
    report?.manager_comments || {
      best_achievement: 'Exceeded target by 7.1%',
      biggest_problem: 'Stock shortage of desert titanium color',
      most_important_action: 'Expedite goods receipt from Apex',
      owner_decision_required: 'Approve ৳500,000 supplier payment'
    }
  );

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveReport = (status: WeeklyReport['status']) => {
    const updated: WeeklyReport = {
      ...report,
      actions_taken: actions,
      problems: problems,
      next_week_plan: nextPlan,
      manager_comments: comments,
      status
    };
    storage.saveWeeklyReport(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarRange className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Weekly Management Intelligence Report', 'সাপ্তাহিক ব্যবস্থাপনা ও ব্যবসায় পর্যালোচনা')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Period: <strong>{report?.week_label}</strong> • Scope: <strong>{report?.branch_name}</strong> • Status:{' '}
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
            <span>Print Report</span>
          </button>
          <button
            onClick={() => handleSaveReport('approved')}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Approve Report</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Weekly Report updated successfully!</span>
        </div>
      )}

      {/* 1. Branch Sales Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          1. WEEKLY SALES PERFORMANCE BY BRANCH
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-2.5">Branch</th>
                <th className="p-2.5 text-right">Weekly Target</th>
                <th className="p-2.5 text-right">Actual Sales</th>
                <th className="p-2.5 text-right">Achievement %</th>
                <th className="p-2.5 text-right">Prev Week</th>
                <th className="p-2.5 text-right">Growth %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">Motijheel Flagship Store</td>
                <td className="p-2.5 text-right">৳500,000</td>
                <td className="p-2.5 text-right font-bold text-emerald-600">৳545,000</td>
                <td className="p-2.5 text-right font-semibold">109.0%</td>
                <td className="p-2.5 text-right text-slate-500">৳480,000</td>
                <td className="p-2.5 text-right text-emerald-600 font-bold">+13.5%</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Bashundhara City Mega Mall</td>
                <td className="p-2.5 text-right">৳400,000</td>
                <td className="p-2.5 text-right font-bold text-emerald-600">৳420,000</td>
                <td className="p-2.5 text-right font-semibold">105.0%</td>
                <td className="p-2.5 text-right text-slate-500">৳395,000</td>
                <td className="p-2.5 text-right text-emerald-600 font-bold">+6.3%</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Uttara Sector-7 Hub</td>
                <td className="p-2.5 text-right">৳150,000</td>
                <td className="p-2.5 text-right font-bold text-amber-600">৳160,000</td>
                <td className="p-2.5 text-right font-semibold">106.6%</td>
                <td className="p-2.5 text-right text-slate-500">৳163,000</td>
                <td className="p-2.5 text-right text-rose-500 font-bold">-1.8%</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-black">
                <td className="p-2.5">Total Consolidated</td>
                <td className="p-2.5 text-right">৳1,050,000</td>
                <td className="p-2.5 text-right text-emerald-600">৳1,125,000</td>
                <td className="p-2.5 text-right">107.1%</td>
                <td className="p-2.5 text-right">৳1,038,000</td>
                <td className="p-2.5 text-right text-emerald-600">+8.4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Top Selling Models & Slow Moving Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Selling Models */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. TOP SELLING MODELS (BY REVENUE & PROFIT)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Model</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Revenue</th>
                  <th className="p-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report?.top_models.map(m => (
                  <tr key={m.rank}>
                    <td className="p-2 font-bold text-slate-500">#{m.rank}</td>
                    <td className="p-2 font-semibold text-slate-900 dark:text-white">{m.product_name}</td>
                    <td className="p-2 text-right font-mono">{m.quantity_sold}</td>
                    <td className="p-2 text-right font-mono font-bold">৳{m.sales_value.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono text-emerald-600 font-bold">৳{m.profit.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Moving Handsets & Recommended Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            3. SLOW-MOVING INVENTORY & ACTIONABLE REMEDY
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-2">Handset</th>
                  <th className="p-2 text-right">Stock Qty</th>
                  <th className="p-2 text-right">Days In Store</th>
                  <th className="p-2 text-right">Stock Value</th>
                  <th className="p-2">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report?.slow_moving_stock.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2 font-semibold">{item.product_name}</td>
                    <td className="p-2 text-right font-bold text-amber-600">{item.stock_quantity}</td>
                    <td className="p-2 text-right">{item.days_in_stock} Days</td>
                    <td className="p-2 text-right font-bold">৳{item.stock_value.toLocaleString('en-IN')}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                        {item.recommended_action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Employee Performance & Staff Ratings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>4. EMPLOYEE WEEKLY SALES PERFORMANCE & GRADES (A / B / C / D)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-2.5">Staff Name</th>
                <th className="p-2.5">Branch</th>
                <th className="p-2.5 text-right">Monthly Target</th>
                <th className="p-2.5 text-right">Month-to-Date Sales</th>
                <th className="p-2.5 text-right">Achievement %</th>
                <th className="p-2.5 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.employees.slice(0, 6).map(emp => (
                <tr key={emp.id}>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                    {emp.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{emp.designation}</span>
                  </td>
                  <td className="p-2.5 text-slate-500">{emp.branch_name}</td>
                  <td className="p-2.5 text-right font-mono">৳{emp.monthly_target.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ৳{emp.monthly_sales.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right font-bold text-emerald-600">{emp.achievement_rate}%</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-black text-xs ${
                      emp.rating === 'A'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : emp.rating === 'B'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {emp.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Qualitative Manager Plan & Owner Decision Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Week Plan */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            5. NEXT WEEK TARGETS & OPERATIONAL PLAN
          </h2>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block">Sales Plan</label>
              <input
                type="text"
                value={nextPlan.sales}
                onChange={e => setNextPlan({ ...nextPlan, sales: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block">Inventory & Stock</label>
              <input
                type="text"
                value={nextPlan.stock}
                onChange={e => setNextPlan({ ...nextPlan, stock: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block">Staff & Training</label>
              <input
                type="text"
                value={nextPlan.employee}
                onChange={e => setNextPlan({ ...nextPlan, employee: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block">Customer Debt Recovery</label>
              <input
                type="text"
                value={nextPlan.customer}
                onChange={e => setNextPlan({ ...nextPlan, customer: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Manager Summary Comments & Decision Requests */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            6. CRITICAL MANAGER EVALUATION & OWNER DECISIONS
          </h2>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-emerald-600 uppercase font-bold block">Best Weekly Achievement</label>
              <input
                type="text"
                value={comments.best_achievement}
                onChange={e => setComments({ ...comments, best_achievement: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-rose-500 uppercase font-bold block">Biggest Weekly Problem</label>
              <input
                type="text"
                value={comments.biggest_problem}
                onChange={e => setComments({ ...comments, biggest_problem: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-amber-500 uppercase font-bold block">Owner Decision / Sanction Required</label>
              <textarea
                rows={2}
                value={comments.owner_decision_required}
                onChange={e => setComments({ ...comments, owner_decision_required: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

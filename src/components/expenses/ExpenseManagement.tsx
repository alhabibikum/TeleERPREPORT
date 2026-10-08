import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Expense } from '../../types';
import {
  DollarSign,
  Plus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const ExpenseManagement: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [category, setCategory] = useState<Expense['category']>('Office Maintenance');
  const [amount, setAmount] = useState<number>(2500);
  const [branchId, setBranchId] = useState('br_1');
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | 'bkash' | 'nagad'>('cash');
  const [paidTo, setPaidTo] = useState('');
  const [description, setDescription] = useState('');

  const expenses = state.expenses.filter(e => {
    if (activeBranchId !== 'all' && e.branch_id !== activeBranchId) return false;
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    storage.createExpense({
      branch_id: branchId,
      category,
      amount: Number(amount),
      payment_method: payMethod,
      paid_to: paidTo || 'Vendor',
      description,
      user_name: currentUser.name,
      approved_by: `${currentUser.name} (${currentUser.role})`
    });

    setIsAddExpenseOpen(false);
    setDescription('');
    setPaidTo('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Operating Expense Vouchers & Petty Cash', 'দোকানের পরিচালন ব্যয় ও খরচের ভাউচার')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Recorded Expenses: <strong>৳{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</strong> • Automatic Balanced Journal Creation
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Expense Voucher</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
            <tr>
              <th className="p-3">Voucher #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Category</th>
              <th className="p-3">Paid To / Recipient</th>
              <th className="p-3">Description</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3 text-right">Amount (BDT)</th>
              <th className="p-3">Approved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{exp.voucher_no}</td>
                <td className="p-3 text-slate-500">{new Date(exp.created_at).toLocaleDateString('en-GB')}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{exp.branch_name}</td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{exp.category}</td>
                <td className="p-3">{exp.paid_to}</td>
                <td className="p-3 text-slate-500">{exp.description}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                    {exp.payment_method}
                  </span>
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                  ৳{exp.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-slate-400 text-[10px]">{exp.approved_by || 'Management'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Create Store Expense Voucher</span>
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Branch</label>
                  <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Expense Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="Shop Rent">Showroom Rent</option>
                    <option value="Staff Salaries">Staff Salary / Advance</option>
                    <option value="Electricity & Utilities">Electricity & Generator</option>
                    <option value="Internet & Software">Internet & Software Cloud</option>
                    <option value="Transport & Courier">Transport & Courier</option>
                    <option value="Marketing & Promotion">Marketing & Promotion</option>
                    <option value="Office Maintenance">Maintenance & Tea/Snacks</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Disbursement Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="cash">Store Drawer Cash</option>
                    <option value="bkash">bKash Merchant</option>
                    <option value="nagad">Nagad Merchant</option>
                    <option value="bank">City Bank Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Paid To (Vendor / Person)</label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={e => setPaidTo(e.target.value)}
                  placeholder="e.g. DESCO, Landlord, Internet Provider"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Description & Reason *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Fiber optic optical line monthly fee"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Save & Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

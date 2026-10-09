import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import {
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const BankingMFSReconciliationView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [activeAccountTab, setActiveAccountTab] = useState<'cash' | 'bank' | 'mfs' | 'reconcile'>('cash');

  // Cash to Bank Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositFromBranch, setDepositFromBranch] = useState('br_1');
  const [depositToBank, setDepositToBank] = useState('acc_1020');
  const [depositAmount, setDepositAmount] = useState(50000);
  const [depositRef, setDepositRef] = useState('City Bank Deposit Slip #449102');
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Reconciliation Modal State
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [reconAccId, setReconAccId] = useState('acc_1020');
  const [reconStmtBal, setReconStmtBal] = useState(1450000);
  const [reconNotes, setReconNotes] = useState('Statement matched with online banking export');

  const cashAccounts = state.accounts.filter(a => a.category === 'Cash');
  const bankAccounts = state.accounts.filter(a => a.category === 'Bank');
  const mfsAccounts = state.accounts.filter(a => a.category === 'MFS');

  const handleDepositToBank = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = state.branches.find(b => b.id === depositFromBranch);
    const bankAcc = state.accounts.find(a => a.id === depositToBank);
    if (!branch || !bankAcc || depositAmount <= 0) return;

    if (branch.cash_balance < depositAmount) {
      alert(`Insufficient cash in ${branch.name} drawer! (Available: ৳${branch.cash_balance.toLocaleString('en-IN')})`);
      return;
    }

    // 1. Update balances
    branch.cash_balance -= depositAmount;
    bankAcc.balance += depositAmount;

    // 2. Generate balanced journal entry: Dr Bank, Cr Cash
    const jrnNo = 'JRN-' + new Date().getFullYear() + '-' + String(state.journals.length + 201).padStart(3, '0');
    const nowIso = new Date().toISOString();
    const cashAccCode = branch.id === 'br_2' ? '1011' : branch.id === 'br_3' ? '1012' : '1010';

    state.journals.unshift({
      id: 'jrn_' + Date.now(),
      entry_no: jrnNo,
      date: nowIso.split('T')[0],
      reference_type: 'adjustment',
      reference_id: depositRef,
      branch_id: branch.id,
      branch_name: branch.name,
      narration: `Cash deposit from ${branch.name} to ${bankAcc.name} (Ref: ${depositRef})`,
      lines: [
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: bankAcc.id,
          account_code: bankAcc.code,
          account_name: bankAcc.name,
          debit: depositAmount,
          credit: 0,
          branch_id: branch.id,
          description: `Bank deposit via ${depositRef}`
        },
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: 'acc_' + cashAccCode,
          account_code: cashAccCode,
          account_name: `Cash in Hand - ${branch.name}`,
          debit: 0,
          credit: depositAmount,
          branch_id: branch.id,
          description: `Drawer cash deposited to bank`
        }
      ],
      total_debit: depositAmount,
      total_credit: depositAmount,
      is_posted: true,
      created_by: currentUser.name,
      created_at: nowIso
    });

    state.auditLogs.unshift({
      id: 'aud_' + Date.now(),
      user_name: currentUser.name,
      role: currentUser.role,
      action: 'post',
      module: 'Cash to Bank Transfer',
      record_id: jrnNo,
      summary: `Deposited ৳${depositAmount.toLocaleString('en-IN')} from ${branch.name} to ${bankAcc.name}`,
      ip_address: '103.145.12.89',
      created_at: nowIso
    });

    setIsDepositModalOpen(false);
    setDepositSuccess(true);
    setTimeout(() => setDepositSuccess(false), 3000);
  };

  const handlePerformReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = state.accounts.find(a => a.id === reconAccId);
    if (!acc) return;

    const variance = Number(reconStmtBal) - acc.balance;

    storage.createBankReconciliation({
      account_id: acc.id,
      account_name: acc.name,
      statement_date: new Date().toISOString().split('T')[0],
      book_balance: acc.balance,
      bank_statement_balance: Number(reconStmtBal),
      variance,
      status: Math.abs(variance) < 1 ? 'matched' : 'unreconciled',
      notes: reconNotes,
      reconciled_by: currentUser.name
    });

    setIsReconModalOpen(false);
  };

  const handleDeleteReconciliation = (id: string) => {
    if (confirm('Are you sure you want to delete this reconciliation statement record?')) {
      storage.deleteBankReconciliation(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Cash Book, Bank Book, MFS & Statement Reconciliation', 'ক্যাশ বুক, ব্যাংক বুক, এমএফএস ও ব্যাংক রিকনসিলিয়েশন')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Liquid Capital: <strong>৳{(
              state.branches.reduce((s, b) => s + b.cash_balance, 0) +
              bankAccounts.reduce((s, b) => s + b.balance, 0) +
              mfsAccounts.reduce((s, m) => s + m.balance, 0)
            ).toLocaleString('en-IN')}</strong> • Real-time Merchant & Bank Reconciliation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Deposit Cash to Bank</span>
          </button>
          <button
            onClick={() => setIsReconModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Run Statement Reconciliation</span>
          </button>
        </div>
      </div>

      {depositSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Cash successfully deposited to bank account! Balanced journal entry generated.</span>
        </div>
      )}

      {/* Account Type Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveAccountTab('cash')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
            activeAccountTab === 'cash'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Cash in Hand Book (৳{state.branches.reduce((s, b) => s + b.cash_balance, 0).toLocaleString('en-IN')})</span>
        </button>
        <button
          onClick={() => setActiveAccountTab('bank')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
            activeAccountTab === 'bank'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Bank Book (৳{bankAccounts.reduce((s, b) => s + b.balance, 0).toLocaleString('en-IN')})</span>
        </button>
        <button
          onClick={() => setActiveAccountTab('mfs')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
            activeAccountTab === 'mfs'
              ? 'bg-pink-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>MFS Accounts Book (৳{mfsAccounts.reduce((s, m) => s + m.balance, 0).toLocaleString('en-IN')})</span>
        </button>
        <button
          onClick={() => setActiveAccountTab('reconcile')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
            activeAccountTab === 'reconcile'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Reconciliation Records ({state.bankReconciliations.length})</span>
        </button>
      </div>

      {/* CASH BOOK */}
      {activeAccountTab === 'cash' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.branches.map(br => (
            <div
              key={br.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">{br.name}</h3>
                <span className="text-[10px] uppercase font-bold text-slate-400">{br.code}</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Drawer Physical Cash Balance</span>
                <strong className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  ৳{br.cash_balance.toLocaleString('en-IN')}
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Cash Custodian: <strong>{br.manager_name}</strong>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* BANK BOOK */}
      {activeAccountTab === 'bank' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map(bank => (
            <div
              key={bank.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">{bank.name}</h3>
                <span className="text-[10px] font-mono text-slate-400">COA #{bank.code}</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cleared Ledger Balance</span>
                <strong className="text-xl font-black text-blue-700 dark:text-blue-400">
                  ৳{bank.balance.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Account Type: Corporate Current</span>
                <span className="text-emerald-600 font-bold">100% Reconciled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MFS BOOK */}
      {activeAccountTab === 'mfs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mfsAccounts.map(mfs => (
            <div
              key={mfs.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">{mfs.name}</h3>
                <span className="text-[10px] font-mono text-slate-400">COA #{mfs.code}</span>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-lg border border-pink-200 dark:border-pink-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Merchant Wallet Balance</span>
                <strong className="text-xl font-black text-pink-700 dark:text-pink-400">
                  ৳{mfs.balance.toLocaleString('en-IN')}
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Channel: Direct POS QR & Merchant API Integration
              </p>
            </div>
          ))}
        </div>
      )}

      {/* RECONCILIATION AUDIT RECORDS */}
      {activeAccountTab === 'reconcile' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Statement Date</th>
                <th className="p-3">Bank / MFS Account</th>
                <th className="p-3 text-right">ERP Book Balance</th>
                <th className="p-3 text-right">Statement Balance</th>
                <th className="p-3 text-right">Variance / Difference</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Auditor / Reconciled By</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.bankReconciliations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    No bank reconciliation records logged yet.
                  </td>
                </tr>
              ) : (
                state.bankReconciliations.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500">{rec.statement_date}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{rec.account_name}</td>
                    <td className="p-3 text-right font-mono font-bold">৳{rec.book_balance.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold">৳{rec.bank_statement_balance.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={rec.variance !== 0 ? 'text-rose-500' : 'text-emerald-600'}>
                        ৳{rec.variance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.status === 'matched' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{rec.reconciled_by}</td>
                    <td className="p-3 text-slate-400">{rec.notes || 'N/A'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteReconciliation(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Reconciliation Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cash to Bank Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
              <span>Record Cash Drawer Deposit to Bank Account</span>
            </h3>

            <form onSubmit={handleDepositToBank} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Source Store Branch</label>
                <select
                  value={depositFromBranch}
                  onChange={e => setDepositFromBranch(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} (Available: ৳{b.cash_balance.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Destination Bank Account</label>
                <select
                  value={depositToBank}
                  onChange={e => setDepositToBank(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Amount to Deposit (BDT) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={depositAmount}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Bank Deposit Slip / Cheque Ref *</label>
                <input
                  type="text"
                  required
                  value={depositRef}
                  onChange={e => setDepositRef(e.target.value)}
                  placeholder="e.g. City Bank Deposit Slip #88192"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Confirm & Post Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statement Reconciliation Modal */}
      {isReconModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>Record Official Statement Reconciliation</span>
            </h3>

            <form onSubmit={handlePerformReconciliation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Select Account</label>
                <select
                  value={reconAccId}
                  onChange={e => {
                    setReconAccId(e.target.value);
                    const a = state.accounts.find(x => x.id === e.target.value);
                    if (a) setReconStmtBal(a.balance);
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {[...bankAccounts, ...mfsAccounts].map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Book: ৳{a.balance.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Bank Statement Actual Closing Balance (BDT) *</label>
                <input
                  type="number"
                  required
                  value={reconStmtBal}
                  onChange={e => setReconStmtBal(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Verification Notes / Statement Period</label>
                <input
                  type="text"
                  value={reconNotes}
                  onChange={e => setReconNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReconModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded"
                >
                  Save Reconciliation Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

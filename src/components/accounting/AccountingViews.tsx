import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountingEngine } from '../../services/accountingEngine';
import { storage } from '../../db/storage';
import {
  BookOpen,
  Scale,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Wallet,
  Trash2,
  X
} from 'lucide-react';
import { Account } from '../../types';

interface AccountingViewsProps {
  viewMode: 'chart_of_accounts' | 'journals' | 'pnl_balance';
}

export const AccountingViews: React.FC<AccountingViewsProps> = ({ viewMode }) => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'coa' | 'journals' | 'trial_balance' | 'pnl' | 'balance_sheet'>(
    viewMode === 'journals' ? 'journals' : viewMode === 'pnl_balance' ? 'pnl' : 'coa'
  );

  const [isManualJournalOpen, setIsManualJournalOpen] = useState(false);
  const [jrnNarration, setJrnNarration] = useState('');
  const [jrnDebitAcc, setJrnDebitAcc] = useState('acc_6070');
  const [jrnCreditAcc, setJrnCreditAcc] = useState('acc_1010');
  const [jrnAmount, setJrnAmount] = useState(1000);
  const [jrnError, setJrnError] = useState<string | null>(null);

  // New Account Modal State
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccBnName, setNewAccBnName] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('asset');
  const [newAccCategory, setNewAccCategory] = useState('Operating');
  const [newAccBalance, setNewAccBalance] = useState<number>(0);

  // Accounting engine outputs
  const trialBalance = AccountingEngine.generateTrialBalance(state, activeBranchId);
  const pnl = AccountingEngine.generateProfitAndLoss(state, activeBranchId);
  const balanceSheet = AccountingEngine.generateBalanceSheet(state);

  const handlePostManualJournal = (e: React.FormEvent) => {
    e.preventDefault();
    setJrnError(null);

    const drAcc = state.accounts.find(a => a.id === jrnDebitAcc);
    const crAcc = state.accounts.find(a => a.id === jrnCreditAcc);
    if (!drAcc || !crAcc) return;

    if (jrnAmount <= 0) {
      setJrnError('Amount must be positive');
      return;
    }

    const entryNo = 'JRN-' + new Date().getFullYear() + '-' + String(state.journals.length + 301).padStart(3, '0');
    const nowIso = new Date().toISOString();

    storage.addJournalEntry({
      entry_no: entryNo,
      date: nowIso.split('T')[0],
      reference_type: 'manual',
      reference_id: 'MANUAL',
      branch_id: activeBranchId === 'all' ? 'br_1' : activeBranchId,
      branch_name: activeBranchId === 'all' ? 'Motijheel Flagship Store' : state.branches.find(b => b.id === activeBranchId)?.name || 'Store',
      narration: jrnNarration || 'Manual adjustment journal entry',
      lines: [
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: drAcc.id,
          account_code: drAcc.code,
          account_name: drAcc.name,
          debit: Number(jrnAmount),
          credit: 0,
          description: jrnNarration
        },
        {
          id: 'jl_' + Math.random().toString(36).slice(2, 8),
          account_id: crAcc.id,
          account_code: crAcc.code,
          account_name: crAcc.name,
          debit: 0,
          credit: Number(jrnAmount),
          description: jrnNarration
        }
      ],
      total_debit: Number(jrnAmount),
      total_credit: Number(jrnAmount),
      is_posted: true,
      created_by: currentUser.name,
      created_at: nowIso
    });

    setIsManualJournalOpen(false);
    setJrnNarration('');
  };

  const handleDeleteJournal = (id: string, entryNo: string) => {
    if (confirm(`Are you sure you want to delete journal entry "${entryNo}"?`)) {
      storage.deleteJournalEntry(id);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCode || !newAccName) return;

    storage.addAccount({
      code: newAccCode,
      name: newAccName,
      bn_name: newAccBnName || undefined,
      type: newAccType,
      category: newAccCategory,
      balance: Number(newAccBalance),
      is_active: true
    });

    setIsAddAccountOpen(false);
    setNewAccCode('');
    setNewAccName('');
    setNewAccBnName('');
    setNewAccBalance(0);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove account "${name}" from Chart of Accounts?`)) {
      storage.deleteAccount(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Double-Entry Accounting & Financial Ledger', 'ডাবল-এন্ট্রি অ্যাকাউন্টিং ও সাধারণ লেজার')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Double-Entry Enforcement (Debit = Credit) • Auto-Generated From Sales, Purchases & Expenses
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'coa' && (
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Account (COA)</span>
            </button>
          )}
          <button
            onClick={() => setIsManualJournalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Manual Journal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('coa')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'coa'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          Chart of Accounts (COA)
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'journals'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          Journal Entries ({state.journals.length})
        </button>
        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'trial_balance'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'pnl'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          Profit & Loss (P&L)
        </button>
        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'balance_sheet'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          Balance Sheet
        </button>
      </div>

      {/* TAB 1: CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Account Title (English / বাংলা)</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Debit / Credit Balance</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No accounts defined in Chart of Accounts. Clean database.
                  </td>
                </tr>
              ) : (
                state.accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{acc.code}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{acc.name}</div>
                      {acc.bn_name && <div className="text-[10px] text-slate-400 font-sans">{acc.bn_name}</div>}
                    </td>
                    <td className="p-3">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{acc.category}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ৳{acc.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-600 font-bold text-[10px]">Active</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Account"
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

      {/* TAB 2: JOURNAL ENTRIES (DOUBLE-ENTRY) */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          {state.journals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Scale className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {t('No journal entries recorded. Clean slate general ledger.', 'কোন জাবেদা এন্ট্রি নেই। ফ্রেশ লেজার।')}
              </p>
              <button
                onClick={() => setIsManualJournalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post First Journal</span>
              </button>
            </div>
          ) : (
            state.journals.map(jrn => (
              <div
                key={jrn.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800 gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {jrn.entry_no}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {jrn.reference_type}
                    </span>
                    <span className="text-slate-400">• {jrn.branch_name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-slate-400 text-[11px]">
                      Date: <strong>{jrn.date}</strong> • Posted by: <strong>{jrn.created_by}</strong>
                    </div>
                    <button
                      onClick={() => handleDeleteJournal(jrn.id, jrn.entry_no)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete Journal Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {jrn.narration}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                    <tr>
                      <th className="p-2">Account Code & Title</th>
                      <th className="p-2">Line Description</th>
                      <th className="p-2 text-right">Debit (BDT)</th>
                      <th className="p-2 text-right">Credit (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {jrn.lines.map((l, lIdx) => (
                      <tr key={lIdx}>
                        <td className="p-2">
                          <span className="font-mono text-slate-400 mr-1.5">{l.account_code}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{l.account_name}</span>
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">{l.description}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {l.debit > 0 ? `৳${l.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {l.credit > 0 ? `৳${l.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-bold border-t">
                      <td colSpan={2} className="p-2 text-slate-600 dark:text-slate-300">
                        Total Journal Balance (Dr == Cr Verified):
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-600">
                        ৳{jrn.total_debit.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-600">
                        ৳{jrn.total_credit.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
        </div>
      )}

      {/* TAB 3: TRIAL BALANCE */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              UNADJUSTED TRIAL BALANCE (AS OF TODAY)
            </h2>
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-500">Integrity:</span>
              <strong className="text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Dr == Cr Balanced</span>
              </strong>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Account Title</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5 text-right">Debit Balance (BDT)</th>
                <th className="p-2.5 text-right">Credit Balance (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {trialBalance.items.map(it => (
                <tr key={it.code}>
                  <td className="p-2 font-mono font-bold text-slate-900 dark:text-white">{it.code}</td>
                  <td className="p-2 font-semibold text-slate-900 dark:text-white">{it.name}</td>
                  <td className="p-2 text-slate-400 text-[10px] uppercase">{it.type}</td>
                  <td className="p-2 text-right font-mono font-bold">
                    {it.debit > 0 ? `৳${it.debit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="p-2 text-right font-mono font-bold">
                    {it.credit > 0 ? `৳${it.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-black border-t text-sm">
                <td colSpan={3} className="p-3 text-emerald-800 dark:text-emerald-300">
                  GRAND TRIAL BALANCE TOTAL:
                </td>
                <td className="p-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  ৳{trialBalance.total_debit.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  ৳{trialBalance.total_credit.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PROFIT & LOSS (P&L) */}
      {activeTab === 'pnl' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-base">{state.company.name}</h2>
            <h3 className="text-xs font-black uppercase text-emerald-600">STATEMENT OF PROFIT & LOSS</h3>
            <p className="text-[11px] text-slate-400">{pnl.period_label}</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div className="space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                REVENUE FROM OPERATIONS
              </div>
              {pnl.revenue.items.map((r, i) => (
                <div key={i} className="flex justify-between pl-4">
                  <span>{r.name}</span>
                  <span className="font-mono">৳{r.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total Operational Revenue:</span>
                <span className="font-mono text-emerald-600">৳{pnl.revenue.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* COGS */}
            <div className="space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                COST OF GOODS SOLD (COGS)
              </div>
              {pnl.cogs.items.map((c, i) => (
                <div key={i} className="flex justify-between pl-4">
                  <span>{c.name}</span>
                  <span className="font-mono">৳{c.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-1 border-t text-rose-600">
                <span>Total Cost of Goods Sold:</span>
                <span className="font-mono">-৳{pnl.cogs.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Gross Profit Strip */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex justify-between font-black text-sm text-emerald-800 dark:text-emerald-300">
              <span>GROSS PROFIT (Margin: {pnl.gross_margin_pct.toFixed(1)}%):</span>
              <span>৳{pnl.gross_profit.toLocaleString('en-IN')}</span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                OPERATING EXPENSES
              </div>
              {pnl.expenses.items.map((e, i) => (
                <div key={i} className="flex justify-between pl-4">
                  <span>{e.category}</span>
                  <span className="font-mono">৳{e.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-1 border-t text-rose-600">
                <span>Total Operating Expenses:</span>
                <span className="font-mono">-৳{pnl.expenses.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Net Profit Strip */}
            <div className="p-3 bg-slate-900 text-white rounded-lg flex justify-between font-black text-base">
              <span className="text-emerald-400">NET OPERATING PROFIT (Net Margin: {pnl.net_margin_pct.toFixed(1)}%):</span>
              <span className="text-emerald-400 font-mono">৳{pnl.net_profit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BALANCE SHEET */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-base">{state.company.name}</h2>
            <h3 className="text-xs font-black uppercase text-emerald-600">BALANCE SHEET (STATEMENT OF FINANCIAL POSITION)</h3>
            <p className="text-[11px] text-slate-400">As of Date: {balanceSheet.as_of_date}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Assets */}
            <div className="space-y-3">
              <h4 className="font-black text-emerald-700 uppercase border-b pb-1">1. ASSETS</h4>
              <div className="space-y-1.5 pl-2">
                {balanceSheet.assets.current_assets.map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{a.name}</span>
                    <strong className="font-mono">৳{a.amount.toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded flex justify-between font-black text-sm text-emerald-800">
                <span>TOTAL ASSETS:</span>
                <span>৳{balanceSheet.assets.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-3">
              <h4 className="font-black text-amber-700 uppercase border-b pb-1">2. LIABILITIES</h4>
              <div className="space-y-1.5 pl-2">
                {balanceSheet.liabilities.current_liabilities.map((l, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{l.name}</span>
                    <strong className="font-mono">৳{l.amount.toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded flex justify-between font-bold">
                <span>Total Liabilities:</span>
                <span>৳{balanceSheet.liabilities.total.toLocaleString('en-IN')}</span>
              </div>

              <h4 className="font-black text-indigo-700 uppercase border-b pb-1 pt-2">3. SHAREHOLDERS' EQUITY</h4>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between">
                  <span>Owner's Paid-up Capital</span>
                  <strong className="font-mono">৳{balanceSheet.equity.capital.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Retained Earnings</span>
                  <strong className="font-mono">৳{balanceSheet.equity.retained_earnings.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Current Period Net Profit</span>
                  <strong className="font-mono">৳{balanceSheet.equity.current_period_profit.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded flex justify-between font-bold">
                <span>Total Equity:</span>
                <span>৳{balanceSheet.equity.total.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-2.5 bg-slate-900 text-white rounded flex justify-between font-black text-sm">
                <span>TOTAL LIABILITIES + EQUITY:</span>
                <span>৳{(balanceSheet.liabilities.total + balanceSheet.equity.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Journal Modal */}
      {isManualJournalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Post Balanced Double-Entry Journal</span>
            </h3>

            {jrnError && <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded">{jrnError}</div>}

            <form onSubmit={handlePostManualJournal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Debit Account (Dr)</label>
                <select
                  value={jrnDebitAcc}
                  onChange={e => setJrnDebitAcc(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Credit Account (Cr)</label>
                <select
                  value={jrnCreditAcc}
                  onChange={e => setJrnCreditAcc(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Amount (BDT)</label>
                <input
                  type="number"
                  min={1}
                  value={jrnAmount}
                  onChange={e => setJrnAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Narration / Description</label>
                <input
                  type="text"
                  required
                  value={jrnNarration}
                  onChange={e => setJrnNarration(e.target.value)}
                  placeholder="e.g. Monthly internet bill payment adjustment"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualJournalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Post Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Create New Account (Chart of Accounts)</span>
              </h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Account Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1025"
                    value={newAccCode}
                    onChange={e => setNewAccCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Account Type *</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as Account['type'])}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="asset">Asset (সম্পদ)</option>
                    <option value="liability">Liability (দায়)</option>
                    <option value="equity">Equity (মালিকানাস্বত্ব)</option>
                    <option value="revenue">Revenue (রাজস্ব/আয়)</option>
                    <option value="expense">Expense (ব্যয়)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Account Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pubali Bank Current Account"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Account Title (বাংলা)</label>
                <input
                  type="text"
                  placeholder="e.g. পূবালী ব্যাংক চলতি হিসাব"
                  value={newAccBnName}
                  onChange={e => setNewAccBnName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Category *</label>
                  <select
                    value={newAccCategory}
                    onChange={e => setNewAccCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank">Bank Account</option>
                    <option value="MFS">MFS (bKash/Nagad)</option>
                    <option value="Receivable">Receivable</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Payable">Payable</option>
                    <option value="Sales">Sales</option>
                    <option value="Operating">Operating Expense</option>
                    <option value="Capital">Owner Capital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Opening Balance (BDT)</label>
                  <input
                    type="number"
                    value={newAccBalance}
                    onChange={e => setNewAccBalance(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { DatabaseState } from '../db/storage';
import { Account, JournalLine } from '../types';

export interface LedgerAccountSummary {
  account: Account;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  transactions: Array<{
    date: string;
    entry_no: string;
    narration: string;
    debit: number;
    credit: number;
    running_balance: number;
  }>;
}

export interface TrialBalanceItem {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface ProfitAndLossReport {
  period_label: string;
  revenue: {
    items: Array<{ name: string; amount: number }>;
    total: number;
  };
  cogs: {
    items: Array<{ name: string; amount: number }>;
    total: number;
  };
  gross_profit: number;
  gross_margin_pct: number;
  expenses: {
    items: Array<{ category: string; amount: number }>;
    total: number;
  };
  net_profit: number;
  net_margin_pct: number;
}

export interface BalanceSheetReport {
  as_of_date: string;
  assets: {
    current_assets: Array<{ name: string; amount: number }>;
    total: number;
  };
  liabilities: {
    current_liabilities: Array<{ name: string; amount: number }>;
    total: number;
  };
  equity: {
    capital: number;
    retained_earnings: number;
    current_period_profit: number;
    total: number;
  };
  is_balanced: boolean;
  variance: number;
}

export class AccountingEngine {
  public static calculateLedger(state: DatabaseState, accountId: string, branchId?: string): LedgerAccountSummary | null {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return null;

    const txs: Array<{
      date: string;
      entry_no: string;
      narration: string;
      debit: number;
      credit: number;
      running_balance: number;
    }> = [];

    let totalDr = 0;
    let totalCr = 0;
    let currentBalance = 0;

    // Filter journal lines
    for (const jrn of [...state.journals].reverse()) {
      for (const line of jrn.lines) {
        if (line.account_id === accountId || line.account_code === account.code) {
          if (branchId && branchId !== 'all' && jrn.branch_id !== branchId) {
            continue;
          }

          totalDr += line.debit;
          totalCr += line.credit;

          // Normal balance rules: Asset & Expense = Dr - Cr; Liability, Equity, Revenue = Cr - Dr
          if (account.type === 'asset' || account.type === 'expense' || account.type === 'cogs') {
            currentBalance += line.debit - line.credit;
          } else {
            currentBalance += line.credit - line.debit;
          }

          txs.push({
            date: jrn.date,
            entry_no: jrn.entry_no,
            narration: line.description || jrn.narration,
            debit: line.debit,
            credit: line.credit,
            running_balance: currentBalance
          });
        }
      }
    }

    return {
      account,
      opening_balance: account.balance,
      total_debit: totalDr,
      total_credit: totalCr,
      closing_balance: account.balance + currentBalance,
      transactions: txs
    };
  }

  public static generateTrialBalance(state: DatabaseState, branchId?: string): {
    items: TrialBalanceItem[];
    total_debit: number;
    total_credit: number;
    is_balanced: boolean;
  } {
    const accTotals: Record<string, { dr: number; cr: number }> = {};

    for (const acc of state.accounts) {
      accTotals[acc.code] = { dr: 0, cr: 0 };
    }

    for (const jrn of state.journals) {
      if (branchId && branchId !== 'all' && jrn.branch_id !== branchId) continue;
      for (const line of jrn.lines) {
        if (!accTotals[line.account_code]) {
          accTotals[line.account_code] = { dr: 0, cr: 0 };
        }
        accTotals[line.account_code].dr += line.debit;
        accTotals[line.account_code].cr += line.credit;
      }
    }

    const items: TrialBalanceItem[] = [];
    let grandDebit = 0;
    let grandCredit = 0;

    for (const acc of state.accounts) {
      const totals = accTotals[acc.code] || { dr: 0, cr: 0 };
      const net = totals.dr - totals.cr;

      let drValue = 0;
      let crValue = 0;

      if (acc.type === 'asset' || acc.type === 'expense' || acc.type === 'cogs') {
        const bal = acc.balance + net;
        if (bal >= 0) drValue = bal;
        else crValue = Math.abs(bal);
      } else {
        const bal = acc.balance + (totals.cr - totals.dr);
        if (bal >= 0) crValue = bal;
        else drValue = Math.abs(bal);
      }

      grandDebit += drValue;
      grandCredit += crValue;

      items.push({
        code: acc.code,
        name: acc.name,
        type: acc.type.toUpperCase(),
        debit: drValue,
        credit: crValue
      });
    }

    return {
      items,
      total_debit: grandDebit,
      total_credit: grandCredit,
      is_balanced: Math.abs(grandDebit - grandCredit) < 1
    };
  }

  public static generateProfitAndLoss(state: DatabaseState, branchId?: string): ProfitAndLossReport {
    // 1. Calculate actual revenue from posted sales
    const sales = state.sales.filter(s => {
      if (branchId && branchId !== 'all' && s.branch_id !== branchId) return false;
      return s.status === 'posted';
    });

    let mobileSales = 0;
    let accSales = 0;
    let mobileCost = 0;
    let accCost = 0;

    for (const sale of sales) {
      for (const itm of sale.items) {
        if (itm.has_imei) {
          mobileSales += itm.subtotal;
          mobileCost += itm.cost_price * itm.quantity;
        } else {
          accSales += itm.subtotal;
          accCost += itm.cost_price * itm.quantity;
        }
      }
    }

    const totalRevenue = mobileSales + accSales;
    const totalCogs = mobileCost + accCost;
    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // 2. Calculate expenses from expense table
    const expenses = state.expenses.filter(e => {
      if (branchId && branchId !== 'all' && e.branch_id !== branchId) return false;
      return true;
    });

    const expByCat: Record<string, number> = {};
    for (const exp of expenses) {
      expByCat[exp.category] = (expByCat[exp.category] || 0) + exp.amount;
    }

    const expItems = Object.entries(expByCat).map(([category, amount]) => ({ category, amount }));
    const totalExpenses = expItems.reduce((acc, curr) => acc + curr.amount, 0);

    const netProfit = grossProfit - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period_label: 'Current Year-to-Date (FY 2026-27)',
      revenue: {
        items: [
          { name: 'Mobile Handset Sales Revenue', amount: mobileSales },
          { name: 'Accessories & Gadgets Revenue', amount: accSales }
        ],
        total: totalRevenue
      },
      cogs: {
        items: [
          { name: 'COGS - Mobile Handsets', amount: mobileCost },
          { name: 'COGS - Accessories', amount: accCost }
        ],
        total: totalCogs
      },
      gross_profit: grossProfit,
      gross_margin_pct: grossMarginPct,
      expenses: {
        items: expItems,
        total: totalExpenses
      },
      net_profit: netProfit,
      net_margin_pct: netMarginPct
    };
  }

  public static generateBalanceSheet(state: DatabaseState): BalanceSheetReport {
    // Assets: Cash + Bank + MFS + Customer Receivable + Inventory
    const totalCash = state.branches.reduce((sum, b) => sum + b.cash_balance, 0);
    const bankCity = state.accounts.find(a => a.code === '1020')?.balance || 0;
    const bankBrac = state.accounts.find(a => a.code === '1021')?.balance || 0;
    const bkashBal = state.accounts.find(a => a.code === '1030')?.balance || 0;
    const nagadBal = state.accounts.find(a => a.code === '1031')?.balance || 0;
    const rocketBal = state.accounts.find(a => a.code === '1032')?.balance || 0;

    const totalReceivable = state.customers.reduce((sum, c) => sum + c.current_balance, 0);
    const totalInventoryValue = state.imeis
      .filter(i => i.status === 'in_stock')
      .reduce((sum, i) => sum + i.cost_price, 0) + 840000; // mobile + accessories

    const currentAssets = [
      { name: 'Cash in Hand (All Branches)', amount: totalCash },
      { name: 'Bank Accounts (City + BRAC)', amount: bankCity + bankBrac },
      { name: 'Mobile Financial Services (bKash/Nagad/Rocket)', amount: bkashBal + nagadBal + rocketBal },
      { name: 'Accounts Receivable (Customer Ledger)', amount: totalReceivable },
      { name: 'Inventory Asset (Mobile + Accessories)', amount: totalInventoryValue }
    ];
    const totalAssets = currentAssets.reduce((s, a) => s + a.amount, 0);

    // Liabilities: Supplier Payables + VAT Payable + Accrued
    const totalPayable = state.suppliers.reduce((sum, s) => sum + s.current_payable, 0);
    const vatPayable = state.accounts.find(a => a.code === '2020')?.balance || 0;
    const accrued = state.accounts.find(a => a.code === '2030')?.balance || 0;

    const currentLiabilities = [
      { name: 'Accounts Payable (Supplier Ledger)', amount: totalPayable },
      { name: 'VAT / Tax Payable', amount: vatPayable },
      { name: 'Accrued Operating Liabilities', amount: accrued }
    ];
    const totalLiabilities = currentLiabilities.reduce((s, l) => s + l.amount, 0);

    // Equity: Capital + Retained Earnings + Net Profit
    const pnl = this.generateProfitAndLoss(state);
    const capital = 8000000;
    const retainedEarnings = 1689200;
    const totalEquity = capital + retainedEarnings + pnl.net_profit;

    const variance = totalAssets - (totalLiabilities + totalEquity);

    return {
      as_of_date: new Date().toISOString().split('T')[0],
      assets: {
        current_assets: currentAssets,
        total: totalAssets
      },
      liabilities: {
        current_liabilities: currentLiabilities,
        total: totalLiabilities
      },
      equity: {
        capital,
        retained_earnings: retainedEarnings,
        current_period_profit: pnl.net_profit,
        total: totalEquity
      },
      is_balanced: Math.abs(variance) < 1000,
      variance
    };
  }
}

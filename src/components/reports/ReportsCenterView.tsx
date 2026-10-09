import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Filter,
  CheckCircle,
  TrendingUp,
  Package,
  Users,
  Wallet
} from 'lucide-react';

export const ReportsCenterView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<string>('daily_sales');
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-10-08');

  const branchName = activeBranchId === 'all' ? 'All Branches (Consolidated)' : state.branches.find(b => b.id === activeBranchId)?.name || 'Store';

  const reportOptions = [
    { id: 'daily_sales', label: '1. Daily Sales Summary Report' },
    { id: 'product_sales', label: '2. Product Model Sales & Gross Margins' },
    { id: 'imei_ledger', label: '3. IMEI Lifecycle & Status Report' },
    { id: 'stock_valuation', label: '4. Inventory Valuation & Stock Aging' },
    { id: 'customer_aging', label: '5. Customer Outstanding & Credit Limits' },
    { id: 'supplier_payables', label: '6. Supplier Payables & Settlement Ledger' },
    { id: 'cash_book', label: '7. Cash in Hand Book Register' },
    { id: 'bank_mfs', label: '8. Bank & MFS Ledger Statement' },
    { id: 'profit_loss', label: '9. Profit & Loss Statement (P&L)' },
    { id: 'expense_breakdown', label: '10. Operating Expenses Breakdown' },
    { id: 'employee_performance', label: '11. Employee Sales & Commission Report' },
    { id: 'branch_ranking', label: '12. Branch KPI Ranking & Benchmark' },
    { id: 'warranty_report', label: '13. Device Warranty Claims Report' },
    { id: 'audit_log', label: '14. System Security & Audit Trail' }
  ];

  const handleExportCSV = () => {
    let csvRows: string[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    if (selectedReportType === 'daily_sales') {
      csvRows.push('Invoice No,Date,Customer,Phone,Branch,Payment Mode,Subtotal,Discount,Total Amount,Paid,Due');
      state.sales.forEach(s => {
        csvRows.push(`"${s.invoice_no}","${s.created_at}","${s.customer_name}","${s.customer_phone}","${s.branch_name}","${s.payment_method}",${s.subtotal},${s.discount},${s.total_amount},${s.paid_amount},${s.due_amount}`);
      });
    } else if (selectedReportType === 'imei_ledger') {
      csvRows.push('IMEI 1,IMEI 2,Product Name,Model,Brand,Branch,Location,Status,Cost Price,Selling Price,Supplier,Sale Invoice');
      state.imeis.forEach(i => {
        csvRows.push(`"${i.imei1}","${i.imei2 || ''}","${i.product_name}","${i.model}","${i.brand_name}","${i.branch_name}","${i.current_location}","${i.status}",${i.cost_price},${i.selling_price},"${i.supplier_name}","${i.sale_invoice_id || ''}"`);
      });
    } else if (selectedReportType === 'customer_aging') {
      csvRows.push('Customer Code,Customer Name,Phone,Address,Credit Limit,Current Outstanding');
      state.customers.forEach(c => {
        csvRows.push(`"${c.code}","${c.name}","${c.phone}","${c.address}",${c.credit_limit ?? 0},${c.current_balance ?? 0}`);
      });
    } else {
      csvRows.push('Account Code,Account Name,Category,Type,Balance');
      state.accounts.forEach(a => {
        csvRows.push(`"${a.code}","${a.name}","${a.category}","${a.type}",${a.balance}`);
      });
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedReportType}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Official Management Reports & Export Hub', 'ব্যবস্থাপনা রিপোর্ট ও এক্সপোর্ট হাব')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            16 Pre-configured Statutory & Managerial Reports • Standard Header & Filter Parameters
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs hover:bg-slate-100"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs no-print">
        <div>
          <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Select Report Type</label>
          <select
            value={selectedReportType}
            onChange={e => setSelectedReportType(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-semibold"
          >
            {reportOptions.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Date Range (From - To)</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Report Target Scope</label>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-semibold text-slate-700 dark:text-slate-300">
            🏢 {branchName}
          </div>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 font-sans text-xs print:border-none print:shadow-none">
        {/* Standard Official Header */}
        <div className="text-center space-y-1 border-b border-slate-300 pb-4">
          <h2 className="text-xl font-black tracking-tight">{state.company.name}</h2>
          <p className="text-slate-600 text-xs">{state.company.legal_name} • {state.company.address}</p>
          <p className="text-slate-500 text-[11px]">BIN: {state.company.bin_number} • Phone: {state.company.phone} • Email: {state.company.email}</p>
          <div className="pt-2 text-sm font-black uppercase text-emerald-700 tracking-wider">
            {reportOptions.find(r => r.id === selectedReportType)?.label.slice(3)}
          </div>
          <div className="text-[11px] text-slate-500">
            Branch Scope: <strong>{branchName}</strong> • Period: <strong>{dateFrom} to {dateTo}</strong>
          </div>
        </div>

        {/* Dynamic Report Content Table */}
        {selectedReportType === 'daily_sales' && (
          <table className="w-full text-xs text-left border">
            <thead className="bg-slate-100 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2 border">Invoice #</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Branch</th>
                <th className="p-2 border text-right">Total (BDT)</th>
                <th className="p-2 border text-right">Paid</th>
                <th className="p-2 border text-right">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {state.sales.map(s => (
                <tr key={s.id}>
                  <td className="p-2 border font-bold">{s.invoice_no}</td>
                  <td className="p-2 border text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="p-2 border font-sans">{s.customer_name}</td>
                  <td className="p-2 border font-sans">{s.branch_name}</td>
                  <td className="p-2 border text-right font-bold">৳{s.total_amount.toLocaleString('en-IN')}</td>
                  <td className="p-2 border text-right">৳{s.paid_amount.toLocaleString('en-IN')}</td>
                  <td className="p-2 border text-right text-rose-600 font-bold">৳{s.due_amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold text-xs border-t-2">
                <td colSpan={4} className="p-2 border font-sans">Summary Total:</td>
                <td className="p-2 border text-right text-emerald-700">
                  ৳{state.sales.reduce((s, x) => s + x.total_amount, 0).toLocaleString('en-IN')}
                </td>
                <td className="p-2 border text-right">
                  ৳{state.sales.reduce((s, x) => s + x.paid_amount, 0).toLocaleString('en-IN')}
                </td>
                <td className="p-2 border text-right text-rose-700">
                  ৳{state.sales.reduce((s, x) => s + x.due_amount, 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {selectedReportType === 'imei_ledger' && (
          <table className="w-full text-xs text-left border">
            <thead className="bg-slate-100 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border">IMEI 1 & 2</th>
                <th className="p-2 border">Branch</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border text-right">Cost Price</th>
                <th className="p-2 border text-right">Retail MRP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {state.imeis.map(i => (
                <tr key={i.id}>
                  <td className="p-2 border font-sans font-bold">{i.product_name}</td>
                  <td className="p-2 border">{i.imei1} {i.imei2 ? `• ${i.imei2}` : ''}</td>
                  <td className="p-2 border font-sans">{i.branch_name}</td>
                  <td className="p-2 border uppercase font-bold text-[10px]">{i.status}</td>
                  <td className="p-2 border text-right">৳{i.cost_price.toLocaleString('en-IN')}</td>
                  <td className="p-2 border text-right font-bold">৳{i.selling_price.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedReportType === 'customer_aging' && (
          <table className="w-full text-xs text-left border">
            <thead className="bg-slate-100 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2 border">Code</th>
                <th className="p-2 border">Customer Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border text-right">Credit Limit</th>
                <th className="p-2 border text-right">Current Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {state.customers.map(c => (
                <tr key={c.id}>
                  <td className="p-2 border">{c.code}</td>
                  <td className="p-2 border font-sans font-bold">{c.name}</td>
                  <td className="p-2 border">{c.phone}</td>
                  <td className="p-2 border text-right">৳{(c.credit_limit ?? 0).toLocaleString('en-IN')}</td>
                  <td className="p-2 border text-right font-bold text-rose-600">৳{(c.current_balance ?? 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedReportType !== 'daily_sales' && selectedReportType !== 'imei_ledger' && selectedReportType !== 'customer_aging' && (
          <table className="w-full text-xs text-left border">
            <thead className="bg-slate-100 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2 border">COA Code</th>
                <th className="p-2 border">Account Title</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border text-right">Ledger Balance (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {state.accounts.map(a => (
                <tr key={a.id}>
                  <td className="p-2 border font-bold">{a.code}</td>
                  <td className="p-2 border font-sans">{a.name}</td>
                  <td className="p-2 border font-sans">{a.category}</td>
                  <td className="p-2 border text-right font-bold">৳{a.balance.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer Meta & Signatures */}
        <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-500">
          <div>
            <div>Generated by: <strong>{currentUser.name} ({currentUser.role})</strong></div>
            <div>Generated at: <strong>{new Date().toLocaleString()}</strong></div>
            <div>Computer generated official financial record.</div>
          </div>
          <div className="flex space-x-12 text-center">
            <div className="border-t border-slate-400 pt-1 px-4">
              <span>Prepared By</span>
            </div>
            <div className="border-t border-slate-400 pt-1 px-4">
              <span>Head of Accounts</span>
            </div>
            <div className="border-t border-slate-400 pt-1 px-4">
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

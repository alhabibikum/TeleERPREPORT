import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import {
  Receipt,
  Search,
  Printer,
  RotateCcw,
  FileText,
  CheckCircle,
  Eye,
  Calendar,
  X
} from 'lucide-react';

export const SalesManagement: React.FC = () => {
  const { state, activeBranchId, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const sales = state.sales.filter(s => {
    if (activeBranchId !== 'all' && s.branch_id !== activeBranchId) return false;
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.invoice_no.toLowerCase().includes(q) ||
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_phone.includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Sales Invoices & Transaction History', 'বিক্রয় চালান ও লেনদেন রেজিস্টার')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Invoices: <strong>{sales.length}</strong> • Total Turnover:{' '}
            <strong>৳{sales.reduce((s, x) => s + x.total_amount, 0).toLocaleString('en-IN')}</strong> • Total Due:{' '}
            <strong className="text-rose-500">৳{sales.reduce((s, x) => s + x.due_amount, 0).toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, customer name..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Items Purchased</th>
                <th className="p-3 text-right">Total (BDT)</th>
                <th className="p-3 text-right">Paid (BDT)</th>
                <th className="p-3 text-right">Due (BDT)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                    {s.invoice_no}
                  </td>
                  <td className="p-3 text-slate-500">
                    {new Date(s.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{s.customer_name}</div>
                    <div className="text-[10px] text-slate-400">{s.customer_phone}</div>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{s.branch_name}</td>
                  <td className="p-3">
                    <div className="text-[11px] line-clamp-1">
                      {s.items.map(it => `${it.quantity}x ${it.product_name}`).join(', ')}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ৳{s.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-600 font-semibold">
                    ৳{s.paid_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span className={s.due_amount > 0 ? 'text-rose-500' : 'text-slate-400'}>
                      ৳{s.due_amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedSale(s)}
                      className="p-1 text-slate-500 hover:text-emerald-600"
                      title="View & Print Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail / Print Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 no-print">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Invoice {selectedSale.invoice_no}
                </h3>
                <span className="text-[10px] text-slate-400">Journal: {selectedSale.journal_entry_id}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Print Document */}
            <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg text-xs space-y-3">
              <div className="text-center space-y-0.5">
                <h2 className="font-bold text-base">{state.company.name}</h2>
                <p className="text-[11px] text-slate-500">{selectedSale.branch_name}</p>
                <p className="text-[10px] text-slate-400">BIN: {state.company.bin_number} • Phone: {state.company.phone}</p>
                <div className="pt-1 text-xs font-bold uppercase text-emerald-600">
                  OFFICIAL TAX INVOICE
                </div>
              </div>

              <div className="border-t border-b border-slate-200 dark:border-slate-700 py-2 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Customer:</span>
                  <strong>{selectedSale.customer_name}</strong>
                  <div className="text-slate-500">{selectedSale.customer_phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Invoice Date:</span>
                  <strong>{new Date(selectedSale.created_at).toLocaleString()}</strong>
                  <div className="text-slate-500">Rep: {selectedSale.sales_rep_name}</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{item.product_name}</span>
                      <span>৳{item.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {item.imei1 && (
                      <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                        IMEI 1: {item.imei1} {item.imei2 ? `/ IMEI 2: ${item.imei2}` : ''}
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{item.quantity} x ৳{item.unit_price.toLocaleString('en-IN')} (Disc: ৳{item.discount})</span>
                      <span>Warranty: {item.warranty_months} Months</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1 text-right text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <strong>৳{selectedSale.subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-emerald-600">-৳{selectedSale.discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-slate-200 dark:border-slate-700 pt-1">
                  <span>Total Amount:</span>
                  <span className="text-emerald-600">৳{selectedSale.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Paid:</span>
                  <span>৳{selectedSale.paid_amount.toLocaleString('en-IN')}</span>
                </div>
                {selectedSale.due_amount > 0 && (
                  <div className="flex justify-between font-bold text-rose-500">
                    <span>Outstanding Due:</span>
                    <span>৳{selectedSale.due_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

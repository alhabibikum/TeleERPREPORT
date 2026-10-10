import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
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
  X,
  Trash2,
  Plus,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import {
  aiOwnerGuardianValidationEngine,
  GuardianInterceptionResult
} from '../../services/aiOwnerGuardianValidationEngine';
import { GuardianInterceptModal } from '../guardian/GuardianInterceptModal';

export const SalesManagement: React.FC = () => {
  const { state, activeBranchId, currentUser, setIsAIGuardianOpen, triggerGuardianVoice, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'posted' | 'voided'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // New Sales Invoice Form State
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [saleCustId, setSaleCustId] = useState(state.customers[0]?.id || 'cust_1');
  const [saleBranchId, setSaleBranchId] = useState(activeBranchId === 'all' ? 'br_1' : activeBranchId);
  const [saleProductId, setSaleProductId] = useState(state.products[0]?.id || 'prd_1');
  const [saleQty, setSaleQty] = useState(1);
  const [saleUnitPrice, setSaleUnitPrice] = useState(state.products[0]?.selling_price || 18000);
  const [saleDiscount, setSaleDiscount] = useState(0);
  const [salePaymentMethod, setSalePaymentMethod] = useState<'cash' | 'bank' | 'bkash' | 'credit'>('cash');
  const [guardianResult, setGuardianResult] = useState<GuardianInterceptionResult | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);

  // Void Modal State
  const [voidTargetSale, setVoidTargetSale] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Admin Restore Modal State
  const [restoreTargetSale, setRestoreTargetSale] = useState<Sale | null>(null);
  const [restoreReason, setRestoreReason] = useState('');

  const sales = state.sales.filter(s => {
    if (activeBranchId !== 'all' && s.branch_id !== activeBranchId) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.invoice_no.toLowerCase().includes(q) ||
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_phone.includes(q)
    );
  });

  const executeCreateSale = (overridePrice?: number, overrideQty?: number, overrideDisc?: number) => {
    const price = overridePrice ?? Number(saleUnitPrice);
    const qty = overrideQty ?? Number(saleQty);
    const disc = overrideDisc ?? Number(saleDiscount);

    const product = state.products.find(p => p.id === saleProductId);
    const imei = product?.has_imei
      ? state.imeis.find(i => i.product_id === saleProductId && (saleBranchId === 'all' || i.branch_id === saleBranchId) && i.status === 'in_stock')
      : undefined;

    const res = storage.createSale({
      branch_id: saleBranchId === 'all' ? 'br_1' : saleBranchId,
      customer_id: saleCustId,
      items: [
        {
          product_id: saleProductId,
          quantity: qty,
          unit_price: price,
          discount: disc,
          imei_id: imei?.id
        }
      ],
      payment_method: salePaymentMethod,
      sales_rep_id: currentUser.id,
      sales_rep_name: currentUser.name,
      notes: `Sales invoice created in Sales Management by ${currentUser.name}`
    });

    if (!res.success) {
      setSaleError(res.error || 'Failed to create sale invoice');
      return;
    }

    setIsNewSaleOpen(false);
    setGuardianResult(null);
    setSaleError(null);
  };

  const handleCreateSaleInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError(null);

    // Intercept with AIOwnerGuardianValidationEngine
    const interception = aiOwnerGuardianValidationEngine.interceptSalesSubmission({
      items: [
        {
          product_id: saleProductId,
          quantity: Number(saleQty),
          unit_price: Number(saleUnitPrice),
          discount: Number(saleDiscount)
        }
      ],
      customer_id: saleCustId,
      branch_id: saleBranchId === 'all' ? 'br_1' : saleBranchId,
      currentUser,
      state
    });

    if (!interception.isValid) {
      aiOwnerGuardianValidationEngine.recordAndAlert(interception, currentUser, state);
      setGuardianResult(interception);
      return;
    }

    executeCreateSale();
  };

  const handleExecuteVoid = () => {
    if (!voidTargetSale || !voidReason.trim()) {
      alert('বাতিলকরণের কারণ (Void Reason) উল্লেখ করা আবশ্যক।');
      return;
    }
    const res = storage.voidSale(voidTargetSale.id, voidReason, currentUser);
    if (res.success) {
      triggerGuardianVoice('চালানটি সফলভাবে বাতিল ও লেজার রিভার্স করা হয়েছে।', true);
      setVoidTargetSale(null);
      setVoidReason('');
    } else {
      alert(res.message);
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreTargetSale || !restoreReason.trim()) {
      alert('পুনরুদ্ধারের কারণ (Restore Reason) উল্লেখ করা আবশ্যক।');
      return;
    }
    const res = storage.restoreSale(restoreTargetSale.id, currentUser, restoreReason);
    if (res.success) {
      triggerGuardianVoice('চালানটি সফলভাবে রিস্টোর ও সক্রিয় করা হয়েছে।', true);
      setRestoreTargetSale(null);
      setRestoreReason('');
    } else {
      alert(res.message);
    }
  };

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

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-semibold"
          >
            <option value="all">সকল চালান (All Status)</option>
            <option value="posted">সক্রিয় (Posted)</option>
            <option value="voided">বাতিলকৃত (Voided)</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, customer name..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
            />
          </div>

          <button
            onClick={() => {
              setSaleError(null);
              setIsNewSaleOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('New Invoice', 'নতুন চালান')}</span>
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {t('No sales invoices found.', 'কোন বিক্রয় চালান পাওয়া যায়নি।')}
            </p>
            <p className="text-[11px] text-slate-400">
              Open the POS Terminal to scan and checkout customer sales.
            </p>
          </div>
        ) : (
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
                      {s.restored_at && (
                        <span className="block text-[9px] text-blue-500 font-sans font-bold">Restored</span>
                      )}
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
                      ৳{(s.total_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-semibold">
                      ৳{(s.paid_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={(s.due_amount ?? 0) > 0 ? 'text-rose-500' : 'text-slate-400'}>
                        ৳{(s.due_amount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {s.status === 'voided' ? (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900 cursor-help"
                          title={`Voided by: ${s.voided_by || 'Admin'}\nReason: ${s.void_reason || 'N/A'}`}
                        >
                          Voided
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedSale(s)}
                          className="p-1 text-slate-500 hover:text-emerald-600 transition"
                          title="View & Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {s.status === 'posted' ? (
                          <button
                            onClick={() => {
                              setVoidTargetSale(s);
                              setVoidReason('');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="ভুল চালান বাতিল ও রিভার্স করুন (Void & Reverse - Rule 8)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : s.status === 'voided' ? (
                          <button
                            onClick={() => {
                              setRestoreTargetSale(s);
                              setRestoreReason('');
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                            title="অ্যাডমিন চালান রিস্টোর (Admin Restore - Rule 8)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Void Confirmation Modal */}
      {voidTargetSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <Trash2 className="w-5 h-5" />
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                চালান বাতিল ও রিভার্সাল (Void Invoice #{voidTargetSale.invoice_no})
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              AI Owner Guardian নীতি অনুযায়ী চালানটি স্থায়ীভাবে মুছে ফেলা হবে না। এটি <code className="text-rose-600 font-bold">voided</code> হিসেবে সংরক্ষিত থাকবে এবং আইএমইআই ও লেজারে স্বয়ংক্রিয় রিভার্সাল পোস্ট হবে।
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বাতিলকরণের কারণ (Void Reason) *
              </label>
              <textarea
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="যেমন: ভুল কাস্টমার সিলেক্ট করা হয়েছিল, অথবা গ্রাহক পণ্য ফিরিয়ে দিয়েছেন..."
                className="w-full p-2.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setVoidTargetSale(null)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleExecuteVoid}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
              >
                নিশ্চিত করুন ও চালান বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Restore Confirmation Modal */}
      {restoreTargetSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <RotateCcw className="w-5 h-5" />
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                চালান পুনরুদ্ধার (Restore Invoice #{restoreTargetSale.invoice_no})
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              AI ভেরিফিকেশন: আইএমইআই প্রাপ্যতা এবং লেজার ডাবল-কাউন্টিং পরীক্ষা করে চালানটি পুনঃসক্রিয় করা হবে।
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                পুনরুদ্ধারের কারণ (Admin Justification) *
              </label>
              <textarea
                value={restoreReason}
                onChange={e => setRestoreReason(e.target.value)}
                placeholder="যেমন: গ্রাহক সমাধান পেয়ে পণ্য গ্রহণ করেছেন, ভুলবশত বাতিল করা হয়েছিল..."
                className="w-full p-2.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRestoreTargetSale(null)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleExecuteRestore}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                নিশ্চিত করুন ও রিস্টোর করুন
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* New Sales Invoice Modal with AIOwnerGuardian Interceptor */}
      {isNewSaleOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  নতুন বিক্রয় চালান (New Sales Invoice)
                </h3>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase">
                AI Guardian Protected
              </span>
            </div>

            {saleError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {saleError}
              </div>
            )}

            <form onSubmit={handleCreateSaleInvoice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">কাস্টমার (Customer)</label>
                  <select
                    value={saleCustId}
                    onChange={e => setSaleCustId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                  >
                    {state.customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">শাখা (Branch)</label>
                  <select
                    value={saleBranchId}
                    onChange={e => setSaleBranchId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                  >
                    {state.branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">পণ্য নির্বাচন (Product)</label>
                <select
                  value={saleProductId}
                  onChange={e => {
                    const pid = e.target.value;
                    setSaleProductId(pid);
                    const prod = state.products.find(p => p.id === pid);
                    if (prod) {
                      setSaleUnitPrice(prod.selling_price);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  {state.products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} • ৳{p.selling_price.toLocaleString('en-IN')} (Cost: ৳{p.cost_price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">পরিমাণ (Qty)</label>
                  <input
                    type="number"
                    min={1}
                    value={saleQty}
                    onChange={e => setSaleQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">একক দর (Unit Price)</label>
                  <input
                    type="number"
                    value={saleUnitPrice}
                    onChange={e => setSaleUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">ছাড় (Discount)</label>
                  <input
                    type="number"
                    value={saleDiscount}
                    onChange={e => setSaleDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">পেমেন্ট মেথড</label>
                <select
                  value={salePaymentMethod}
                  onChange={e => setSalePaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  <option value="cash">Cash Voucher</option>
                  <option value="bank">Bank POS / RTGS</option>
                  <option value="bkash">bKash Merchant Pay</option>
                  <option value="credit">Full Customer Due (Credit)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between font-bold">
                <span className="text-slate-500">মোট প্রদেয় (Grand Total):</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
                  ৳{Math.max(0, saleQty * saleUnitPrice - saleDiscount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewSaleOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  চালান সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Owner Guardian Intercept Modal */}
      <GuardianInterceptModal
        result={guardianResult}
        onClose={() => setGuardianResult(null)}
        onApplyCorrection={(field, val) => {
          if (field.includes('unit_price')) setSaleUnitPrice(Number(val));
          if (field.includes('quantity')) setSaleQty(Number(val));
          if (field.includes('discount')) setSaleDiscount(Number(val));
          setGuardianResult(null);
        }}
        onProceedAnyway={() => {
          executeCreateSale();
        }}
        onSupervisorOverride={() => {
          executeCreateSale();
        }}
      />
    </div>
  );
};

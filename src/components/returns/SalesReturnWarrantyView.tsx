import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { WarrantyCase, SalesReturn } from '../../types';
import {
  RotateCcw,
  ShieldCheck,
  Search,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  FileText,
  Trash2
} from 'lucide-react';

export const SalesReturnWarrantyView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'returns' | 'warranty'>('returns');

  // Sales Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnInvoiceNo, setReturnInvoiceNo] = useState('');
  const [returnCustomer, setReturnCustomer] = useState('');
  const [returnPhone, setReturnPhone] = useState('');
  const [returnProduct, setReturnProduct] = useState('prd_1');
  const [returnImei, setReturnImei] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnRefund, setReturnRefund] = useState(189999);
  const [refundMethod, setRefundMethod] = useState<'cash' | 'bkash' | 'credit_note'>('cash');
  const [returnReason, setReturnReason] = useState('Hardware screen defect within 7 days');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState(false);

  // Warranty Case Modal State
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [warImei, setWarImei] = useState('');
  const [warProduct, setWarProduct] = useState('Samsung Galaxy S24 Ultra 5G');
  const [warBrand, setWarBrand] = useState('Samsung');
  const [warCustomer, setWarCustomer] = useState('');
  const [warPhone, setWarPhone] = useState('');
  const [warIssue, setWarIssue] = useState('No power / display flickering');
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyCase | null>(null);

  const returns = state.salesReturns.filter(r => {
    if (activeBranchId !== 'all' && r.branch_id !== activeBranchId) return false;
    return true;
  });

  const warranties = state.warranties.filter(w => {
    if (activeBranchId !== 'all' && w.branch_id !== activeBranchId) return false;
    return true;
  });

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const product = state.products.find(p => p.id === returnProduct);

    storage.createSalesReturn({
      invoice_no: returnInvoiceNo || 'INV-2026-089',
      customer_name: returnCustomer || 'Walk-in Customer',
      customer_phone: returnPhone || '01700000000',
      branch_id: activeBranchId === 'all' ? 'br_1' : activeBranchId,
      items: [
        {
          product_id: returnProduct,
          product_name: product?.name || 'Mobile Phone',
          imei1: returnImei || undefined,
          quantity: Number(returnQty),
          refund_unit_price: Number(returnRefund),
          subtotal: Number(returnRefund) * Number(returnQty)
        }
      ],
      total_refund: Number(returnRefund) * Number(returnQty),
      refund_method: refundMethod,
      reason: returnReason,
      user_name: currentUser.name
    });

    setIsReturnModalOpen(false);
    setReturnSuccessMsg(true);
    setTimeout(() => setReturnSuccessMsg(false), 3000);
  };

  const handleCreateWarrantyCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warImei || !warCustomer) return;

    storage.createWarrantyCase({
      imei: warImei,
      product_name: warProduct,
      brand_name: warBrand,
      customer_name: warCustomer,
      customer_phone: warPhone,
      branch_id: activeBranchId === 'all' ? 'br_1' : activeBranchId,
      branch_name: activeBranchId === 'all' ? 'Motijheel Flagship Store' : state.branches.find(b => b.id === activeBranchId)?.name || 'Store',
      issue_description: warIssue,
      status: 'received',
      expected_return_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service_charge: 0,
      notes: 'Initial claim received at counter'
    });

    setIsWarrantyModalOpen(false);
    setWarImei('');
    setWarCustomer('');
  };

  const handleUpdateWarrantyStatus = (id: string, status: WarrantyCase['status']) => {
    storage.updateWarrantyStatus(id, status, `Status changed to ${status} by ${currentUser.name}`);
  };

  const handleDeleteReturn = (id: string, returnNo: string) => {
    if (confirm(`Are you sure you want to delete sales return record "${returnNo}"?`)) {
      storage.deleteSalesReturn(id);
    }
  };

  const handleDeleteWarranty = (id: string, ticketNo: string) => {
    if (confirm(`Are you sure you want to delete warranty claim "${ticketNo}"?`)) {
      storage.deleteWarrantyCase(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Sales Returns, Restocking & Warranty Claims Desk', 'বিক্রয় ফেরত, রিফান্ড ও ওয়ারেন্টি সার্ভিস ডেস্ক')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full Auditability • Auto Reversing Journal • IMEI Lifecycle Restoration • Brand Warranty RMA Tickets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'returns' ? (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Process New Sales Return</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWarrantyModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Warranty Job Ticket</span>
            </button>
          )}
        </div>
      </div>

      {returnSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Sales Return successfully processed! IMEI status updated and reversing journal posted.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'returns'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sales Returns & Refunds ({returns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'warranty'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Device Warranty & RMA Claims ({warranties.length})</span>
        </button>
      </div>

      {/* TAB 1: SALES RETURNS TABLE */}
      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Return Slip #</th>
                <th className="p-3">Original Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Returned Item & IMEI</th>
                <th className="p-3 text-right">Refund Amount (BDT)</th>
                <th className="p-3">Refund Method</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-400">
                    No sales return records found.
                  </td>
                </tr>
              ) : (
                returns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{ret.return_no}</td>
                    <td className="p-3 font-mono text-emerald-600 font-semibold">{ret.invoice_no}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {ret.customer_name}
                      <span className="block text-[10px] text-slate-400">{ret.customer_phone}</span>
                    </td>
                    <td className="p-3 text-slate-500">{ret.branch_name}</td>
                    <td className="p-3">
                      {ret.items.map((it, idx) => (
                        <div key={idx}>
                          <span>{it.quantity}x {it.product_name}</span>
                          {it.imei1 && <span className="block font-mono text-[10px] text-indigo-500">IMEI: {it.imei1}</span>}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">
                      ৳{ret.total_refund.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                        {ret.refund_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{ret.reason}</td>
                    <td className="p-3 text-slate-400 text-[10px]">{new Date(ret.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteReturn(ret.id, ret.return_no)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Return Record"
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

      {/* TAB 2: WARRANTY CLAIMS & RMA TRACKER */}
      {activeTab === 'warranty' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Ticket #</th>
                <th className="p-3">Device & IMEI</th>
                <th className="p-3">Customer Details</th>
                <th className="p-3">Reported Fault</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Dates</th>
                <th className="p-3 text-center">Manage Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {warranties.map(war => (
                <tr key={war.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-indigo-600">{war.ticket_no}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{war.product_name}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">IMEI: {war.imei}</div>
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 dark:text-white block">{war.customer_name}</strong>
                    <span className="text-[10px] text-slate-400">{war.customer_phone}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{war.issue_description}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      war.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : war.status === 'repaired'
                        ? 'bg-blue-100 text-blue-800'
                        : war.status === 'sent_to_brand'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {war.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] text-slate-400">
                    <div>Rec: {war.received_date}</div>
                    {war.expected_return_date && <div>Due: {war.expected_return_date}</div>}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {war.status === 'received' && (
                        <button
                          onClick={() => handleUpdateWarrantyStatus(war.id, 'sent_to_brand')}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold"
                        >
                          Send to Brand
                        </button>
                      )}
                      {war.status === 'sent_to_brand' && (
                        <button
                          onClick={() => handleUpdateWarrantyStatus(war.id, 'repaired')}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold"
                        >
                          Mark Repaired
                        </button>
                      )}
                      {war.status === 'repaired' && (
                        <button
                          onClick={() => handleUpdateWarrantyStatus(war.id, 'delivered')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Handover
                        </button>
                      )}
                      {war.status === 'delivered' && (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteWarranty(war.id, war.ticket_no)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Warranty Claim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Process Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>Process Customer Sales Return & Refund</span>
            </h3>

            <form onSubmit={handleCreateReturn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Original Invoice # *</label>
                  <input
                    type="text"
                    required
                    value={returnInvoiceNo}
                    onChange={e => setReturnInvoiceNo(e.target.value)}
                    placeholder="e.g. INV-2026-089"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Product Model *</label>
                  <select
                    value={returnProduct}
                    onChange={e => {
                      setReturnProduct(e.target.value);
                      const p = state.products.find(x => x.id === e.target.value);
                      if (p) setReturnRefund(p.selling_price);
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Customer Name</label>
                  <input
                    type="text"
                    value={returnCustomer}
                    onChange={e => setReturnCustomer(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Customer Phone</label>
                  <input
                    type="text"
                    value={returnPhone}
                    onChange={e => setReturnPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Returned Device IMEI (If Handset)</label>
                <input
                  type="text"
                  value={returnImei}
                  onChange={e => setReturnImei(e.target.value)}
                  placeholder="358249110294825"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Refund Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={returnRefund}
                    onChange={e => setReturnRefund(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Refund Method</label>
                  <select
                    value={refundMethod}
                    onChange={e => setRefundMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="cash">Cash Drawer Refund</option>
                    <option value="bkash">bKash Merchant Refund</option>
                    <option value="credit_note">Credit to Customer Ledger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Return Reason & Inspection Note *</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="e.g. 7-Day DOA replacement exchange"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Post Return & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Warranty Ticket Modal */}
      {isWarrantyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Create Official Device Warranty Job Ticket</span>
            </h3>

            <form onSubmit={handleCreateWarrantyCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Device IMEI Number *</label>
                <input
                  type="text"
                  required
                  value={warImei}
                  onChange={e => setWarImei(e.target.value)}
                  placeholder="Scan or type 15-digit IMEI..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Device Model</label>
                  <input
                    type="text"
                    value={warProduct}
                    onChange={e => setWarProduct(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Brand</label>
                  <input
                    type="text"
                    value={warBrand}
                    onChange={e => setWarBrand(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={warCustomer}
                    onChange={e => setWarCustomer(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={warPhone}
                    onChange={e => setWarPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Reported Hardware / Software Issue *</label>
                <textarea
                  rows={2}
                  required
                  value={warIssue}
                  onChange={e => setWarIssue(e.target.value)}
                  placeholder="Detailed description of defect..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWarrantyModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded"
                >
                  Issue Warranty Job Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

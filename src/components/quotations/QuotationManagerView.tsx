import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Quotation } from '../../types';
import {
  FileText,
  Plus,
  Printer,
  CheckCircle,
  Calendar,
  Building,
  Smartphone,
  Eye,
  X,
  ArrowRight,
  Trash2
} from 'lucide-react';

export const QuotationManagerView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [compName, setCompName] = useState('');
  const [selectedProdId, setSelectedProdId] = useState('prd_1');
  const [prodQty, setProdQty] = useState(5);
  const [prodDiscount, setProdDiscount] = useState(2500);
  const [validDays, setValidDays] = useState(14);
  const [quoteNotes, setQuoteNotes] = useState('Official brand warranty and doorstep delivery included.');

  const quotations = state.quotations.filter(q => {
    if (activeBranchId !== 'all' && q.branch_id !== activeBranchId) return false;
    return true;
  });

  const handleDeleteQuotation = (id: string, quoteNo: string) => {
    if (confirm(`Are you sure you want to delete quotation "${quoteNo}"?`)) {
      storage.deleteQuotation(id);
    }
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = state.products.find(p => p.id === selectedProdId);
    if (!prod || !custName) return;

    const subtotal = prod.selling_price * prodQty;
    const totalDiscount = prodDiscount * prodQty;
    const total = subtotal - totalDiscount;

    storage.createQuotation({
      customer_name: custName,
      customer_phone: custPhone,
      company_name: compName,
      branch_id: activeBranchId === 'all' ? 'br_1' : activeBranchId,
      branch_name: activeBranchId === 'all' ? 'Motijheel Flagship Store' : state.branches.find(b => b.id === activeBranchId)?.name || 'Store',
      items: [
        {
          product_id: prod.id,
          product_name: prod.name,
          model: prod.model,
          quantity: Number(prodQty),
          unit_price: prod.selling_price,
          discount: Number(prodDiscount),
          subtotal: total
        }
      ],
      subtotal,
      discount: totalDiscount,
      total_amount: total,
      valid_until: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: quoteNotes,
      status: 'active',
      created_by: currentUser.name
    });

    setIsNewQuoteOpen(false);
    setCustName('');
    setCustPhone('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Corporate Quotations & B2B Pro-Forma Billing', 'কর্পোরেট কোটেশন ও বিটুবি প্রফর্মা ইনভয়েস')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal Corporate Price Proposals • Institutional Bulk Offers • 1-Click Convert to POS Sale
          </p>
        </div>

        <button
          onClick={() => setIsNewQuoteOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Corporate Quotation</span>
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
            <tr>
              <th className="p-3">Quotation #</th>
              <th className="p-3">Customer / Organization</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Proposed Models</th>
              <th className="p-3 text-right">Quoted Value (BDT)</th>
              <th className="p-3">Valid Until</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {quotations.map(q => (
              <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{q.quotation_no}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-white">{q.customer_name}</div>
                  {q.company_name && <div className="text-[10px] text-slate-400">{q.company_name}</div>}
                </td>
                <td className="p-3 text-slate-500">{q.customer_phone}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{q.branch_name}</td>
                <td className="p-3">
                  {q.items.map((it, idx) => (
                    <div key={idx} className="line-clamp-1">{it.quantity}x {it.product_name}</div>
                  ))}
                </td>
                <td className="p-3 text-right font-mono font-bold text-emerald-600 text-sm">
                  ৳{q.total_amount.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-slate-500">{q.valid_until}</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {q.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelectedQuote(q)}
                    className="p-1 text-slate-500 hover:text-emerald-600"
                    title="View & Print Letterhead"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Quotation Modal */}
      {isNewQuoteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Create Official Corporate Price Quotation</span>
            </h3>

            <form onSubmit={handleCreateQuotation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Company / Institution Name</label>
                <input
                  type="text"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  placeholder="e.g. Beximco Pharma Ltd."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Select Mobile Phone Model</label>
                <select
                  value={selectedProdId}
                  onChange={e => setSelectedProdId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (MRP: ৳{p.selling_price.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Quoted Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={prodQty}
                    onChange={e => setProdQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Bulk Discount per Unit (BDT)</label>
                  <input
                    type="number"
                    value={prodDiscount}
                    onChange={e => setProdDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Quotation Validity (Days)</label>
                <input
                  type="number"
                  value={validDays}
                  onChange={e => setValidDays(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Terms & Notes</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={e => setQuoteNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Letterhead Print Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center no-print">
              <span className="font-bold text-xs uppercase text-emerald-600">Official Price Quotation</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Letterhead</span>
                </button>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border border-slate-200 p-5 rounded-lg space-y-4 text-xs">
              <div className="text-center space-y-0.5 border-b pb-3">
                <h2 className="text-base font-black tracking-tight">{state.company.name}</h2>
                <p className="text-slate-500">{selectedQuote.branch_name}</p>
                <p className="text-slate-400 text-[10px]">BIN: {state.company.bin_number} • Phone: {state.company.phone}</p>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest pt-1">
                  COMMERCIAL PRICE QUOTATION
                </div>
              </div>

              <div className="flex justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block">To:</span>
                  <strong className="text-sm">{selectedQuote.company_name || selectedQuote.customer_name}</strong>
                  <div>Attn: {selectedQuote.customer_name}</div>
                  <div>Phone: {selectedQuote.customer_phone}</div>
                </div>
                <div className="text-right">
                  <div>Quotation: <strong>{selectedQuote.quotation_no}</strong></div>
                  <div>Date: {new Date(selectedQuote.created_at).toLocaleDateString()}</div>
                  <div className="text-emerald-600 font-bold">Valid Until: {selectedQuote.valid_until}</div>
                </div>
              </div>

              <table className="w-full text-left border-t border-b">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedQuote.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2">
                        <strong>{it.product_name}</strong>
                        {it.discount > 0 && <div className="text-[10px] text-emerald-600">Bulk discount applied: ৳{it.discount}/unit</div>}
                      </td>
                      <td className="py-2 text-right font-mono">{it.quantity}</td>
                      <td className="py-2 text-right font-mono">৳{(it.unit_price - it.discount).toLocaleString('en-IN')}</td>
                      <td className="py-2 text-right font-mono font-bold">৳{it.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right space-y-1">
                <div className="text-slate-500">Subtotal: ৳{selectedQuote.subtotal.toLocaleString('en-IN')}</div>
                <div className="text-emerald-600 font-semibold">Special B2B Discount: -৳{selectedQuote.discount.toLocaleString('en-IN')}</div>
                <div className="text-sm font-black border-t pt-1">
                  Net Quoted Amount: ৳{selectedQuote.total_amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t pt-3">
                <p><strong>Terms:</strong> {selectedQuote.notes}</p>
                <p>Delivery: Within 24-48 hours upon receipt of confirmed work order.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

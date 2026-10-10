import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Purchase } from '../../types';
import {
  Truck,
  Plus,
  Search,
  Building,
  FileCheck,
  CheckCircle,
  Barcode,
  Eye,
  X,
  Trash2,
  Sparkles
} from 'lucide-react';
import {
  aiOwnerGuardianValidationEngine,
  GuardianInterceptionResult
} from '../../services/aiOwnerGuardianValidationEngine';
import { GuardianInterceptModal } from '../guardian/GuardianInterceptModal';

export const PurchaseManagement: React.FC = () => {
  const { state, currentUser, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Form State
  const [supplierId, setSupplierId] = useState('sup_1');
  const [branchId, setBranchId] = useState('br_4'); // default central warehouse
  const [billNo, setBillNo] = useState('');
  const [productId, setProductId] = useState('prd_1');
  const [quantity, setQuantity] = useState(2);
  const [unitCost, setUnitCost] = useState(168000);
  const [paidAmount, setPaidAmount] = useState(200000);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash' | 'credit' | 'split'>('bank');
  const [imeiInput, setImeiInput] = useState('');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [guardianResult, setGuardianResult] = useState<GuardianInterceptionResult | null>(null);

  const purchases = state.purchases.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.purchase_no.toLowerCase().includes(q) ||
      p.bill_no.toLowerCase().includes(q) ||
      p.supplier_name.toLowerCase().includes(q)
    );
  });

  const handleDeletePurchase = (id: string, purNo: string) => {
    if (confirm(`Are you sure you want to remove purchase bill "${purNo}"? Supplier accounts payable will be reverted.`)) {
      storage.deletePurchase(id);
    }
  };

  const executePurchaseSubmission = (customCost?: number, customQty?: number, customPaid?: number) => {
    const effCost = customCost ?? Number(unitCost);
    const effQty = customQty ?? Number(quantity);
    const effPaid = customPaid ?? Number(paidAmount);

    const imeiList = imeiInput
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean);

    const res = storage.createPurchase({
      bill_no: billNo || 'BILL-' + Date.now().toString().slice(-6),
      supplier_id: supplierId,
      branch_id: branchId,
      items: [
        {
          product_id: productId,
          quantity: effQty,
          unit_cost: effCost,
          imei_list: imeiList.length > 0 ? imeiList : undefined
        }
      ],
      paid_amount: effPaid,
      payment_method: paymentMethod,
      user_name: currentUser.name
    });

    if (!res.success) {
      setPurchaseError(res.error || 'Failed to create purchase');
      return;
    }

    setIsNewPurchaseOpen(false);
    setGuardianResult(null);
    setBillNo('');
    setImeiInput('');
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError(null);

    const imeiList = imeiInput
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean);

    const product = state.products.find(p => p.id === productId);
    if (product?.has_imei && imeiList.length !== Number(quantity)) {
      setPurchaseError(`You specified quantity ${quantity}, but provided ${imeiList.length} IMEIs! They must match.`);
      return;
    }

    // Intercept form submission with AIOwnerGuardianValidationEngine
    const interception = aiOwnerGuardianValidationEngine.interceptPurchaseSubmission({
      product_id: productId,
      supplier_id: supplierId,
      branch_id: branchId,
      quantity: Number(quantity),
      unit_cost: Number(unitCost),
      paid_amount: Number(paidAmount),
      imei_list: imeiList.length > 0 ? imeiList : undefined,
      currentUser,
      state
    });

    if (!interception.isValid) {
      aiOwnerGuardianValidationEngine.recordAndAlert(interception, currentUser, state);
      setGuardianResult(interception);
      return; // Submission intercepted
    }

    executePurchaseSubmission();
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Purchase Management & Goods Receive (GRN)', 'ক্রয় ব্যবস্থাপনা ও মালামাল গ্রহণ')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Purchase Value: <strong>৳{purchases.reduce((s, p) => s + p.total_cost, 0).toLocaleString('en-IN')}</strong> • Total Supplier Payables:{' '}
            <strong className="text-amber-600">৳{state.suppliers.reduce((s, x) => s + x.current_payable, 0).toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsNewPurchaseOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Receive New Goods / GRN</span>
          </button>
        </div>
      </div>

      {/* Purchases List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {purchases.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Truck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {t('No purchase orders / GRN received. Clean slate database.', 'কোন ক্রয় চালান বা জিআরএন নেই। ফ্রেশ ডাটাবেজ।')}
            </p>
            <button
              onClick={() => setIsNewPurchaseOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Purchase</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
                <tr>
                  <th className="p-3">GRN Purchase #</th>
                  <th className="p-3">Supplier Bill #</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Receiving Branch</th>
                  <th className="p-3">Products Received</th>
                  <th className="p-3 text-right">Total Cost (BDT)</th>
                  <th className="p-3 text-right">Paid (BDT)</th>
                  <th className="p-3 text-right">Due / Payable</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{p.purchase_no}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{p.bill_no}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{p.supplier_name}</td>
                    <td className="p-3 text-slate-500">{p.branch_name}</td>
                    <td className="p-3">
                      <div className="line-clamp-1">{p.items.map(it => `${it.quantity}x ${it.product_name}`).join(', ')}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ৳{(p.total_cost ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-semibold">
                      ৳{(p.paid_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={(p.due_amount ?? 0) > 0 ? 'text-amber-600' : 'text-slate-400'}>
                        ৳{(p.due_amount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedPurchase(p)}
                          className="p-1 text-slate-500 hover:text-emerald-600 transition"
                          title="View GRN Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(p.id, p.purchase_no)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Purchase"
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
      </div>

      {/* New Purchase Modal with Batch IMEI input */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Record New Goods Receive Note (GRN)</span>
            </h3>

            {purchaseError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                {purchaseError}
              </div>
            )}

            <form onSubmit={handleCreatePurchase} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Supplier Name *</label>
                  <select
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Supplier Bill / Invoice # *</label>
                  <input
                    type="text"
                    required
                    value={billNo}
                    onChange={e => setBillNo(e.target.value)}
                    placeholder="e.g. FAIR-INV-9901"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Receiving Depot / Branch *</label>
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
                  <label className="block text-slate-500 mb-0.5">Product Model *</label>
                  <select
                    value={productId}
                    onChange={e => {
                      setProductId(e.target.value);
                      const p = state.products.find(x => x.id === e.target.value);
                      if (p) setUnitCost(p.cost_price);
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Quantity Received</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Unit Purchase Cost (BDT)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={e => setUnitCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">
                  Scan / Paste IMEIs (15-digit TAC, comma or newline separated, exactly {quantity} IMEIs)
                </label>
                <textarea
                  rows={3}
                  value={imeiInput}
                  onChange={e => setImeiInput(e.target.value)}
                  placeholder="358249110294901&#10;358249110294902"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Initial Paid Amount (BDT)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="bank">Bank RTGS / Cheque</option>
                    <option value="cash">Cash Voucher</option>
                    <option value="credit">Full Supplier Credit</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border text-slate-600 dark:text-slate-300">
                Total Bill: <strong>৳{(quantity * unitCost).toLocaleString('en-IN')}</strong> • Payable Due:{' '}
                <strong className="text-amber-600">৳{Math.max(0, quantity * unitCost - paidAmount).toLocaleString('en-IN')}</strong>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Confirm Goods Receipt
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
          if (field === 'unit_cost') setUnitCost(Number(val));
          if (field === 'quantity') setQuantity(Number(val));
          if (field === 'paid_amount') setPaidAmount(Number(val));
          setGuardianResult(null);
        }}
        onProceedAnyway={() => {
          executePurchaseSubmission();
        }}
        onSupervisorOverride={() => {
          executePurchaseSubmission();
        }}
      />
    </div>
  );
};

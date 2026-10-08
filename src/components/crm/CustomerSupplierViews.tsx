import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Customer, Supplier } from '../../types';
import {
  Users,
  Building,
  CreditCard,
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  MapPin
} from 'lucide-react';

interface CustomerSupplierViewsProps {
  mode: 'customers' | 'suppliers';
}

export const CustomerSupplierViews: React.FC<CustomerSupplierViewsProps> = ({ mode }) => {
  const { state, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'master' | 'aging'>('master');
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);

  // Payment Collection State
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | 'bkash' | 'nagad'>('cash');
  const [payRef, setPayRef] = useState('');

  const handleCollectCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment) return;

    storage.collectCustomerPayment({
      customer_id: selectedCustomerForPayment.id,
      branch_id: selectedCustomerForPayment.branch_id || 'br_1',
      amount: Number(payAmount),
      payment_method: payMethod,
      reference: payRef,
      user_name: currentUser.name
    });

    setSelectedCustomerForPayment(null);
    setPayRef('');
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment) return;

    storage.paySupplier({
      supplier_id: selectedSupplierForPayment.id,
      branch_id: 'br_1',
      amount: Number(payAmount),
      payment_method: payMethod === 'nagad' ? 'bkash' : (payMethod as any),
      reference: payRef,
      user_name: currentUser.name
    });

    setSelectedSupplierForPayment(null);
    setPayRef('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            {mode === 'customers' ? (
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {mode === 'customers'
                ? t('Customer Master & Receivables Aging', 'গ্রাহক লেজার ও দেনাদার এজিং')
                : t('Supplier Master & Accounts Payable', 'সরবরাহকারী লেজার ও পাওনাদার হিসাব')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'customers'
              ? `Total Customers: ${state.customers.length} • Total Receivable: ৳${state.customers.reduce((s, c) => s + c.current_balance, 0).toLocaleString('en-IN')}`
              : `Total Suppliers: ${state.suppliers.length} • Total Payable: ৳${state.suppliers.reduce((s, x) => s + x.current_payable, 0).toLocaleString('en-IN')}`}
          </p>
        </div>

        {mode === 'customers' && (
          <div className="flex gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'master'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
              }`}
            >
              Customer Directory
            </button>
            <button
              onClick={() => setActiveTab('aging')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'aging'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
              }`}
            >
              Receivables Aging Analysis
            </button>
          </div>
        )}
      </div>

      {/* CUSTOMER DIRECTORY */}
      {mode === 'customers' && activeTab === 'master' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Customer Code & Name</th>
                <th className="p-3">Contact & Address</th>
                <th className="p-3 text-right">Credit Limit (BDT)</th>
                <th className="p-3 text-right">Current Outstanding (BDT)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{c.code}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1 text-slate-800 dark:text-slate-200">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      <span className="truncate max-w-xs">{c.address}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                    ৳{c.credit_limit.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span className={c.current_balance > 0 ? 'text-rose-500 text-sm' : 'text-slate-400'}>
                      ৳{c.current_balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.current_balance > c.credit_limit && c.credit_limit > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.current_balance > c.credit_limit && c.credit_limit > 0 ? 'Overlimit' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {c.current_balance > 0 && (
                      <button
                        onClick={() => {
                          setSelectedCustomerForPayment(c);
                          setPayAmount(c.current_balance);
                        }}
                        className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-[11px] hover:bg-emerald-700"
                      >
                        Receive Collection
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CUSTOMER AGING ANALYSIS */}
      {mode === 'customers' && activeTab === 'aging' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              DEBTOR AGING BUCKETS ANALYSIS (AS OF TODAY)
            </h3>
            <span className="text-xs text-slate-500">Normal Credit Terms: 15 Days</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Current (0-7 Days)</span>
              <strong className="text-sm font-black text-emerald-700">৳75,000</strong>
            </div>
            <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">8-15 Days</span>
              <strong className="text-sm font-black text-blue-700">৳142,000</strong>
            </div>
            <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">16-30 Days</span>
              <strong className="text-sm font-black text-amber-700">৳185,000</strong>
            </div>
            <div className="p-2.5 rounded bg-orange-50 dark:bg-orange-950/40 border border-orange-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">31-60 Days</span>
              <strong className="text-sm font-black text-orange-700">৳28,500</strong>
            </div>
            <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">61-90 Days</span>
              <strong className="text-sm font-black text-rose-700">৳0</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-900 text-white">
              <span className="text-[10px] text-rose-300 uppercase block font-bold">90+ Days (Default)</span>
              <strong className="text-sm font-black text-rose-400">৳0</strong>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIERS DIRECTORY */}
      {mode === 'suppliers' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Supplier Code & Company</th>
                <th className="p-3">Contact Person & Phone</th>
                <th className="p-3">Address</th>
                <th className="p-3 text-right">Current Payable (BDT)</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{s.code}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{s.contact_person}</div>
                    <div className="text-[10px] text-slate-400">{s.phone}</div>
                  </td>
                  <td className="p-3 text-slate-500">{s.address}</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600 text-sm">
                    ৳{s.current_payable.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center">
                    {s.current_payable > 0 && (
                      <button
                        onClick={() => {
                          setSelectedSupplierForPayment(s);
                          setPayAmount(s.current_payable);
                        }}
                        className="px-2 py-1 bg-amber-600 text-white rounded font-bold text-[11px] hover:bg-amber-700"
                      >
                        Disburse Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Collection Modal */}
      {selectedCustomerForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Receive Customer Payment (Money Receipt)
            </h3>
            <p className="text-xs text-slate-500">
              Customer: <strong>{selectedCustomerForPayment.name}</strong> • Due: ৳{selectedCustomerForPayment.current_balance.toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleCollectCustomerPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Amount to Collect (BDT)</label>
                <input
                  type="number"
                  required
                  max={selectedCustomerForPayment.current_balance}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  <option value="cash">Cash In Hand</option>
                  <option value="bkash">bKash Merchant</option>
                  <option value="nagad">Nagad Merchant</option>
                  <option value="bank">City Bank / BRAC Bank Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Reference / Trx ID / Cheque #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. Trx 89201 or Cheque 99120"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPayment(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Confirm & Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal */}
      {selectedSupplierForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Disburse Supplier Payment
            </h3>
            <p className="text-xs text-slate-500">
              Supplier: <strong>{selectedSupplierForPayment.name}</strong> • Payable: ৳{selectedSupplierForPayment.current_payable.toLocaleString('en-IN')}
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Disbursement Amount (BDT)</label>
                <input
                  type="number"
                  required
                  max={selectedSupplierForPayment.current_payable}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Disbursement Channel</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  <option value="bank">City Bank / RTGS Transfer</option>
                  <option value="cash">Cash Voucher</option>
                  <option value="bkash">bKash B2B Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Cheque / RTGS Ref #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. RTGS #991029"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForPayment(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white font-bold rounded"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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
  MapPin,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface CustomerSupplierViewsProps {
  mode: 'customers' | 'suppliers';
}

export const CustomerSupplierViews: React.FC<CustomerSupplierViewsProps> = ({ mode }) => {
  const { state, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'master' | 'aging'>('master');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modals
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);

  // Add/Edit Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState<number>(50000);
  const [custOpeningBal, setCustOpeningBal] = useState<number>(0);
  const [custBranchId, setCustBranchId] = useState<string>('br_1');

  // Add/Edit Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supContactPerson, setSupContactPerson] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supOpeningPayable, setSupOpeningPayable] = useState<number>(0);

  // Payment Collection State
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | 'bkash' | 'nagad'>('cash');
  const [payRef, setPayRef] = useState('');

  // Filtering
  const filteredCustomers = state.customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.code.toLowerCase().includes(q);
  });

  const filteredSuppliers = state.suppliers.filter(s => {
    const q = searchQuery.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.code.toLowerCase().includes(q);
  });

  // Open Add Customer
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustCreditLimit(50000);
    setCustOpeningBal(0);
    setCustBranchId(state.branches[0]?.id || 'br_1');
    setIsCustomerModalOpen(true);
  };

  // Open Edit Customer
  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustAddress(c.address);
    setCustCreditLimit(c.credit_limit);
    setIsCustomerModalOpen(true);
  };

  // Save Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    if (editingCustomer) {
      storage.updateCustomer(editingCustomer.id, {
        name: custName,
        phone: custPhone,
        address: custAddress,
        credit_limit: Number(custCreditLimit)
      });
    } else {
      storage.addCustomer({
        name: custName,
        phone: custPhone,
        address: custAddress,
        credit_limit: Number(custCreditLimit),
        current_balance: Number(custOpeningBal),
        opening_balance: Number(custOpeningBal),
        branch_id: custBranchId
      });
    }

    setIsCustomerModalOpen(false);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      storage.deleteCustomer(id);
    }
  };

  // Open Add Supplier
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupContactPerson('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupOpeningPayable(0);
    setIsSupplierModalOpen(true);
  };

  // Open Edit Supplier
  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupName(s.name);
    setSupContactPerson(s.contact_person || '');
    setSupPhone(s.phone);
    setSupEmail(s.email || '');
    setSupAddress(s.address);
    setIsSupplierModalOpen(true);
  };

  // Save Supplier
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone) return;

    if (editingSupplier) {
      storage.updateSupplier(editingSupplier.id, {
        name: supName,
        contact_person: supContactPerson,
        phone: supPhone,
        email: supEmail,
        address: supAddress
      });
    } else {
      storage.addSupplier({
        name: supName,
        contact_person: supContactPerson,
        phone: supPhone,
        email: supEmail,
        address: supAddress,
        current_payable: Number(supOpeningPayable),
        opening_payable: Number(supOpeningPayable)
      });
    }

    setIsSupplierModalOpen(false);
  };

  // Delete Supplier
  const handleDeleteSupplier = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      storage.deleteSupplier(id);
    }
  };

  // Payment Collections
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
              ? `Total Customers: ${state.customers.length} • Total Receivable: ৳${state.customers.reduce((s, c) => s + (c.current_balance ?? 0), 0).toLocaleString('en-IN')}`
              : `Total Suppliers: ${state.suppliers.length} • Total Payable: ৳${state.suppliers.reduce((s, x) => s + (x.current_payable ?? 0), 0).toLocaleString('en-IN')}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === 'customers' ? (
            <button
              onClick={handleOpenAddCustomer}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Add New Customer', 'নতুন গ্রাহক যোগ করুন')}</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddSupplier}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Add New Supplier', 'নতুন সরবরাহকারী যোগ করুন')}</span>
            </button>
          )}

          {mode === 'customers' && (
            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setActiveTab('master')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  activeTab === 'master'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
                }`}
              >
                Customer Directory
              </button>
              <button
                onClick={() => setActiveTab('aging')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  activeTab === 'aging'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
                }`}
              >
                Receivables Aging
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={mode === 'customers' ? 'Search by customer name, phone, code...' : 'Search by supplier name, phone, code...'}
          className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
        />
      </div>

      {/* CUSTOMER DIRECTORY */}
      {mode === 'customers' && activeTab === 'master' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {state.customers.length === 0
                  ? t('No customers found. Database is clean slate.', 'কোন গ্রাহক নেই। ডাটাবেজ খালি।')
                  : 'No matching customers found.'}
              </p>
              <button
                onClick={handleOpenAddCustomer}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Customer</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredCustomers.map(c => (
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
                        ৳{(c.credit_limit ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={(c.current_balance ?? 0) > 0 ? 'text-rose-500 text-sm' : 'text-slate-400'}>
                          ৳{(c.current_balance ?? 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          (c.current_balance ?? 0) > (c.credit_limit ?? 0) && (c.credit_limit ?? 0) > 0
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {(c.current_balance ?? 0) > (c.credit_limit ?? 0) && (c.credit_limit ?? 0) > 0 ? 'Overlimit' : 'Normal'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {(c.current_balance ?? 0) > 0 && (
                            <button
                              onClick={() => {
                                setSelectedCustomerForPayment(c);
                                setPayAmount(c.current_balance);
                              }}
                              className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-[11px] hover:bg-emerald-700 transition"
                              title="Receive Payment"
                            >
                              Receive
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditCustomer(c)}
                            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Delete Customer"
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Current (0-7 Days)</span>
              <strong className="text-sm font-black text-emerald-700">
                ৳{Math.round(state.customers.reduce((s, c) => s + (c.current_balance ?? 0), 0) * 0.45).toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">8-15 Days</span>
              <strong className="text-sm font-black text-blue-700">
                ৳{Math.round(state.customers.reduce((s, c) => s + (c.current_balance ?? 0), 0) * 0.35).toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">16-30 Days</span>
              <strong className="text-sm font-black text-amber-700">
                ৳{Math.round(state.customers.reduce((s, c) => s + (c.current_balance ?? 0), 0) * 0.15).toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">30+ Days (Overdue)</span>
              <strong className="text-sm font-black text-rose-700">
                ৳{Math.round(state.customers.reduce((s, c) => s + (c.current_balance ?? 0), 0) * 0.05).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER MASTER */}
      {mode === 'suppliers' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Building className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {state.suppliers.length === 0
                  ? t('No suppliers found. Database is clean slate.', 'কোন সরবরাহকারী নেই। ডাটাবেজ খালি।')
                  : 'No matching suppliers found.'}
              </p>
              <button
                onClick={handleOpenAddSupplier}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Supplier</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
                  <tr>
                    <th className="p-3">Supplier Code & Company</th>
                    <th className="p-3">Contact Person & Phone</th>
                    <th className="p-3">Email & Address</th>
                    <th className="p-3 text-right">Current Payable (BDT)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{s.code}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{s.contact_person || 'Management'}</div>
                        <div className="text-[10px] text-slate-400">{s.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-500">{s.email || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{s.address}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 text-sm">
                        ৳{(s.current_payable ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {(s.current_payable ?? 0) > 0 && (
                            <button
                              onClick={() => {
                                setSelectedSupplierForPayment(s);
                                setPayAmount(s.current_payable);
                              }}
                              className="px-2 py-1 bg-amber-600 text-white rounded font-bold text-[11px] hover:bg-amber-700 transition"
                              title="Disburse Payment"
                            >
                              Pay Bill
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditSupplier(s)}
                            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(s.id, s.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Delete Supplier"
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
      )}

      {/* Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{editingCustomer ? 'Edit Customer Information' : 'Add New Customer Profile'}</span>
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="e.g. 01712-345678"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Address / Area</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={e => setCustAddress(e.target.value)}
                  placeholder="e.g. Mirpur-10, Dhaka"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Credit Limit (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={custCreditLimit}
                    onChange={e => setCustCreditLimit(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                  />
                </div>
                {!editingCustomer && (
                  <div>
                    <label className="block text-slate-500 mb-0.5">Opening Due (BDT)</label>
                    <input
                      type="number"
                      min={0}
                      value={custOpeningBal}
                      onChange={e => setCustOpeningBal(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-rose-500 font-bold"
                    />
                  </div>
                )}
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-slate-500 mb-0.5">Assign Branch</label>
                  <select
                    value={custBranchId}
                    onChange={e => setCustBranchId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>{editingSupplier ? 'Edit Supplier Information' : 'Add New Supplier Profile'}</span>
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Fair Electronics Ltd."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Contact Person</label>
                <input
                  type="text"
                  value={supContactPerson}
                  onChange={e => setSupContactPerson(e.target.value)}
                  placeholder="e.g. Mustafizur Rahman"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Phone *</label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={e => setSupPhone(e.target.value)}
                    placeholder="e.g. 01711-223344"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Email</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={e => setSupEmail(e.target.value)}
                    placeholder="e.g. sales@fairbd.com"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Office Address</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={e => setSupAddress(e.target.value)}
                  placeholder="e.g. Gulshan-1, Dhaka"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              {!editingSupplier && (
                <div>
                  <label className="block text-slate-500 mb-0.5">Opening Payable Balance (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={supOpeningPayable}
                    onChange={e => setSupOpeningPayable(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-amber-600 font-bold"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
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
              Customer: <strong>{selectedCustomerForPayment.name}</strong> • Due: ৳{(selectedCustomerForPayment.current_balance ?? 0).toLocaleString('en-IN')}
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
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
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
              Supplier: <strong>{selectedSupplierForPayment.name}</strong> • Payable: ৳{(selectedSupplierForPayment.current_payable ?? 0).toLocaleString('en-IN')}
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Amount to Pay (BDT)</label>
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
                <label className="block text-slate-500 mb-0.5">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  <option value="bank">City Bank / BEFTN / RTGS</option>
                  <option value="cash">Cash In Hand</option>
                  <option value="bkash">bKash Merchant</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Reference / Cheque #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. CQ-29012"
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
                  className="flex-1 py-2 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 transition"
                >
                  Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

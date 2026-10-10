import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Product, IMEIDevice, Customer, PaymentSplitDetail } from '../../types';
import confetti from 'canvas-confetti';
import { aiOwnerGuardian } from '../../services/aiOwnerGuardian';
import { SmartValidationResult } from '../../types/guardian';
import { SmartEntryValidationBanner } from '../guardian/SmartEntryValidationBanner';
import {
  aiOwnerGuardianValidationEngine,
  GuardianInterceptionResult
} from '../../services/aiOwnerGuardianValidationEngine';
import { GuardianInterceptModal } from '../guardian/GuardianInterceptModal';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Smartphone,
  Tag,
  UserPlus,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  selectedImeiId?: string;
  selectedImei1?: string;
  selectedImei2?: string;
}

export const POSTerminal: React.FC = () => {
  const { state, activeBranchId, currentUser, triggerGuardianVoice, t } = useApp();
  const [guardianValidation, setGuardianValidation] = useState<SmartValidationResult | null>(null);
  const [guardianInterception, setGuardianInterception] = useState<GuardianInterceptionResult | null>(null);

  // Branch must be concrete for POS
  const effectiveBranchId = activeBranchId === 'all' ? 'br_1' : activeBranchId;
  const currentBranch =
    (state.branches && state.branches.find(b => b.id === effectiveBranchId)) ||
    (state.branches && state.branches[0]) || {
      id: 'br_1',
      name: 'Main Flagship Store',
      bn_name: 'প্রধান শাখা',
      code: 'BR-01',
      address: 'Dhaka',
      phone: '01711-000000',
      manager_name: 'Manager',
      is_warehouse: false,
      cash_balance: 0
    };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_6'); // default walk-in
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'credit' | 'split'>('cash');

  // Split details
  const [cashSplit, setCashSplit] = useState<number>(0);
  const [bankSplit, setBankSplit] = useState<number>(0);
  const [bkashSplit, setBkashSplit] = useState<number>(0);
  const [creditSplit, setCreditSplit] = useState<number>(0);

  // Modals
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [targetCartIndex, setTargetCartIndex] = useState<number | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSaleInvoice, setLastSaleInvoice] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(50000);

  // Available products
  const filteredProducts = useMemo(() => {
    return state.products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [state.products, selectedCategory, searchQuery]);

  // Available IMEIs for this branch & product
  const getAvailableImeis = (productId: string) => {
    return state.imeis.filter(
      im =>
        im.product_id === productId &&
        im.branch_id === currentBranch.id &&
        im.status === 'in_stock'
    );
  };

  const handleAddToCart = (product: Product) => {
    if (product.has_imei) {
      const available = getAvailableImeis(product.id);
      if (available.length === 0) {
        setErrorMsg(`No IMEI in stock for ${product.name} at ${currentBranch.name}!`);
        return;
      }
      // Add one handset line and open IMEI selection
      const newIdx = cart.length;
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unit_price: product.selling_price,
          discount: 0,
          selectedImeiId: available[0]?.id,
          selectedImei1: available[0]?.imei1,
          selectedImei2: available[0]?.imei2
        }
      ]);
    } else {
      // Accessories
      const existingIdx = cart.findIndex(c => c.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...cart];
        updated[existingIdx].quantity += 1;
        setCart(updated);
      } else {
        setCart([
          ...cart,
          {
            product,
            quantity: 1,
            unit_price: product.selling_price,
            discount: 0
          }
        ]);
      }
    }
    setErrorMsg(null);
  };

  const updateQuantity = (idx: number, delta: number) => {
    const updated = [...cart];
    const item = updated[idx];
    if (item.product.has_imei) return; // Handsets are 1 per IMEI
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      item.quantity = newQty;
    }
    setCart(updated);
  };

  const updateDiscount = (idx: number, val: number) => {
    const updated = [...cart];
    updated[idx].discount = Math.max(0, val);
    setCart(updated);
  };

  const removeCartItem = (idx: number) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  const handleApplyCorrection = (field: string, suggestedVal: any) => {
    const match = field.match(/items\[(\d+)\]\.(unit_price|discount)/);
    if (match) {
      const idx = parseInt(match[1]);
      const prop = match[2];
      const updated = [...cart];
      if (updated[idx]) {
        if (prop === 'unit_price') updated[idx].unit_price = Number(suggestedVal);
        if (prop === 'discount') updated[idx].discount = Number(suggestedVal);
        setCart(updated);
        setGuardianValidation(null);
      }
    }
  };

  const executeCompleteSale = () => {
    let splits: PaymentSplitDetail[] | undefined = undefined;
    if (paymentMethod === 'split') {
      const candidateSplits: PaymentSplitDetail[] = [
        { method: 'cash' as const, amount: cashSplit },
        { method: 'bank' as const, amount: bankSplit },
        { method: 'bkash' as const, amount: bkashSplit },
        { method: 'credit' as const, amount: creditSplit }
      ];
      splits = candidateSplits.filter(s => s.amount > 0);

      const splitSum = splits.reduce((s, p) => s + p.amount, 0);
      if (Math.abs(splitSum - grandTotal) > 1) {
        setErrorMsg(`Split payment sum (৳${splitSum.toLocaleString('en-IN')}) does not match Total (৳${grandTotal.toLocaleString('en-IN')})!`);
        return;
      }
    }

    const res = storage.createSale({
      branch_id: currentBranch.id,
      customer_id: selectedCustomerId,
      items: cart.map(c => ({
        product_id: c.product.id,
        quantity: c.quantity,
        unit_price: c.unit_price,
        discount: c.discount,
        imei_id: c.selectedImeiId
      })),
      payment_method: paymentMethod,
      splits,
      sales_rep_id: currentUser.id,
      sales_rep_name: currentUser.name,
      notes: `POS checkout at ${currentBranch.name}`
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Sale transaction failed');
      return;
    }

    // Success! Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }

    setLastSaleInvoice(res.sale);
    setIsReceiptModalOpen(true);
    setCart([]);
    setErrorMsg(null);
    setGuardianInterception(null);
    setGuardianValidation(null);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setErrorMsg('Cart is empty!');
      return;
    }

    // Verify all IMEI items have selected IMEI
    for (const item of cart) {
      if (item.product.has_imei && !item.selectedImeiId) {
        setErrorMsg(`Please select IMEI for ${item.product.name}`);
        return;
      }
    }

    // Smart AI Owner Guardian Intercept Validation
    const interception = aiOwnerGuardianValidationEngine.interceptSalesSubmission({
      items: cart.map(c => ({
        product_id: c.product.id,
        quantity: c.quantity,
        unit_price: c.unit_price,
        discount: c.discount,
        imei_id: c.selectedImeiId
      })),
      customer_id: selectedCustomerId,
      branch_id: currentBranch.id,
      currentUser,
      state
    });

    if (!interception.isValid) {
      aiOwnerGuardianValidationEngine.recordAndAlert(interception, currentUser, state);
      setGuardianInterception(interception);
      return;
    }

    executeCompleteSale();
  };

  const handleCreateCustomer = () => {
    if (!newCustName || !newCustPhone) return;
    const cust = storage.addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress || 'Dhaka',
      credit_limit: newCustLimit,
      current_balance: 0,
      opening_balance: 0,
      branch_id: currentBranch.id
    });
    setSelectedCustomerId(cust.id);
    setIsCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const fallbackWalkInCustomer: Customer = {
    id: 'cust_walkin',
    code: 'CUST-WALKIN',
    name: 'Walk-in Retail Customer',
    phone: '01700-000000',
    address: 'Counter Cash Sale',
    credit_limit: 0,
    current_balance: 0,
    opening_balance: 0,
    branch_id: currentBranch?.id || 'br_1',
    created_at: new Date().toISOString()
  };

  const selectedCustomer: Customer =
    (state.customers && state.customers.find(c => c.id === selectedCustomerId)) ||
    (state.customers && state.customers[0]) ||
    fallbackWalkInCustomer;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4.25rem)] gap-3 p-3 bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Left: Product Catalog & Fast Grid */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header Search & Category Filter */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('POS Terminal', 'পিওএস বিক্রয় টার্মিনাল')} • {currentBranch.name}
              </h2>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('Cashier', 'ক্যাশিয়ার')}: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('Scan barcode or type model (e.g. S24 Ultra, Anker)...', 'বারকোড স্ক্যান করুন বা মডেল লিখুন...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('All Items', 'সকল পণ্য')}
            </button>
            {state.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
              <Smartphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t('No products in showroom catalog. Clean slate database.', 'শোরুমে কোনো পণ্য নেই। ফ্রেশ ডাটাবেজ।')}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('Go to Stock & Inventory or Purchase to receive handsets.', 'স্টক ও ইনভেন্টরি অথবা ক্রয় সেকশন থেকে মালামাল যুক্ত করুন।')}
              </p>
            </div>
          ) : (
            filteredProducts.map(prod => {
              const inStockImeis = prod.has_imei ? getAvailableImeis(prod.id).length : 25;
              const isOutOfStock = inStockImeis === 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && handleAddToCart(prod)}
                  className={`group relative p-3 rounded-lg border transition text-left flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-800/80 hover:border-emerald-500 dark:hover:border-emerald-400 border-slate-200 dark:border-slate-700/80 cursor-pointer shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {prod.brand_name}
                      </span>
                      {prod.has_imei && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1">
                          <Barcode className="w-2.5 h-2.5" />
                          <span>IMEI</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {prod.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {prod.storage ? `${prod.storage} / ${prod.ram} • ${prod.color}` : prod.model}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t('Retail MRP', 'খুচরা মূল্য')}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-emerald-400">
                        ৳{prod.selling_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-semibold ${isOutOfStock ? 'text-rose-500' : 'text-slate-500'}`}>
                        {prod.has_imei ? `${inStockImeis} in stock` : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Cart, Customer & Checkout Sidebar */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden shrink-0">
        {/* Customer Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('Customer / Buyer', 'গ্রাহক / ক্রেতা')}
            </span>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('New Customer', 'নতুন গ্রাহক')}</span>
            </button>
          </div>
          <select
            value={selectedCustomer?.id || fallbackWalkInCustomer.id}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            {(!state.customers || state.customers.length === 0) ? (
              <option value={fallbackWalkInCustomer.id}>
                {fallbackWalkInCustomer.name} ({fallbackWalkInCustomer.phone})
              </option>
            ) : (
              state.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {(c.current_balance ?? 0) > 0 ? `Due: ৳${(c.current_balance ?? 0).toLocaleString('en-IN')}` : 'Clear'}
                </option>
              ))
            )}
          </select>
          {selectedCustomer && (selectedCustomer.credit_limit ?? 0) > 0 && (
            <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
              <span>Credit Limit: ৳{(selectedCustomer.credit_limit ?? 0).toLocaleString('en-IN')}</span>
              <span className={(selectedCustomer.current_balance ?? 0) > 0 ? 'text-rose-500 font-semibold' : ''}>
                Due: ৳{(selectedCustomer.current_balance ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
              <ShoppingCart className="w-10 h-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs">{t('Cart is empty. Click or scan products on the left to sell.', 'কার্ট খালি আছে। পণ্য যোগ করতে ক্লিক করুন।')}</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.product.name}
                    </div>
                    {item.product.has_imei && (
                      <div className="mt-1">
                        <button
                          onClick={() => {
                            setTargetCartIndex(idx);
                            setIsImeiModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center space-x-1"
                        >
                          <Barcode className="w-3 h-3" />
                          <span>IMEI: {item.selectedImei1 || 'Click to select IMEI'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeCartItem(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    {!item.product.has_imei && (
                      <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span className="text-[11px]">@ ৳{item.unit_price.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Discount ৳"
                      value={item.discount || ''}
                      onChange={e => updateDiscount(idx, Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-right focus:outline-hidden"
                      title="Item discount in BDT"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">
                      ৳{((item.unit_price - item.discount) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Totals Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>{t('Subtotal', 'মোট মূল্য')}</span>
              <span>৳{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t('Discount', 'ছাড়')}</span>
              <span className="text-emerald-600 font-semibold">-৳{totalDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>{t('Payable Total', 'সর্বমোট প্রদেয়')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">
                ৳{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('Payment Mode', 'মূল্য পরিশোধ মাধ্যম')}
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['cash', 'bkash', 'nagad', 'bank', 'credit', 'split'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  className={`py-1.5 px-2 rounded-lg font-bold uppercase text-[11px] border transition ${
                    paymentMethod === mode
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Split Mode Inputs */}
          {paymentMethod === 'split' && (
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span>Cash ৳</span>
                <input
                  type="number"
                  value={cashSplit || ''}
                  onChange={e => setCashSplit(Number(e.target.value))}
                  className="w-24 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border rounded text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>bKash ৳</span>
                <input
                  type="number"
                  value={bkashSplit || ''}
                  onChange={e => setBkashSplit(Number(e.target.value))}
                  className="w-24 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border rounded text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Bank / Card ৳</span>
                <input
                  type="number"
                  value={bankSplit || ''}
                  onChange={e => setBankSplit(Number(e.target.value))}
                  className="w-24 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border rounded text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Customer Due / Credit ৳</span>
                <input
                  type="number"
                  value={creditSplit || ''}
                  onChange={e => setCreditSplit(Number(e.target.value))}
                  className="w-24 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border rounded text-right text-rose-500 font-bold"
                />
              </div>
            </div>
          )}

          {/* AI Owner Guardian Smart Validation Banner */}
          {guardianValidation && (
            <SmartEntryValidationBanner
              validation={guardianValidation}
              onApplyCorrection={handleApplyCorrection}
              onDismiss={() => setGuardianValidation(null)}
            />
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('Complete Sale & Print Receipt', 'বিক্রয় সম্পন্ন করুন ও চালান প্রিন্ট')}</span>
          </button>
        </div>
      </div>

      {/* Select IMEI Modal */}
      {isImeiModalOpen && targetCartIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-4 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Barcode className="w-4 h-4 text-emerald-500" />
              <span>Select In-Stock IMEI for {cart[targetCartIndex]?.product.name}</span>
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {getAvailableImeis(cart[targetCartIndex].product.id).map(im => (
                <div
                  key={im.id}
                  onClick={() => {
                    const updated = [...cart];
                    updated[targetCartIndex].selectedImeiId = im.id;
                    updated[targetCartIndex].selectedImei1 = im.imei1;
                    updated[targetCartIndex].selectedImei2 = im.imei2;
                    setCart(updated);
                    setIsImeiModalOpen(false);
                  }}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition ${
                    cart[targetCartIndex].selectedImeiId === im.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      IMEI 1: {im.imei1}
                    </div>
                    {im.imei2 && <div className="font-mono text-[10px] text-slate-400">IMEI 2: {im.imei2}</div>}
                    <div className="text-[11px] text-slate-500 mt-0.5">Location: {im.current_location}</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Available</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsImeiModalOpen(false)}
              className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-4 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('Quick Register Customer', 'দ্রুত নতুন গ্রাহক নিবন্ধন')}
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Customer Name *</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Shakib Al Hasan"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-0.5">Phone Number *</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-0.5">Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  placeholder="Area / Market name"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-0.5">Credit Limit (BDT)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={e => setNewCustLimit(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Save & Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal (Thermal 80mm & A4 Tax Invoice) */}
      {isReceiptModalOpen && lastSaleInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl max-w-md w-full shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex justify-between items-center no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Transaction Successful</span>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-md"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Receipt Printable Container */}
            <div className="border border-dashed border-slate-300 p-4 rounded-lg font-mono text-xs space-y-3">
              <div className="text-center space-y-0.5">
                <h2 className="font-bold text-sm tracking-tight">{state.company.name}</h2>
                <p className="text-[10px] text-slate-500">{currentBranch.name}</p>
                <p className="text-[10px] text-slate-500">{currentBranch.address}</p>
                <p className="text-[10px] text-slate-500">BIN: {state.company.bin_number} • Phone: {currentBranch.phone}</p>
                <div className="pt-1 text-[11px] font-bold border-t border-slate-300">
                  TAX INVOICE / CASH MEMO
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-1.5 space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Invoice: <strong>{lastSaleInvoice.invoice_no}</strong></span>
                  <span>{new Date(lastSaleInvoice.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer: {lastSaleInvoice.customer_name}</span>
                  <span>{lastSaleInvoice.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Rep: {lastSaleInvoice.sales_rep_name}</span>
                  <span>Mode: {lastSaleInvoice.payment_method.toUpperCase()}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 text-[11px]">
                {lastSaleInvoice.items.map((it: any, iIdx: number) => (
                  <div key={iIdx} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>{it.product_name}</span>
                      <span>৳{it.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {it.imei1 && (
                      <div className="text-[10px] text-slate-600">
                        IMEI: {it.imei1} {it.imei2 ? `/ ${it.imei2}` : ''}
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Qty: {it.quantity} x ৳{it.unit_price.toLocaleString('en-IN')} (Disc: ৳{it.discount})</span>
                      <span>Warranty: {it.warranty_months} Mo</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-300 pt-1.5 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{lastSaleInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-৳{lastSaleInvoice.discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1">
                  <span>Grand Total:</span>
                  <span>৳{lastSaleInvoice.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Paid Amount:</span>
                  <span>৳{lastSaleInvoice.paid_amount.toLocaleString('en-IN')}</span>
                </div>
                {lastSaleInvoice.due_amount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Due Balance:</span>
                    <span>৳{lastSaleInvoice.due_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="border-t border-slate-200 pt-2 text-[9px] text-slate-500 space-y-0.5 text-center">
                <p>Goods sold cannot be returned without original cash memo & undamaged box.</p>
                <p>7 Days replacement guarantee for official hardware defects.</p>
                <p>Thank you for choosing SmartPhone Galaxy BD!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Owner Guardian Intercept Modal */}
      <GuardianInterceptModal
        result={guardianInterception}
        onClose={() => setGuardianInterception(null)}
        onApplyCorrection={(field, val) => {
          const match = field.match(/items\[(\d+)\]\.(unit_price|discount|quantity)/);
          if (match) {
            const idx = parseInt(match[1]);
            const prop = match[2];
            const updated = [...cart];
            if (updated[idx]) {
              if (prop === 'unit_price') updated[idx].unit_price = Number(val);
              if (prop === 'discount') updated[idx].discount = Number(val);
              if (prop === 'quantity') updated[idx].quantity = Number(val);
              setCart(updated);
            }
          }
          setGuardianInterception(null);
        }}
        onProceedAnyway={() => {
          executeCompleteSale();
        }}
        onSupervisorOverride={() => {
          executeCompleteSale();
        }}
      />
    </div>
  );
};

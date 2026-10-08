import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Product, StockTransfer } from '../../types';
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  SlidersHorizontal,
  Package,
  Search,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Headphones
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mobile' | 'accessories' | 'transfers'>('all');

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // New Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [prodBrand, setProdBrand] = useState('Samsung');
  const [prodCat, setProdCat] = useState('cat_1');
  const [prodCost, setProdCost] = useState(15000);
  const [prodPrice, setProdPrice] = useState(18000);
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodHasImei, setProdHasImei] = useState(true);

  // Transfer State
  const [trfFrom, setTrfFrom] = useState('br_4'); // default central warehouse
  const [trfTo, setTrfTo] = useState('br_1');
  const [trfProduct, setTrfProduct] = useState('prd_1');
  const [trfQty, setTrfQty] = useState(1);
  const [trfImeis, setTrfImeis] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);

  // Adjustment State
  const [adjBranch, setAdjBranch] = useState('br_1');
  const [adjProduct, setAdjProduct] = useState('prd_1');
  const [adjType, setAdjType] = useState<'damage' | 'warranty' | 'lost' | 'decrease' | 'increase'>('damage');
  const [adjReason, setAdjReason] = useState('');

  const filteredProducts = state.products.filter(p => {
    if (activeTab === 'mobile' && !p.has_imei) return false;
    if (activeTab === 'accessories' && p.has_imei) return false;
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.barcode.includes(q);
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;

    storage.addProduct({
      code: prodCode || 'PROD-' + Date.now().toString().slice(-4),
      name: prodName,
      brand_id: 'brd_1',
      brand_name: prodBrand,
      category_id: prodCat,
      category_name: state.categories.find(c => c.id === prodCat)?.name || 'General',
      has_imei: prodHasImei,
      model: prodName,
      barcode: prodBarcode || String(Date.now()).slice(-12),
      cost_price: Number(prodCost),
      selling_price: Number(prodPrice),
      mrp: Number(prodPrice) * 1.05,
      min_stock_level: 3,
      warranty_months: prodHasImei ? 12 : 6
    });

    setIsAddProductOpen(false);
    setProdName('');
    setProdCode('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    const imeiArr = trfImeis
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean);

    const res = storage.createStockTransfer({
      from_branch_id: trfFrom,
      to_branch_id: trfTo,
      product_id: trfProduct,
      quantity: Number(trfQty),
      imei_numbers: imeiArr.length > 0 ? imeiArr : undefined,
      user_name: currentUser.name
    });

    if (!res.success) {
      setTransferError(res.error || 'Transfer failed');
      return;
    }

    setIsTransferOpen(false);
    setTrfImeis('');
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    storage.createStockAdjustment({
      branch_id: adjBranch,
      product_id: adjProduct,
      adjustment_type: adjType,
      quantity: 1,
      reason: adjReason || 'General inventory physical variance adjustment',
      user_name: currentUser.name
    });

    setIsAdjustmentOpen(false);
    setAdjReason('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Inventory & Warehouse Stock Master', 'মজুদ পণ্য ও ওয়্যারহাউজ ইনভেন্টরি')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catalog: <strong>{state.products.length} Products</strong> • Total Valuation:{' '}
            <strong>৳{(state.imeis.filter(i => i.status === 'in_stock').reduce((s, i) => s + i.cost_price, 0) + 840000).toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>Branch Transfer</span>
          </button>
          <button
            onClick={() => setIsAdjustmentOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span>Stock Adjustment</span>
          </button>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="flex gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
            }`}
          >
            All Products ({state.products.length})
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${
              activeTab === 'mobile'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Phones</span>
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${
              activeTab === 'accessories'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Accessories & Audio</span>
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${
              activeTab === 'transfers'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfers History ({state.transfers.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search catalog by name or code..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Product Table or Transfers Table */}
      {activeTab === 'transfers' ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Stock Transfer Operations Between Branches
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3">Transfer #</th>
                <th className="p-3">Origin Branch</th>
                <th className="p-3">Destination Branch</th>
                <th className="p-3">Product Name</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3">IMEI List</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.transfers.map(tr => (
                <tr key={tr.id}>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{tr.transfer_no}</td>
                  <td className="p-3 font-semibold">{tr.from_branch_name}</td>
                  <td className="p-3 font-semibold text-emerald-600">{tr.to_branch_name}</td>
                  <td className="p-3">{tr.product_name}</td>
                  <td className="p-3 text-right font-mono font-bold">{tr.quantity}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-500">
                    {tr.imei_numbers?.join(', ') || 'N/A (Accessories)'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {tr.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(tr.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Code & Barcode</th>
                <th className="p-3">Product & Model</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3 text-right">Cost (BDT)</th>
                <th className="p-3 text-right">Selling (BDT)</th>
                <th className="p-3 text-right">Gross Margin</th>
                <th className="p-3 text-center">Available Stock</th>
                <th className="p-3 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map(p => {
                const inStockCount = p.has_imei
                  ? state.imeis.filter(i => i.product_id === p.id && i.status === 'in_stock').length
                  : 25;
                const margin = p.selling_price > 0 ? (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(1) : '0';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{p.code}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.barcode}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.model}</div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.category_name}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{p.brand_name}</td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      ৳{p.cost_price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ৳{p.selling_price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">
                      {margin}%
                    </td>
                    <td className="p-3 text-center font-bold font-mono">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        inStockCount <= p.min_stock_level
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {inStockCount} units
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.has_imei ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.has_imei ? 'IMEI Handset' : 'Accessory'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Add New Product to Master Catalog
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="e.g. Samsung Galaxy A55 5G"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Brand</label>
                  <select
                    value={prodBrand}
                    onChange={e => setProdBrand(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Category</label>
                  <select
                    value={prodCat}
                    onChange={e => setProdCat(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Cost Price (BDT)</label>
                  <input
                    type="number"
                    value={prodCost}
                    onChange={e => setProdCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Retail Selling Price (BDT)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={prodHasImei}
                    onChange={e => setProdHasImei(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Device requires individual IMEI Tracking</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Stock Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
              <span>Inter-Branch Stock Dispatch & Transfer</span>
            </h3>

            {transferError && (
              <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {transferError}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">From Branch/Depot</label>
                  <select
                    value={trfFrom}
                    onChange={e => setTrfFrom(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">To Destination</label>
                  <select
                    value={trfTo}
                    onChange={e => setTrfTo(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.branches.filter(b => b.id !== trfFrom).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Select Product Model</label>
                <select
                  value={trfProduct}
                  onChange={e => setTrfProduct(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Quantity to Dispatch</label>
                <input
                  type="number"
                  min={1}
                  value={trfQty}
                  onChange={e => setTrfQty(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">IMEI Numbers (If Handset, 1 per line or comma)</label>
                <textarea
                  rows={2}
                  value={trfImeis}
                  onChange={e => setTrfImeis(e.target.value)}
                  placeholder="358249110294821..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Stock Adjustment / Write-Off Voucher</span>
            </h3>

            <form onSubmit={handleExecuteAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Branch</label>
                <select
                  value={adjBranch}
                  onChange={e => setAdjBranch(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  <option value="damage">Damaged Screen / Hardware Defect</option>
                  <option value="warranty">Sent to Supplier Warranty</option>
                  <option value="lost">Lost / Physical Count Shortage</option>
                  <option value="increase">Physical Count Surplus</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Product</label>
                <select
                  value={adjProduct}
                  onChange={e => setAdjProduct(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                >
                  {state.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Reason & Inspection Notes</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  placeholder="e.g. Broken packaging / supplier DOA claim"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white font-bold rounded"
                >
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

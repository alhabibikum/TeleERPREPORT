import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Barcode, Receipt, Users, Building, Smartphone, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { state, isSearchOpen, setIsSearchOpen, t } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { imeis: [], sales: [], customers: [], suppliers: [], products: [] };

    const imeis = state.imeis
      .filter(i => i.imei1.toLowerCase().includes(q) || (i.imei2 && i.imei2.toLowerCase().includes(q)) || i.model.toLowerCase().includes(q))
      .slice(0, 5);

    const sales = state.sales
      .filter(s => s.invoice_no.toLowerCase().includes(q) || s.customer_name.toLowerCase().includes(q) || s.customer_phone.includes(q))
      .slice(0, 5);

    const customers = state.customers
      .filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 5);

    const suppliers = state.suppliers
      .filter(s => s.name.toLowerCase().includes(q) || s.contact_person.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      .slice(0, 5);

    const products = state.products
      .filter(p => p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.barcode.includes(q))
      .slice(0, 5);

    return { imeis, sales, customers, suppliers, products };
  }, [query, state]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('Search by IMEI 1/2, Invoice #, Customer Phone, Product Model...', 'আইএমইআই, ইনভয়েস নম্বর, গ্রাহকের ফোন, মডেল দিয়ে খুঁজুন...')}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              {t('Type at least 2 characters to search across IMEIs, sales invoices, customers, and inventory.', 'আইএমইআই, ইনভয়েস, গ্রাহক বা স্টক অনুসন্ধানের জন্য টাইপ করুন।')}
            </div>
          ) : (
            <>
              {/* IMEI Results */}
              {searchResults.imeis.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Barcode className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t('Matching IMEI Devices', 'মিলে যাওয়া আইএমইআই ডিভাইস')} ({searchResults.imeis.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.imeis.map(im => (
                      <div
                        key={im.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{im.product_name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              im.status === 'in_stock'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : im.status === 'sold'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {im.status}
                            </span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                            IMEI 1: <strong className="text-indigo-600 dark:text-indigo-400">{im.imei1}</strong> • Branch: {im.branch_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-slate-200">
                            ৳{im.selling_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {searchResults.sales.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('Sales Invoices', 'বিক্রয় চালান')} ({searchResults.sales.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.sales.map(s => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {s.invoice_no} • {s.customer_name} ({s.customer_phone})
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {s.branch_name} • Paid: ৳{s.paid_amount.toLocaleString('en-IN')} • Due: ৳{s.due_amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{s.total_amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {searchResults.customers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t('Customers', 'গ্রাহক')} ({searchResults.customers.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.customers.map(c => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {c.name} ({c.code})
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Phone: {c.phone} • Limit: ৳{c.credit_limit.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">{t('Current Due', 'বর্তমান বকেয়া')}</span>
                          <span className={`font-bold ${c.current_balance > 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                            ৳{c.current_balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {searchResults.products.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                    <span>{t('Products & Models', 'পণ্য ও মডেল')} ({searchResults.products.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.products.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Model: {p.model} • Brand: {p.brand_name} • Barcode: {p.barcode}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white">
                            ৳{p.selling_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex justify-between items-center px-4">
          <span>Press ESC or click close to dismiss</span>
          <span>TelecomERP Real-Time Index</span>
        </div>
      </div>
    </div>
  );
};

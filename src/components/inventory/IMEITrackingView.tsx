import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { IMEIDevice, IMEIStatus } from '../../types';
import {
  Barcode,
  Search,
  Filter,
  History,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ScanLine,
  Smartphone,
  Eye,
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export const IMEITrackingView: React.FC = () => {
  const { state, activeBranchId, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedImeiForHistory, setSelectedImeiForHistory] = useState<IMEIDevice | null>(null);

  // IMEI Physical Audit state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditScannedInput, setAuditScannedInput] = useState('');
  const [auditScannedList, setAuditScannedList] = useState<string[]>([]);

  // Filtered IMEIs
  const filteredImeis = useMemo(() => {
    return state.imeis.filter(im => {
      const matchBranch = activeBranchId === 'all' || im.branch_id === activeBranchId;
      const matchStatus = statusFilter === 'all' || im.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        im.imei1.toLowerCase().includes(q) ||
        (im.imei2 && im.imei2.toLowerCase().includes(q)) ||
        im.product_name.toLowerCase().includes(q) ||
        im.model.toLowerCase().includes(q) ||
        im.brand_name.toLowerCase().includes(q) ||
        (im.sale_invoice_id && im.sale_invoice_id.toLowerCase().includes(q)) ||
        (im.customer_name && im.customer_name.toLowerCase().includes(q));

      return matchBranch && matchStatus && matchQuery;
    });
  }, [state.imeis, activeBranchId, statusFilter, searchQuery]);

  // Movements for selected device
  const deviceMovements = useMemo(() => {
    if (!selectedImeiForHistory) return [];
    return state.imei_movements.filter(m => m.imei1 === selectedImeiForHistory.imei1);
  }, [selectedImeiForHistory, state.imei_movements]);

  // Audit calculations
  const expectedImeisInBranch = useMemo(() => {
    const branchId = activeBranchId === 'all' ? 'br_1' : activeBranchId;
    return state.imeis.filter(i => i.branch_id === branchId && i.status === 'in_stock');
  }, [state.imeis, activeBranchId]);

  const auditMatched = auditScannedList.filter(scan =>
    expectedImeisInBranch.some(e => e.imei1 === scan || e.imei2 === scan)
  );
  const auditMissing = expectedImeisInBranch.filter(
    e => !auditScannedList.includes(e.imei1) && (!e.imei2 || !auditScannedList.includes(e.imei2))
  );
  const auditUnexpected = auditScannedList.filter(
    scan => !expectedImeisInBranch.some(e => e.imei1 === scan || e.imei2 === scan)
  );

  const handleAuditScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = auditScannedInput.trim();
    if (!clean) return;
    if (!auditScannedList.includes(clean)) {
      setAuditScannedList([...auditScannedList, clean]);
    }
    setAuditScannedInput('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Barcode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('IMEI Lifecycle & Device Tracking Engine', 'আইএমইআই ট্র্যাকিং ও অডিট ইঞ্জিন')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Tracked: <strong>{state.imeis.length} Handsets</strong> • In-Stock:{' '}
            <strong>{state.imeis.filter(i => i.status === 'in_stock').length}</strong> • Sold:{' '}
            <strong>{state.imeis.filter(i => i.status === 'sold').length}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Launch Physical IMEI Audit</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search IMEI 1/2, invoice, model, brand..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
          >
            <option value="all">All IMEI Statuses</option>
            <option value="in_stock">In Stock (Available)</option>
            <option value="sold">Sold to Customer</option>
            <option value="warranty">Warranty Inspection</option>
            <option value="returned">Customer Returned</option>
            <option value="damaged">Damaged / Defect</option>
            <option value="missing">Flagged Missing</option>
          </select>
        </div>
      </div>

      {/* Main IMEI Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Device & Model</th>
                <th className="p-3">IMEI 1 & 2</th>
                <th className="p-3">Current Branch & Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Cost Price</th>
                <th className="p-3 text-right">Selling Price</th>
                <th className="p-3">Customer / Invoice</th>
                <th className="p-3 text-center">Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredImeis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No IMEI devices matched your query.
                  </td>
                </tr>
              ) : (
                filteredImeis.map(im => (
                  <tr key={im.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{im.product_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {im.storage || ''} {im.ram ? `/ ${im.ram}` : ''} • Color: {im.color} • Serial: {im.serial_number || 'N/A'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {im.imei1}
                      </div>
                      {im.imei2 && (
                        <div className="font-mono text-[10px] text-slate-400">
                          IMEI 2: {im.imei2}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {im.branch_name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Location: {im.current_location}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        im.status === 'in_stock'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : im.status === 'sold'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : im.status === 'warranty'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {im.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-500">
                      ৳{im.cost_price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ৳{im.selling_price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      {im.status === 'sold' ? (
                        <div>
                          <strong className="text-slate-900 dark:text-white block">{im.customer_name}</strong>
                          <span className="text-[10px] text-slate-400">Inv: {im.sale_invoice_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedImeiForHistory(im)}
                        className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                        title="View IMEI Journey History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Modal */}
      {selectedImeiForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Device Lifecycle & Movement Audit Trail
                </h3>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  IMEI: {selectedImeiForHistory.imei1} ({selectedImeiForHistory.product_name})
                </p>
              </div>
              <button
                onClick={() => setSelectedImeiForHistory(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {deviceMovements.length === 0 ? (
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                  Initial Goods Receipt from Supplier ({selectedImeiForHistory.supplier_name})
                </div>
              ) : (
                deviceMovements.map((mov, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                        {mov.reference_type}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(mov.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">
                      {mov.notes}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Operator: {mov.created_by_name} • Ref: {mov.reference_id}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedImeiForHistory(null)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physical IMEI Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ScanLine className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Physical Store IMEI Audit Mode
                </h3>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAuditScanSubmit} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={auditScannedInput}
                onChange={e => setAuditScannedInput(e.target.value)}
                placeholder="Scan or type 15-digit IMEI barcode..."
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                Scan Enter
              </button>
            </form>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Matched in Store</span>
                <strong className="text-base text-emerald-700 font-black">{auditMatched.length}</strong>
              </div>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Missing from Shelf</span>
                <strong className="text-base text-rose-700 font-black">{auditMissing.length}</strong>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Unexpected Scan</span>
                <strong className="text-base text-amber-700 font-black">{auditUnexpected.length}</strong>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Scanned IMEIs Batch:</h4>
              {auditScannedList.map((sc, i) => (
                <div key={i} className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] flex justify-between">
                  <span>{sc}</span>
                  <span className="text-emerald-600 font-bold">Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

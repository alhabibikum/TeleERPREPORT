import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IMEIDevice } from '../../types';
import {
  Barcode,
  Printer,
  Search,
  CheckCircle,
  Smartphone,
  Layers,
  Filter
} from 'lucide-react';

export const BarcodeLabelPrintView: React.FC = () => {
  const { state, activeBranchId, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImeis, setSelectedImeis] = useState<string[]>(['imei_101', 'imei_102']);
  const [labelSize, setLabelSize] = useState<'50x25' | '38x25'>('50x25');

  const inStockImeis = state.imeis.filter(i => {
    if (activeBranchId !== 'all' && i.branch_id !== activeBranchId) return false;
    if (i.status !== 'in_stock') return false;
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      i.imei1.includes(q) ||
      i.product_name.toLowerCase().includes(q) ||
      i.model.toLowerCase().includes(q) ||
      i.brand_name.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    if (selectedImeis.includes(id)) {
      setSelectedImeis(selectedImeis.filter(x => x !== id));
    } else {
      setSelectedImeis([...selectedImeis, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedImeis.length === inStockImeis.length) {
      setSelectedImeis([]);
    } else {
      setSelectedImeis(inStockImeis.map(i => i.id));
    }
  };

  const labelsToPrint = state.imeis.filter(i => selectedImeis.includes(i.id));

  // Generates SVG barcode lines based on IMEI digits
  const renderSvgBarcode = (code: string) => {
    return (
      <svg className="w-full h-8" viewBox="0 0 160 30" preserveAspectRatio="none">
        {code.split('').map((char, idx) => {
          const width = (char.charCodeAt(0) % 3) + 1;
          const x = idx * 10;
          return (
            <rect
              key={idx}
              x={x}
              y="0"
              width={width}
              height="30"
              fill="black"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Barcode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Thermal Barcode & IMEI Label Sticker Printer', 'থার্মাল বারকোড ও আইএমইআই স্টিকার প্রিন্টার')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compatible with Xprinter / TSC / Zebra 50x25mm Label Rolls • Code-128 Barcode Simulation
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <select
            value={labelSize}
            onChange={e => setLabelSize(e.target.value as any)}
            className="text-xs p-1.5 bg-white dark:bg-slate-800 border rounded-lg font-semibold"
          >
            <option value="50x25">50mm x 25mm (Standard Phone Box)</option>
            <option value="38x25">38mm x 25mm (Compact Accessory Pack)</option>
          </select>
          <button
            onClick={() => window.print()}
            disabled={labelsToPrint.length === 0}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print {labelsToPrint.length} Selected Labels</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Device Selection List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3 no-print">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
              Select Handsets in Stock ({inStockImeis.length})
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              {selectedImeis.length === inStockImeis.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by IMEI or model..."
              className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded text-xs"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1.5 text-xs">
            {inStockImeis.map(im => {
              const isSelected = selectedImeis.includes(im.id);
              return (
                <div
                  key={im.id}
                  onClick={() => toggleSelect(im.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 truncate">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{im.product_name}</div>
                    <div className="font-mono text-[10px] text-slate-400">IMEI: {im.imei1}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">৳{im.selling_price.toLocaleString('en-IN')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Printable Label Stickers Grid */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex justify-between items-center no-print">
            <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
              Live Sticker Label Preview Sheet ({labelsToPrint.length} Labels)
            </h3>
            <span className="text-xs text-slate-400">Paper Size: 50mm x 25mm Thermal Roll</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 print:grid-cols-2">
            {labelsToPrint.map(dev => (
              <div
                key={dev.id}
                className="bg-white text-slate-950 p-2.5 rounded border border-slate-300 shadow-2xs font-mono text-[10px] space-y-1 print:border-black print:shadow-none print-break-inside-avoid"
              >
                <div className="text-center font-bold border-b border-dashed border-slate-300 pb-0.5 tracking-tight">
                  <div className="text-[11px] font-black">{state.company.name}</div>
                  <div className="text-[8px] text-slate-600">BIN: {state.company.bin_number} • BD</div>
                </div>

                <div className="font-bold text-xs leading-tight line-clamp-1">
                  {dev.product_name}
                </div>
                <div className="text-[9px] text-slate-600">
                  {dev.storage || ''} {dev.ram ? `/ ${dev.ram}` : ''} • Color: {dev.color}
                </div>

                {/* SVG Barcode representation */}
                <div className="pt-0.5 pb-0.5">
                  {renderSvgBarcode(dev.imei1)}
                </div>

                <div className="text-center font-mono font-bold text-[10px] tracking-wider">
                  IMEI 1: {dev.imei1}
                </div>
                {dev.imei2 && (
                  <div className="text-center font-mono text-[8px] text-slate-600">
                    IMEI 2: {dev.imei2}
                  </div>
                )}

                <div className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-0.5 text-[10px]">
                  <span>MRP: ৳{dev.selling_price.toLocaleString('en-IN')}</span>
                  <span>WAR: 12M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

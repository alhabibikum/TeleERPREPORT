import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import {
  DatabaseBackup,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  Layers
} from 'lucide-react';

interface DatabaseControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseControlModal: React.FC<DatabaseControlModalProps> = ({ isOpen, onClose }) => {
  const { state, refreshState, t } = useApp();

  const [activeTab, setActiveTab] = useState<'reset' | 'demo' | 'backup' | 'restore'>('reset');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmCleanText, setConfirmCleanText] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const counts = storage.getRecordCounts();
  const totalRecords =
    counts.products +
    counts.imeis +
    counts.sales +
    counts.purchases +
    counts.customers +
    counts.suppliers +
    counts.journals +
    counts.expenses;

  // Execute Full Clean Slate (0 Records)
  const handleFullCleanReset = () => {
    storage.resetToFreshBlank();
    refreshState();
    setSuccessMsg(
      t(
        'Database has been 100% completely blanked! All pages, products, invoices, and ledgers now have 0 records for a fresh real-life business start.',
        'ডাটাবেজ শতভাগ সম্পূর্ণ ফাঁকা ও ক্লিন করা হয়েছে! সকল পেইজ, প্রোডাক্ট ও হিসাব এখন শূন্য (0) রেকর্ড।'
      )
    );
    setErrorMsg(null);
    setConfirmCleanText('');
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  // Execute Demo Restore
  const handleRestoreDemo = () => {
    storage.resetToDemo();
    refreshState();
    setSuccessMsg(
      t(
        'Database restored with authentic Bangladeshi telecom retail demo dataset (120+ phones, IMEIs, sales, customer ledgers, and accounts).',
        'পূর্ণাঙ্গ বাংলাদেশি টেলিকম শোরুম ডেমো ডাটাবেজ সফলভাবে রিস্টোর করা হয়েছে।'
      )
    );
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  // Download JSON Backup
  const handleDownloadBackup = () => {
    const jsonStr = storage.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `telecom-erp-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessMsg(t('JSON Backup downloaded successfully!', 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!'));
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Copy JSON to Clipboard
  const handleCopyBackup = () => {
    const jsonStr = storage.exportBackup();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // File Upload Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = storage.importBackup(content);
      if (res.success) {
        refreshState();
        setSuccessMsg(
          t(
            'Backup restored successfully from file! All tables updated.',
            'ফাইল থেকে ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!'
          )
        );
        setErrorMsg(null);
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(res.message);
      }
    };
    reader.readAsText(file);
  };

  // Textarea Import
  const handleTextareaRestore = () => {
    if (!importJsonText.trim()) return;
    const res = storage.importBackup(importJsonText);
    if (res.success) {
      refreshState();
      setSuccessMsg(t('Backup restored successfully from text!', 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!'));
      setErrorMsg(null);
      setImportJsonText('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DatabaseBackup className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t('Database Safety, Backup & Clean Reset', 'ডাটাবেজ ব্যাকআপ, রিস্টোর ও ক্লিন রিসেট কন্ট্রোল')}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t(
                  '360° Management: 1-Click Clean Slate (0 records), Demo Dataset, or JSON Backup/Restore',
                  '৩৬০° ডাটাবেজ নিয়ন্ত্রণ: ১০০% ফাঁকা ক্লিন রিসেট, ডেমো ডাটাবেজ বা ফাইল ব্যাকআপ/রিস্টোর'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Database Stats Bar */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Products', 'পণ্য')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.products}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('IMEIs', 'আইএমইআই')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.imeis}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Sales', 'বিক্রয়')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.sales}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Purchases', 'ক্রয়')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.purchases}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Customers', 'গ্রাহক')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.customers}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Suppliers', 'সাপ্লায়ার')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.suppliers}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Expenses', 'খরচ')}</span>
            <strong className="text-slate-900 dark:text-white font-mono">{counts.expenses}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('Total', 'মোট রেকর্ড')}</span>
            <strong
              className={`font-mono ${totalRecords === 0 ? 'text-emerald-500' : 'text-blue-600 dark:text-blue-400'}`}
            >
              {totalRecords === 0 ? '0 (Clean)' : totalRecords}
            </strong>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="m-4 mb-0 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start space-x-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Action Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('reset')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'reset'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('1. Full Clean Reset (0 Records)', '১. সম্পূর্ণ ফাঁকা ক্লিন রিসেট (০ রেকর্ড)')}</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'demo'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('2. Restore BD Demo Data', '২. বাংলাদেশি ডেমো ডাটা রিস্টোর')}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('3. Download Backup', '৩. ব্যাকআপ ডাউনলোড')}</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'restore'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('4. Restore from File', '৪. ফাইল থেকে রিস্টোর')}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: FULL CLEAN RESET */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{t('100% Complete Blank Clean Slate Guarantee', 'শতভাগ সম্পূর্ণ ব্ল্যাংক ও ফাঁকা ক্লিন স্লেট নিশ্চয়তা')}</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  {t(
                    'This operation wipes all products, IMEIs, sales invoices, purchases, customer ledgers, supplier payables, expense vouchers, journals, and reports. Every single list and table across all pages will become completely empty (0 records) so you can register your actual showroom stock and start live business.',
                    'এই বাটন চাপলে সফটওয়্যারের সকল পেইজের সকল ডাটা মুছে ১০০% ফাঁকা (০ রেকর্ড) হয়ে যাবে। কোনো ডেমো হ্যান্ডসেট, সেলস ইনভয়েস, কাস্টমার বাকি বা টেস্ট রেকর্ড থাকবে না। আপনি একেবারে ফ্রেশ ও পরিষ্কারভাবে আপনার আসল ব্যবসার ডাটা এন্ট্রি করতে পারবেন।'
                  )}
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {t('Confirm Clean Wipe Action:', 'সম্পূর্ণ রিসেট নিশ্চিতকরণ:')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t(
                    'To protect against accidental clicking, type "RESET" or click the red execute button below.',
                    'ভুলবশত ক্লিক রোধে নিচে "RESET" টাইপ করুন অথবা সরাসরি লাল বাটন চাপুন।'
                  )}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={confirmCleanText}
                    onChange={e => setConfirmCleanText(e.target.value.toUpperCase())}
                    placeholder='Type "RESET" to confirm'
                    className="p-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg text-xs font-mono font-bold text-rose-700 dark:text-rose-300 w-full sm:w-56 focus:outline-hidden uppercase"
                  />
                  <button
                    onClick={handleFullCleanReset}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('Wipe Entire Database to 0 Records', 'পুরো সফটওয়্যার ১০০% ফাঁকা ও ক্লিন করুন')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE DEMO DATA */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>{t('Authentic Bangladeshi Telecom Demo Dataset', 'বাস্তবধর্মী বাংলাদেশি মোবাইল শোরুম ডেমো ডাটা')}</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  {t(
                    'Instantly populates 3 branches (Motijheel, Chittagong, Sylhet), 120+ smartphones with real 15-digit IMEIs (Galaxy S24 Ultra, iPhone 16 Pro, Redmi Note 13), customer ledger due balances, supplier payables, balanced double-entry accounting journals, and EMI installment agreements.',
                    '৩টি শোরুম শাখা, ১২০টি স্মার্টফোন ও ১৫ ডিজিটের আসল আইএমইআই, বিক্রয় চালান, কাস্টমার বাকি লেজার, সরবরাহকারী দেনা এবং জাবেদা সহ পূর্ণাঙ্গ বাংলাদেশি ডেমো ডাটা লোড হবে।'
                  )}
                </p>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('Ready to populate demo dataset?', 'ডেমো ডাটাবেজ রিস্টোর করতে প্রস্তুত?')}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t('Useful for testing features, reports, barcode label printing, and POS flows.', 'টেস্টিং ও ফিচার প্রদর্শনের জন্য আদর্শ।')}
                  </p>
                </div>
                <button
                  onClick={handleRestoreDemo}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('Load Bangladeshi Demo Data', 'ডেমো ডাটাবেজ লোড করুন')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('1-Click Full JSON Snapshot Backup', '১-ক্লিক পূর্ণাঙ্গ ডাটাবেজ ব্যাকআপ')}</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  {t(
                    'Exports everything in your system (products, IMEIs, invoices, customer ledgers, settings) into a single portable JSON file. You can save it to your computer, Google Drive, or pendrive for 100% data security.',
                    'আপনার সমস্ত পণ্য, আইএমইআই, বিক্রয় চালান, বাকি খাতা ও সেটিংস একটি সুরক্ষিত JSON ফাইলে রূপান্তর করে ডাউনলোড করুন।'
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleDownloadBackup}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Download .json Backup File Now', 'ব্যাকআপ ফাইল (.json) ডাউনলোড করুন')}</span>
                </button>

                <button
                  onClick={handleCopyBackup}
                  className="py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('Copied!', 'কপি হয়েছে!') : t('Copy JSON Text', 'কপি করুন')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RESTORE FROM FILE */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>{t('Restore Database from External Backup', 'পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর করুন')}</span>
                </div>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  {t(
                    'Select a previously exported .json backup file to seamlessly restore your entire database. An automatic safety snapshot will be created prior to restoring.',
                    'পূর্বে ডাউনলোড করা .json ব্যাকআপ ফাইলটি নির্বাচন করুন। কোনো ডাটা হারানোর ঝুঁকি এড়াতে রিস্টোরের আগে স্বয়ংক্রিয় সেফটি স্ন্যাপশট সংরক্ষিত থাকবে।'
                  )}
                </p>
              </div>

              {/* File input */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center space-y-2 hover:border-indigo-500 transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-800/20">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 mx-auto text-indigo-500" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('Click here to choose a backup .json file', 'ব্যাকআপ .json ফাইল নির্বাচন করতে এখানে ক্লিক করুন')}
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports JSON backups from TelecomERP Pro
                </p>
              </div>

              {/* Paste JSON manually */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('Or paste backup JSON code manually:', 'অথবা সরাসরি JSON কোড পেস্ট করুন:')}
                </label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={e => setImportJsonText(e.target.value)}
                  placeholder='Paste {"meta": ..., "data": ...} here'
                  className="w-full p-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-hidden"
                />
                <button
                  disabled={!importJsonText.trim()}
                  onClick={handleTextareaRestore}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('Restore Pasted JSON', 'পেস্টকৃত ডাটা রিস্টোর করুন')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('Local storage persistence active • Auto-synced across tabs', 'লোকাল স্টোরেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত')}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-lg font-semibold"
          >
            {t('Close', 'বন্ধ করুন')}
          </button>
        </div>
      </div>
    </div>
  );
};

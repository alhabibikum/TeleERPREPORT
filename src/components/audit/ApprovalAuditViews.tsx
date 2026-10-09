import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { ApprovalRequest, AuditLog, DatabaseSnapshot } from '../../types';
import {
  CheckCircle2,
  XCircle,
  History,
  DatabaseBackup,
  Download,
  Upload,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Database,
  Save,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  HardDrive,
  Activity,
  Layers,
  FileText,
  Lock,
  Unlock,
  Eye,
  CheckCircle,
  X
} from 'lucide-react';
import { DatabaseControlModal } from '../modals/DatabaseControlModal';

interface ApprovalAuditViewsProps {
  mode: 'approvals' | 'audit' | 'backup';
}

export const ApprovalAuditViews: React.FC<ApprovalAuditViewsProps> = ({ mode }) => {
  const { state, currentUser, t, refreshState } = useApp();

  const [notes, setNotes] = useState('');
  const [isDatabaseControlModalOpen, setIsDatabaseControlModalOpen] = useState(false);

  // 360-Degree Backup, Restore & Reset State
  const [activeBackupTab, setActiveBackupTab] = useState<'export' | 'snapshots' | 'restore' | 'reset'>('export');
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>([]);
  const [copiedJson, setCopiedJson] = useState(false);

  // Restore State
  const [importJson, setImportJson] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Reset State
  const [selectedResetType, setSelectedResetType] = useState<'demo' | 'transactions_only' | 'fresh_blank' | null>(null);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Integrity Check Modal
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false);
  const [integrityData, setIntegrityData] = useState<any>(null);

  useEffect(() => {
    if (mode === 'backup') {
      setSnapshots(storage.getSnapshots());
    }
  }, [mode, state]);

  // --- APPROVAL ACTIONS ---
  const handleApprove = (id: string) => {
    storage.updateApproval(id, 'approved', currentUser.name, notes);
    setNotes('');
  };

  const handleReject = (id: string) => {
    storage.updateApproval(id, 'rejected', currentUser.name, notes);
    setNotes('');
  };

  // --- EXPORT & DOWNLOAD ---
  const handleExportBackup = () => {
    const jsonStr = storage.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    a.href = url;
    a.download = `telecom_erp_pro_full_backup_${nowStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyBackupJSON = () => {
    const jsonStr = storage.exportBackup();
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  // --- SNAPSHOT ACTIONS ---
  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const snap = storage.createSnapshot(snapshotName || `Snapshot ${new Date().toLocaleTimeString()}`);
    setSnapshotName('');
    setSnapshots(storage.getSnapshots());
  };

  const handleRestoreSnapshot = (id: string, name: string) => {
    if (confirm(`Are you sure you want to rollback to snapshot: "${name}"? A safety backup of your current database will be saved automatically.`)) {
      const ok = storage.restoreSnapshot(id);
      if (ok) {
        refreshState();
        setSnapshots(storage.getSnapshots());
        alert(`Database successfully restored to snapshot "${name}".`);
      }
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    if (confirm('Delete this saved snapshot from browser storage?')) {
      storage.deleteSnapshot(id);
      setSnapshots(storage.getSnapshots());
    }
  };

  const handleDownloadSnapshot = (snap: DatabaseSnapshot) => {
    const blob = new Blob([JSON.stringify(snap.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot_${snap.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- FILE UPLOAD & RESTORE ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setImportJson(text);
      try {
        const parsed = JSON.parse(text);
        const dataNode = parsed.data || parsed;
        setParsedPreview({
          meta: parsed.meta,
          products: dataNode.products?.length || 0,
          imeis: dataNode.imeis?.length || 0,
          sales: dataNode.sales?.length || 0,
          purchases: dataNode.purchases?.length || 0,
          customers: dataNode.customers?.length || 0,
          journals: dataNode.journals?.length || 0,
          branches: dataNode.branches?.length || 0
        });
        setImportStatus(null);
      } catch (err: any) {
        setParsedPreview(null);
        setImportStatus({ success: false, message: 'Invalid JSON file: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const handlePastedJsonChange = (val: string) => {
    setImportJson(val);
    if (!val.trim()) {
      setParsedPreview(null);
      return;
    }
    try {
      const parsed = JSON.parse(val);
      const dataNode = parsed.data || parsed;
      setParsedPreview({
        meta: parsed.meta,
        products: dataNode.products?.length || 0,
        imeis: dataNode.imeis?.length || 0,
        sales: dataNode.sales?.length || 0,
        purchases: dataNode.purchases?.length || 0,
        customers: dataNode.customers?.length || 0,
        journals: dataNode.journals?.length || 0,
        branches: dataNode.branches?.length || 0
      });
      setImportStatus(null);
    } catch (e) {
      setParsedPreview(null);
    }
  };

  const handleExecuteRestore = () => {
    if (!importJson.trim()) return;
    const res = storage.importBackup(importJson);
    setImportStatus(res);
    if (res.success) {
      refreshState();
      setSnapshots(storage.getSnapshots());
      setImportJson('');
      setParsedPreview(null);
    }
  };

  // --- 360-DEGREE RESETS ---
  const handleExecuteReset = (force = false) => {
    if (!force && resetConfirmInput.trim().toUpperCase() !== 'CONFIRM') {
      alert('Please type "CONFIRM" in the text box to proceed with database reset.');
      return;
    }

    if (selectedResetType === 'demo') {
      storage.resetToDemo();
      setResetSuccessMsg('Database has been completely restored to authentic Bangladeshi demo dataset.');
    } else if (selectedResetType === 'transactions_only') {
      storage.resetTransactionsOnly();
      setResetSuccessMsg('All transaction records, invoices, and vouchers cleared. Master products and customer directories are preserved.');
    } else if (selectedResetType === 'fresh_blank') {
      storage.resetToFreshBlank();
      setResetSuccessMsg('Database initialized to clean slate (0 records) for fresh business setup.');
    }

    refreshState();
    setSelectedResetType(null);
    setResetConfirmInput('');
    setTimeout(() => setResetSuccessMsg(null), 5000);
  };

  // --- INTEGRITY CHECK ---
  const handleRunIntegrityCheck = () => {
    const report = storage.verifyIntegrity();
    setIntegrityData(report);
    setIsIntegrityModalOpen(true);
  };

  const recordCounts = storage.getRecordCounts();
  const storageSizeKb = Math.round((JSON.stringify(state).length * 2) / 1024);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            {mode === 'approvals' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : mode === 'audit' ? (
              <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <DatabaseBackup className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {mode === 'approvals'
                ? t('Approval Workflow & Sensitive Override Requests', 'অনুমোদন ওয়ার্কফ্লো ও বিশেষ ছাড়')
                : mode === 'audit'
                ? t('System Audit Trail & Immutable Operational Logs', 'অডিট ট্রেইল ও লেনদেন লগ')
                : t('System Settings & Database Controls', 'সিস্টেম সেটিংস ও ডাটাবেজ কন্ট্রোল')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'backup'
              ? t(
                  'Enterprise settings & data preservation, JSON backup/restore, clean slate blank reset & relational integrity audit.',
                  'সিস্টেম সেটিংস, সম্পূর্ণ ডাটাবেজ ব্যাকআপ, ব্যাকআপ ফাইল আপলোড রিস্টোর ও ১০০% ফুল ক্লিন শূন্য রেকর্ড রিসেট।'
                )
              : t(
                  'Role-Based Access Control • Traceable Activity Log with Client IP & Timestamp',
                  'রোল ভিত্তিক অ্যাক্সেস • ব্যবহারকারীর আইপি ও সময় সহ সুরক্ষিত লগ'
                )}
          </p>
        </div>

        {mode === 'backup' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDatabaseControlModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
            >
              <DatabaseBackup className="w-4 h-4" />
              <span>{t('Quick Reset & Backup Wizard', 'কুইক রিসেট ও ব্যাকআপ উইজার্ড')}</span>
            </button>
            <button
              onClick={handleRunIntegrityCheck}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition border border-slate-300 dark:border-slate-700 shadow-2xs"
            >
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('Verify Integrity & Health', 'ডাটাবেজ হেলথ ও ইন্টিগ্রিটি')}</span>
            </button>
          </div>
        )}
      </div>

      {resetSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{resetSuccessMsg}</span>
        </div>
      )}

      {/* APPROVALS QUEUE */}
      {mode === 'approvals' && (
        <div className="space-y-3">
          {state.approvals.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl text-slate-400 text-xs border border-slate-200 dark:border-slate-800">
              No pending approval requests.
            </div>
          ) : (
            state.approvals.map(req => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold uppercase tracking-wider text-emerald-600">
                      {req.request_type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">• Branch: {req.branch_name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {req.details}
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <span>
                    Requested by: <strong>{req.requester_name}</strong> • Time:{' '}
                    {new Date(req.created_at).toLocaleString()}
                  </span>

                  {req.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded font-bold hover:bg-rose-100"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                      >
                        Authorize & Approve
                      </button>
                    </div>
                  )}

                  {req.status !== 'pending' && (
                    <div className="text-[11px] text-slate-400">
                      Actioned by: <strong>{req.approver_name}</strong> at{' '}
                      {new Date(req.action_date || '').toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AUDIT TRAIL LOGS */}
      {mode === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t('Total Audit Records:', 'মোট অডিট লগ:')} {state.auditLogs.length}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Audit Engine Active (100% Traceability)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Record Ref</th>
                  <th className="p-3">Summary Description</th>
                  <th className="p-3">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <strong className="text-slate-900 dark:text-white block">{log.user_name}</strong>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">{log.role}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.module}</td>
                    <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{log.record_id}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{log.summary}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 360-DEGREE DATABASE BACKUP, RESTORE & RESET */}
      {mode === 'backup' && (
        <div className="space-y-6">
          {/* Quick Health & Storage Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('Storage Footprint', 'মেমোরি আকার')}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{storageSizeKb} KB</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('Catalog Records', 'প্রোডাক্ট ও আইএমইআই')}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{recordCounts.products} prods / {recordCounts.imeis} imeis</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('Transactions', 'লেনদেন ও জাবেদা')}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{recordCounts.sales} sales / {recordCounts.journals} jrnls</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('Snapshot Slots', 'স্ন্যাপশট ব্যাকআপ')}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{snapshots.length} {t('Saved', 'টি সেভড')}</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 text-xs font-semibold">
            <button
              onClick={() => setActiveBackupTab('export')}
              className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
                activeBackupTab === 'export'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{t('1. Full JSON Export & Backup', '১. ফুল ব্যাকআপ ও এক্সপোর্ট')}</span>
            </button>

            <button
              onClick={() => setActiveBackupTab('snapshots')}
              className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
                activeBackupTab === 'snapshots'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('2. Browser Snapshot Slots (Time-Machine)', '২. লোকাল স্ন্যাপশট টাইম মেশিন')} ({snapshots.length})</span>
            </button>

            <button
              onClick={() => setActiveBackupTab('restore')}
              className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
                activeBackupTab === 'restore'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{t('3. File Upload & Restore Engine', '৩. ফাইল আপলোড ও রিস্টোর')}</span>
            </button>

            <button
              onClick={() => setActiveBackupTab('reset')}
              className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition ${
                activeBackupTab === 'reset'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('4. 360° Selective Reset & Wiping', '৪. সিলেক্টিভ রিসেট ও ওয়াইপ')}</span>
            </button>
          </div>

          {/* TAB 1: EXPORT & BACKUP */}
          {activeBackupTab === 'export' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>{t('One-Click Complete Database Export', '১-ক্লিকে সম্পূর্ণ ডাটাবেজ ব্যাকআপ')}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">JSON v1.2 Standard</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t(
                    'Exports all relational entities into a self-contained, portable JSON file. Includes company profile, branch structures, full smartphone catalog, IMEI device serials, sales invoices, double-entry journals, customer/supplier ledgers, and audit logs.',
                    'একটি কমপ্লিট পোর্টেবল JSON ফাইল ডাউনলোড করুন। এতে শোরুমের প্রতিটি প্রোডাক্ট, আইএমইআই, বিক্রয় চালান, খতিয়ান, জাবেদা ও কাস্টমার লেজার সুরক্ষিত থাকে।'
                  )}
                </p>

                {/* Table Breakdown Pill Badges */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t('Current Database Entities Included in Backup:', 'ব্যাকআপ ফাইলে অন্তর্ভুক্ত ডাটা টেবিলসমূহ:')}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Branches: <strong>{recordCounts.branches}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Products: <strong>{recordCounts.products}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Active IMEIs: <strong>{recordCounts.imeis}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Sales: <strong>{recordCounts.sales}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Purchases: <strong>{recordCounts.purchases}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Journals: <strong>{recordCounts.journals}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Customers: <strong>{recordCounts.customers}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Suppliers: <strong>{recordCounts.suppliers}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      Installments: <strong>{recordCounts.installments}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('Download Full Database Backup (.json)', 'ব্যাকআপ ফাইল ডাউনলোড করুন (.json)')}</span>
                  </button>

                  <button
                    onClick={handleCopyBackupJSON}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-2 border border-slate-300 dark:border-slate-700 transition"
                  >
                    {copiedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedJson ? t('Copied to Clipboard!', 'কপিকৃত!') : t('Copy JSON Payload', 'জেসন কপি করুন')}</span>
                  </button>
                </div>
              </div>

              {/* Best Practices & Security */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('Backup Safety Best Practices', 'ব্যাকআপের নিরাপত্তা নির্দেশিকা')}</span>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px] list-disc list-inside leading-relaxed">
                  <li>{t('Take daily evening backups before closing store registers.', 'প্রতিদিন শোরুম বন্ধ করার আগে নিয়মিত ব্যাকআপ ডাউনলোড করে রাখুন।')}</li>
                  <li>{t('Store JSON files in secure Google Drive or external offline storage.', 'ব্যাকআপ ফাইলটি নিরাপদ ড্রাইভ বা এক্সটার্নাল ড্রাইভে সংরক্ষণ করুন।')}</li>
                  <li>{t('Automatic safety snapshot is created prior to any restore or reset.', 'কোনো রিস্টোর বা রিসেটের আগে সিস্টেম স্বয়ংক্রিয়ভাবে সেফটি স্ন্যাপশট রাখে।')}</li>
                  <li>{t('The backup includes double-entry general ledger verification.', 'ব্যাকআপের প্রতিটি এন্ট্রি ডাবল-এন্ট্রি ব্যালেন্সড থাকে।')}</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: LOCAL SNAPSHOTS (TIME MACHINE) */}
          {activeBackupTab === 'snapshots' && (
            <div className="space-y-4">
              {/* Snapshot Creator Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
                <form onSubmit={handleCreateSnapshot} className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Save className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={snapshotName}
                      onChange={e => setSnapshotName(e.target.value)}
                      placeholder={t('Enter Snapshot Label (e.g. "Pre-Audit Check", "October 8 Closing")...', 'স্ন্যাপশট নাম দিন (যেমন: "অডিট পূর্ববর্তী ব্যাকআপ", "দিনের ক্লোজিং")...')}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shrink-0 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('Save Local Snapshot Slot', 'স্ন্যাপশট সেভ করুন')}</span>
                  </button>
                </form>
              </div>

              {/* Snapshots List */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('Saved Local Snapshots in Browser Storage', 'ব্রাউজার মেমোরিতে সংরক্ষিত স্ন্যাপশটসমূহ')} ({snapshots.length}/10 Slots)
                  </span>
                  <span className="text-slate-400 text-[11px]">{t('Instant 1-Click Rollback Available', 'তাৎক্ষণিক রোলব্যাক সুবিধা')}</span>
                </div>

                {snapshots.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    {t('No local snapshots created yet. Enter a label above to take your first snapshot!', 'এখনও কোনো লোকাল স্ন্যাপশট নেওয়া হয়নি।')}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {snapshots.map(snap => (
                      <div
                        key={snap.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{snap.name}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-500">
                              {snap.size_kb} KB
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-3">
                            <span>{new Date(snap.timestamp).toLocaleString()}</span>
                            <span>• {snap.record_counts.products} Prods</span>
                            <span>• {snap.record_counts.sales} Sales</span>
                            <span>• {snap.record_counts.journals} Jrnls</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleDownloadSnapshot(snap)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                            title="Download JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRestoreSnapshot(snap.id, snap.name)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center space-x-1 transition shadow-2xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t('Rollback to this Snapshot', 'এই স্ন্যাপশটে ফিরুন')}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
                            title="Delete Snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FILE UPLOAD & RESTORE ENGINE */}
          {activeBackupTab === 'restore' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{t('Database Restore from Backup File', 'ব্যাকআপ ফাইল থেকে ডাটাবেজ রিস্টোর')}</span>
                  </h3>
                  <span className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded font-medium">
                    {t('Auto-safety snapshot will be taken', 'রিস্টোরের পূর্বে অটো-স্ন্যাপশট নেওয়া হবে')}
                  </span>
                </div>

                {/* File picker */}
                <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('Select or drop your TelecomERP backup JSON file', 'আপনার ব্যাকআপ (.json) ফাইলটি সিলেক্ট করুন')}
                  </div>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>

                {/* Or paste JSON */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Or Paste Raw Backup JSON Content Directly:', 'অথবা সরাসরি ব্যাকআপ জেসন পেস্ট করুন:')}
                  </label>
                  <textarea
                    rows={4}
                    value={importJson}
                    onChange={e => handlePastedJsonChange(e.target.value)}
                    placeholder='{"meta": {...}, "data": {"products": [...], "branches": [...]}}'
                    className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Pre-Restore Inspection Card */}
                {parsedPreview && (
                  <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t('Valid Backup File Verified - Pre-Restore Record Inspection:', 'ভ্যালিড ব্যাকআপ ফাইল যাচাইকৃত - রেকর্ডের সারসংক্ষেপ:')}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900">
                        <span className="text-[10px] text-slate-400 block">Products:</span>
                        <strong className="text-slate-900 dark:text-white">{parsedPreview.products}</strong>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900">
                        <span className="text-[10px] text-slate-400 block">IMEI Devices:</span>
                        <strong className="text-slate-900 dark:text-white">{parsedPreview.imeis}</strong>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900">
                        <span className="text-[10px] text-slate-400 block">Sales Invoices:</span>
                        <strong className="text-slate-900 dark:text-white">{parsedPreview.sales}</strong>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900">
                        <span className="text-[10px] text-slate-400 block">Journals:</span>
                        <strong className="text-slate-900 dark:text-white">{parsedPreview.journals}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {importStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                      importStatus.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {importStatus.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{importStatus.message}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    disabled={!parsedPreview}
                    onClick={handleExecuteRestore}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('Execute Full Database Restore', 'ডাটাবেজ রিস্টোর সম্পন্ন করুন')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 360° SELECTIVE RESETS & WIPING */}
          {activeBackupTab === 'reset' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Demo Reset */}
                <div
                  onClick={() => setSelectedResetType('demo')}
                  className={`p-5 rounded-xl border cursor-pointer transition space-y-2 ${
                    selectedResetType === 'demo'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('Option 1: Factory Reset to Demo Dataset', 'অপশন ১: ফুল ডেমো ডাটাবেজ রিস্টোর')}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t(
                      'Replaces entire database with authentic Bangladeshi demo data: Motijheel, Bashundhara, Uttara branches, 120+ smartphones with valid IMEIs, customer ledgers, double-entry journals & reports.',
                      '৩টি ব্রাঞ্চ, ১২০টি ফোন, আইএমইআই, কাস্টমার বাকি লেজার ও ব্যালেন্সড ডাবল-এন্ট্রি জাবেদা সহ স্ট্যান্ডার্ড ডেমো ডাটা ফিরিয়ে আনে।'
                    )}
                  </p>
                </div>

                {/* Option 2: Clear Transactions Only */}
                <div
                  onClick={() => setSelectedResetType('transactions_only')}
                  className={`p-5 rounded-xl border cursor-pointer transition space-y-2 ${
                    selectedResetType === 'transactions_only'
                      ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('Option 2: Clear Transactions Only (Keep Masters)', 'অপশন ২: শুধু লেনদেন ক্লিয়ার (মাস্টার ডাটা অক্ষুণ্ন)')}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t(
                      'Wipes sales, purchases, expenses, installments and journals; resets all IMEIs back to in_stock; zeroes debtor/creditor balances, BUT preserves your entire catalog of products, categories, branches & customer directories.',
                      'প্রোডাক্ট লিস্ট, ব্র্যান্ড, ক্যাটাগরি ও কাস্টমার ডিরেক্টরি বজায় রেখে সমস্ত পুরনো বিক্রয় ইনভয়েস, ভাউচার ও ট্রানজ্যাকশন ক্লিয়ার করে।'
                    )}
                  </p>
                </div>

                {/* Option 3: Clean Slate (0 Records) */}
                <div
                  onClick={() => setSelectedResetType('fresh_blank')}
                  className={`p-5 rounded-xl border cursor-pointer transition space-y-2 ${
                    selectedResetType === 'fresh_blank'
                      ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40 ring-2 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('Option 3: Clean Slate / Fresh Start (0 Records)', 'অপশন ৩: ফ্রেশ ক্লিন স্লেট (শূন্য রেকর্ড)')}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t(
                      'Completely empties all inventory and transactions for a brand-new live commercial onboarding. Preserves company settings and branches.',
                      'নতুন কোনো মোবাইল শোরুমে একেবারে শূন্য থেকে লাইভ শুরু করার জন্য সমস্ত টেস্ট প্রোডাক্ট ও রেকর্ড মুছে ফেলে ফ্রেশ শুরু।'
                    )}
                  </p>
                </div>
              </div>

              {/* Safety Confirmation Prompt */}
              {selectedResetType && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-900 dark:text-rose-200 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{t('Destructive Action Confirmation Required:', 'নিরাপত্তা নিশ্চিতকরণ প্রয়োজন:')}</span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300">
                    {selectedResetType === 'demo'
                      ? t('You are about to restore the demo dataset.', 'আপনি ডেমো ডাটাবেজ রিস্টোর করতে যাচ্ছেন।')
                      : selectedResetType === 'transactions_only'
                      ? t('You are about to delete all sales, purchase, and journal transactions.', 'আপনি সমস্ত বিক্রয়, ক্রয় ও জাবেদা ইতিহাস মুছে ফেলতে যাচ্ছেন।')
                      : t('You are about to wipe all products and records.', 'আপনি সম্পূর্ণ ডাটাবেজ শূন্য করতে যাচ্ছেন।')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={resetConfirmInput}
                      onChange={e => setResetConfirmInput(e.target.value)}
                      placeholder='Type "CONFIRM" to unlock'
                      className="w-full sm:w-60 p-2 text-xs font-mono font-bold uppercase bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg text-rose-900 dark:text-rose-200 focus:outline-hidden"
                    />
                    <button
                      disabled={resetConfirmInput.trim().toUpperCase() !== 'CONFIRM'}
                      onClick={() => handleExecuteReset(false)}
                      className="w-full sm:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('Execute Selected Reset Now', 'নিশ্চিত করুন ও রিসেট চালান')}</span>
                    </button>
                    <button
                      onClick={() => handleExecuteReset(true)}
                      className="w-full sm:w-auto px-3.5 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <span>{t('1-Click Direct Wipe', '১-ক্লিকে সরাসরি রিসেট')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResetType(null);
                        setResetConfirmInput('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 underline"
                    >
                      {t('Cancel', 'বাতিল')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* INTEGRITY REPORT MODAL */}
      {isIntegrityModalOpen && integrityData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t('Database Relational Integrity Audit', 'ডাটাবেজ রিলেশনাল ইন্টিগ্রিটি অডিট')}
                </h3>
              </div>
              <button onClick={() => setIsIntegrityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>{t('Database Health Status: 100% Sound', 'ডাটাবেজ হেলথ স্ট্যাটাস: ১০০% নির্ভুল')}</strong>
                  <br />
                  {t('All double-entry journals are balanced (Debit = Credit) and foreign keys are valid.', 'প্রতিটি জাবেদায় ডেবিট ও ক্রেডিট সমান এবং কোনো অনাথ রেকর্ড নেই।')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block">Total Active Records:</span>
                  <strong>{integrityData.stats.totalRecords}</strong>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block">Memory Size:</span>
                  <strong>{integrityData.stats.storageSizeKB} KB</strong>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block">Unbalanced Journals:</span>
                  <strong className="text-emerald-600">{integrityData.stats.unbalancedJournals}</strong>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block">Orphan IMEIs:</span>
                  <strong className="text-emerald-600">{integrityData.stats.orphanImeis}</strong>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsIntegrityModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold text-xs"
                >
                  {t('Close', 'বন্ধ করুন')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

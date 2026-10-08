import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { ApprovalRequest, AuditLog } from '../../types';
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
  AlertTriangle
} from 'lucide-react';

interface ApprovalAuditViewsProps {
  mode: 'approvals' | 'audit' | 'backup';
}

export const ApprovalAuditViews: React.FC<ApprovalAuditViewsProps> = ({ mode }) => {
  const { state, currentUser, t, refreshState } = useApp();

  const [notes, setNotes] = useState('');
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    storage.updateApproval(id, 'approved', currentUser.name, notes);
    setNotes('');
  };

  const handleReject = (id: string) => {
    storage.updateApproval(id, 'rejected', currentUser.name, notes);
    setNotes('');
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telecom_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    if (!importJson.trim()) return;
    const ok = storage.importBackup(importJson.trim());
    if (ok) {
      setImportStatus('Database successfully restored from JSON backup!');
      refreshState();
    } else {
      setImportStatus('Error: Invalid JSON backup file format.');
    }
  };

  const handleResetDemo = () => {
    if (confirm('Are you sure you want to reset the system to initial Bangladeshi demo data? All temporary records will be restored.')) {
      storage.resetToDemo();
      refreshState();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            {mode === 'approvals' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : mode === 'audit' ? (
              <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <DatabaseBackup className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {mode === 'approvals'
                ? t('Approval Workflow & Sensitive Override Requests', 'অনুমোদন ওয়ার্কফ্লো ও বিশেষ ছাড়')
                : mode === 'audit'
                ? t('System Audit Trail & Immutable Operational Logs', 'অডিট ট্রেইল ও লেনদেন লগ')
                : t('Database Safety, Backup & Disaster Recovery', 'ডাটাবেজ ব্যাকআপ ও সিস্টেম রিসেট')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control • Traceable Activity Log with Client IP & Timestamp
          </p>
        </div>
      </div>

      {/* APPROVALS QUEUE */}
      {mode === 'approvals' && (
        <div className="space-y-3">
          {state.approvals.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl text-slate-400 text-xs">
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    req.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {req.details}
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <span>Requested by: <strong>{req.requester_name}</strong> • Time: {new Date(req.created_at).toLocaleString()}</span>

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
                      Actioned by: <strong>{req.approver_name}</strong> at {new Date(req.action_date || '').toLocaleTimeString()}
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
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
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
      )}

      {/* DATABASE BACKUP & RESTORE */}
      {mode === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Full Database JSON Export</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export all relational tables, including chart of accounts, IMEI device registers, posted sales invoices, purchases, journals, and management reports as a standalone JSON backup file.
            </p>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Database Backup (.json)</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Restore Authentic Demo Dataset</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reset database state back to standard seed demo data (3 Branches, 120+ active IMEIs, customer ledgers, double-entry journals, daily/weekly/monthly reports).
            </p>
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Database to Demo State</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

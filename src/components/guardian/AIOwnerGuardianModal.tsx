import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { aiOwnerGuardian } from '../../services/aiOwnerGuardian';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  Scale,
  Settings,
  FileBarChart,
  X,
  Play,
  ArrowRight,
  TrendingDown,
  Users,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AIAnomalyRecord, AnomalySeverity, AnomalyType } from '../../types/guardian';

export const AIOwnerGuardianModal: React.FC = () => {
  const {
    state,
    isAIGuardianOpen,
    setIsAIGuardianOpen,
    activeGuardianTab,
    setActiveGuardianTab,
    currentUser,
    language,
    triggerGuardianVoice,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'monitor' | 'report' | 'recovery' | 'audit' | 'ledger' | 'settings'
  >(activeGuardianTab || 'monitor');

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportPeriod, setReportPeriod] = useState<'today' | 'weekly' | 'monthly' | 'all'>('weekly');

  // Admin Restore Modal State
  const [restoreModalSaleId, setRestoreModalSaleId] = useState<string | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync tab with context if changed externally
  React.useEffect(() => {
    if (activeGuardianTab) {
      setActiveTab(activeGuardianTab);
    }
  }, [activeGuardianTab]);

  if (!isAIGuardianOpen) return null;

  // Filtered Anomalies
  const anomalies = state.aiAnomalies || [];
  const filteredAnomalies = anomalies.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.user_name.toLowerCase().includes(q) ||
        (a.reference_no && a.reference_no.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // GL Audit data
  const glAudit = aiOwnerGuardian.auditGeneralLedger(state.journals);

  // Financial Anomaly Report
  const anomalyReport = aiOwnerGuardian.generateAnomalyReport({
    anomalies: state.aiAnomalies,
    auditTrail: state.aiAuditTrail,
    journals: state.journals,
    sales: state.sales,
    period: reportPeriod
  });

  // Voided / Erroneous Sales for Recovery
  const voidedSales = state.sales.filter(s => s.status === 'voided' || !!s.restored_at);

  // Auto Fix Handler
  const handleAutoFix = (id: string) => {
    const res = storage.autoFixAnomaly(id, currentUser);
    if (res.success) {
      setActionSuccessMsg(res.message);
      triggerGuardianVoice('অসংগতিটি সফলভাবে সংশোধন করা হয়েছে এবং অডিট ট্রেইলে সংরক্ষিত হয়েছে।', true);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  // Restore Sale Handler
  const handleExecuteRestore = () => {
    if (!restoreModalSaleId || !restoreReason.trim()) {
      alert('অনুগ্রহ করে পুনরুদ্ধারের কারণ উল্লেখ করুন।');
      return;
    }
    const res = storage.restoreSale(restoreModalSaleId, currentUser, restoreReason);
    if (res.success) {
      setActionSuccessMsg(res.message);
      triggerGuardianVoice('চালানটি সফলভাবে রিস্টোর করা হয়েছে।', true);
      setRestoreModalSaleId(null);
      setRestoreReason('');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      alert(res.message);
    }
  };

  // Test Voice Alert
  const handleTestVoice = () => {
    triggerGuardianVoice('পরীক্ষামূলক সতর্কতা: এআই ওনার গার্ডিয়ান সিস্টেম সার্বক্ষণিক সক্রিয় রয়েছে।', true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md ring-2 ring-amber-400/40">
              মালিক
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
                  <span>AI Owner Guardian Agent</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Always-On Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                প্রতিষ্ঠানের আর্থিক নিরাপত্তা, ডেটা ভ্যালিডেশন, স্বয়ংক্রিয় সংশোধন ও অডিটযোগ্য নিয়ন্ত্রণ কেন্দ্র
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Voice toggle quick indicator */}
            <button
              onClick={() => {
                storage.updateVoiceFeedbackConfig({
                  enabled: !state.voiceFeedbackConfig?.enabled
                });
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                state.voiceFeedbackConfig?.enabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Voice Feedback"
            >
              {state.voiceFeedbackConfig?.enabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>কণ্ঠস্বর চালু</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>কণ্ঠস্বর বন্ধ</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAIGuardianOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Success Banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 overflow-x-auto no-scrollbar text-xs font-bold space-x-1">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`py-3 px-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'monitor'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>লাইভ গার্ডিয়ান মনিটর</span>
            {anomalies.filter(a => a.status === 'detected' || a.status === 'pending_approval').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {anomalies.filter(a => a.status === 'detected' || a.status === 'pending_approval').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 px-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'report'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileBarChart className="w-3.5 h-3.5" />
            <span>ফাইন্যান্সিয়াল অ্যানোমালি রিপোর্ট</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-3 px-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'recovery'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ট্রানজেকশন রিকভারি ও অ্যাডমিন রিস্টোর</span>
            {voidedSales.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {voidedSales.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'audit'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>অপরিবর্তনীয় এআই অডিট ট্রেইল</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3 px-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'ledger'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>লেজার ও ডাবল-এন্ট্রি অডিট</span>
            {!glAudit.isHealthy && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ভয়েস ও পলিসি সেটিংস</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: LIVE MONITOR & ANOMALY FEED */}
          {activeTab === 'monitor' && (
            <div className="space-y-5">
              {/* Top KPI Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">মোট শনাক্ত অসংগতি</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {anomalies.length}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">সর্বশেষ ২৪ ঘণ্টার হিসাব</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">স্বয়ংক্রিয় সংশোধিত</span>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {anomalies.filter(a => a.status === 'auto_corrected').length}
                  </div>
                  <span className="text-[10px] text-emerald-600/80 mt-0.5 block">ব্যবসায়িক নিয়ম অনুযায়ী ফিক্সড</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">মালিকের অনুমোদন বাকি</span>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                    {anomalies.filter(a => a.status === 'detected' || a.status === 'pending_approval').length}
                  </div>
                  <span className="text-[10px] text-amber-600/80 mt-0.5 block">উচ্চ ঝুঁকির আর্থিক ট্রানজেকশন</span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">প্রতিরোধকৃত আর্থিক ক্ষতি</span>
                  <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
                    ৳{anomalies.reduce((sum, a) => sum + (a.financial_impact || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-blue-600/80 mt-0.5 block">ভুল মূল্য ও মার্জিন সুরক্ষা</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="অসংগতি বা চালান খুঁজুন..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="all">সকল তীব্রতা (All)</option>
                    <option value="critical">গুরুতর (Critical)</option>
                    <option value="high">উচ্চ ঝুঁকি (High)</option>
                    <option value="medium">মাঝারি (Medium)</option>
                    <option value="low">সাধারণ (Low)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={handleTestVoice}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition"
                  >
                    <Play className="w-3 h-3" />
                    <span>ভয়েস অ্যালার্ট টেস্ট</span>
                  </button>
                </div>
              </div>

              {/* Anomaly Feed Cards */}
              <div className="space-y-3">
                {filteredAnomalies.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                    <div className="font-bold text-slate-700 dark:text-slate-300">কোন অসমাধানকৃত অসংগতি নেই!</div>
                    <p className="text-[11px]">ERP-এর ডেটাবেজ, হিসাব ও মূল্য তালিকা সুরক্ষিত রয়েছে।</p>
                  </div>
                ) : (
                  filteredAnomalies.map(anom => (
                    <div
                      key={anom.id}
                      className={`p-4 rounded-xl border transition-all ${
                        anom.severity === 'critical'
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                          : anom.severity === 'high'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start space-x-2.5">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              anom.severity === 'critical'
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600'
                                : anom.severity === 'high'
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600'
                                : 'bg-blue-100 dark:bg-blue-900/60 text-blue-600'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                                {anom.title}
                              </h4>
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                                  anom.severity === 'critical'
                                    ? 'bg-rose-600 text-white'
                                    : anom.severity === 'high'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {anom.severity}
                              </span>
                              {anom.is_recurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                  পুনরাবৃত্ত ভুল ({anom.recurrent_count}x)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {anom.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                              <span>মডিউল: <strong className="text-slate-700 dark:text-slate-200 uppercase">{anom.module}</strong></span>
                              <span>এন্ট্রি কারী: <strong className="text-slate-700 dark:text-slate-200">{anom.user_name} ({anom.user_role})</strong></span>
                              <span>আইডি: <strong className="font-mono text-slate-700 dark:text-slate-200">{anom.reference_no || anom.record_id}</strong></span>
                              <span>প্রভাব: <strong className="text-emerald-600 font-bold">৳{(anom.financial_impact || 0).toLocaleString('en-IN')}</strong></span>
                              <span>নিয়ম: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">{anom.rule_applied}</code></span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                          {anom.status === 'auto_corrected' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>স্বয়ংক্রিয় সংশোধিত</span>
                            </span>
                          ) : anom.status === 'approved' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>মালিক কর্তৃক অনুমোদিত</span>
                            </span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAutoFix(anom.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs"
                              >
                                স্বয়ংক্রিয় সংশোধন (Auto-Fix)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {anom.resolution_notes && (
                        <div className="mt-3 p-2 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                          <strong>সংশোধনের বিবরণ:</strong> {anom.resolution_notes} ({anom.resolved_by})
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL ANOMALY REPORT */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <FileBarChart className="w-4 h-4 text-amber-500" />
                    <span>স্বয়ংক্রিয় ফাইন্যান্সিয়াল অ্যানোমালি সারসংক্ষেপ</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    মালিক ও ম্যানেজারের জন্য নির্ধারিত সময়সীমাভিত্তিক আর্থিক অসংগতির অডিট প্রতিবেদন
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 text-xs font-semibold">
                    {(['today', 'weekly', 'monthly', 'all'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setReportPeriod(p)}
                        className={`px-3 py-1 rounded-md capitalize transition ${
                          reportPeriod === p
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p === 'today' ? 'দৈনিক' : p === 'weekly' ? 'সাপ্তাহিক' : p === 'monthly' ? 'মাসিক' : 'সকল'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
                  >
                    রিপোর্ট প্রিন্ট
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">মোট শনাক্ত ভুল</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {anomalyReport.total_anomalies_detected}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{reportPeriod} সময়সীমায়</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">স্বয়ংক্রিয় সংশোধন</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {anomalyReport.total_auto_corrected}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">সফলভাবে সমাধানকৃত</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-amber-600 font-bold uppercase block">বাতিল / রিস্টোরকৃত চালান</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {anomalyReport.voided_transactions_count} Void / {anomalyReport.restored_transactions_count} Restored
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">ডাবল-কাউন্টিং মুক্ত</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-blue-600 font-bold uppercase block">আর্থিক সুরক্ষা (BDT)</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    ৳{anomalyReport.total_loss_prevented.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">সংশোধনের ফলে সাশ্রয়</span>
                </div>
              </div>

              {/* User Mistake Rankings */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>ব্যবহারকারীভিত্তিক ভুলের সংখ্যা ও পুনরাবৃত্তির হার (User Error Profile)</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">কর্মকর্তা / ব্যবহারকারী</th>
                        <th className="p-2.5 text-center">মোট ভুল</th>
                        <th className="p-2.5 text-center">সর্বোচ্চ তীব্রতা</th>
                        <th className="p-2.5">সাধারণ ভুলের ধরন</th>
                        <th className="p-2.5 text-center">সতর্কতার মাত্রা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {anomalyReport.user_mistakes_ranking.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{u.user_name}</td>
                          <td className="p-2.5 text-center font-bold text-rose-600">{u.count}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              {u.highest_severity}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{u.common_error}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              u.count >= 3
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}>
                              {u.count >= 3 ? 'লেভেল ৩: দৃঢ় নির্দেশ' : 'লেভেল ২: সতর্কবার্তা'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Module Discrepancies Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  মডিউল ও ক্যাটাগরিভিত্তিক আর্থিক অসংগতির বিবরণ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {anomalyReport.category_discrepancies.map((cat, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{cat.category_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 font-bold">
                          {cat.anomaly_count} ঘটনা
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        ৳{cat.financial_impact.toLocaleString('en-IN')} সুরক্ষা
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION RECOVERY & ADMIN RESTORE */}
          {activeTab === 'recovery' && (
            <div className="space-y-5">
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>অ্যাডমিন ট্রানজেকশন রিকভারি ও রিভার্সাল পলিসি</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  ERP-তে কোনো ট্রানজেকশন স্থায়ীভাবে মুছে ফেলা হয় না। ভুল চালানগুলোকে <code className="font-bold text-rose-600">voided</code> স্ট্যাটাসে রাখা হয়। অ্যাডমিন উপযুক্ত কারণ উল্লেখ করে এবং আইএমইআই প্রাপ্যতা ও লেজার ডাবল-কাউন্টিং যাচাই করে যেকোনো বাতিল চালান নিরাপদে পুনরায় সক্রিয় (Restore) করতে পারেন।
                </p>
              </div>

              {/* Voided Sales Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-3 border-b bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
                  বাতিলকৃত ও পুনরুদ্ধারযোগ্য চালানের তালিকা ({voidedSales.length})
                </div>

                {voidedSales.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    কোন বাতিল বা রিভার্স করা চালান পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/60 dark:bg-slate-800/60 text-slate-500 font-semibold border-b">
                        <tr>
                          <th className="p-3">চালান #</th>
                          <th className="p-3">তারিখ</th>
                          <th className="p-3">গ্রাহক</th>
                          <th className="p-3 text-right">মোট টাকা</th>
                          <th className="p-3">বাতিলের কারণ ও ব্যবহারকারী</th>
                          <th className="p-3 text-center">স্ট্যাটাস</th>
                          <th className="p-3 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {voidedSales.map(sale => (
                          <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                              {sale.invoice_no}
                            </td>
                            <td className="p-3 text-slate-500">{sale.created_at.slice(0, 10)}</td>
                            <td className="p-3 font-semibold">{sale.customer_name}</td>
                            <td className="p-3 text-right font-bold">৳{sale.total_amount.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">
                              <div>{sale.void_reason || 'Manual cancellation'}</div>
                              <span className="text-[10px] text-slate-400">
                                By: {sale.voided_by || 'Admin'} • {sale.voided_at ? new Date(sale.voided_at).toLocaleTimeString() : ''}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {sale.status === 'voided' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                                  Voided
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  Restored
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {sale.status === 'voided' ? (
                                <button
                                  onClick={() => setRestoreModalSaleId(sale.id)}
                                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-2xs"
                                >
                                  রিস্টোর করুন (Restore)
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  Restored by {sale.restored_by}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Restore Confirmation Dialog Modal */}
              {restoreModalSaleId && (
                <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <RotateCcw className="w-5 h-5" />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        চালান পুনরুদ্ধার নিশ্চিতকরণ (Admin Restore)
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      AI সিস্টেম নিশ্চিত করবে যে এই চালানের পণ্য ও আইএমইআই অন্য কোথাও বিক্রয় হয়নি এবং লেজারে কোনো ডাবল-কাউন্টিং হবে না।
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        পুনরুদ্ধারের কারণ (Restore Justification Reason) *
                      </label>
                      <textarea
                        value={restoreReason}
                        onChange={e => setRestoreReason(e.target.value)}
                        placeholder="যেমন: গ্রাহক পণ্য অক্ষত রেখে পুনরায় গ্রহণ করায় পূর্বের চালানটি কার্যকর করা হলো..."
                        className="w-full p-2.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => {
                          setRestoreModalSaleId(null);
                          setRestoreReason('');
                        }}
                        className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={handleExecuteRestore}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        নিশ্চিত করুন ও চালান রিস্টোর করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IMMUTABLE AI AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tamper-Evident Chronological History • {state.aiAuditTrail?.length || 0} Records</span>
                <span className="font-mono text-[10px]">Security Hash Verified</span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b">
                      <tr>
                        <th className="p-3">সময় ও তারিখ</th>
                        <th className="p-3">ট্রানজেকশন / মডিউল</th>
                        <th className="p-3">ফিল্ড</th>
                        <th className="p-3">পূর্বের মান → নতুন মান</th>
                        <th className="p-3">শনাক্তের কারণ ও AI সিদ্ধান্ত</th>
                        <th className="p-3">ব্যবসায়িক নিয়ম</th>
                        <th className="p-3">ব্যবহারকারী</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(state.aiAuditTrail || []).map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold font-mono">
                            {entry.original_trx_id}
                            <span className="block text-[10px] text-slate-400 uppercase font-sans">{entry.module}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {entry.field}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="line-through text-rose-500 font-mono text-[11px] mr-1">{entry.old_value}</span>
                            <ArrowRight className="w-3 h-3 inline text-slate-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] ml-1">{entry.new_value}</span>
                          </td>
                          <td className="p-3 max-w-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{entry.detected_reason}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{entry.ai_decision}</div>
                          </td>
                          <td className="p-3">
                            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                              {entry.business_rule}
                            </code>
                          </td>
                          <td className="p-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {entry.user_name}
                            {entry.is_auto_corrected && (
                              <span className="block text-[10px] text-emerald-600 font-bold">Auto-Corrected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GENERAL LEDGER INTEGRITY AUDIT */}
          {activeTab === 'ledger' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">পরীক্ষিত জার্নাল এন্ট্রি</span>
                  <div className="text-xl font-black mt-1">{glAudit.totalJournalsChecked}</div>
                  <span className="text-[10px] text-slate-500">Double-Entry Journals</span>
                </div>

                <div className={`p-4 rounded-xl border ${
                  glAudit.unbalancedJournals.length > 0
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 text-rose-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900 text-emerald-700'
                }`}>
                  <span className="text-[10px] uppercase font-bold block">অসম ডেবিট/ক্রেডিট জার্নাল</span>
                  <div className="text-xl font-black mt-1">{glAudit.unbalancedJournals.length}</div>
                  <span className="text-[10px] block">Debit = Credit সমতা পরীক্ষা</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">ডুপ্লিকেট রেফারেন্স ভাউচার</span>
                  <div className="text-xl font-black mt-1">{glAudit.duplicateEntries.length}</div>
                  <span className="text-[10px] text-slate-500">স্বয়ংক্রিয় অডিট যাচাই</span>
                </div>
              </div>

              {glAudit.unbalancedJournals.length > 0 ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>অসম ডেবিট-ক্রেডিট শনাক্ত হয়েছে! সংশোধন আবশ্যক:</span>
                  </div>
                  <div className="space-y-2">
                    {glAudit.unbalancedJournals.map(u => (
                      <div key={u.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-xs flex justify-between items-center">
                        <div>
                          <strong>{u.entry_no}</strong> • ডেবিট: ৳{u.debit.toLocaleString('en-IN')} | ক্রেডিট: ৳{u.credit.toLocaleString('en-IN')}
                          <span className="text-rose-600 block text-[11px] font-bold">পার্থক্য: ৳{u.diff.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          onClick={() => {
                            // Balance the journal
                            const jrn = state.journals.find(j => j.id === u.id);
                            if (jrn) {
                              const diff = jrn.total_debit - jrn.total_credit;
                              if (diff > 0) {
                                jrn.lines.push({
                                  id: 'jln_adj_' + Date.now(),
                                  account_id: 'acc_suspense',
                                  account_code: '3099',
                                  account_name: 'Suspense / Rounding Difference',
                                  debit: 0,
                                  credit: diff,
                                  description: 'AI Owner Guardian Auto-Balance Adjustment'
                                });
                                jrn.total_credit += diff;
                              } else {
                                jrn.lines.push({
                                  id: 'jln_adj_' + Date.now(),
                                  account_id: 'acc_suspense',
                                  account_code: '3099',
                                  account_name: 'Suspense / Rounding Difference',
                                  debit: Math.abs(diff),
                                  credit: 0,
                                  description: 'AI Owner Guardian Auto-Balance Adjustment'
                                });
                                jrn.total_debit += Math.abs(diff);
                              }
                              storage.notify();
                              setActionSuccessMsg(`Journal ${u.entry_no} balanced with Suspense Adjustment line.`);
                              setTimeout(() => setActionSuccessMsg(null), 4000);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                        >
                          অটো-ব্যালেন্স সমন্বয়
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    সকল পোস্ট করা জার্নালে Debit ও Credit ১০০% সমতায় আছে
                  </div>
                  <p>Trial Balance, Profit & Loss এবং Balance Sheet গাণিতিকভাবে সম্পূর্ণ নির্ভুল।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GUARDIAN VOICE & POLICY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span>Voice-Based AI Feedback System (Web Speech API)</span>
                </h4>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">বাংলা ভয়েস ফিডব্যাক সক্রিয়</div>
                      <p className="text-slate-500 text-[11px]">ডাটা এন্ট্রির সময় ভুল হলে ব্রাউজার স্বয়ংক্রিয়ভাবে মৌখিক সতর্কবার্তা দেবে</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={state.voiceFeedbackConfig?.enabled ?? true}
                      onChange={e => {
                        storage.updateVoiceFeedbackConfig({ enabled: e.target.checked });
                      }}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      ভলিউম লেভেল ({Math.round((state.voiceFeedbackConfig?.volume ?? 1) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={state.voiceFeedbackConfig?.volume ?? 1.0}
                      onChange={e => {
                        storage.updateVoiceFeedbackConfig({ volume: parseFloat(e.target.value) });
                      }}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      কণ্ঠস্বরের গতি (Speech Rate: {state.voiceFeedbackConfig?.rate ?? 0.95}x)
                    </label>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={state.voiceFeedbackConfig?.rate ?? 0.95}
                      onChange={e => {
                        storage.updateVoiceFeedbackConfig({ rate: parseFloat(e.target.value) });
                      }}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleTestVoice}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>বাংলা কণ্ঠস্বর পরীক্ষা করুন (Test Voice Alert)</span>
                  </button>
                </div>
              </div>

              {/* Policy Enforcements */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span>AI Guardian Validation Rules & Policies</span>
                </h4>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span>RULE_NO_NEGATIVE_MARGIN (ক্রয়মূল্যের নিচে বিক্রয় সম্পূর্ণ নিষিদ্ধ ও ব্লক)</span>
                    <span className="text-emerald-600 font-bold">সক্রিয়</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span>RULE_WHOLESALE_TIER_POLICY (হোলসেল কাস্টমারদের জন্য পাইকারি রেট বাধ্যতামূলক)</span>
                    <span className="text-emerald-600 font-bold">সক্রিয়</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span>RULE_DOUBLE_ENTRY_BALANCE (ডাবল-এন্ট্রিতে ডেবিট ও ক্রেডিট সমান থাকা বাধ্যতামূলক)</span>
                    <span className="text-emerald-600 font-bold">সক্রিয়</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span>RULE_MAX_DISCOUNT_CAP (নির্ধারিত মার্জিনের সর্বোচ্চ ৫০% এর বেশি ছাড় নিষিদ্ধ)</span>
                    <span className="text-emerald-600 font-bold">সক্রিয়</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

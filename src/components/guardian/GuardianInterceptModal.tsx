import React, { useState } from 'react';
import { GuardianInterceptionResult } from '../../services/aiOwnerGuardianValidationEngine';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History,
  Lock,
  ArrowRight,
  Sparkles,
  X,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GuardianInterceptModalProps {
  result: GuardianInterceptionResult | null;
  onClose: () => void;
  onApplyCorrection: (field: string, suggestedVal: any) => void;
  onProceedAnyway?: () => void;
  onSupervisorOverride?: () => void;
}

export const GuardianInterceptModal: React.FC<GuardianInterceptModalProps> = ({
  result,
  onClose,
  onApplyCorrection,
  onProceedAnyway,
  onSupervisorOverride
}) => {
  const { triggerGuardianVoice } = useApp();
  const [overrideCode, setOverrideCode] = useState('');
  const [overrideError, setOverrideError] = useState(false);
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  if (!result || result.isValid) return null;

  const level = result.warningLevel;
  const metrics = result.historicalMetrics;

  const handleApplySingle = (field: string, val: any) => {
    onApplyCorrection(field, val);
  };

  const handleApplyAll = () => {
    result.recommendedCorrections.forEach(c => {
      onApplyCorrection(c.field, c.suggested_val);
    });
    onClose();
  };

  const handleVerifyOverride = () => {
    // Owner override passcode: e.g. "OWNER" or "9999"
    if (overrideCode.trim().toUpperCase() === 'OWNER' || overrideCode.trim() === '9999') {
      if (onSupervisorOverride) {
        onSupervisorOverride();
      } else if (onProceedAnyway) {
        onProceedAnyway();
      }
      onClose();
    } else {
      setOverrideError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className={`p-5 flex items-start justify-between border-b ${
            level === 4
              ? 'bg-rose-600 text-white border-rose-700'
              : level === 3
              ? 'bg-amber-600 text-white border-amber-700'
              : level === 2
              ? 'bg-orange-600 text-white border-orange-700'
              : 'bg-indigo-600 text-white border-indigo-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-900">
                  AI ওনার গার্ডিয়ান • লেভেল {level}
                </span>
                <span className="text-[11px] font-semibold opacity-90 uppercase">
                  {result.module.toUpperCase()} MODULE INTERCEPT
                </span>
              </div>
              <h3 className="text-base font-black tracking-tight mt-1">
                {result.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {result.voiceAlert && (
              <button
                onClick={() => triggerGuardianVoice(result.voiceAlert!, true)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                title="ভয়েস বার্তা আবার শুনুন"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Main Warnings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>শনাক্তকৃত ডেটা ও আর্থিক ঝুঁকি:</span>
            </h4>
            <div className="space-y-1.5">
              {result.warnings.map((w, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 flex items-start space-x-2"
                >
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">⚠️</span>
                  <span className="leading-relaxed">{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Cross-Referencing Card */}
          {metrics && (
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ঐতিহাসিক লেনদেন ডেটা বিশ্লেষণ (Cross-Reference):</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  মোট চালান: {metrics.totalTransactions} টি
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-medium">ঐতিহাসিক গড় মূল্য</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    ৳{metrics.avgPrice > 0 ? metrics.avgPrice.toLocaleString('en-IN') : 'N/A'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-medium">নিরাপদ মূল্যসীমা</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ৳{metrics.safeMinPrice > 0 ? metrics.safeMinPrice.toLocaleString('en-IN') : 'N/A'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-medium">স্বাভাবিক একক পরিমাণ</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {metrics.avgQuantity} টি (সর্বোচ্চ {metrics.maxSingleQuantity})
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-medium">বর্তমান মজুদ স্টক</div>
                  <div className={`font-bold mt-0.5 ${
                    (metrics.currentAvailableStock ?? 0) <= 0
                      ? 'text-rose-600'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {metrics.currentAvailableStock ?? 'N/A'} টি
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommended Corrections */}
          {result.recommendedCorrections.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>AI প্রস্তাবিত স্বয়ংক্রিয় সংশোধন:</span>
                </h4>
                {result.recommendedCorrections.length > 1 && (
                  <button
                    onClick={handleApplyAll}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>সকল সংশোধন প্রয়োগ করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {result.recommendedCorrections.map((corr, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-emerald-950 dark:text-emerald-200">
                        {corr.reason}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        <span className="line-through text-rose-500">
                          {typeof corr.current_val === 'number'
                            ? `৳${corr.current_val.toLocaleString('en-IN')}`
                            : corr.current_val}
                        </span>
                        <span>➔</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {typeof corr.suggested_val === 'number'
                            ? `৳${corr.suggested_val.toLocaleString('en-IN')}`
                            : corr.suggested_val}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplySingle(corr.field, corr.suggested_val)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
                    >
                      প্রয়োগ করুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supervisor Override Input */}
          {result.blocked && isOverrideMode && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 space-y-2.5 animate-slide-up">
              <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-200 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>মালিক / সুপারভাইজার ওভাররাইড কোড প্রদান করুন:</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={overrideCode}
                  onChange={e => {
                    setOverrideCode(e.target.value);
                    setOverrideError(false);
                  }}
                  placeholder="Master Passcode (e.g. OWNER)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleVerifyOverride}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  অনুমোদন করুন
                </button>
              </div>
              {overrideError && (
                <div className="text-[11px] text-rose-600 font-bold">
                  ভুল কোড! সঠিক মালিক কোড লিখুন অথবা উপরের প্রস্তাবিত মূল্য প্রয়োগ করুন।
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            ফর্মে ফিরে যান ও সংশোধন করুন
          </button>

          <div className="flex items-center space-x-2">
            {!result.blocked && onProceedAnyway && (
              <button
                onClick={() => {
                  onProceedAnyway();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                সতর্কতা মেনে এগিয়ে যান
              </button>
            )}

            {result.blocked && !isOverrideMode && (
              <button
                onClick={() => setIsOverrideMode(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>মালিক ওভাররাইড</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { SmartValidationResult } from '../../types/guardian';
import { AlertTriangle, ShieldAlert, CheckCircle2, Volume2, ArrowRight } from 'lucide-react';

interface SmartEntryValidationBannerProps {
  validation: SmartValidationResult;
  onApplyCorrection?: (field: string, suggestedVal: any) => void;
  onDismiss?: () => void;
  onRequestOverride?: () => void;
}

export const SmartEntryValidationBanner: React.FC<SmartEntryValidationBannerProps> = ({
  validation,
  onApplyCorrection,
  onDismiss,
  onRequestOverride
}) => {
  if (validation.is_valid && validation.warnings.length === 0) return null;

  const level = validation.warning_level || 1;

  return (
    <div
      className={`p-4 rounded-xl border transition-all animate-slide-up shadow-md space-y-3 ${
        level === 4
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30'
          : level === 3
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/80 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/30'
          : level === 2
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-950 dark:text-orange-100'
          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100'
      }`}
    >
      {/* Header with Guardian Shield and Warning Level Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              level === 4
                ? 'bg-rose-600 text-white animate-pulse'
                : level === 3
                ? 'bg-amber-600 text-white'
                : level === 2
                ? 'bg-orange-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs">
              {level === 4
                ? 'AI ওনার গার্ডিয়ান: লেনদেন সাবমিট স্থগিত (Critical Financial Breach)'
                : level === 3
                ? 'AI ওনার গার্ডিয়ান: বারবার ভুল শনাক্ত (Escalated Directive & Owner Alert)'
                : level === 2
                ? 'AI ওনার গার্ডিয়ান: একই ভুলের পুনরাবৃত্তি (Recurrent Error Warning)'
                : 'AI ওনার গার্ডিয়ান: সম্ভাব্য ডেটা অসংগতি শনাক্ত (Smart Validation)'}
            </h4>
            <span className="text-[10px] opacity-80 block">
              {level === 4
                ? 'প্রতিষ্ঠানকে আর্থিক লোকসান থেকে রক্ষা করতে সাবমিট সাময়িকভাবে ব্লক করা হয়েছে।'
                : level === 3
                ? 'এই ব্যবহারকারীর ভুলের সংখ্যা বৃদ্ধি পেয়েছে। মালিকের কাছে সতর্কতা পাঠানো হয়েছে।'
                : level === 2
                ? 'সতর্কতা! একই ধরনের ভুল পূর্বেও করা হয়েছিল। অনুগ্রহ করে যাচাই করুন।'
                : 'সঠিক মূল্য ও হিসাব নিশ্চিত করতে নিচের সতর্কতাগুলো পরীক্ষা করুন।'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
              level === 4
                ? 'bg-rose-600 text-white'
                : level === 3
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            লেভেল {level}
          </span>
          {onDismiss && !validation.blocked && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Warnings List */}
      <div className="space-y-1.5 text-xs pl-2 border-l-2 border-current/30">
        {validation.warnings.map((w, idx) => (
          <div key={idx} className="flex items-start space-x-1.5">
            <span className="font-bold">•</span>
            <span>{w}</span>
          </div>
        ))}
      </div>

      {/* Recommended Corrections */}
      {validation.recommended_corrections.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-current/10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90 block">
            AI প্রস্তাবিত স্বয়ংক্রিয় সংশোধন (Recommended Corrections):
          </span>
          <div className="space-y-1.5">
            {validation.recommended_corrections.map((corr, cIdx) => (
              <div
                key={cIdx}
                className="flex items-center justify-between bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {corr.reason}
                  </span>
                  <div className="text-[10px] font-mono opacity-70">
                    বর্তমান: {corr.current_val} <ArrowRight className="w-2.5 h-2.5 inline" /> প্রস্তাবিত:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {corr.suggested_val}
                    </strong>
                  </div>
                </div>

                {onApplyCorrection && (
                  <button
                    onClick={() => onApplyCorrection(corr.field, corr.suggested_val)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                  >
                    প্রয়োগ করুন
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      {validation.blocked && onRequestOverride && (
        <div className="pt-2 flex items-center justify-between border-t border-rose-300 dark:border-rose-800/60">
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold">
            সুপারভাইজার বা মালিকের বিশেষ অনুমোদন ছাড়া এই লেনদেন সম্পন্ন করা যাবে না।
          </span>
          <button
            onClick={onRequestOverride}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-2xs"
          >
            অনুমোদনের আবেদন পাঠান
          </button>
        </div>
      )}
    </div>
  );
};

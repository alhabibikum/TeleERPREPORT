import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AIService } from '../../services/aiService';
import { AIInsight } from '../../types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Cpu,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export const AIInsightsView: React.FC = () => {
  const { state, t } = useApp();

  const [ruleInsights, setRuleInsights] = useState<AIInsight[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Generate deterministic rule-based factual metrics grounded in actual database
    const insights = AIService.generateRuleBasedInsights(state);
    setRuleInsights(insights);

    // Initial summary
    AIService.generateGeminiExecutiveSummary(state).then(text => {
      setExecutiveSummary(text);
    });
  }, [state]);

  const handleRefreshAI = async () => {
    setLoadingAi(true);
    const text = await AIService.generateGeminiExecutiveSummary(state);
    setExecutiveSummary(text);
    setLoadingAi(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('AI Business Intelligence & Predictive Analytics', 'এআই বিজনেস ইন্টেলিজেন্স ও ব্যবসায়িক অন্তর্দৃষ্টি')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Separation of <strong className="text-emerald-600">Verified Database Facts</strong> vs{' '}
            <strong className="text-indigo-600">Strategic Recommendations</strong>
          </p>
        </div>

        <button
          onClick={handleRefreshAI}
          disabled={loadingAi}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
          <span>Regenerate AI Briefing</span>
        </button>
      </div>

      {/* Gemini Executive Briefing Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-900/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </span>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              Chief Intelligence Officer Executive Synthesis
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Model: Gemini 2.5 Flash / Dynamic Grounding
          </span>
        </div>

        <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans pl-1">
          {executiveSummary}
        </div>
      </div>

      {/* Diagnostic Facts & Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            DIAGNOSTIC FACTUAL FINDINGS & RECOMMENDED REMEDIES
          </h2>
          <span className="text-xs text-slate-400">6 Real-Time Triggers Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ruleInsights.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border shadow-2xs space-y-2.5 transition ${
                item.type === 'fact'
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : item.type === 'alert'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    item.type === 'fact'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.type === 'alert'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  {item.type === 'fact' ? 'Verified Fact' : item.type === 'alert' ? 'Critical Alert' : 'Recommendation'}
                </span>
                {item.metric && (
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {item.metric}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                {item.headline}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.detail}
              </p>

              {item.action_suggestion && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-start space-x-1.5 text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {item.action_suggestion}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

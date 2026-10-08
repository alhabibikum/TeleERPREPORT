import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, AlertTriangle, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { storage } from '../../db/storage';

export const NotificationDrawer: React.FC = () => {
  const { state, isNotificationOpen, setIsNotificationOpen, t } = useApp();

  if (!isNotificationOpen) return null;

  const handleMarkAllRead = () => {
    for (const a of state.alerts) {
      if (!a.is_read) {
        storage.markAlertAsRead(a.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {t('Alerts & Notifications', 'সতর্কবার্তা ও নোটিফিকেশন')}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t('Mark all read', 'সব পড়া হয়েছে')}</span>
            </button>
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {t('No active notifications or alerts.', 'কোন সক্রিয় নোটিফিকেশন নেই।')}
            </div>
          ) : (
            state.alerts.map(alt => (
              <div
                key={alt.id}
                onClick={() => storage.markAlertAsRead(alt.id)}
                className={`p-3 rounded-lg border text-xs transition cursor-pointer ${
                  alt.is_read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                    : alt.severity === 'critical'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-slate-800 dark:text-slate-200'
                    : alt.severity === 'high'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-slate-800 dark:text-slate-200'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 shrink-0">
                    {alt.severity === 'critical' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    ) : alt.severity === 'high' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {alt.title}
                      </span>
                      {!alt.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {alt.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="uppercase font-semibold tracking-wider">
                        {alt.type} • {alt.severity}
                      </span>
                      <span>{new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

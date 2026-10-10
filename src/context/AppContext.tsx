import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, DatabaseState } from '../db/storage';
import { User, Branch, AlertNotification, ApprovalRequest } from '../types';

export type Language = 'en' | 'bn';

interface AppContextType {
  state: DatabaseState;
  activeBranchId: string; // 'all' or specific branch id
  setActiveBranchId: (id: string) => void;
  activeBranch: Branch | undefined;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (val: boolean) => void;
  unreadAlertCount: number;
  pendingApprovalCount: number;
  isAIGuardianOpen: boolean;
  setIsAIGuardianOpen: (val: boolean) => void;
  activeGuardianTab: 'monitor' | 'report' | 'recovery' | 'audit' | 'ledger' | 'settings';
  setActiveGuardianTab: (tab: 'monitor' | 'report' | 'recovery' | 'audit' | 'ledger' | 'settings') => void;
  guardianToast: { title: string; message: string; type: 'info' | 'warning' | 'critical' | 'success' } | null;
  setGuardianToast: (toast: { title: string; message: string; type: 'info' | 'warning' | 'critical' | 'success' } | null) => void;
  triggerGuardianVoice: (text: string, urgent?: boolean) => void;
  t: (key: string, bnText?: string) => string;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

import { aiOwnerGuardian } from '../services/aiOwnerGuardian';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<DatabaseState>(storage.getState());
  const [activeBranchId, setActiveBranchId] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User>(dbState.users[0]); // default to Owner
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isAIGuardianOpen, setIsAIGuardianOpen] = useState<boolean>(false);
  const [activeGuardianTab, setActiveGuardianTab] = useState<'monitor' | 'report' | 'recovery' | 'audit' | 'ledger' | 'settings'>('monitor');
  const [guardianToast, setGuardianToast] = useState<{
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical' | 'success';
  } | null>(null);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setDbState({ ...storage.getState() });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Auto dismiss toast after 6 seconds
  useEffect(() => {
    if (guardianToast) {
      const timer = setTimeout(() => {
        setGuardianToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [guardianToast]);

  // Keyboard shortcut Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerGuardianVoice = (text: string, urgent = false) => {
    aiOwnerGuardian.speak(text, dbState.voiceFeedbackConfig, { urgent });
  };

  const activeBranch = activeBranchId === 'all'
    ? undefined
    : dbState.branches.find(b => b.id === activeBranchId);

  const unreadAlertCount = dbState.alerts.filter(a => !a.is_read).length;
  const pendingApprovalCount = dbState.approvals.filter(a => a.status === 'pending').length;

  const t = (enText: string, bnText?: string): string => {
    if (language === 'bn' && bnText) return bnText;
    return enText;
  };

  const refreshState = () => {
    setDbState({ ...storage.getState() });
  };

  return (
    <AppContext.Provider
      value={{
        state: dbState,
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        currentUser,
        setCurrentUser,
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        unreadAlertCount,
        pendingApprovalCount,
        isAIGuardianOpen,
        setIsAIGuardianOpen,
        activeGuardianTab,
        setActiveGuardianTab,
        guardianToast,
        setGuardianToast,
        triggerGuardianVoice,
        t,
        refreshState
      }}
    >
      <div className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-slate-50 text-slate-900 min-h-screen'}>
        {children}

        {/* Global Floating AI Owner Guardian Toast */}
        {guardianToast && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900 text-white rounded-xl shadow-2xl border border-amber-500/50 p-4 transition-all duration-300 animate-slide-up flex items-start space-x-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              guardianToast.type === 'critical'
                ? 'bg-rose-500 text-white animate-pulse'
                : guardianToast.type === 'warning'
                ? 'bg-amber-500 text-slate-950'
                : guardianToast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-500 text-white'
            }`}>
              <span className="font-extrabold text-xs">AI</span>
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">{guardianToast.title}</span>
                <button
                  onClick={() => setGuardianToast(null)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">{guardianToast.message}</p>
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsAIGuardianOpen(true);
                    setGuardianToast(null);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow-xs"
                >
                  {language === 'bn' ? 'মালিক কনসোলে দেখুন' : 'Open Guardian Console'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

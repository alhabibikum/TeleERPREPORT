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
  t: (key: string, bnText?: string) => string;
  refreshState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<DatabaseState>(storage.getState());
  const [activeBranchId, setActiveBranchId] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User>(dbState.users[0]); // default to Owner Al-Amin Chowdhury
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setDbState({ ...storage.getState() });
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
        t,
        refreshState
      }}
    >
      <div className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-slate-50 text-slate-900 min-h-screen'}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

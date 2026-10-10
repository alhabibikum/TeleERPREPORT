import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  UserCheck,
  ShieldCheck,
  CheckSquare,
  Clock
} from 'lucide-react';
import { Role } from '../../types';

export const TopBar: React.FC = () => {
  const {
    state,
    activeBranchId,
    setActiveBranchId,
    currentUser,
    setCurrentUser,
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    setIsSearchOpen,
    setIsNotificationOpen,
    setIsAIGuardianOpen,
    unreadAlertCount,
    pendingApprovalCount,
    t
  } = useApp();

  const handleRoleChange = (userId: string) => {
    const selected = state.users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      // If user is restricted to a branch, auto switch branch
      if (selected.branch_id) {
        setActiveBranchId(selected.branch_id);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shadow-xs">
      {/* Left: Brand & Branch Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            SG
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {state.company.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              BIN: {state.company.bin_number} • Dhaka, BD
            </p>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="relative pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={activeBranchId}
              onChange={e => setActiveBranchId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">🏢 {t('All Branches (Consolidated)', 'সকল শাখা (একত্রিত)')}</option>
              {state.branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.is_warehouse ? '📦' : '🏬'} {language === 'bn' ? b.bn_name : b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Spacer to push controls to the right */}
      <div className="flex-1" />

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Header AI Button: MUST ONLY DISPLAY "মালিক" */}
        <button
          onClick={() => setIsAIGuardianOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all shadow-xs ring-1 ring-amber-400/60 cursor-pointer tracking-wide"
          title="AI Owner Guardian Console"
        >
          মালিক
        </button>
        {/* Language Switch */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
          title="Switch Language (English / বাংলা)"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'বাংলা' : 'ENG'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications & Alerts */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
          title="Alerts and Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Pending Approvals quick badge */}
        {pendingApprovalCount > 0 && (
          <div className="hidden lg:flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md text-xs border border-amber-200 dark:border-amber-800 font-medium">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{pendingApprovalCount} {t('Pending Approvals', 'অনুমোদন বাকি')}</span>
          </div>
        )}

        {/* Role Simulator Selector */}
        <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
            {currentUser.name.slice(0, 1)}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">
              {currentUser.role.replace('_', ' ')}
            </div>
          </div>
          <select
            value={currentUser.id}
            onChange={e => handleRoleChange(e.target.value)}
            className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-hidden cursor-pointer"
            title="Switch Simulated User / RBAC Role"
          >
            {state.users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  ShoppingCart,
  Receipt,
  Truck,
  Boxes,
  Barcode,
  CalendarCheck,
  CalendarRange,
  FileSpreadsheet,
  BookOpen,
  Scale,
  Users,
  Building,
  DollarSign,
  UserCheck,
  CheckCircle2,
  History,
  DatabaseBackup,
  CreditCard,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export type ActiveTab =
  | 'executive'
  | 'onepage'
  | 'ai_insights'
  | 'pos'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'imei'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'accounting'
  | 'journals'
  | 'pnl_balance'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'branches'
  | 'employees'
  | 'approvals'
  | 'audit'
  | 'backup';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeCount?: number;
  highlight?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const { t, pendingApprovalCount } = useApp();

  const navGroups: NavGroup[] = [
    {
      group: t('Control Center', 'নিয়ন্ত্রণ কেন্দ্র'),
      items: [
        { id: 'executive' as ActiveTab, label: t('Executive Dashboard', 'নির্বাহী ড্যাশবোর্ড'), icon: LayoutDashboard },
        { id: 'onepage' as ActiveTab, label: t('One-Page Owner Control', 'ওয়ান-পেজ ওনার কন্ট্রোল'), icon: Layers, badge: 'Key' },
        { id: 'ai_insights' as ActiveTab, label: t('AI Business Insights', 'এআই বিজনেস ইনসাইট'), icon: Sparkles, badge: 'AI' }
      ]
    },
    {
      group: t('Retail & Inventory', 'রিটেল ও ইনভেন্টরি'),
      items: [
        { id: 'pos' as ActiveTab, label: t('POS Terminal', 'পিওএস বিক্রয় টার্মিনাল'), icon: ShoppingCart, highlight: true },
        { id: 'sales' as ActiveTab, label: t('Sales & Invoices', 'বিক্রয় ও চালান'), icon: Receipt },
        { id: 'purchases' as ActiveTab, label: t('Purchase & Receive', 'ক্রয় ও মালামাল গ্রহণ'), icon: Truck },
        { id: 'inventory' as ActiveTab, label: t('Stock & Inventory', 'মজুদ ও স্টক হিসাব'), icon: Boxes },
        { id: 'imei' as ActiveTab, label: t('IMEI Tracking & Audit', 'আইএমইআই ট্র্যাকিং ও অডিট'), icon: Barcode }
      ]
    },
    {
      group: t('Management Reports', 'ম্যানেজমেন্ট রিপোর্ট'),
      items: [
        { id: 'daily' as ActiveTab, label: t('Daily Management', 'দৈনিক ব্যবস্থাপনা'), icon: CalendarCheck },
        { id: 'weekly' as ActiveTab, label: t('Weekly Management Report', 'সাপ্তাহিক প্রতিবেদন'), icon: CalendarRange },
        { id: 'monthly' as ActiveTab, label: t('Monthly Management Report', 'মাসিক প্রতিবেদন'), icon: FileSpreadsheet }
      ]
    },
    {
      group: t('Accounts & Ledgers', 'হিসাব ও লেজার'),
      items: [
        { id: 'accounting' as ActiveTab, label: t('Chart of Accounts', 'হিসাবের তালিকা (COA)'), icon: BookOpen },
        { id: 'journals' as ActiveTab, label: t('Journal Entries (Double-Entry)', 'জাবেদা এন্ট্রি'), icon: Scale },
        { id: 'pnl_balance' as ActiveTab, label: t('Profit & Loss / Balance Sheet', 'লাভ-ক্ষতি ও ব্যালেন্স শীট'), icon: TrendingUp },
        { id: 'customers' as ActiveTab, label: t('Customer Ledgers & Aging', 'গ্রাহক দেনাদার লেজার'), icon: Users },
        { id: 'suppliers' as ActiveTab, label: t('Supplier Payables', 'সরবরাহকারী পাওনাদার'), icon: Building },
        { id: 'expenses' as ActiveTab, label: t('Expense Vouchers', 'খরচের ভাউচার'), icon: DollarSign }
      ]
    },
    {
      group: t('Administration', 'প্রশাসন ও নিয়ন্ত্রণ'),
      items: [
        { id: 'branches' as ActiveTab, label: t('Branches & Warehouses', 'শাখা ও ওয়্যারহাউজ'), icon: Building },
        { id: 'employees' as ActiveTab, label: t('Employees & Attendance', 'কর্মচারী ও হাজিরা'), icon: UserCheck },
        {
          id: 'approvals' as ActiveTab,
          label: t('Approval Workflow', 'অনুমোদন ওয়ার্কফ্লো'),
          icon: CheckCircle2,
          badgeCount: pendingApprovalCount
        },
        { id: 'audit' as ActiveTab, label: t('Audit Trail', 'অডিট ট্রেইল ও লগ'), icon: History },
        { id: 'backup' as ActiveTab, label: t('Database Safety & Backup', 'ব্যাকআপ ও সিস্টেম রিসেট'), icon: DatabaseBackup }
      ]
    }
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      } no-print`}
    >
      <div className="overflow-y-auto py-3 px-2 flex-1 space-y-4">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {grp.group}
              </div>
            )}
            {grp.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center space-x-1 shrink-0">
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white">
                          {item.badgeCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs transition"
          title="Toggle Sidebar"
        >
          <ChevronRight className={`w-4 h-4 transform transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          {!collapsed && <span className="ml-2">{t('Collapse Sidebar', 'সাইডবার গুটিয়ে নিন')}</span>}
        </button>
      </div>
    </aside>
  );
};

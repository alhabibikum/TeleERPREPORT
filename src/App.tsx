import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';

// Main Views
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { OnePageManagement } from './components/onepage/OnePageManagement';
import { POSTerminal } from './components/pos/POSTerminal';
import { SalesManagement } from './components/sales/SalesManagement';
import { PurchaseManagement } from './components/purchase/PurchaseManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { IMEITrackingView } from './components/inventory/IMEITrackingView';
import { DailyManagementView } from './components/daily/DailyManagementView';
import { WeeklyManagementReportView } from './components/weekly/WeeklyManagementReportView';
import { MonthlyManagementReportView } from './components/monthly/MonthlyManagementReportView';
import { AccountingViews } from './components/accounting/AccountingViews';
import { CustomerSupplierViews } from './components/crm/CustomerSupplierViews';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { EmployeeBranchViews } from './components/hr/EmployeeBranchViews';
import { ApprovalAuditViews } from './components/audit/ApprovalAuditViews';
import { AIInsightsView } from './components/ai/AIInsightsView';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navigation Bar */}
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {activeTab === 'executive' && <ExecutiveDashboard />}
          {activeTab === 'onepage' && <OnePageManagement />}
          {activeTab === 'ai_insights' && <AIInsightsView />}
          {activeTab === 'pos' && <POSTerminal />}
          {activeTab === 'sales' && <SalesManagement />}
          {activeTab === 'purchases' && <PurchaseManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'imei' && <IMEITrackingView />}
          {activeTab === 'daily' && <DailyManagementView />}
          {activeTab === 'weekly' && <WeeklyManagementReportView />}
          {activeTab === 'monthly' && <MonthlyManagementReportView />}
          {activeTab === 'accounting' && <AccountingViews viewMode="chart_of_accounts" />}
          {activeTab === 'journals' && <AccountingViews viewMode="journals" />}
          {activeTab === 'pnl_balance' && <AccountingViews viewMode="pnl_balance" />}
          {activeTab === 'customers' && <CustomerSupplierViews mode="customers" />}
          {activeTab === 'suppliers' && <CustomerSupplierViews mode="suppliers" />}
          {activeTab === 'expenses' && <ExpenseManagement />}
          {activeTab === 'branches' && <EmployeeBranchViews mode="branches" />}
          {activeTab === 'employees' && <EmployeeBranchViews mode="employees" />}
          {activeTab === 'approvals' && <ApprovalAuditViews mode="approvals" />}
          {activeTab === 'audit' && <ApprovalAuditViews mode="audit" />}
          {activeTab === 'backup' && <ApprovalAuditViews mode="backup" />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <NotificationDrawer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

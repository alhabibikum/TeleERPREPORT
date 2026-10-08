import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { Employee, Branch, AttendanceRecord } from '../../types';
import {
  Users,
  Building,
  UserCheck,
  Plus,
  Clock,
  Award,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EmployeeBranchViewsProps {
  mode: 'employees' | 'branches';
}

export const EmployeeBranchViews: React.FC<EmployeeBranchViewsProps> = ({ mode }) => {
  const { state, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance'>('employees');

  // Attendance quick marking
  const handleMarkAttendance = (empId: string, status: AttendanceRecord['status']) => {
    storage.recordAttendance(empId, status);
  };

  const todayStr = '2026-10-08';

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            {mode === 'employees' ? (
              <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {mode === 'employees'
                ? t('Employees, Attendance & Sales Performance', 'কর্মকর্তা-কর্মচারী, হাজিরা ও পারফরম্যান্স')
                : t('Branch Stores & Warehouses Directory', 'শাখা শোরুম ও ওয়্যারহাউজ ব্যবস্থাপনা')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'employees'
              ? `Total Staff: ${state.employees.length} Employees Across 4 Locations`
              : `Total Physical Outlets: ${state.branches.length} (3 Showrooms + 1 Central Depot)`}
          </p>
        </div>

        {mode === 'employees' && (
          <div className="flex gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'employees'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
              }`}
            >
              Employee Directory
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'attendance'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
              }`}
            >
              Daily Attendance Sheet
            </button>
          </div>
        )}
      </div>

      {/* BRANCHES VIEW */}
      {mode === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.branches.map(br => {
            const branchSales = state.sales.filter(s => s.branch_id === br.id && s.status === 'posted');
            const totalBranchSales = branchSales.reduce((s, x) => s + x.total_amount, 0);
            const branchImeis = state.imeis.filter(i => i.branch_id === br.id && i.status === 'in_stock');

            return (
              <div
                key={br.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold block">{br.code}</span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">{br.name}</h3>
                    <p className="text-xs text-slate-400 font-sans">{br.bn_name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    br.is_warehouse ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {br.is_warehouse ? 'Depot' : 'Showroom'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Address: {br.address}</div>
                  <div>Manager: <strong>{br.manager_name}</strong> • Phone: {br.phone}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-[10px] text-slate-400 block">Cash Balance</span>
                    <strong className="text-slate-900 dark:text-white">৳{br.cash_balance.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-[10px] text-slate-400 block">In-Stock Handsets</span>
                    <strong className="text-indigo-600">{branchImeis.length} Units</strong>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-[10px] text-slate-400 block">Total Sales</span>
                    <strong className="text-emerald-600">৳{totalBranchSales.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPLOYEES VIEW */}
      {mode === 'employees' && activeTab === 'employees' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b">
              <tr>
                <th className="p-3">Staff ID & Name</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Branch Location</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-right">Monthly Target</th>
                <th className="p-3 text-right">Current Sales</th>
                <th className="p-3 text-right">Achievement %</th>
                <th className="p-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{emp.emp_id}</div>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                  <td className="p-3 text-slate-500">{emp.branch_name}</td>
                  <td className="p-3 text-slate-500">{emp.phone}</td>
                  <td className="p-3 text-right font-mono">৳{emp.monthly_target.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ৳{emp.monthly_sales.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600">{emp.achievement_rate}%</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-800">
                      {emp.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ATTENDANCE VIEW */}
      {mode === 'employees' && activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              DAILY STAFF ATTENDANCE SHEET ({todayStr})
            </h3>
            <span className="text-xs text-slate-400">Mark Present, Late or Leave</span>
          </div>

          <div className="space-y-2">
            {state.employees.map(emp => {
              const record = state.attendance.find(a => a.employee_id === emp.id && a.date === todayStr);

              return (
                <div
                  key={emp.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.designation} • {emp.branch_name}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {record && (
                      <span className="font-mono text-slate-400 text-[11px] mr-2">
                        In: {record.in_time || 'Recorded'}
                      </span>
                    )}

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMarkAttendance(emp.id, 'present')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          record?.status === 'present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-700 border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(emp.id, 'late')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          record?.status === 'late'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white dark:bg-slate-700 border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(emp.id, 'leave')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          record?.status === 'leave'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

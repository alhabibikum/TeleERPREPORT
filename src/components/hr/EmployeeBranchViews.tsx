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
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Search
} from 'lucide-react';

interface EmployeeBranchViewsProps {
  mode: 'employees' | 'branches';
}

export const EmployeeBranchViews: React.FC<EmployeeBranchViewsProps> = ({ mode }) => {
  const { state, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance'>('employees');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [empName, setEmpName] = useState('');
  const [empDesignation, setEmpDesignation] = useState('Sales Executive');
  const [empBranchId, setEmpBranchId] = useState('br_1');
  const [empPhone, setEmpPhone] = useState('');
  const [empTarget, setEmpTarget] = useState<number>(300000);
  const [empSalary, setEmpSalary] = useState<number>(25000);

  // Branch Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [brName, setBrName] = useState('');
  const [brBnName, setBrBnName] = useState('');
  const [brCode, setBrCode] = useState('');
  const [brAddress, setBrAddress] = useState('');
  const [brPhone, setBrPhone] = useState('');
  const [brManager, setBrManager] = useState('');
  const [brIsWarehouse, setBrIsWarehouse] = useState(false);

  // Filtering
  const filteredEmployees = state.employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return !q || e.name.toLowerCase().includes(q) || e.phone.includes(q) || e.designation.toLowerCase().includes(q);
  });

  const filteredBranches = state.branches.filter(b => {
    const q = searchQuery.toLowerCase();
    return !q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
  });

  // Open Add Employee
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpDesignation('Sales Executive');
    setEmpBranchId(state.branches[0]?.id || 'br_1');
    setEmpPhone('');
    setEmpTarget(300000);
    setEmpSalary(25000);
    setIsEmployeeModalOpen(true);
  };

  // Open Edit Employee
  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpDesignation(emp.designation);
    setEmpBranchId(emp.branch_id);
    setEmpPhone(emp.phone);
    setEmpTarget(emp.monthly_target);
    setEmpSalary(emp.salary);
    setIsEmployeeModalOpen(true);
  };

  // Save Employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    const branch = state.branches.find(b => b.id === empBranchId);
    const branchName = branch ? branch.name : 'Main Branch';

    if (editingEmployee) {
      storage.updateEmployee(editingEmployee.id, {
        name: empName,
        designation: empDesignation,
        branch_id: empBranchId,
        branch_name: branchName,
        phone: empPhone,
        monthly_target: Number(empTarget),
        salary: Number(empSalary)
      });
    } else {
      storage.addEmployee({
        name: empName,
        designation: empDesignation,
        branch_id: empBranchId,
        branch_name: branchName,
        phone: empPhone,
        monthly_target: Number(empTarget),
        monthly_sales: 0,
        achievement_rate: 0,
        rating: 'A',
        salary: Number(empSalary),
        joining_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    }

    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  // Delete Employee
  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete employee "${name}"?`)) {
      storage.deleteEmployee(id);
    }
  };

  // Open Add Branch
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBrName('');
    setBrBnName('');
    setBrCode(`BR-0${state.branches.length + 1}`);
    setBrAddress('');
    setBrPhone('');
    setBrManager(currentUser.name);
    setBrIsWarehouse(false);
    setIsBranchModalOpen(true);
  };

  // Open Edit Branch
  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBrName(b.name);
    setBrBnName(b.bn_name);
    setBrCode(b.code);
    setBrAddress(b.address);
    setBrPhone(b.phone);
    setBrManager(b.manager_name);
    setBrIsWarehouse(b.is_warehouse || false);
    setIsBranchModalOpen(true);
  };

  // Save Branch
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName) return;

    if (editingBranch) {
      storage.updateBranch(editingBranch.id, {
        name: brName,
        bn_name: brBnName,
        code: brCode,
        address: brAddress,
        phone: brPhone,
        manager_name: brManager,
        is_warehouse: brIsWarehouse
      });
    } else {
      storage.addBranch({
        code: brCode || `BR-${Date.now().toString().slice(-3)}`,
        name: brName,
        bn_name: brBnName || brName,
        address: brAddress,
        phone: brPhone,
        manager_id: currentUser.id,
        manager_name: brManager,
        is_warehouse: brIsWarehouse,
        cash_balance: 0
      });
    }

    setIsBranchModalOpen(false);
    setEditingBranch(null);
  };

  // Delete Branch
  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete branch "${name}"?`)) {
      const res = storage.deleteBranch(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Attendance quick marking
  const handleMarkAttendance = (empId: string, status: AttendanceRecord['status']) => {
    storage.recordAttendance(empId, status);
  };

  const todayStr = new Date().toISOString().split('T')[0];

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
              ? `Total Staff: ${state.employees.length} Employees Across ${state.branches.length} Locations`
              : `Total Physical Outlets: ${state.branches.length} Showrooms & Depots`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === 'employees' ? (
            <button
              onClick={handleOpenAddEmployee}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Add New Employee', 'নতুন কর্মচারী যোগ করুন')}</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddBranch}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Add New Branch / Depot', 'নতুন শাখা / ওয়্যারহাউজ')}</span>
            </button>
          )}

          {mode === 'employees' && (
            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  activeTab === 'employees'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
                }`}
              >
                Employee Directory
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  activeTab === 'attendance'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
                }`}
              >
                Daily Attendance Sheet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={mode === 'employees' ? 'Search employee by name, phone...' : 'Search branch by name, code...'}
          className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
        />
      </div>

      {/* BRANCHES VIEW */}
      {mode === 'branches' && (
        <div className="space-y-4">
          {filteredBranches.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border space-y-2">
              <Building className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No branches registered.</p>
              <button
                onClick={handleOpenAddBranch}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
              >
                Add Head Office Branch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBranches.map(br => {
                const branchSales = state.sales.filter(s => s.branch_id === br.id && s.status === 'posted');
                const totalBranchSales = branchSales.reduce((s, x) => s + (x.total_amount ?? 0), 0);
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
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          br.is_warehouse ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {br.is_warehouse ? 'Depot' : 'Showroom'}
                        </span>
                        <button
                          onClick={() => handleOpenEditBranch(br)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!br.is_head_office && (
                          <button
                            onClick={() => handleDeleteBranch(br.id, br.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>Address: {br.address || 'Dhaka'}</div>
                      <div>Manager: <strong>{br.manager_name}</strong> • Phone: {br.phone}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <span className="text-[10px] text-slate-400 block">Cash Balance</span>
                        <strong className="text-slate-900 dark:text-white">৳{(br.cash_balance ?? 0).toLocaleString('en-IN')}</strong>
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
        </div>
      )}

      {/* EMPLOYEES VIEW */}
      {mode === 'employees' && activeTab === 'employees' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {state.employees.length === 0
                  ? t('No employees found. Clean slate database.', 'কোন কর্মচারী নেই। ফ্রেশ ডাটাবেজ।')
                  : 'No matching employees found.'}
              </p>
              <button
                onClick={handleOpenAddEmployee}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Employee</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{emp.emp_id}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                      <td className="p-3 text-slate-500">{emp.branch_name}</td>
                      <td className="p-3 text-slate-500">{emp.phone}</td>
                      <td className="p-3 text-right font-mono">৳{(emp.monthly_target ?? 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ৳{(emp.monthly_sales ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">{emp.achievement_rate ?? 0}%</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-800">
                          {emp.rating || 'A'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEditEmployee(emp)}
                            className="p-1 text-slate-500 hover:text-blue-600 transition"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            {state.employees.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No employees available for attendance.</p>
            ) : (
              state.employees.map(emp => {
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
                      <span className="text-[11px] text-slate-500">
                        Status:{' '}
                        <strong className="text-emerald-600 uppercase">{record?.status || 'Not Marked'}</strong>
                        {record?.in_time && ` (${record.in_time})`}
                      </span>
                      <button
                        onClick={() => handleMarkAttendance(emp.id, 'present')}
                        className="px-2 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(emp.id, 'late')}
                        className="px-2 py-1 bg-amber-500 text-white rounded font-bold hover:bg-amber-600"
                      >
                        Late
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(emp.id, 'leave')}
                        className="px-2 py-1 bg-rose-500 text-white rounded font-bold hover:bg-rose-600"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>{editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsEmployeeModalOpen(false);
                  setEditingEmployee(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={e => setEmpName(e.target.value)}
                  placeholder="e.g. Mehedi Hasan"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Designation</label>
                  <input
                    type="text"
                    required
                    value={empDesignation}
                    onChange={e => setEmpDesignation(e.target.value)}
                    placeholder="e.g. Senior Sales Executive"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Branch</label>
                  <select
                    value={empBranchId}
                    onChange={e => setEmpBranchId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    {state.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={empPhone}
                  onChange={e => setEmpPhone(e.target.value)}
                  placeholder="e.g. 01719-876543"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Monthly Sales Target (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={empTarget}
                    onChange={e => setEmpTarget(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Base Salary (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={empSalary}
                    onChange={e => setEmpSalary(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmployeeModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
                >
                  {editingEmployee ? 'Update Profile' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>{editingBranch ? 'Edit Branch Outlet' : 'Add New Branch / Warehouse'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsBranchModalOpen(false);
                  setEditingBranch(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Branch Name (English) *</label>
                <input
                  type="text"
                  required
                  value={brName}
                  onChange={e => setBrName(e.target.value)}
                  placeholder="e.g. Dhanmondi Showroom"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">শাখার নাম (বাংলা)</label>
                <input
                  type="text"
                  value={brBnName}
                  onChange={e => setBrBnName(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি শাখা"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={brCode}
                    onChange={e => setBrCode(e.target.value)}
                    placeholder="e.g. BR-05"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Outlet Type</label>
                  <select
                    value={brIsWarehouse ? 'warehouse' : 'showroom'}
                    onChange={e => setBrIsWarehouse(e.target.value === 'warehouse')}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="showroom">Retail Showroom</option>
                    <option value="warehouse">Central Depot / Warehouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Address Location</label>
                <input
                  type="text"
                  value={brAddress}
                  onChange={e => setBrAddress(e.target.value)}
                  placeholder="e.g. Road 27, Dhanmondi, Dhaka"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={brPhone}
                    onChange={e => setBrPhone(e.target.value)}
                    placeholder="e.g. 01711-000000"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Branch Manager</label>
                  <input
                    type="text"
                    value={brManager}
                    onChange={e => setBrManager(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsBranchModalOpen(false);
                    setEditingBranch(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
                >
                  {editingBranch ? 'Update Outlet' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

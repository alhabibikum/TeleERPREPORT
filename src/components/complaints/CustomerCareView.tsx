import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { CustomerComplaint } from '../../types';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Phone,
  Search,
  Filter,
  Trash2
} from 'lucide-react';

export const CustomerCareView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<CustomerComplaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Form State
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cCategory, setCCategory] = useState<CustomerComplaint['category']>('device_fault');
  const [cPriority, setCPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [cSubject, setCSubject] = useState('');
  const [cDesc, setCDesc] = useState('');

  const complaints = state.complaints.filter(c => {
    if (activeBranchId !== 'all' && c.branch_id !== activeBranchId) return false;
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cSubject) return;

    storage.createCustomerComplaint({
      customer_name: cName,
      customer_phone: cPhone,
      branch_id: activeBranchId === 'all' ? 'br_1' : activeBranchId,
      branch_name: activeBranchId === 'all' ? 'Motijheel Flagship Store' : state.branches.find(b => b.id === activeBranchId)?.name || 'Store',
      category: cCategory,
      subject: cSubject,
      description: cDesc,
      priority: cPriority,
      status: 'open'
    });

    setIsNewTicketOpen(false);
    setCName('');
    setCPhone('');
    setCSubject('');
    setCDesc('');
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !resolutionText) return;

    storage.resolveComplaint(selectedComplaint.id, resolutionText);
    setSelectedComplaint(null);
    setResolutionText('');
  };

  const handleDeleteTicket = (id: string, ticketNo: string) => {
    if (confirm(`Are you sure you want to delete complaint ticket "${ticketNo}"?`)) {
      storage.deleteCustomerComplaint(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquareWarning className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Customer Complaints & Support Ticket Desk', 'গ্রাহক অভিযোগ ও সেবা সহায়তা ডেস্ক')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Complaints: <strong>{complaints.filter(c => c.status !== 'resolved').length} Open</strong> • Resolved:{' '}
            <strong className="text-emerald-600">{complaints.filter(c => c.status === 'resolved').length}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log New Complaint Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <MessageSquareWarning className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {t('No customer complaints logged. All customers satisfied.', 'কোন অভিযোগ জমা নেই। ফ্রেশ ডাটাবেজ।')}
            </p>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Ticket</span>
            </button>
          </div>
        ) : (
          complaints.map(cmp => (
            <div
              key={cmp.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {cmp.ticket_no}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    cmp.priority === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : cmp.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {cmp.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400">• {cmp.branch_name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    cmp.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : cmp.status === 'investigating'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {cmp.status}
                  </span>

                  {cmp.status !== 'resolved' && (
                    <button
                      onClick={() => setSelectedComplaint(cmp)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                    >
                      Resolve Ticket
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTicket(cmp.id, cmp.ticket_no)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete Complaint Ticket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">{cmp.subject}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {cmp.description}
              </p>
            </div>

            {cmp.resolution_notes && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                <strong>Resolution Log:</strong> {cmp.resolution_notes}
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Customer: <strong>{cmp.customer_name}</strong> ({cmp.customer_phone})</span>
              <span>Logged: {new Date(cmp.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <MessageSquareWarning className="w-4 h-4 text-rose-600" />
              <span>Log Customer Complaint Ticket</span>
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={e => setCName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={cPhone}
                    onChange={e => setCPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Complaint Category</label>
                  <select
                    value={cCategory}
                    onChange={e => setCCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="device_fault">Hardware Device Fault</option>
                    <option value="delayed_warranty">Delayed Warranty Service</option>
                    <option value="billing">Billing / Credit Ledger Dispute</option>
                    <option value="staff_behavior">Staff / Service Behavior</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Urgency / Priority</label>
                  <select
                    value={cPriority}
                    onChange={e => setCPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Subject Headline *</label>
                <input
                  type="text"
                  required
                  value={cSubject}
                  onChange={e => setCSubject(e.target.value)}
                  placeholder="e.g. S24 Ultra screen cracked within warranty claim"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Detailed Description</label>
                <textarea
                  rows={3}
                  value={cDesc}
                  onChange={e => setCDesc(e.target.value)}
                  placeholder="Full background and customer remarks..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 text-white font-bold rounded"
                >
                  Submit Complaint Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Ticket Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Resolve Complaint {selectedComplaint.ticket_no}</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Subject: <strong>{selectedComplaint.subject}</strong> ({selectedComplaint.customer_name})
            </p>

            <form onSubmit={handleResolveTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Resolution Actions Taken *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  placeholder="Explain how the issue was investigated and customer satisfied..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded"
                >
                  Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

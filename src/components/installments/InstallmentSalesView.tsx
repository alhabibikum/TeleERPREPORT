import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { InstallmentAgreement, IMEIDevice } from '../../types';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  FileText,
  User,
  Smartphone,
  Calendar,
  X,
  Send,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Percent,
  Trash2
} from 'lucide-react';

export const InstallmentSalesView: React.FC = () => {
  const { state, activeBranchId, currentUser, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<InstallmentAgreement | null>(null);

  // New Agreement Modal
  const [isNewAgreementModalOpen, setIsNewAgreementModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNid, setCustNid] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('');
  const [guarantorNid, setGuarantorNid] = useState('');
  const [selectedImeiId, setSelectedImeiId] = useState('');
  const [downPayment, setDownPayment] = useState(20000);
  const [tenureMonths, setTenureMonths] = useState(6);
  const [interestPercent, setInterestPercent] = useState(0);

  // Collect Payment Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectAgreement, setCollectAgreement] = useState<InstallmentAgreement | null>(null);
  const [collectInstallmentNo, setCollectInstallmentNo] = useState<number>(1);
  const [collectMethod, setCollectMethod] = useState<'cash' | 'bkash' | 'bank'>('cash');
  const [collectSuccessMsg, setCollectSuccessMsg] = useState(false);

  // Available in-stock IMEIs for selling
  const availableImeis = state.imeis.filter(i => {
    if (activeBranchId !== 'all' && i.branch_id !== activeBranchId) return false;
    return i.status === 'in_stock';
  });

  const selectedImeiObj = state.imeis.find(i => i.id === selectedImeiId);
  const selectedCashPrice = selectedImeiObj ? selectedImeiObj.selling_price : 0;
  const financedAmount = Math.max(0, selectedCashPrice - downPayment);
  const totalMarkup = (financedAmount * interestPercent) / 100;
  const totalPayableWithDown = selectedCashPrice + totalMarkup;
  const monthlyAmount = tenureMonths > 0 ? (financedAmount + totalMarkup) / tenureMonths : 0;

  // Filter agreements
  const filteredAgreements = state.installments.filter(a => {
    if (activeBranchId !== 'all' && a.branch_id !== activeBranchId) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      a.agreement_no.toLowerCase().includes(q) ||
      a.customer_name.toLowerCase().includes(q) ||
      a.customer_phone.includes(q) ||
      a.imei.includes(q) ||
      a.product_name.toLowerCase().includes(q)
    );
  });

  // KPI calculations
  const totalActivePlans = state.installments.filter(a => a.status === 'active').length;
  const totalOutstanding = state.installments
    .filter(a => a.status === 'active')
    .reduce((sum, a) => sum + a.remaining_due, 0);
  const totalCollected = state.installments.reduce((sum, a) => sum + a.total_paid, 0);

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImeiObj || !custName || !custPhone || !custNid) return;

    // Generate schedule
    const scheduleItems = [];
    const now = new Date();
    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(now.getFullYear(), now.getMonth() + i, 10);
      scheduleItems.push({
        installment_no: i,
        due_date: dueDate.toISOString().split('T')[0],
        amount: Math.round(monthlyAmount),
        status: 'pending' as const
      });
    }

    const branch = state.branches.find(b => b.id === (activeBranchId === 'all' ? selectedImeiObj.branch_id : activeBranchId)) || state.branches[0];

    storage.createInstallmentAgreement({
      customer_id: 'cust_' + Date.now(),
      customer_name: custName,
      customer_phone: custPhone,
      customer_nid: custNid,
      guarantor_name: guarantorName || 'N/A',
      guarantor_phone: guarantorPhone || 'N/A',
      guarantor_relation: guarantorRelation || 'Relative',
      guarantor_nid: guarantorNid,
      product_id: selectedImeiObj.product_id,
      product_name: selectedImeiObj.product_name,
      imei: selectedImeiObj.imei1,
      branch_id: branch.id,
      branch_name: branch.name,
      cash_price: selectedCashPrice,
      down_payment: downPayment,
      financed_amount: financedAmount,
      interest_rate_percent: interestPercent,
      total_installments: tenureMonths,
      monthly_amount: Math.round(monthlyAmount),
      total_payable: Math.round(totalPayableWithDown),
      total_paid: downPayment,
      remaining_due: Math.round(totalPayableWithDown - downPayment),
      start_date: now.toISOString().split('T')[0],
      status: 'active',
      schedule: scheduleItems
    });

    setIsNewAgreementModalOpen(false);
    // Reset inputs
    setCustName('');
    setCustPhone('');
    setCustNid('');
    setGuarantorName('');
    setGuarantorPhone('');
    setSelectedImeiId('');
  };

  const handleDeleteAgreement = (id: string, agreementNo: string) => {
    if (confirm(`Are you sure you want to delete installment agreement "${agreementNo}"? Handset status will be restored.`)) {
      storage.deleteInstallmentAgreement(id);
    }
  };

  const handleOpenCollectModal = (ag: InstallmentAgreement) => {
    setCollectAgreement(ag);
    const nextPending = ag.schedule.find(s => s.status === 'pending' || s.status === 'overdue');
    setCollectInstallmentNo(nextPending ? nextPending.installment_no : 1);
    setIsCollectModalOpen(true);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectAgreement) return;

    const item = collectAgreement.schedule.find(s => s.installment_no === collectInstallmentNo);
    const amt = item ? item.amount : collectAgreement.monthly_amount;

    storage.collectInstallmentPayment(
      collectAgreement.id,
      collectInstallmentNo,
      amt,
      collectMethod
    );

    // Also send SMS receipt log
    storage.sendSMSNotification({
      recipient_phone: collectAgreement.customer_phone,
      customer_name: collectAgreement.customer_name,
      template_type: 'payment_receipt',
      message: `Dear ${collectAgreement.customer_name}, Received installment #${collectInstallmentNo} of BDT ${amt.toLocaleString('en-IN')} for agreement ${collectAgreement.agreement_no}. Remaining due: BDT ${(collectAgreement.remaining_due - amt).toLocaleString('en-IN')}. Thank you!`,
      channel: 'sms',
      status: 'delivered'
    });

    setIsCollectModalOpen(false);
    setCollectSuccessMsg(true);
    setTimeout(() => setCollectSuccessMsg(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('Installment & EMI Sales Tracker', 'কিস্তি ও ইএমআই বিক্রয় ব্যবস্থাপনা')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'Manage 0% bank EMI and store installment plans, guarantor records, monthly repayment schedules & print legal agreements.',
              '০% ব্যাংক ইএমআই ও নিজস্ব শোরুম কিস্তি চুক্তি, জামিনদার তথ্য, মাসিক কিস্তি আদায় ও লিগ্যাল এগ্রিমেন্ট।'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsNewAgreementModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('New EMI Agreement', 'নতুন কিস্তি চুক্তি তৈরি')}</span>
        </button>
      </div>

      {collectSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t('Installment payment collected successfully & SMS receipt sent to customer!', 'কিস্তির টাকা সফলভাবে জমা হয়েছে এবং গ্রাহককে এসএমএস রসিদ পাঠানো হয়েছে!')}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t('Active EMI Agreements', 'চলমান কিস্তি চুক্তি')}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalActivePlans} {t('Contracts', 'টি চুক্তি')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t('Total Financed Due', 'মোট বকেয়া কিস্তির মূলধন')}</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">৳{totalOutstanding.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t('Total Recovered Amount', 'মোট আদায়কৃত কিস্তি')}</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">৳{totalCollected.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('Search Agreement #, Customer, Phone, IMEI...', 'চুক্তি নং, গ্রাহকের নাম, ফোন, আইএমইআই...')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'active', 'overdue', 'completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'all' ? t('All', 'সকল') : st === 'active' ? t('Active', 'চলমান') : st === 'overdue' ? t('Overdue', 'মেয়াদোত্তীর্ণ') : t('Completed', 'পরিশোধিত')}
            </button>
          ))}
        </div>
      </div>

      {/* Agreements Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                <th className="py-3 px-4">{t('Agreement No', 'চুক্তি নং')}</th>
                <th className="py-3 px-4">{t('Customer & Guarantor', 'গ্রাহক ও জামিনদার')}</th>
                <th className="py-3 px-4">{t('Device & IMEI', 'ডিভাইস ও আইএমইআই')}</th>
                <th className="py-3 px-4">{t('Price & Down Pay', 'মূল্য ও ডাউনপেমেন্ট')}</th>
                <th className="py-3 px-4">{t('Tenure & Monthly', 'কিস্তির হার')}</th>
                <th className="py-3 px-4">{t('Repayment Progress', 'পরিশোধের অগ্রগতি')}</th>
                <th className="py-3 px-4">{t('Status', 'অবস্থা')}</th>
                <th className="py-3 px-4 text-right">{t('Actions', 'অ্যাকশন')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAgreements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {t('No installment records found matching criteria.', 'কোন কিস্তি চুক্তি পাওয়া যায়নি।')}
                  </td>
                </tr>
              ) : (
                filteredAgreements.map(ag => {
                  const paidCount = ag.schedule.filter(s => s.status === 'paid').length;
                  const percentPaid = Math.round((ag.total_paid / ag.total_payable) * 100);

                  return (
                    <tr key={ag.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {ag.agreement_no}
                        <div className="text-[10px] text-slate-400 font-normal">{ag.start_date}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{ag.customer_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ag.customer_phone}</div>
                        <div className="text-[10px] text-slate-400">
                          G: {ag.guarantor_name} ({ag.guarantor_relation})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{ag.product_name}</div>
                        <div className="text-[10px] font-mono text-slate-500">IMEI: {ag.imei}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>৳{ag.cash_price.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-emerald-600">DP: ৳{ag.down_payment.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">৳{ag.monthly_amount.toLocaleString('en-IN')}/mo</div>
                        <div className="text-[10px] text-slate-500">{ag.total_installments} Months ({ag.interest_rate_percent}% markup)</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{paidCount}/{ag.total_installments} Paid</span>
                            <span>{percentPaid}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400">Due: ৳{ag.remaining_due.toLocaleString('en-IN')}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ag.status === 'active'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : ag.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {ag.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {ag.status === 'active' && (
                            <button
                              onClick={() => handleOpenCollectModal(ag)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-medium transition"
                            >
                              {t('Collect', 'টাকা জমা')}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAgreement(ag)}
                            className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Schedule & Legal Agreement"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgreement(ag.id, ag.agreement_no)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete Agreement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Installment Payment Modal */}
      {isCollectModalOpen && collectAgreement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t('Collect Monthly Installment', 'মাসিক কিস্তি গ্রহণ')}
                </h3>
                <div className="text-xs text-slate-500 font-mono">{collectAgreement.agreement_no} - {collectAgreement.customer_name}</div>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">{t('Select Installment Number', 'কিস্তি নম্বর বাছাই করুন')}</label>
                <select
                  value={collectInstallmentNo}
                  onChange={e => setCollectInstallmentNo(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {collectAgreement.schedule.map(s => (
                    <option key={s.installment_no} value={s.installment_no} disabled={s.status === 'paid'}>
                      Installment #{s.installment_no} - ৳{s.amount.toLocaleString('en-IN')} (Due: {s.due_date}) {s.status === 'paid' ? ' - [ALREADY PAID]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">{t('Payment Method', 'টাকা জমার মাধ্যম')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'bkash', 'bank'] as const).map(pm => (
                    <button
                      type="button"
                      key={pm}
                      onClick={() => setCollectMethod(pm)}
                      className={`p-2 rounded-lg border font-medium text-center uppercase ${
                        collectMethod === pm
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 flex justify-between items-center">
                <span>{t('Amount to be Collected:', 'জমাযোগ্য টাকার পরিমাণ:')}</span>
                <span className="font-bold text-sm">৳{collectAgreement.monthly_amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                >
                  {t('Confirm & Print Receipt', 'নিশ্চিত করুন ও মানি রিসিট')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Agreement Modal */}
      {isNewAgreementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('Create New Installment / EMI Agreement', 'নতুন কিস্তি / ইএমআই চুক্তি তৈরি')}
                </h3>
                <div className="text-xs text-slate-500">
                  {t('Assign handset IMEI, set down payment, installment tenure & guarantor details.', 'হ্যান্ডসেট আইএমইআই, ডাউনপেমেন্ট, কিস্তির মেয়াদ ও জামিনদার তথ্য যুক্ত করুন।')}
                </div>
              </div>
              <button onClick={() => setIsNewAgreementModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgreement} className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>{t('Customer Information', 'গ্রাহকের তথ্য')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-0.5">{t('Customer Name *', 'গ্রাহকের নাম *')}</label>
                    <input
                      required
                      type="text"
                      value={custName}
                      onChange={e => setCustName(e.target.value)}
                      placeholder="e.g. Mahfuzur Rahman"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">{t('Phone Number *', 'মোবাইল নম্বর *')}</label>
                    <input
                      required
                      type="text"
                      value={custPhone}
                      onChange={e => setCustPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">{t('National ID (NID) *', 'জাতীয় পরিচয়পত্র (NID) *')}</label>
                    <input
                      required
                      type="text"
                      value={custNid}
                      onChange={e => setCustNid(e.target.value)}
                      placeholder="10/17 digit NID"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor Info */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>{t('Guarantor / Reference Information', 'জামিনদার বা রেফারেন্সের তথ্য')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-0.5">{t('Guarantor Name', 'জামিনদারের নাম')}</label>
                    <input
                      type="text"
                      value={guarantorName}
                      onChange={e => setGuarantorName(e.target.value)}
                      placeholder="e.g. Abdul Karim"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">{t('Guarantor Phone', 'জামিনদারের মোবাইল')}</label>
                    <input
                      type="text"
                      value={guarantorPhone}
                      onChange={e => setGuarantorPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">{t('Relationship / Profession', 'সম্পর্ক / পেশা')}</label>
                    <input
                      type="text"
                      value={guarantorRelation}
                      onChange={e => setGuarantorRelation(e.target.value)}
                      placeholder="Brother / Banker"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Handset Selection */}
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">{t('Select In-Stock Handset & IMEI *', 'স্টকের হ্যান্ডসেট ও আইএমইআই বাছাই *')}</label>
                <select
                  required
                  value={selectedImeiId}
                  onChange={e => setSelectedImeiId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  <option value="">{t('-- Choose In-Stock Phone --', '-- বিক্রয়যোগ্য স্টক বাছাই করুন --')}</option>
                  {availableImeis.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.product_name} - ({i.model}) | IMEI: {i.imei1} | MRP: ৳{i.selling_price.toLocaleString('en-IN')} ({i.branch_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Finance Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">{t('Down Payment (৳)', 'ডাউনপেমেন্ট (৳)')}</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={e => setDownPayment(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">{t('Tenure (Months)', 'কিস্তির মেয়াদ (মাস)')}</label>
                  <select
                    value={tenureMonths}
                    onChange={e => setTenureMonths(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={9}>9 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={18}>18 Months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">{t('Markup / Interest (%)', 'সুদ / মার্কআপ (%)')}</label>
                  <input
                    type="number"
                    value={interestPercent}
                    onChange={e => setInterestPercent(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Calculated Summary Banner */}
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-indigo-950 dark:text-indigo-200">
                <div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400">Total Price:</div>
                  <div className="font-bold">৳{selectedCashPrice.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400">Financed:</div>
                  <div className="font-bold">৳{financedAmount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400">Monthly Installment:</div>
                  <div className="font-bold text-emerald-600">৳{Math.round(monthlyAmount).toLocaleString('en-IN')}/mo</div>
                </div>
                <div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400">Total Payable:</div>
                  <div className="font-bold">৳{Math.round(totalPayableWithDown).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAgreementModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  disabled={!selectedImeiObj || !custName || !custPhone}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium shadow-xs"
                >
                  {t('Generate Agreement & Schedule', 'চুক্তি তৈরি ও শিডিউল নিশ্চিত')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule and Legal Deed Drawer/Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('Installment Schedule & Legal Agreement', 'কিস্তির পরিশোধ তালিকা ও চুক্তিপত্র')}
                </h3>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {selectedAgreement.agreement_no}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('Print Agreement', 'প্রিন্ট এগ্রিমেন্ট')}</span>
                </button>
                <button onClick={() => setSelectedAgreement(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-slate-400 text-[10px]">{t('Customer Details', 'গ্রাহকের বিবরণ')}</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedAgreement.customer_name}</div>
                  <div className="font-mono text-slate-600 dark:text-slate-300">{selectedAgreement.customer_phone}</div>
                  <div className="text-slate-500">NID: {selectedAgreement.customer_nid}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">{t('Guarantor Details', 'জামিনদারের বিবরণ')}</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedAgreement.guarantor_name}</div>
                  <div className="font-mono text-slate-600 dark:text-slate-300">{selectedAgreement.guarantor_phone}</div>
                  <div className="text-slate-500">Relation: {selectedAgreement.guarantor_relation}</div>
                </div>
              </div>

              {/* Handset Details */}
              <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedAgreement.product_name}</div>
                  <div className="font-mono text-slate-500 text-[11px]">IMEI: {selectedAgreement.imei}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">৳{selectedAgreement.cash_price.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-500">Down Payment: ৳{selectedAgreement.down_payment.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Monthly Schedule Table */}
              <div>
                <div className="font-semibold text-slate-900 dark:text-white mb-2">{t('Monthly Payment Schedule', 'মাসিক কিস্তির তারিখ ও তালিকা')}</div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                      <th className="p-2">#</th>
                      <th className="p-2">Due Date</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Paid On</th>
                      <th className="p-2 text-right">Receipt #</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedAgreement.schedule.map(s => (
                      <tr key={s.installment_no}>
                        <td className="p-2 font-mono font-bold">Inst #{s.installment_no}</td>
                        <td className="p-2">{s.due_date}</td>
                        <td className="p-2 font-semibold">৳{s.amount.toLocaleString('en-IN')}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              s.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500">{s.paid_date || '-'}</td>
                        <td className="p-2 text-right font-mono text-slate-500">{s.receipt_no || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legal Signatures */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
                  <div className="text-[10px] text-slate-500">{t('Customer Signature', 'গ্রাহকের স্বাক্ষর')}</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
                  <div className="text-[10px] text-slate-500">{t('Guarantor Signature', 'জামিনদারের স্বাক্ষর')}</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
                  <div className="text-[10px] text-slate-500">{t('Showroom Manager', 'শোরুম ম্যানেজার')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

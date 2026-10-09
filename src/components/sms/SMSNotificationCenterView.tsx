import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../db/storage';
import { SMSNotificationLog } from '../../types';
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle,
  Clock,
  Phone,
  Copy,
  Users,
  Trash2
} from 'lucide-react';

export const SMSNotificationCenterView: React.FC = () => {
  const { state, currentUser, t } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_1');
  const [templateType, setTemplateType] = useState<SMSNotificationLog['template_type']>('sale_invoice');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const [customMsg, setCustomMsg] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  const fallbackCustomer = {
    id: 'cust_walkin',
    name: 'Valued Customer',
    phone: '01700-000000',
    current_balance: 0
  };
  const customer = state.customers.find(c => c.id === selectedCustomerId) || state.customers[0] || fallbackCustomer;

  // Dynamic template generator
  const getGeneratedMessage = () => {
    if (customMsg) return customMsg;
    const custBalance = (customer?.current_balance ?? 0).toLocaleString('en-IN');

    if (templateType === 'sale_invoice') {
      return lang === 'bn'
        ? `প্রিয় ${customer?.name || 'গ্রাহক'}, স্মার্টফোন গ্যালাক্সি বিডি থেকে ক্রয়ের জন্য ধন্যবাদ। চালান নং: INV-2026-089। ওয়ারেন্টি নিশ্চিত করা হয়েছে। হেল্পলাইন: 01711002233`
        : `Dear ${customer?.name || 'Customer'}, Thank you for purchasing from SmartPhone Galaxy BD. Inv #INV-2026-089. Official warranty registered. Helpline: 01711002233`;
    } else if (templateType === 'due_reminder') {
      return lang === 'bn'
        ? `সম্মানিত ${customer?.name || 'গ্রাহক'}, স্মার্টফোন গ্যালাক্সি বিডিতে আপনার বকেয়া ব্যালেন্স ৳${custBalance}। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ।`
        : `Dear ${customer?.name || 'Customer'}, Friendly reminder from SmartPhone Galaxy BD: Your outstanding credit balance is BDT ${custBalance}. Please settle at your earliest.`;
    } else if (templateType === 'warranty_update') {
      return lang === 'bn'
        ? `প্রিয় ${customer?.name || 'গ্রাহক'}, আপনার ওয়ারেন্টির ডিভাইসটি সার্ভিসিং সম্পন্ন হয়েছে। শোরুম থেকে রিসিট দেখিয়ে হ্যান্ডসেটটি গ্রহণ করুন। ধন্যবাদ।`
        : `Dear ${customer?.name || 'Customer'}, Your device under warranty is repaired and ready for pickup at our showroom. Please show your job slip.`;
    } else {
      return `Dear ${customer?.name || 'Customer'}, We have received your payment of BDT 10,000. Current remaining due is BDT ${custBalance}. Thank you!`;
    }
  };

  const handleSend = () => {
    const msg = getGeneratedMessage();
    storage.sendSMSNotification({
      recipient_phone: customer?.phone || '01700-000000',
      customer_name: customer?.name || 'Customer',
      template_type: templateType,
      message: msg,
      channel,
      status: 'delivered'
    });

    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  const handleDeleteSMSLog = (id: string) => {
    storage.deleteSMSNotification(id);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t('Customer SMS & WhatsApp Notification Dispatcher', 'গ্রাহক এসএমএস ও হোয়াটসঅ্যাপ নোটিফিকেশন সেন্টার')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Branded Masked SMS Sender (GPO/Onnorokom SMS Gateway) • Automated Invoice, Due Reminder & Warranty SMS
          </p>
        </div>
      </div>

      {sendSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Notification dispatched and delivered to {customer.phone}!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Compose Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Compose Broadcast / Customer Alert
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone}) - Due: ৳{c.current_balance.toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Notification Template</label>
                <select
                  value={templateType}
                  onChange={e => setTemplateType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  <option value="sale_invoice">POS Sale & Warranty Confirmation</option>
                  <option value="due_reminder">Outstanding Credit Due Reminder</option>
                  <option value="warranty_update">Warranty Repair Ready for Delivery</option>
                  <option value="payment_receipt">Payment Money Receipt Acknowledgement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Delivery Channel</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      channel === 'sms'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Branded SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      channel === 'whatsapp'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    WhatsApp Business
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Message Language</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLang('bn')}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      lang === 'bn' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border'
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      lang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Message Body (Editable)</label>
              <textarea
                rows={4}
                value={getGeneratedMessage()}
                onChange={e => setCustomMsg(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard 160 characters per SMS credit • Masking: GALAXY_BD
              </span>
            </div>

            <button
              onClick={handleSend}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Notification to {customer.phone}</span>
            </button>
          </div>
        </div>

        {/* Right: Mock Mobile Phone Preview */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center">
          <div className="w-64 bg-slate-900 border-4 border-slate-700 rounded-3xl p-3 shadow-2xl text-white space-y-3">
            <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto"></div>
            <div className="text-center border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-emerald-400">GALAXY_BD</span>
              <div className="text-[9px] text-slate-400">Verified Official Masking</div>
            </div>

            <div className="p-3 bg-slate-800 rounded-2xl text-[11px] leading-relaxed text-slate-100 shadow-inner">
              {getGeneratedMessage()}
            </div>

            <div className="text-center text-[9px] text-slate-500 pt-2">
              Delivered via Bangladesh Telecom Gateway
            </div>
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
          </div>
        </div>
      </div>

      {/* Dispatch History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
          Recent Notification Dispatch Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-2.5">Recipient</th>
                <th className="p-2.5">Phone Number</th>
                <th className="p-2.5">Template</th>
                <th className="p-2.5">Channel</th>
                <th className="p-2.5">Message Content</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Sent Time</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.smsLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No SMS or WhatsApp logs found. Dispatch log is clean.
                  </td>
                </tr>
              ) : (
                state.smsLogs.map(log => (
                  <tr key={log.id}>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{log.customer_name}</td>
                    <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{log.recipient_phone}</td>
                    <td className="p-2.5 uppercase text-[10px] font-bold text-indigo-600">{log.template_type.replace(/_/g, ' ')}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 max-w-xs truncate">{log.message}</td>
                    <td className="p-2.5">
                      <span className="text-emerald-600 font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400 text-[10px]">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleDeleteSMSLog(log.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

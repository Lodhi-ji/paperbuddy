import React, { useState } from 'react';
import { Bell, X, AlertCircle, Mail, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function SendReminderModal({ fee, onClose }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const sendReminderMutation = useMutation({
    mutationFn: () => api.post(`/school-admin/student-fees/${fee.id}/reminder`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['accountantAllStudents'] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to send reminder email');
    }
  });

  const handleSend = () => {
    sendReminderMutation.mutate();
  };

  const totalDue = Number(fee.amountDue) + Number(fee.penaltyAmount) - Number(fee.waiverAmount) - Number(fee.amountPaid);
  const dueDateString = new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Send Payment Reminder</h2>
              <p className="text-xs font-medium text-slate-500">Dispatch an official email notification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
            disabled={sendReminderMutation.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Email Preview</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  An official reminder will be sent to the student's registered email address. It will detail the outstanding balance of 
                  <span className="font-black text-rose-600 mx-1">₹{Math.max(0, totalDue)}</span> 
                  for <span className="font-bold text-slate-700">{fee.feeStructure.feeType.name}</span>.
                </p>
                <div className="mt-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-rose-600">
                    The email includes an official warning that late penalties will be applied automatically if payment is not received by the due date ({dueDateString}).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              onClick={onClose}
              disabled={sendReminderMutation.isPending}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSend}
              disabled={sendReminderMutation.isPending}
              className="flex-[2] py-3.5 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-black rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {sendReminderMutation.isPending ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4" /> Send Email Reminder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

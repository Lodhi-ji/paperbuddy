import React, { useState } from 'react';
import { Receipt, X, AlertCircle, CreditCard, Banknote, Smartphone, FileSignature } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function RecordPaymentModal({ fee, onClose }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI'); // UPI, CARD, CASH, CHEQUE
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [error, setError] = useState(null);

  // Note: Since school admin doesn't have a direct route for transactions, we use the accountant route.
  // The accountant routes checkRole(['SCHOOL_ADMIN', 'ACCOUNTANT']) so admin can access it.
  const isBulk = Array.isArray(fee);
  const feesArray = isBulk ? fee : [fee];
  
  const recordPaymentMutation = useMutation({
    mutationFn: (payload) => isBulk 
      ? api.post(`/accountant/transactions/bulk`, payload)
      : api.post(`/accountant/transactions`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['accountantAllStudents'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['accountant-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountantTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['schoolTransactions'] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to record payment');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please provide a valid payment amount.');
      return;
    }
    
    let payload;
    
    if (isBulk) {
      let remainingAmount = parseFloat(amount);
      const payloadFees = [];
      for (const f of feesArray) {
        const feeDue = Number(f.amountDue) + Number(f.penaltyAmount) - Number(f.waiverAmount) - Number(f.amountPaid);
        if (feeDue <= 0) continue;
        const amtForThisFee = Math.min(feeDue, remainingAmount);
        if (amtForThisFee > 0) {
          payloadFees.push({ studentFeeId: f.id, amount: amtForThisFee });
          remainingAmount -= amtForThisFee;
        }
        if (remainingAmount <= 0) break;
      }
      payload = { fees: payloadFees, method };
    } else {
      payload = {
        studentFeeId: fee.id,
        amount: parseFloat(amount),
        method,
      };
    }
    
    if (method === 'CHEQUE') {
      if (!chequeNumber || !chequeDate) {
        setError('Cheque number and date are required for cheque payments.');
        return;
      }
      payload.chequeNumber = chequeNumber;
      payload.chequeDate = new Date(chequeDate).toISOString();
    }
    
    recordPaymentMutation.mutate(payload);
  };

  const paymentMethods = [
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'CARD', label: 'Card', icon: CreditCard },
    { id: 'CHEQUE', label: 'Cheque', icon: FileSignature },
  ];

  const totalDue = feesArray.reduce((acc, f) => {
    return acc + Number(f.amountDue) + Number(f.penaltyAmount) - Number(f.waiverAmount) - Number(f.amountPaid);
  }, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Record Payment</h2>
              <p className="text-xs font-medium text-slate-500">Log a manual transaction</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Type</span>
              <span className="text-sm font-black text-slate-800">
                {isBulk ? `Multiple Fees (${feesArray.length})` : fee.feeStructure.feeType.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Balance</span>
              <span className="text-sm font-black text-emerald-600">₹{Math.max(0, totalDue)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map(m => {
                  const Icon = m.icon;
                  const isSelected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Amount Paid (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">₹</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (val > Math.max(0, totalDue)) {
                      setAmount(Math.max(0, totalDue).toString());
                    } else {
                      setAmount(e.target.value);
                    }
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium transition-all outline-none"
                  min="0.01"
                  max={Math.max(0, totalDue)}
                  step="0.01"
                  required
                />
              </div>
            </div>

            {method === 'CHEQUE' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Cheque Number</label>
                  <input
                    type="text"
                    value={chequeNumber}
                    onChange={e => setChequeNumber(e.target.value)}
                    placeholder="e.g. 000123"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Cheque Date</label>
                  <input
                    type="date"
                    value={chequeDate}
                    onChange={e => setChequeDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium transition-all outline-none"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-black rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {recordPaymentMutation.isPending ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

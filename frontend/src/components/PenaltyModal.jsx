import React, { useState } from 'react';
import { AlertCircle, X, Calendar, Clock, DollarSign, Repeat, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export default function PenaltyModal({ fee, onClose }) {
  const queryClient = useQueryClient();
  const [basePenalty, setBasePenalty] = useState('');
  const [enablePeriodic, setEnablePeriodic] = useState(false);
  const [periodicAmount, setPeriodicAmount] = useState('');
  const [periodicInterval, setPeriodicInterval] = useState('5');
  const [error, setError] = useState(null);

  const applyPenaltyMutation = useMutation({
    mutationFn: (payload) => api.post(`/school-admin/student-fees/${fee.id}/penalty`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['accountant-students'] });
      queryClient.invalidateQueries({ queryKey: ['schoolMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['accountant-metrics'] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to apply penalty');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!basePenalty && !enablePeriodic) {
      setError('Please provide a penalty amount or configure a periodic penalty.');
      return;
    }
    
    const payload = {
      penaltyAmount: basePenalty ? parseFloat(basePenalty) : 0,
    };
    
    if (enablePeriodic) {
      if (!periodicAmount || parseFloat(periodicAmount) <= 0) {
        setError('Please provide a valid periodic penalty amount.');
        return;
      }
      if (!periodicInterval || parseInt(periodicInterval) <= 0) {
        setError('Please provide a valid interval for the periodic penalty.');
        return;
      }
      payload.periodicPenaltyAmount = parseFloat(periodicAmount);
      payload.periodicPenaltyIntervalDays = parseInt(periodicInterval);
    } else {
      payload.periodicPenaltyAmount = null; // Clear existing if unchecked
    }
    
    applyPenaltyMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Add Penalty</h2>
              <p className="text-xs font-medium text-slate-500">Apply late fees or recurring penalties</p>
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
              <span className="text-sm font-black text-slate-800">{fee.feeStructure.feeType.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
              <span className="text-sm font-medium text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Billed</span>
              <span className="text-sm font-black text-rose-600">₹{Number(fee.amountDue) + Number(fee.penaltyAmount)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Immediate Penalty Amount (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">₹</span>
                </div>
                <input
                  type="number"
                  value={basePenalty}
                  onChange={e => setBasePenalty(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-sm font-medium transition-all outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={enablePeriodic}
                    onChange={(e) => setEnablePeriodic(e.target.checked)}
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-brand-primary peer-checked:border-brand-primary transition-colors"></div>
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">Enable Periodic Penalty</span>
                  <span className="text-[10px] font-medium text-slate-500">Automatically add a penalty every few days if unpaid</span>
                </div>
              </label>
            </div>

            {enablePeriodic && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Amount to Add (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      value={periodicAmount}
                      onChange={e => setPeriodicAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full pl-8 pr-4 py-3 bg-rose-50/30 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-sm font-medium transition-all outline-none"
                      min="1"
                      step="0.01"
                      required={enablePeriodic}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Every (Days)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={periodicInterval}
                      onChange={e => setPeriodicInterval(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full pl-9 pr-4 py-3 bg-rose-50/30 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-sm font-medium transition-all outline-none"
                      min="1"
                      step="1"
                      required={enablePeriodic}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={applyPenaltyMutation.isPending}
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-black rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {applyPenaltyMutation.isPending ? 'Applying...' : 'Apply Penalty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { 
  Search, 
  Download,
  Filter,
  Eye,
  FileText,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Plus,
  Receipt,
  Globe,
  Loader2
} from 'lucide-react';
import ReceiptModal from './ReceiptModal';

export default function TransactionCenter({
  transactions,
  txnsLoading,
  txnSearch, setTxnSearch,
  txnMethod, setTxnMethod,
  txnStatus, setTxnStatus,
  setProfileStudentId
}) {
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);

  const reconcileMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/accountant/transactions/${id}/reconcile`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountantTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['schoolTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['accountantAllStudents'] });
    }
  });

  const handleOpenReceipt = (e, tx) => {
    e.stopPropagation();
    setSelectedReceiptTxn(tx);
    setIsReceiptModalOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMethodIcon = (method) => {
    const m = (method || '').toUpperCase();
    if (m.includes('CARD')) return <CreditCard className="w-4 h-4 text-blue-500" />;
    if (m.includes('UPI')) return <Smartphone className="w-4 h-4 text-emerald-500" />;
    if (m.includes('CASH')) return <Banknote className="w-4 h-4 text-amber-500" />;
    if (m.includes('CHEQUE') || m.includes('BANK')) return <Landmark className="w-4 h-4 text-purple-500" />;
    return <Globe className="w-4 h-4 text-indigo-500" />;
  };

  const getMethodLabel = (method) => {
    if (!method) return 'Online';
    const m = method.toUpperCase();
    if (m.includes('CARD')) return 'Card';
    if (m.includes('UPI')) return 'UPI';
    if (m.includes('CASH')) return 'Cash';
    if (m.includes('CHEQUE') || m.includes('BANK')) return 'Bank Transfer';
    
    // Format fallback string nicely (e.g., 'ONLINE' -> 'Online')
    return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'CLEARED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black tracking-widest uppercase text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Success</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-black tracking-widest uppercase text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending</span>;
      case 'FAILED':
      case 'BOUNCED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[10px] font-black tracking-widest uppercase text-rose-600"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Failed</span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black tracking-widest uppercase text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Refunded</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black tracking-widest uppercase text-slate-600">{status}</span>;
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Dynamic Timeline Data from the real transactions list
  const timelineData = React.useMemo(() => {
    if (!transactions) return [];
    
    // Sort transactions by date descending, take top 5
    const latestTxns = [...transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return latestTxns.map(t => {
      const date = new Date(t.createdAt);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      let text = `${getMethodLabel(t.method)} Received`;
      if (t.status === 'PENDING') text = `${getMethodLabel(t.method)} Pending`;
      if (t.status === 'FAILED' || t.status === 'BOUNCED') text = `${getMethodLabel(t.method)} Bounced/Failed`;
      
      let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      if (t.status === 'PENDING') icon = <Clock className="w-3.5 h-3.5 text-amber-500" />;
      if (t.status === 'FAILED' || t.status === 'BOUNCED') icon = <XCircle className="w-3.5 h-3.5 text-rose-500" />;

      return {
        time: timeStr,
        icon,
        text,
        amount: formatCurrency(Number(t.amount))
      };
    });
  }, [transactions]);

  // Dynamic KPI calculations
  const calculations = React.useMemo(() => {
    let todayCollected = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let successCount = 0;

    const todayStr = new Date().toDateString();

    transactions?.forEach(t => {
      const amt = Number(t.amount) || 0;
      const isToday = new Date(t.createdAt).toDateString() === todayStr;

      if (t.status === 'SUCCESS' || t.status === 'CLEARED') {
        successCount++;
        if (isToday) {
          todayCollected += amt;
        }
      } else if (t.status === 'PENDING') {
        pendingCount++;
      } else if (t.status === 'FAILED' || t.status === 'BOUNCED') {
        failedCount++;
      }
    });

    const totalCount = successCount + failedCount;
    const successRate = totalCount ? Math.round((successCount / totalCount) * 1000) / 10 : 0;

    return {
      todayCollected,
      pendingCount,
      failedCount,
      successRate
    };
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Financial Timeline (Top Bar) */}
      <div className="glass-card rounded-[20px] p-3 border border-white/40 shadow-sm flex items-center overflow-x-auto no-scrollbar gap-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary px-3 border-r border-slate-200 shrink-0">Live Feed</div>
        {timelineData.length > 0 ? (
          timelineData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 text-xs">
              <span className="font-mono font-bold text-slate-400">{item.time}</span>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                {item.icon}
                <span className="font-bold text-slate-600">{item.text}</span>
                {item.amount && <span className="font-black text-slate-800 ml-1">{item.amount}</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs font-semibold text-slate-400">No transaction activity recorded yet.</div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-brand-primary" /> Transaction Center
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
            Monitor, verify and audit every payment across your institution in real time.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Ledger
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-secondary hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Record Offline Payment
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm md:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Today's Collection</h3>
          <div className="text-3xl font-black text-emerald-600">{formatCurrency(calculations.todayCollected)}</div>
        </div>
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pending</h3>
          <div className="text-3xl font-black text-amber-500">{calculations.pendingCount}</div>
        </div>
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Failed</h3>
          <div className="text-3xl font-black text-rose-500">{calculations.failedCount}</div>
        </div>
        <div className="glass-card rounded-[20px] p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Success Rate</h3>
          <div className="text-3xl font-black text-slate-800">{calculations.successRate}%</div>
        </div>
      </div>

      {/* Single Column Layout (Table Full Width) */}
      <div className="flex flex-col gap-6">
        
        {/* Left Column: Table Container */}
        <div className="flex-1 glass-card rounded-[32px] p-6 md:p-8 border border-white/40 shadow-premium">
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4 mb-8 w-full">
            <div className="relative flex-1 min-w-[250px] md:max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search receipt ID or student..."
                className="pl-10 w-full glass-input text-sm h-10 rounded-xl !border-[1.5px] !border-slate-400 focus:!border-brand-primary"
              />
            </div>
            
            <div className="relative">
              <select 
                value={txnMethod}
                onChange={(e) => setTxnMethod(e.target.value)}
                className="glass-input appearance-none text-sm h-10 rounded-xl font-semibold text-slate-600 pl-4 !pr-10 !border-[1.5px] !border-slate-400 w-32"
              >
                <option value="">Method</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Bank</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative hidden sm:block">
              <select 
                value={txnStatus}
                onChange={(e) => setTxnStatus(e.target.value)}
                className="glass-input appearance-none text-sm h-10 rounded-xl font-semibold text-slate-600 pl-4 !pr-10 !border-[1.5px] !border-slate-400 w-32"
              >
                <option value="">Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Table */}
          {txnsLoading ? (
             <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <th className="pb-4 pl-2 w-8"></th>
                    <th className="pb-4">Receipt ID</th>
                    <th className="pb-4">Student</th>
                    <th className="pb-4">Method</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-right">Amount</th>
                    <th className="pb-4 text-center pr-2">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <React.Fragment key={tx.id}>
                      <tr 
                        onClick={() => toggleRow(tx.id)}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group ${expandedRow === tx.id ? 'bg-slate-50/80' : ''}`}
                      >
                        <td className="py-4 pl-2 text-slate-300 group-hover:text-slate-500">
                          {expandedRow === tx.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                        <td className="py-4 font-mono text-[11px] font-bold text-slate-500 uppercase">
                          {tx.receiptUrl?.replace('https://', '').substring(0, 10) || `TXN-${tx.id.substring(0,6)}`}
                        </td>
                        <td className="py-4">
                          {tx.studentFee?.student ? (
                            <div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setProfileStudentId && setProfileStudentId(tx.studentFee.student.id); }}
                                className="font-extrabold text-slate-800 hover:text-brand-primary text-left transition-colors"
                              >
                                {tx.studentFee.student.user?.name || 'Unknown'}
                              </button>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Class {tx.studentFee.student.class}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">Deleted Student</span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded shadow-sm border border-slate-100">
                              {getMethodIcon(tx.method)}
                            </div>
                            <span className="font-bold text-slate-600 text-xs">{getMethodLabel(tx.method)}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-4 text-right font-black text-slate-800">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-4 text-center pr-2">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={(e) => handleOpenReceipt(e, tx)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center gap-1.5 shadow-sm bg-white"
                            >
                              <Receipt className="w-3.5 h-3.5" /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row Detail (Stripe-like) */}
                      {expandedRow === tx.id && (
                        <tr>
                          <td colSpan={8} className="p-0 border-b border-slate-100">
                            <div className="bg-slate-50 p-6 shadow-inner animate-in slide-in-from-top-2 fade-in duration-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
                                <div>
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Gateway</div>
                                  <div className="text-sm font-bold text-slate-700">{tx.method === 'ONLINE' ? 'Razorpay' : 'Offline / Manual'}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Reference ID</div>
                                  <div className="text-sm font-mono font-bold text-slate-700">{tx.transactionId || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Collected By</div>
                                  <div className="text-sm font-bold text-slate-700">{tx.method === 'ONLINE' ? 'System (Online)' : 'Accountant (POS)'}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Fee Category</div>
                                  <div className="text-sm font-bold text-slate-700">{tx.studentFee?.feeStructure?.feeType?.name || 'General'}</div>
                                </div>
                                
                                {tx.method === 'CHEQUE' && (
                                  <>
                                    <div>
                                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Cheque Number</div>
                                      <div className="text-sm font-mono font-bold text-slate-700">{tx.chequeNumber || 'N/A'}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Cheque Date</div>
                                      <div className="text-sm font-bold text-slate-700">
                                        {tx.chequeDate ? new Date(tx.chequeDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="mt-6 pt-4 border-t border-slate-200/60 flex gap-3">
                                <button 
                                  onClick={(e) => handleOpenReceipt(e, tx)}
                                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download Receipt
                                </button>
                                {tx.status === 'SUCCESS' && (
                                  <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50 flex items-center gap-2">
                                    <RotateCcw className="w-3.5 h-3.5" /> Issue Refund
                                  </button>
                                )}
                                {tx.method === 'CHEQUE' && tx.status === 'PENDING' && (
                                  <>
                                    <button 
                                      onClick={() => reconcileMutation.mutate({ id: tx.id, status: 'CLEARED' })}
                                      disabled={reconcileMutation.isPending}
                                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {reconcileMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} 
                                      Mark as Cleared
                                    </button>
                                    <button 
                                      onClick={() => reconcileMutation.mutate({ id: tx.id, status: 'BOUNCED' })}
                                      disabled={reconcileMutation.isPending}
                                      className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold shadow-sm hover:bg-rose-100 disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {reconcileMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} 
                                      Mark as Bounced
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-8 h-8 text-brand-primary/40" />
              </div>
              <h3 className="text-lg font-black text-slate-800">No transactions found</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Try adjusting your search filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>

      </div>

      <ReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={selectedReceiptTxn}
      />
    </div>
  );
}

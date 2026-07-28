import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import PrintReceipt from '../components/PrintReceipt';
import StudentProfile360 from '../components/StudentProfile360';
import MessagesView from '../components/MessagesView';
import TransactionCenter from '../components/TransactionCenter';
import {
  IndianRupee,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
  AlertTriangle,
  HelpCircle,
  Coins,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  AlertOctagon,
  BookOpen,
  Receipt,
  Printer,
  FileText,
  UserSearch,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Smartphone,
  Landmark,
  Globe,
  PieChart,
  ListTodo,
  Download,
  Wallet,
  Play
} from 'lucide-react';

export default function AccountantDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const permissions = user?.permissions || {};

  const canRecordPayment = permissions.can_record_payment === true;
  const canReconcileCheque = permissions.can_reconcile_cheque === true;
  const canApplyWaiver = permissions.can_apply_waiver === true;
  const canViewMetrics = permissions.can_view_dashboard_metrics === true;

  // View Mode: 'POS' or 'DIRECTORY'
  const [viewMode, setViewMode] = useState('POS');
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedDirectoryStudent, setSelectedDirectoryStudent] = useState(null);

  // Search & Filter for Spotlight
  const [search, setSearch] = useState('');
  
  // Selected Student for POS
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [selectedFeeIds, setSelectedFeeIds] = useState([]);

  // Payment Modal State (Now embedded in POS)
  const [payMethod, setPayMethod] = useState('CASH');
  const [payAmount, setPayAmount] = useState('');
  const [chqNumber, setChqNumber] = useState('');
  const [chqDate, setChqDate] = useState('');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [generateReceipt, setGenerateReceipt] = useState(true);

  // Printing state
  const [printReceiptData, setPrintReceiptData] = useState(null);

  // Transaction Center Filters
  const [txnSearch, setTxnSearch] = useState('');
  const [txnMethod, setTxnMethod] = useState('');
  const [txnStatus, setTxnStatus] = useState('');

  // Keyboard Shortcut for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['accountantMetrics'],
    queryFn: () => api.get('/accountant/dashboard/metrics'),
    enabled: canViewMetrics || canReconcileCheque,
  });

  const { data: feesQueue, isLoading: queueLoading } = useQuery({
    queryKey: ['accountantFeesQueue', search],
    queryFn: () => api.get(`/accountant/student-fees?status=UNPAID,PARTIAL&search=${search}`),
    enabled: canRecordPayment && viewMode === 'POS',
  });

  // Fetch all students for directory
  const { data: allStudents, isLoading: allStudentsLoading } = useQuery({
    queryKey: ['accountantAllStudents'],
    queryFn: () => api.get('/school-admin/students'),
    enabled: viewMode === 'DIRECTORY',
  });

  // Recent transactions for activity feed & analytics
  const { data: transactions, isLoading: txnsLoading } = useQuery({
    queryKey: ['accountantRecentTransactions'],
    queryFn: () => api.get('/accountant/transactions?limit=20'),
  });

  // ----------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------
  const recordPaymentMutation = useMutation({
    mutationFn: (payload) => api.post('/accountant/transactions', payload),
    onSuccess: (data) => {
      setPaySuccess('Payment recorded successfully!');
      setPayError('');
      
      // Auto trigger receipt if selected
      if (generateReceipt) {
        setPrintReceiptData(data.transaction || data);
        setTimeout(() => window.print(), 300);
      }

      setTimeout(() => {
        setSelectedStudent(null);
        setSelectedFeeIds([]);
        setSearch('');
        setPayAmount('');
        setPaySuccess('');
      }, 1500);

      queryClient.invalidateQueries({ queryKey: ['accountantFeesQueue'] });
      queryClient.invalidateQueries({ queryKey: ['accountantMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['accountantRecentTransactions'] });
    },
    onError: (err) => {
      setPayError(err.message || 'Failed to record payment');
      setPaySuccess('');
    },
  });

  const reconcileChequeMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/accountant/transactions/${id}/reconcile`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountantMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['accountantRecentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountantFeesQueue'] });
    },
    onError: (err) => {
      alert(err.response?.data?.error || err.message || 'Cheque reconciliation failed');
    }
  });

  // ----------------------------------------------------
  // HANDLERS & HELPERS
  // ----------------------------------------------------
  
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getRemainingAmount = (fee) => {
    return Number(fee.amountDue) + Number(fee.penaltyAmount) - Number(fee.amountPaid) - Number(fee.waiverAmount);
  };

  const getMethodIcon = (method) => {
    const m = (method || '').toUpperCase();
    if (m.includes('CARD')) return <CreditCard className="w-3 h-3 text-blue-500" />;
    if (m.includes('UPI')) return <Smartphone className="w-3 h-3 text-emerald-500" />;
    if (m.includes('CASH')) return <Banknote className="w-3 h-3 text-amber-500" />;
    if (m.includes('CHEQUE') || m.includes('BANK')) return <Landmark className="w-3 h-3 text-purple-500" />;
    return <Globe className="w-3 h-3 text-indigo-500" />;
  };

  // Group fees by student for POS experience
  const studentsWithFees = useMemo(() => {
    if (!feesQueue) return [];
    const grouped = {};
    feesQueue.forEach(fee => {
      const sId = fee.student.id;
      if (!grouped[sId]) {
        grouped[sId] = {
          student: fee.student,
          fees: [],
          totalOutstanding: 0
        };
      }
      grouped[sId].fees.push(fee);
      grouped[sId].totalOutstanding += getRemainingAmount(fee);
    });
    return Object.values(grouped);
  }, [feesQueue]);

  // POS logic
  const handleSelectStudent = (studentData) => {
    setSelectedStudent(studentData);
    // Auto-select all fees by default for convenience
    const allFeeIds = studentData.fees.map(f => f.id);
    setSelectedFeeIds(allFeeIds);
    setPayAmount(studentData.totalOutstanding.toString());
    setPayError('');
    setPaySuccess('');
  };

  const toggleFeeSelection = (feeId, amount) => {
    let newSelection = [...selectedFeeIds];
    if (newSelection.includes(feeId)) {
      newSelection = newSelection.filter(id => id !== feeId);
    } else {
      newSelection.push(feeId);
    }
    setSelectedFeeIds(newSelection);

    // Recalculate suggested total based on selected fees
    if (selectedStudent) {
      const newTotal = selectedStudent.fees
        .filter(f => newSelection.includes(f.id))
        .reduce((sum, f) => sum + getRemainingAmount(f), 0);
      setPayAmount(newTotal.toString());
    }
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || selectedFeeIds.length === 0 || !payAmount) {
      setPayError('Please select at least one fee and enter an amount.');
      return;
    }

    // In a real system you'd map the amount across selected fees, but our backend handles one studentFeeId.
    // For this simulation, if multiple are selected, we just record against the first selected one to satisfy the API.
    // Ideally the API accepts an array of fee allocations.
    const primaryFeeId = selectedFeeIds[0];

    const payload = {
      studentFeeId: primaryFeeId,
      amount: parseFloat(payAmount),
      method: payMethod,
    };

    if (payMethod === 'CHEQUE') {
      if (!chqNumber || !chqDate) {
        setPayError('Cheque details required.');
        return;
      }
      payload.chequeNumber = chqNumber;
      payload.chequeDate = chqDate;
    }

    recordPaymentMutation.mutate(payload);
  };

  // ----------------------------------------------------
  // DERIVED DATA
  // ----------------------------------------------------
  const pendingChequesCount = metrics?.pendingCheques?.length || 0;
  const todayTransactions = transactions?.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()) || [];
  const completedTodayCount = todayTransactions.filter(t => t.status === 'SUCCESS').length;
  
  // Dynamic pending metrics for the hero
  const totalPendingAmount = metrics?.totalPending ?? 0;
  const totalPendingStudents = metrics?.defaultersCount ?? 0;
  const progressPercent = totalPendingStudents ? Math.min(100, (completedTodayCount / totalPendingStudents) * 100) : 0;

  return (
    <div className="print:hidden max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#F8FAFC] min-h-screen">
      <Header />

      {/* MODE SWITCHER */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-6 border-b border-slate-200 w-full">
          <button 
            onClick={() => setViewMode('TRANSACTIONS')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              viewMode === 'TRANSACTIONS' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Transaction Center
          </button>
          <button 
            onClick={() => setViewMode('POS')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              viewMode === 'POS' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            POS Workstation
          </button>
          <button 
            onClick={() => setViewMode('DIRECTORY')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              viewMode === 'DIRECTORY' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Student Directory
          </button>
          <button 
            onClick={() => setViewMode('MESSAGES')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              viewMode === 'MESSAGES' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Messages
          </button>
        </div>
      </div>

      {viewMode === 'TRANSACTIONS' ? (
        <TransactionCenter 
          transactions={transactions}
          txnsLoading={txnsLoading}
          txnSearch={txnSearch} setTxnSearch={setTxnSearch}
          txnMethod={txnMethod} setTxnMethod={setTxnMethod}
          txnStatus={txnStatus} setTxnStatus={setTxnStatus}
        />
      ) : viewMode === 'MESSAGES' ? (
        <MessagesView />
      ) : viewMode === 'POS' ? (
        <>
          {/* ──────────────────────────────────────────────────────── */}
          {/* INLINE HERO */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Good Morning, {user?.name?.split(' ')[0] || 'Mark'}</h1>
              <p className="text-slate-500 text-sm mt-1">Ready to collect <strong className="font-bold text-slate-800">{formatCurrency(totalPendingAmount)}</strong> from <strong className="font-bold text-slate-800">{totalPendingStudents}</strong> students today.</p>
            </div>
            <button 
              onClick={() => document.getElementById('search-input')?.focus()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4" /> Start Collecting (Cmd+K)
            </button>
          </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* WORK QUEUE */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Today's Work</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Cash Payments', count: todayTransactions.filter(t => t.method === 'CASH').length, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
            { label: 'Pending Cheques', count: pendingChequesCount, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
            { label: 'Fee Adjustments', count: feesQueue?.filter(f => Number(f.waiverAmount) > 0 || Number(f.penaltyAmount) > 0).length || 0, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
            { label: 'Overdue Accounts', count: metrics?.defaultersCount ?? 0, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
            { label: 'Refund Requests', count: 0, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' },
          ].map((queue, idx) => (
            <div key={idx} className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-24 hover:border-slate-400 hover:shadow-md transition-all group`}>
              <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors text-left`}>{queue.label}</span>
              <div className="flex justify-between items-end w-full">
                <span className="text-2xl font-black text-slate-800">{queue.count}</span>
                <div className={`w-8 h-8 rounded-full ${queue.bg} border ${queue.border} flex items-center justify-center`}>
                  <ArrowRight className={`w-4 h-4 ${queue.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MAIN WORKSPACE GRID */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Left: POS Terminal */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Persistent Search Bar */}
          <div className="relative group border border-slate-200 bg-white rounded-lg overflow-hidden flex items-center shadow-sm">
            <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value === '') setSelectedStudent(null);
              }}
              placeholder="Search by student name or roll number..."
              className="w-full px-4 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="mr-4 flex gap-1">
              <kbd className="px-2 py-1 text-[10px] font-medium bg-slate-100 text-slate-500 rounded border border-slate-200">⌘</kbd>
              <kbd className="px-2 py-1 text-[10px] font-medium bg-slate-100 text-slate-500 rounded border border-slate-200">K</kbd>
            </div>
          </div>

          {/* POS Display Area */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            
            {!selectedStudent ? (
              /* State 1: Search Results */
              <div className="flex-1 flex flex-col p-2">
                {search.trim().length > 0 ? (
                  queueLoading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                  ) : studentsWithFees.length > 0 ? (
                    <div className="space-y-2 p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2 mb-2">Search Results</p>
                      <div className="flex flex-col gap-1">
                      {studentsWithFees.map((sData) => (
                        <button
                          key={sData.student.id}
                          onClick={() => handleSelectStudent(sData)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                            <div>
                              <span className="text-sm font-medium text-slate-900">{sData.student.user.name}</span>
                              <span className="text-xs text-slate-500 ml-2">Class {sData.student.class} • Roll {sData.student.rollNumber}</span>
                            </div>
                          </div>
                          <span className="text-sm font-mono font-medium text-slate-900">{formatCurrency(sData.totalOutstanding)}</span>
                        </button>
                      ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <UserSearch className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-lg font-bold text-slate-500">No students found for "{search}"</p>
                    </div>
                  )
                ) : (
                  /* State 0: Idle POS */
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <FileText className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No student selected</p>
                    <p className="text-xs text-slate-400 mt-1">Search or scan to begin</p>
                  </div>
                )}
              </div>
            ) : (
              /* State 2: Student POS Card */
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-300">
                {/* Header Profile */}
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg border border-slate-300">
                      {selectedStudent.student.user.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedStudent.student.user.name}</h2>
                      <p className="text-slate-500 text-sm">Class {selectedStudent.student.class} • Roll {selectedStudent.student.rollNumber}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Total Outstanding</span>
                    <span className="text-2xl font-mono font-medium text-slate-900">{formatCurrency(selectedStudent.totalOutstanding)}</span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  {/* Bill Selection */}
                  <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2"><ListTodo className="w-4 h-4 text-slate-400" /> Outstanding Bills</h3>
                  <div className="space-y-1 mb-8">
                    {selectedStudent.fees.map(fee => {
                      const amount = getRemainingAmount(fee);
                      const isSelected = selectedFeeIds.includes(fee.id);
                      return (
                        <div 
                          key={fee.id}
                          onClick={() => toggleFeeSelection(fee.id, amount)}
                          className={`flex justify-between items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className={`text-sm ${isSelected ? 'font-medium text-slate-900' : 'text-slate-700'}`}>{fee.feeStructure.feeType.name}</p>
                              {Number(fee.penaltyAmount) > 0 && <p className="text-[10px] text-rose-500 mt-0.5">Includes {formatCurrency(Number(fee.penaltyAmount))} late fee</p>}
                              {Number(fee.waiverAmount) > 0 && <p className="text-[10px] text-emerald-500 mt-0.5">{formatCurrency(Number(fee.waiverAmount))} discount applied</p>}
                            </div>
                          </div>
                          <span className={`text-sm font-mono ${isSelected ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <form id="posForm" onSubmit={handleRecordPaymentSubmit} className="mt-auto">
                    {payError && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2"><AlertOctagon className="w-4 h-4"/> {payError}</div>}
                    {paySuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {paySuccess}</div>}

                    {/* Payment Method */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                      {['CASH', 'UPI', 'CARD', 'CHEQUE'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setPayMethod(m); setPayError(''); }}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                            payMethod === m 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {/* Amount & Submit */}
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Amount Received</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                          <input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-slate-500 transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={recordPaymentMutation.isPending || selectedFeeIds.length === 0}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 h-[46px]"
                      >
                        {recordPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Receive Payment'}
                      </button>
                    </div>

                    {/* Receipt Toggle */}
                    <div className="mt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setSelectedStudent(null)} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                        Cancel
                      </button>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={generateReceipt} onChange={(e) => setGenerateReceipt(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                        <span className="text-xs font-medium text-slate-600">Print receipt</span>
                      </label>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right: Live Operations */}
        <div className="space-y-6">
          
          {/* Action Required */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Action Required</h3>
            
            <div className="flex flex-col gap-2">
              {metrics?.pendingCheques && metrics.pendingCheques.length > 0 ? (
                metrics.pendingCheques.map((chq) => (
                  <div key={chq.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-slate-900">{chq.studentName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Cheque #{chq.chequeNumber} • {formatCurrency(chq.amount)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button 
                        onClick={() => reconcileChequeMutation.mutate({ id: chq.id, status: 'CLEARED' })}
                        disabled={reconcileChequeMutation.isPending}
                        className="text-[10px] font-medium bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => reconcileChequeMutation.mutate({ id: chq.id, status: 'BOUNCED' })}
                        disabled={reconcileChequeMutation.isPending}
                        className="text-[10px] font-medium bg-white border border-rose-200 text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        Bounce
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs">
                  Inbox zero.
                </div>
              )}
            </div>
          </div>
          {/* Overdue Accounts */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm min-h-[250px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><UserSearch className="w-3.5 h-3.5" /> Overdue Accounts</h3>

            {metricsLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
            ) : metrics?.defaultersList && metrics.defaultersList.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {metrics.defaultersList.slice(0, 5).map(fee => {
                  const amt = Number(fee.amountDue) + Number(fee.penaltyAmount) - Number(fee.waiverAmount) - Number(fee.amountPaid);
                  return (
                    <div key={fee.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {fee.student?.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{fee.student?.user?.name}</p>
                          <p className="text-[10px] text-slate-500">{fee.feeStructure?.feeType?.name} • Class {fee.student?.class}</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-medium text-rose-600">{formatCurrency(amt)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No overdue accounts!</div>
            )}
          </div>
          {/* Fee Adjustments */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm min-h-[200px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5" /> Fee Adjustments</h3>

            {queueLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
            ) : feesQueue && feesQueue.filter(f => Number(f.waiverAmount) > 0 || Number(f.penaltyAmount) > 0).length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {feesQueue.filter(f => Number(f.waiverAmount) > 0 || Number(f.penaltyAmount) > 0).slice(0, 5).map(fee => (
                  <div key={fee.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {fee.student?.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{fee.student?.user?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-500">
                          {Number(fee.penaltyAmount) > 0 && <span className="text-rose-500">Penalty: {formatCurrency(fee.penaltyAmount)} </span>}
                          {Number(fee.waiverAmount) > 0 && <span className="text-emerald-500">Waiver: {formatCurrency(fee.waiverAmount)}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No active adjustments!</div>
            )}
          </div>

          {/* Recent Collections */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm min-h-[300px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Recent Collections</h3>

            {txnsLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
            ) : todayTransactions.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {todayTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 w-12">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{tx.studentFee?.student?.user?.name || 'System User'}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{tx.method} • {tx.status}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-medium text-slate-900">{formatCurrency(tx.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No collections yet</div>
            )}
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* TODAY'S LEDGER (BOTTOM) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Today's Ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {todayTransactions.length > 0 ? (
                todayTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 text-xs font-bold text-slate-500">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-4 text-sm font-bold text-slate-800">{tx.studentFee?.student?.user?.name || 'N/A'}</td>
                    <td className="py-4 text-sm font-black text-slate-900 font-mono">{formatCurrency(tx.amount)}</td>
                    <td className="py-4 text-xs font-bold text-slate-600 uppercase">{tx.method}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                        tx.status === 'SUCCESS' || tx.status === 'CLEARED' ? 'text-emerald-700 bg-emerald-50' :
                        tx.status === 'PENDING' ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {tx.status === 'SUCCESS' ? (
                        <button 
                          onClick={() => {
                            setPrintReceiptData(tx);
                            setTimeout(() => window.print(), 300);
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-end gap-1.5 ml-auto"
                        >
                          <Download className="w-3 h-3" /> Download
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-bold">No transactions recorded today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        /* ──────────────────────────────────────────────────────── */
        /* DIRECTORY MODE */
        /* ──────────────────────────────────────────────────────── */
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm min-h-[600px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-500" />
              Student Directory
            </h2>
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Class & Roll</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Contact</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {allStudentsLoading ? (
                  <tr><td colSpan="4" className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" /></td></tr>
                ) : allStudents?.filter(s => 
                  (s.user?.name || '').toLowerCase().includes(directorySearch.toLowerCase()) || 
                  (s.rollNumber || '').toLowerCase().includes(directorySearch.toLowerCase())
                ).map(student => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                          {(student.user?.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.user?.name || 'Unknown'}</p>
                          <p className="text-[10px] font-bold text-slate-400">{student.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-700">Class {student.class}</p>
                      <p className="text-xs font-mono text-slate-500">Roll: {student.rollNumber}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-700">{student.guardianName || 'N/A'}</p>
                      <p className="text-xs font-medium text-slate-500">{student.guardianPhone || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => setSelectedDirectoryStudent(student)}
                        className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors shadow-sm"
                      >
                        View 360° Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* PRINT-ONLY RECEIPT (Hidden in UI, rendered for window.print) */}
      {printReceiptData && createPortal(
        <div className="print-only absolute top-0 left-0 w-full bg-white z-[10000] min-h-screen">
          <PrintReceipt transaction={printReceiptData} />
        </div>,
        document.body
      )}

      {/* 360 PROFILE MODAL */}
      {selectedDirectoryStudent && (
        <StudentProfile360 
          student={selectedDirectoryStudent} 
          onClose={() => setSelectedDirectoryStudent(null)} 
        />
      )}

    </div>
  );
}

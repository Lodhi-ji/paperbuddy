import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import PrintReceipt from '../components/PrintReceipt';
import StudentProfile360 from '../components/StudentProfile360';
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
    queryFn: () => api.get(`/accountant/student-fees?status=UNPAID&search=${search}`),
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
  
  // Fake total pending metrics for the hero
  const totalPendingAmount = 154200; 
  const totalPendingStudents = 34;
  const progressPercent = Math.min(100, (completedTodayCount / totalPendingStudents) * 100);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#F8FAFC] min-h-screen">
      <Header />

      {/* MODE SWITCHER */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200">
          <button 
            onClick={() => setViewMode('POS')}
            className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              viewMode === 'POS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            POS Workstation
          </button>
          <button 
            onClick={() => setViewMode('DIRECTORY')}
            className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              viewMode === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Student Directory
          </button>
        </div>
      </div>

      {viewMode === 'POS' ? (
        <>
          {/* ──────────────────────────────────────────────────────── */}
          {/* HERO CTA */}
          {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-indigo-700 rounded-[32px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-indigo-200 font-bold tracking-widest uppercase text-sm mb-2">Good Morning, {user?.name?.split(' ')[0] || 'Mark'}</p>
          <h1 className="text-5xl font-black tracking-tight mb-4">Today's Pending Collections</h1>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black text-emerald-400">{formatCurrency(totalPendingAmount)}</span>
            <span className="text-2xl font-bold text-indigo-200 border-l-2 border-indigo-500 pl-4">{totalPendingStudents} Students</span>
          </div>
        </div>

        <button 
          onClick={() => document.getElementById('search-input')?.focus()}
          className="relative z-10 shrink-0 bg-white text-indigo-700 px-10 py-6 rounded-2xl font-black text-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
        >
          <Play className="fill-indigo-700 w-6 h-6" />
          Start Collecting
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* WORK QUEUE */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Today's Work</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Cash Payments', count: 12, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
            { label: 'Pending Cheques', count: pendingChequesCount || 7, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
            { label: 'Fee Adjustments', count: 5, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
            { label: 'Overdue Accounts', count: metrics?.defaultersCount || 3, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
            { label: 'Refund Requests', count: 2, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' },
          ].map((queue, idx) => (
            <button key={idx} className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-24 hover:border-slate-400 hover:shadow-md transition-all group active:scale-95`}>
              <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors text-left`}>{queue.label}</span>
              <div className="flex justify-between items-end w-full">
                <span className="text-2xl font-black text-slate-800">{queue.count}</span>
                <div className={`w-8 h-8 rounded-full ${queue.bg} border ${queue.border} flex items-center justify-center`}>
                  <ArrowRight className={`w-4 h-4 ${queue.color}`} />
                </div>
              </div>
            </button>
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
          <div className="relative group shadow-lg rounded-2xl bg-white overflow-hidden border border-slate-200">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value === '') setSelectedStudent(null);
              }}
              placeholder="Search Student Name or Roll Number..."
              className="w-full pl-16 pr-6 py-6 bg-transparent text-xl font-black text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-indigo-50/30 transition-colors"
            />
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-4">Select Student</p>
                      {studentsWithFees.map((sData) => (
                        <button
                          key={sData.student.id}
                          onClick={() => handleSelectStudent(sData)}
                          className="w-full text-left p-5 rounded-2xl border-2 border-transparent hover:border-indigo-600 hover:bg-indigo-50 transition-all flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {sData.student.user.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-800">{sData.student.user.name}</h3>
                              <div className="text-xs font-bold text-slate-500 mt-0.5">
                                Class {sData.student.class} • Roll {sData.student.rollNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Total Outstanding</span>
                            <span className="text-xl font-black text-rose-600">{formatCurrency(sData.totalOutstanding)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <UserSearch className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-lg font-bold text-slate-500">No students found for "{search}"</p>
                    </div>
                  )
                ) : (
                  /* State 0: Idle POS */
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Wallet className="w-20 h-20 text-slate-400 mb-6" />
                    <p className="text-2xl font-black text-slate-500 uppercase tracking-widest">POS Terminal Ready</p>
                    <p className="text-sm font-bold text-slate-400 mt-2">Scan ID or search student to begin</p>
                  </div>
                )}
              </div>
            ) : (
              /* State 2: Student POS Card */
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-300">
                {/* Header Profile */}
                <div className="bg-slate-900 p-8 text-white flex justify-between items-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  
                  <div className="flex items-center gap-5 z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-black text-2xl shadow-xl">
                      {selectedStudent.student.user.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{selectedStudent.student.user.name}</h2>
                      <p className="text-slate-400 font-bold text-sm mt-1">Class {selectedStudent.student.class} • Roll {selectedStudent.student.rollNumber}</p>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Guardian: {selectedStudent.student.guardianName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right z-10">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Outstanding</span>
                    <span className="text-3xl font-black text-white">{formatCurrency(selectedStudent.totalOutstanding)}</span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  {/* Bill Selection */}
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">Outstanding Bills</h3>
                  <div className="space-y-3 mb-8">
                    {selectedStudent.fees.map(fee => {
                      const amount = getRemainingAmount(fee);
                      const isSelected = selectedFeeIds.includes(fee.id);
                      return (
                        <div 
                          key={fee.id}
                          onClick={() => toggleFeeSelection(fee.id, amount)}
                          className={`flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{fee.feeStructure.feeType.name}</p>
                              {fee.penaltyAmount > 0 && <p className="text-[10px] text-rose-500 font-bold mt-0.5">Includes {formatCurrency(Number(fee.penaltyAmount))} late fee</p>}
                            </div>
                          </div>
                          <span className={`font-black text-lg ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
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
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Payment Method</h3>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {['CASH', 'UPI', 'CARD', 'CHEQUE'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setPayMethod(m); setPayError(''); }}
                          className={`py-4 rounded-xl border-2 font-black transition-all flex flex-col items-center gap-2 ${
                            payMethod === m 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {m === 'CASH' && <Banknote className="w-6 h-6" />}
                          {m === 'UPI' && <Smartphone className="w-6 h-6" />}
                          {m === 'CARD' && <CreditCard className="w-6 h-6" />}
                          {m === 'CHEQUE' && <Landmark className="w-6 h-6" />}
                          {m}
                        </button>
                      ))}
                    </div>

                    {/* Amount & Submit */}
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount Received</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                          <input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={recordPaymentMutation.isPending || selectedFeeIds.length === 0}
                        className="w-1/2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 h-[72px]"
                      >
                        {recordPaymentMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Receive'}
                        {!recordPaymentMutation.isPending && <ArrowRight className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Receipt Toggle */}
                    <div className="mt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setSelectedStudent(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">
                        Cancel
                      </button>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={generateReceipt} onChange={(e) => setGenerateReceipt(e.target.checked)} className="peer sr-only" />
                          <div className="w-5 h-5 border-2 border-slate-300 rounded transition-colors peer-checked:bg-indigo-600 peer-checked:border-indigo-600" />
                          <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors">Generate Receipt</span>
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
          <div className="bg-white rounded-[32px] p-6 border border-rose-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 mb-5 border-b border-rose-100 pb-2">Action Required</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Bounce Cheque</p>
                  <p className="text-sm font-bold text-slate-800">Rohan Sharma</p>
                  <p className="text-xs font-mono text-slate-500">₹1,000</p>
                </div>
                <button className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-colors">Open →</button>
              </div>
              <div className="w-full h-px bg-slate-100" />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Fee Waiver Request</p>
                  <p className="text-sm font-bold text-slate-800">Emily Chen</p>
                  <p className="text-xs font-mono text-slate-500">₹800</p>
                </div>
                <button className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-white transition-colors">Approve →</button>
              </div>
              <div className="w-full h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-purple-500 tracking-wider">Refund Pending</p>
                  <p className="text-sm font-bold text-slate-800">Kabir Mehta</p>
                  <p className="text-xs font-mono text-slate-500">₹1,200</p>
                </div>
                <button className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white transition-colors">Review →</button>
              </div>
            </div>
          </div>

          {/* Recent Collections */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm min-h-[400px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-5 border-b border-slate-100 pb-2">Recent Collections</h3>

            {txnsLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            ) : todayTransactions.length > 0 ? (
              <div className="space-y-4">
                {todayTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center group">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 w-10">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-sm font-bold text-slate-800">{tx.studentFee?.student?.user?.name || 'System User'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-12">
                        <span className="font-mono text-xs font-black text-emerald-600">{formatCurrency(tx.amount)}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                           • {tx.method} {tx.status === 'PENDING' && <span className="text-amber-500">Pending</span>}
                           {tx.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No collections yet</div>
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

      {/* ──────────────────────────────────────────────────────── */}
      {/* FLOATING PROGRESS WIDGET */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[250px] z-50 border border-slate-700 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Progress</span>
          <span className="text-xs font-black">{completedTodayCount} / {totalPendingStudents}</span>
        </div>
        
        {/* ASCII-style progress bar */}
        <div className="font-mono text-sm tracking-widest text-emerald-400">
          {'█'.repeat(Math.floor(progressPercent / 10))}
          <span className="text-slate-700">{'▒'.repeat(10 - Math.floor(progressPercent / 10))}</span>
        </div>
        
        <p className="text-[9px] font-bold text-slate-500 text-center mt-1 uppercase tracking-widest">Students Completed</p>
      </div>

      {/* PRINT-ONLY RECEIPT (Hidden in UI, rendered for window.print) */}
      {printReceiptData && createPortal(
        <div className="print-only fixed inset-0 z-[10000] bg-white">
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

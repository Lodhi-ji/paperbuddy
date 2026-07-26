import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import PrintReceipt from '../components/PrintReceipt';
import {
  Home,
  FileText,
  Download,
  User,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  QrCode,
  ShieldCheck,
  X,
  Clock,
  CreditCard,
  MessageSquare,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Navigation tab state: 'home' | 'invoices' | 'receipts' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Checkout flows
  const [selectedFee, setSelectedFee] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('summary'); // 'summary' | 'details' | 'processing' | 'success'
  const [payMethod, setPayMethod] = useState('UPI'); // UPI, CARD, NETBANKING, WALLET
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdTxn, setCreatedTxn] = useState(null);
  
  // Custom states
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [enlargeQr, setEnlargeQr] = useState(false);
  const [progressVal, setProgressVal] = useState(0);

  // UPI countdown timer
  const [countdown, setCountdown] = useState(120); // 2:00 minutes

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Print state
  const [printReceiptData, setPrintReceiptData] = useState(null);

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const { data: fees, isLoading: feesLoading } = useQuery({
    queryKey: ['studentFees'],
    queryFn: () => api.get('/student/fees'),
  });

  const { data: transactions, isLoading: txnsLoading } = useQuery({
    queryKey: ['studentTransactions'],
    queryFn: () => api.get('/student/transactions'),
  });

  const payMutation = useMutation({
    mutationFn: ({ id, method }) => api.post(`/student/fees/${id}/pay`, { method }),
    onSuccess: (data) => {
      setCreatedTxn(data.transaction);
      setPaymentSuccess(true);
      setProgressVal(100);
      setCheckoutStep('success');
      queryClient.invalidateQueries({ queryKey: ['studentFees'] });
      queryClient.invalidateQueries({ queryKey: ['studentTransactions'] });
    },
    onError: (err) => {
      alert(err.message || 'Payment simulation failed');
      setCheckoutStep('summary');
    },
  });

  // Countdown timer for UPI QR Code
  useEffect(() => {
    let timer;
    if (selectedFee && payMethod === 'UPI' && checkoutStep === 'details' && !paymentSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 120));
      }, 1000);
    } else {
      setCountdown(120);
    }
    return () => clearInterval(timer);
  }, [selectedFee, payMethod, checkoutStep, paymentSuccess]);

  // Calculations
  const calculations = useMemo(() => {
    let outstanding = 0;
    let waiversTotal = 0;
    let activeInvoicesCount = 0;

    fees?.forEach((fee) => {
      const due = Number(fee.amountDue);
      const paid = Number(fee.amountPaid);
      const waiver = Number(fee.waiverAmount);
      const penalty = Number(fee.penaltyAmount);
      const remaining = Math.max(0, (due + penalty) - (paid + waiver));

      outstanding += remaining;
      waiversTotal += waiver;

      if (remaining > 0) {
        activeInvoicesCount++;
      }
    });

    return {
      outstanding,
      waiversTotal,
      activeInvoicesCount,
    };
  }, [fees]);

  // Visual outstanding balance rolling counter
  const [visualOutstanding, setVisualOutstanding] = useState(0);
  useEffect(() => {
    if (feesLoading) return;
    const target = calculations.outstanding;
    if (visualOutstanding === 0) {
      setVisualOutstanding(target);
      return;
    }

    let start = visualOutstanding;
    const duration = 1000; 
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (target - start) * progress);
      setVisualOutstanding(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [calculations.outstanding, feesLoading]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleStartPayment = (fee) => {
    setSelectedFee(fee);
    setCheckoutStep('summary');
    setPaymentSuccess(false);
    setCreatedTxn(null);
    setProgressVal(0);
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setIsCardFlipped(false);
  };

  const handleTriggerPrint = (transaction) => {
    setPrintReceiptData(transaction);
    setTimeout(() => {
      window.print();
      setPrintReceiptData(null);
    }, 300);
  };

  const handleConfirmCheckout = (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    setCheckoutStep('processing');
    setProgressVal(10);
    setProcessingStage('Verifying Payment Credentials...');

    setTimeout(() => {
      setProgressVal(40);
      setProcessingStage('Contacting Secure Banking Node...');
      
      setTimeout(() => {
        setProgressVal(75);
        setProcessingStage('Updating Distributed Academic Ledger...');
        
        setTimeout(() => {
          payMutation.mutate({ id: selectedFee.id, method: payMethod });
        }, 800);
      }, 800);
    }, 800);
  };

  // Card spacing helper
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted.substring(0, 19));
  };

  // Format timer
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalPayableAmount = selectedFee ? (Number(selectedFee.amountDue) + Number(selectedFee.penaltyAmount) - Number(selectedFee.amountPaid) - Number(selectedFee.waiverAmount)) : 0;

  return (
    <div className="max-w-[800px] mx-auto px-4 pb-24 pt-4 min-h-screen bg-[#F8FAFC] text-[#111827] font-sans flex flex-col justify-between">
      
      {/* Embed Custom Styles for flips, confetti, and money wave animations */}
      <style>{`
        .perspective-container {
          perspective: 1000px;
        }
        .card-inner {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .card-inner.flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          backface-visibility: hidden;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        @keyframes pulse-wave {
          0% { transform: scale(0.9); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .wave-effect {
          animation: pulse-wave 2s infinite ease-out;
        }
      `}</style>

      {/* Top Header */}
      <div className="no-print">
        <Header />
      </div>

      {/* DESKTOP TOP NAV BAR */}
      <nav className="no-print hidden md:flex items-center justify-center gap-1 bg-white p-1 rounded-xl w-fit mx-auto mb-8 border border-[#E5E7EB] shadow-sm">
        {[
          { k: 'home', label: 'Home' },
          { k: 'invoices', label: 'Invoices' },
          { k: 'receipts', label: 'Receipts' },
          { k: 'profile', label: 'Profile' }
        ].map(tab => (
          <button 
            key={tab.k}
            onClick={() => setActiveTab(tab.k)}
            className={`px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === tab.k ? 'bg-[#5B5CEB] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 no-print">

        {/* ---------------------------------------------------- */}
        {/* TAB 1: HOME (Clean layout matching Stripe + Notion) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Greeting Header */}
            <div>
              <h2 className="text-lg font-bold text-[#111827] tracking-tight">
                👋 Good Morning, {user?.name || 'Rohan'}
              </h2>
            </div>

            {/* HERO OUTSTANDING BANNER (Stripe Style flat card) */}
            <div className="relative overflow-hidden rounded-xl p-6 bg-white border border-[#E5E7EB] text-[#111827] shadow-sm flex flex-col justify-between min-h-[160px]">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Outstanding Balance</span>
                <div className="text-3xl font-black font-mono tracking-tight text-[#111827]">
                  {formatCurrency(visualOutstanding)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">Due in 5 Days</span>
                </div>
                {calculations.outstanding > 0 ? (
                  <button 
                    onClick={() => {
                      const firstPending = fees?.find(f => Number(f.amountDue) > Number(f.amountPaid));
                      if (firstPending) handleStartPayment(firstPending);
                    }}
                    className="bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] w-full sm:w-auto"
                  >
                    Pay Now
                  </button>
                ) : (
                  <span className="text-xs text-[#10B981] font-bold uppercase tracking-wider">
                    ✓ All Dues Paid
                  </span>
                )}
              </div>
            </div>

            {/* Wallet Metric Cards (Three columns - Clean styling) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between min-h-[100px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">📄 Receipts</span>
                <span className="text-sm font-extrabold text-[#111827] mt-1.5">
                  {transactions?.length || 0} Available
                </span>
                <span className="text-[8px] text-slate-450 text-slate-400 mt-1 font-medium">Download Anytime</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between min-h-[100px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">⚡ Waivers</span>
                <span className="text-sm font-extrabold text-[#111827] mt-1.5">
                  {formatCurrency(calculations.waiversTotal)}
                </span>
                <span className="text-[8px] text-[#10B981] font-bold mt-1">Applied</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between min-h-[100px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">📅 Upcoming</span>
                <span className="text-sm font-extrabold text-[#111827] mt-1.5">
                  {calculations.activeInvoicesCount} Fees
                </span>
                <span className="text-[8px] text-slate-450 text-slate-400 mt-1 font-medium">31 Jul & 15 Aug</span>
              </div>
            </div>

            {/* UPCOMING FEES LIST (Clean, flat cards) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Fees</h3>
              {feesLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : fees && fees.length > 0 ? (
                <div className="space-y-2.5">
                  {fees.map((fee) => {
                    const due = Number(fee.amountDue);
                    const paid = Number(fee.amountPaid);
                    const waiver = Number(fee.waiverAmount);
                    const penalty = Number(fee.penaltyAmount);
                    const remaining = Math.max(0, (due + penalty) - (paid + waiver));

                    return (
                      <div 
                        key={fee.id}
                        className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm flex justify-between items-center hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="text-xs text-[#111827] font-semibold">📘 {fee.feeStructure?.feeType?.name}</div>
                          <div className="text-[10px] text-slate-450 text-slate-400 font-medium">Due {new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-sm font-bold text-[#111827] font-mono">{formatCurrency(remaining)}</span>
                          {remaining > 0 ? (
                            <button 
                              onClick={() => handleStartPayment(fee)}
                              className="text-xs font-bold text-[#5B5CEB] hover:text-[#4a4bd1] transition-colors flex items-center gap-1"
                            >
                              Pay →
                            </button>
                          ) : (
                            <span className="text-xs text-[#10B981] font-bold">Paid</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">No pending invoices.</div>
              )}
            </div>

            {/* RECENT PAYMENTS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Payments</h3>
              {txnsLoading ? (
                <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-2.5">
                  {transactions.slice(0, 3).map((tx) => (
                    <div 
                      key={tx.id}
                      className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm flex justify-between items-center"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-[#111827]">✓ {tx.studentFee?.feeStructure?.feeType?.name || 'School Fee'} Paid</div>
                        <div className="text-[9px] text-slate-400 font-medium">Paid on {new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-[#111827] font-mono">{formatCurrency(tx.amount)}</span>
                        <button 
                          onClick={() => handleTriggerPrint(tx)}
                          className="text-[10px] font-bold text-[#5B5CEB] hover:text-[#4a4bd1] transition-colors"
                        >
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs bg-white rounded-xl border border-[#E5E7EB] shadow-sm animate-pulse">No transaction records found.</div>
              )}
            </div>

            {/* NEED HELP */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Need Help?</h4>
              <div className="grid grid-cols-3 gap-3">
                <button className="py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all border border-[#E5E7EB] flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-500" /> Chat
                </button>
                <button className="py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all border border-[#E5E7EB] flex items-center justify-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" /> Support
                </button>
                <button className="py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all border border-[#E5E7EB] flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-500" /> FAQ
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: INVOICES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-[#111827] tracking-tight">Active Invoices</h1>
              <p className="text-xs text-slate-550 text-slate-500 font-semibold mt-0.5">Manage and pay academic invoices</p>
            </div>

            {feesLoading ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : fees && fees.length > 0 ? (
              <div className="space-y-2.5">
                {fees.map((fee) => {
                  const due = Number(fee.amountDue);
                  const paid = Number(fee.amountPaid);
                  const waiver = Number(fee.waiverAmount);
                  const penalty = Number(fee.penaltyAmount);
                  const remaining = Math.max(0, (due + penalty) - (paid + waiver));

                  return (
                    <div 
                      key={fee.id}
                      className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-[#111827]">{fee.feeStructure?.feeType?.name}</h4>
                        <div className="text-[10px] text-slate-450 text-slate-405 text-slate-500 font-semibold">
                          Due Date: {new Date(fee.dueDate).toLocaleDateString()} • Base: {formatCurrency(due)}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-bold text-[#111827] font-mono">{formatCurrency(remaining)}</span>
                        {remaining > 0 ? (
                          <button 
                            onClick={() => handleStartPayment(fee)}
                            className="bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Pay Dues
                          </button>
                        ) : (
                          <span className="text-xs text-[#10B981] font-bold">Paid</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">No active invoices found.</div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: RECEIPTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-[#111827] tracking-tight">Receipts History</h1>
              <p className="text-xs text-slate-505 text-slate-500 font-semibold mt-0.5">Immutable transactional ledger updates (Apple Wallet Passes)</p>
            </div>

            {txnsLoading ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : transactions && transactions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm text-[#111827]"
                  >
                    <div className="flex justify-between items-start pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Fee Category</span>
                        <h4 className="font-extrabold text-sm text-[#111827] mt-0.5">{tx.studentFee?.feeStructure?.feeType?.name || 'School Fee'}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[#10B981] text-[9px] font-bold uppercase">PAID</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center my-3">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase block">Paid Date</span>
                        <span className="text-xs font-semibold text-slate-700">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 font-bold uppercase block">Amount</span>
                        <span className="text-base font-black text-[#5B5CEB] font-mono">{formatCurrency(tx.amount)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleTriggerPrint(tx)}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-slate-700 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-xl border border-[#E5E7EB] shadow-sm">No payment receipts available.</div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: PROFILE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Scorecard Profile */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#5B5CEB]" />
              
              <div className="flex items-center gap-4 mt-4 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 shrink-0">
                  👤
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111827] leading-tight">{user?.name || 'Rohan Sharma'}</h2>
                  <p className="text-[9px] font-bold text-slate-450 text-slate-400 uppercase tracking-wider mt-0.5">{user?.email || 'rohan@greenwood.edu'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5 text-left">
                <div>
                  <span className="text-[8px] text-slate-405 text-slate-400 font-bold uppercase tracking-wider block">Class Grade</span>
                  <span className="text-xs font-bold text-[#111827] mt-0.5">Class 10-A</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-405 text-slate-400 font-bold uppercase tracking-wider block">Attendance Rate</span>
                  <span className="text-xs font-bold text-[#10B981] mt-0.5">94% (Excellent)</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-405 text-slate-400 font-bold uppercase tracking-wider block">Fee Status</span>
                  <span className="text-xs font-bold text-[#5B5CEB] mt-0.5">Excellent standing</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-405 text-slate-400 font-bold uppercase tracking-wider block">Academic Rank</span>
                  <span className="text-xs font-bold text-[#111827] mt-0.5">#4 in Class</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-[8px] text-slate-405 text-slate-400 font-bold uppercase tracking-wider block">Guardian Info</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">Rajesh Sharma (Father)</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scholarships & Achievements</h3>
              
              <div className="flex gap-3 items-center p-3 bg-slate-50 rounded-lg border border-[#E5E7EB]">
                <span className="text-base">🏆</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Sports Merit Scholarship</h4>
                  <p className="text-[10px] text-slate-505 text-slate-500 font-semibold mt-0.5">15% Waiver applied automatically to transport invoices.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* RAZORPAY & PHONEPE-STYLE CHECKOUT MULTI-STEP GATEWAY (MODAL OVERLAY) */}
      {selectedFee && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm no-print animate-in fade-in duration-200">
          
          {/* STEP 3: PROCESSING SCREEN - APPLE PAY BLUR COVER */}
          {checkoutStep === 'processing' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
              
              {/* Money Pulse Graphics */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-8">
                <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full wave-effect" />
                <div className="absolute w-28 h-28 bg-indigo-500/10 rounded-full wave-effect" style={{ animationDelay: '0.5s' }} />
                
                <div className="w-16 h-16 bg-[#5B5CEB] rounded-2xl shadow-xl flex items-center justify-center text-white text-2xl font-bold relative z-10">
                  💸
                </div>
              </div>

              <div className="space-y-4 max-w-xs mx-auto">
                <div className="text-3xl font-black font-mono text-white">
                  {formatCurrency(totalPayableAmount)}
                </div>
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Paying to</span>
                  <span className="text-white">Greenwood School</span>
                </div>

                <div className="pt-8">
                  <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">
                    {processingStage}
                  </div>
                  {/* Progress track */}
                  <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                    <div className="bg-[#5B5CEB] h-full rounded-full transition-all duration-500" style={{ width: `${progressVal}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CHECKOUT BOX CONTAINER */}
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh] relative transition-all duration-300">
            
            {/* Header / Brand info */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center text-[#111827]">
              <div>
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">CampusPay</h3>
                <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                  Secure Payment Gateway
                </span>
              </div>
              <button 
                onClick={() => setSelectedFee(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-[#E5E7EB]"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal scroll area */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-between min-h-[360px]">
              
              {/* STEP 1: PAYMENT SUMMARY & METHOD CHANNELS */}
              {checkoutStep === 'summary' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-5">
                    
                    {/* Invoice breakdown list */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[#111827]">{selectedFee.feeStructure?.feeType?.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Due: {new Date(selectedFee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>

                      <div className="border-t border-b border-[#E5E7EB] py-3.5 space-y-2 text-[11px] text-slate-550 text-slate-500 font-semibold">
                        <div className="flex justify-between"><span>Base Fee:</span><span className="text-slate-800">{formatCurrency(Number(selectedFee.amountDue))}</span></div>
                        {Number(selectedFee.penaltyAmount) > 0 && <div className="flex justify-between text-[#EF4444]"><span>Late Penalty:</span><span>+{formatCurrency(Number(selectedFee.penaltyAmount))}</span></div>}
                        {Number(selectedFee.waiverAmount) > 0 && <div className="flex justify-between text-[#10B981]"><span>Scholarship:</span><span>-{formatCurrency(Number(selectedFee.waiverAmount))}</span></div>}
                        {Number(selectedFee.amountPaid) > 0 && <div className="flex justify-between text-slate-400"><span>Paid:</span><span>{formatCurrency(Number(selectedFee.amountPaid))}</span></div>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-slate-500 font-bold">Total:</span>
                      <span className="text-2xl font-black text-[#111827] font-mono">
                        {formatCurrency(totalPayableAmount)}
                      </span>
                    </div>

                    {/* Method Selector Chips with icons */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Payment Method</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { k: 'UPI', icon: '📱', label: 'UPI' },
                          { k: 'CARD', icon: '💳', label: 'Card' },
                          { k: 'NETBANKING', icon: '🏦', label: 'Net Banking' },
                          { k: 'WALLET', icon: '👛', label: 'Wallet' }
                        ].map(method => (
                          <button
                            key={method.k}
                            type="button"
                            onClick={() => setPayMethod(method.k)}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              payMethod === method.k 
                                ? 'bg-white border-[#5B5CEB] text-[#5B5CEB] shadow-sm font-semibold' 
                                : 'bg-[#F8FAFC] border-[#E5E7EB] text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{method.icon}</span>
                            <span>{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCheckoutStep('details')}
                    className="w-full bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm mt-4"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* STEP 2: METHOD DETAILS (UPI QR or Card Live visualization) */}
              {checkoutStep === 'details' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Back header */}
                  <button 
                    onClick={() => setCheckoutStep('summary')}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors w-fit"
                  >
                    ← Back to Summary
                  </button>

                  <div className="space-y-4 flex-1">

                    {/* UPI DETAILS */}
                    {payMethod === 'UPI' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center space-y-3 relative">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scan QR Code</span>
                          
                          {/* QR Enlarge frame */}
                          <div 
                            onClick={() => setEnlargeQr(!enlargeQr)}
                            className={`bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center p-3 shadow-sm cursor-pointer transition-all duration-300 ${
                              enlargeQr ? 'scale-110' : 'hover:scale-102'
                            }`}
                          >
                            <QrCode className={`${enlargeQr ? 'w-28 h-28' : 'w-20 h-20'} text-slate-800 transition-all duration-300`} />
                            <span className="text-[7px] font-mono text-slate-400 mt-1.5 uppercase font-bold tracking-wider">
                              {enlargeQr ? 'Touch to Minimize' : 'Touch to Enlarge'}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 font-bold space-y-1 text-center">
                            <span className="flex items-center gap-1 text-[#5B5CEB] justify-center">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              Time Remaining: {formatTimer(countdown)}
                            </span>
                          </div>
                        </div>

                        {/* UPI Brand selector bubbles */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-slate-450 text-slate-400 font-bold uppercase tracking-wider block text-center">Waiting for Payment...</span>
                          <div className="grid grid-cols-3 gap-2">
                            {['Open GPay', 'Open PhonePe', 'Open Paytm'].map((app, i) => (
                              <button 
                                key={i}
                                type="button"
                                onClick={handleConfirmCheckout}
                                className="py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-[10px] font-bold text-slate-600 transition-colors shadow-sm text-center"
                              >
                                {app}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CARD DETAILS WITH DESKTOP SPLIT SCREEN */}
                    {payMethod === 'CARD' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        
                        {/* 3D Flipping Card Graphics (Left column) */}
                        <div className="perspective-container w-full h-[145px] relative mx-auto max-w-[260px]">
                          <div className={`card-inner w-full h-full relative ${isCardFlipped ? 'flipped' : ''}`}>
                            
                            {/* FRONT SIDE */}
                            <div className="card-front bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-4 text-white flex flex-col justify-between shadow-md border border-white/10 overflow-hidden">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-bold tracking-wider text-indigo-300">CampusPay Visa</span>
                                <div className="w-6 h-4 bg-yellow-400 rounded" />
                              </div>
                              
                              <div className="text-sm font-mono tracking-widest text-center py-2">
                                {cardNumber || '•••• •••• •••• ••••'}
                              </div>

                              <div className="flex justify-between items-end text-[8px] font-mono uppercase tracking-wider text-slate-300">
                                <div>
                                  <span className="block text-[5px] text-slate-400 mb-0.5">Cardholder</span>
                                  <span className="font-bold">{cardName || 'ROHAN SHARMA'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[5px] text-slate-400 mb-0.5">Expiry</span>
                                  <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                                </div>
                              </div>
                            </div>

                            {/* BACK SIDE */}
                            <div className="card-back bg-gradient-to-br from-slate-950 to-indigo-950 rounded-xl p-4 text-white flex flex-col justify-between shadow-md border border-white/10 overflow-hidden">
                              <div className="w-full h-7 bg-slate-800 -mx-4 mt-1" />
                              <div className="flex justify-end items-center gap-3 mt-1">
                                <div className="w-3/4 h-5 bg-white/10 rounded border border-white/5" />
                                <div className="text-right">
                                  <span className="block text-[5px] text-slate-400 mb-0.5 uppercase">CVV</span>
                                  <span className="font-mono text-[10px] font-bold text-indigo-300 bg-black/30 px-1.5 py-0.5 rounded">{cardCvv || '•••'}</span>
                                </div>
                              </div>
                              <div className="text-[6px] text-slate-500 font-semibold tracking-wider uppercase text-left">
                                Secured Sandbox Transaction
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Fields Form (Right column) */}
                        <div className="space-y-2 text-[10px] font-bold text-slate-605 text-slate-600">
                          <div>
                            <label className="block mb-0.5 uppercase tracking-wider text-[7px]">Cardholder Name</label>
                            <input 
                              type="text" 
                              placeholder="ROHAN SHARMA" 
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-slate-850 text-slate-800 focus:outline-none focus:border-[#5B5CEB] focus:bg-white transition-colors"
                              onFocus={() => setIsCardFlipped(false)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block mb-0.5 uppercase tracking-wider text-[7px]">Card Number</label>
                            <input 
                              type="text" 
                              placeholder="4111 2222 3333 4444" 
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-slate-850 text-slate-800 focus:outline-none focus:border-[#5B5CEB] focus:bg-white transition-colors"
                              onFocus={() => setIsCardFlipped(false)}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block mb-0.5 uppercase tracking-wider text-[7px]">Expiry</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-slate-850 text-slate-800 focus:outline-none focus:border-[#5B5CEB] focus:bg-white transition-colors"
                                onFocus={() => setIsCardFlipped(false)}
                                maxLength={5}
                                required
                              />
                            </div>
                            <div>
                              <label className="block mb-0.5 uppercase tracking-wider text-[7px]">CVV</label>
                              <input 
                                type="password" 
                                placeholder="•••" 
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-slate-850 text-slate-800 focus:outline-none focus:border-[#5B5CEB] focus:bg-white transition-colors"
                                onFocus={() => setIsCardFlipped(true)}
                                onBlur={() => setIsCardFlipped(false)}
                                maxLength={3}
                                required
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Netbanking dropdown */}
                    {payMethod === 'NETBANKING' && (
                      <div className="bg-[#F8FAFC] p-4 border border-[#E5E7EB] rounded-xl space-y-2">
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Select Banking Partner</label>
                        <select className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none">
                          <option value="sbi">State Bank of India (Sandbox)</option>
                          <option value="hdfc">HDFC Bank (Sandbox)</option>
                          <option value="icici">ICICI Bank (Sandbox)</option>
                        </select>
                      </div>
                    )}

                    {/* Wallet dropdown */}
                    {payMethod === 'WALLET' && (
                      <div className="bg-[#F8FAFC] p-4 border border-[#E5E7EB] rounded-xl space-y-2">
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Select Wallet Partner</label>
                        <select className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none">
                          <option value="paytm">Paytm Wallet (Sandbox)</option>
                          <option value="phonepe">PhonePe Wallet (Sandbox)</option>
                          <option value="amazon">Amazon Pay (Sandbox)</option>
                        </select>
                      </div>
                    )}

                  </div>

                  {/* Submit CTA button */}
                  {payMethod !== 'UPI' && (
                    <form onSubmit={handleConfirmCheckout}>
                      <button 
                        type="submit"
                        className="w-full bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm mt-4 animate-in fade-in"
                      >
                        Pay {formatCurrency(totalPayableAmount)}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 4: SUCCESS VIEW */}
              {checkoutStep === 'success' && (
                <div className="my-auto text-center space-y-6 py-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                  
                  {/* Tick icon */}
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-[#10B981] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#111827] tracking-tight">✓ Payment Successful</h3>
                    <div className="text-2xl font-black text-[#111827] font-mono tracking-tight mt-1">
                      {createdTxn ? formatCurrency(Number(createdTxn.amount)) : ''}
                    </div>
                  </div>

                  {createdTxn && (
                    <div className="w-full p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-[10px] space-y-2 text-slate-500 font-bold text-left max-w-xs mx-auto">
                      <div className="flex justify-between border-b border-slate-205 pb-1.5">
                        <span>Receipt ID</span>
                        <span className="font-mono text-slate-800 uppercase">CP-{(createdTxn.id || '').substring(0,8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Channel</span>
                        <span className="text-slate-850 text-slate-800 uppercase">{createdTxn.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receipt Copy</span>
                        <span className="text-[#10B981]">Generated ✓</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full max-w-xs pt-4">
                    <button 
                      onClick={() => {
                        if (createdTxn) {
                          const printableObj = {
                            ...createdTxn,
                            studentFee: {
                              ...selectedFee,
                              student: { user: { name: user.name } }
                            }
                          };
                          handleTriggerPrint(printableObj);
                        }
                      }}
                      className="w-full bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      Download Receipt
                    </button>
                    <button 
                      onClick={() => setSelectedFee(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* PRINT-ONLY PORTAL (STANDALONE RECEIPT PRINT ENGINE) */}
      {printReceiptData && createPortal(
        <div className="print-only fixed inset-0 z-[10000] bg-white text-black p-0">
          <PrintReceipt transaction={printReceiptData} />
        </div>,
        document.body
      )}

      {/* BOTTOM NAVIGATION BAR (iOS / Mobile style - Sticky) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-lg border-t border-[#E5E7EB] py-3 px-6 flex justify-between items-center z-50 shadow-lg max-w-[480px] mx-auto rounded-t-2xl">
        {[
          { k: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
          { k: 'invoices', icon: <FileText className="w-5 h-5" />, label: 'Dues' },
          { k: 'receipts', icon: <Download className="w-5 h-5" />, label: 'Receipts' },
          { k: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' }
        ].map(tab => (
          <button 
            key={tab.k}
            onClick={() => setActiveTab(tab.k)}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === tab.k ? 'text-[#5B5CEB] scale-105' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            {tab.icon}
            <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{tab.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

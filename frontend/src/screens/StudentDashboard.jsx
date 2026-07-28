import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import PrintReceipt from '../components/PrintReceipt';
import MessagesView from '../components/MessagesView';
import {
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
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  School,
  Smartphone,
  Landmark,
  Wallet,
  Banknote,
  History,
  Receipt,
  LogOut,
  Settings,
  Bell,
  Home,
} from 'lucide-react';

// ─── Hero Carousel slides definition (ready for dynamic data from admin) ──────
const DEFAULT_SLIDES = [
  {
    id: 1,
    image: '/slide-campus.jpg',
    badge: 'Welcome',
    title: (name) => `Welcome back, ${name || 'Student'}.`,
    subtitle: 'Everything you need for your school payments, in one place.',
    cta: null,
    overlayFrom: 'from-slate-900/70',
    overlayTo: 'to-transparent',
  },
  {
    id: 2,
    image: '/slide-payment.jpg',
    badge: 'Payments',
    title: () => 'Payments made simple.',
    subtitle: 'View dues, pay securely and download receipts instantly.',
    cta: { label: 'View Dues', tab: 'invoices' },
    overlayFrom: 'from-indigo-950/80',
    overlayTo: 'to-indigo-900/20',
  },
  {
    id: 3,
    image: '/slide-notice.jpg',
    badge: 'Stay Updated',
    title: () => 'Stay up to date.',
    subtitle: 'Important notices and payment reminders will appear here.',
    cta: null,
    overlayFrom: 'from-amber-950/60',
    overlayTo: 'to-transparent',
  },
];

// ─── Carousel component ────────────────────────────────────────────────────────
function HeroCarousel({ slides, onCtaClick, userName }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5500);
  }, [slides.length]);

  useEffect(() => {
    if (!isHovered) startTimer();
    return () => clearInterval(timerRef.current);
  }, [isHovered, startTimer]);

  const goTo = (idx) => {
    setCurrent(idx);
    startTimer();
  };
  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  const slide = slides[current];

  return (
    <div
      className="relative w-full h-[320px] md:h-[400px] overflow-hidden rounded-2xl md:rounded-[24px] select-none mx-auto max-w-[1280px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img
            src={s.image}
            alt={`Slide ${i + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlayFrom} ${s.overlayTo}`} />
        </div>
      ))}

      {/* Text Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10 max-w-[550px]">
        <div
          key={current}
          style={{ animation: 'slideUp 0.5s ease forwards' }}
        >
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            {slide.badge}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md max-w-xl">
            {slide.title(userName)}
          </h1>
          <p className="text-sm md:text-base text-white/75 mt-2 font-medium max-w-lg leading-relaxed">
            {slide.subtitle}
          </p>
          {slide.cta && (
            <button
              onClick={() => onCtaClick(slide.cta.tab)}
              className="mt-4 inline-flex items-center gap-2 bg-white text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              {slide.cta.label} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav arrows — desktop only */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 items-center justify-center text-white hover:bg-black/50 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 items-center justify-center text-white hover:bg-black/50 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Action Card ───────────────────────────────────────────────────────────────
function ActionCard({ icon: Icon, iconBg, title, subtitle, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-5 md:p-6 text-left flex flex-col gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.98] aspect-square sm:aspect-auto sm:min-h-[130px] md:min-h-[140px]"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${iconBg} flex-shrink-0`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 flex flex-col justify-end md:justify-start mt-auto md:mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[15px] md:text-[16px] font-bold text-slate-900 leading-snug">{title}</span>
          {badge && (
            <span className="text-[10px] md:text-[11px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full leading-none">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[12px] md:text-[13px] text-slate-400 font-medium mt-1 leading-snug line-clamp-1">{subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all absolute bottom-5 right-5 md:bottom-6 md:right-6" />
    </button>
  );
}

// ─── Avatar Dropdown ───────────────────────────────────────────────────────────
function AvatarMenu({ user, onTabChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'ST';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm flex items-center justify-center border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-transform ring-2 ring-indigo-100"
        aria-label="Profile menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          {[
            { label: 'Profile', icon: User, tab: 'profile' },
            { label: 'Messages', icon: MessageSquare, tab: 'messages' },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => { onTabChange(item.tab); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <item.icon className="w-4 h-4 text-slate-400" />
              {item.label}
            </button>
          ))}
          <div className="border-t border-slate-50">
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('home');

  // Checkout flows (ALL PRESERVED — untouched)
  const [selectedFee, setSelectedFee] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('summary');
  const [payMethod, setPayMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdTxn, setCreatedTxn] = useState(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [enlargeQr, setEnlargeQr] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [countdown, setCountdown] = useState(120);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [printReceiptData, setPrintReceiptData] = useState(null);

  // ── Data fetching ────────────────────────────────────────────────────────────
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

  // ── UPI countdown ─────────────────────────────────────────────────────────────
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

  // ── Calculations ──────────────────────────────────────────────────────────────
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
      if (remaining > 0) activeInvoicesCount++;
    });

    return { outstanding, waiversTotal, activeInvoicesCount };
  }, [fees]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(val || 0);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartPayment = (fee) => {
    setSelectedFee(fee);
    setCheckoutStep('summary');
    setPaymentSuccess(false);
    setCreatedTxn(null);
    setProgressVal(0);
    setCardNumber(''); setCardName(''); setCardExpiry(''); setCardCvv('');
    setIsCardFlipped(false);
  };

  const handleTriggerPrint = (transaction) => {
    setPrintReceiptData(transaction);
    setTimeout(() => { window.print(); setPrintReceiptData(null); }, 300);
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
        setTimeout(() => { payMutation.mutate({ id: selectedFee.id, method: payMethod }); }, 800);
      }, 800);
    }, 800);
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted.substring(0, 19));
  };

  const totalPayableAmount = selectedFee
    ? (Number(selectedFee.amountDue) + Number(selectedFee.penaltyAmount) - Number(selectedFee.amountPaid) - Number(selectedFee.waiverAmount))
    : 0;

  // Upcoming fees = unpaid or partial
  const upcomingFees = useMemo(() =>
    (fees || []).filter(f => {
      const remaining = Math.max(0, (Number(f.amountDue) + Number(f.penaltyAmount)) - (Number(f.amountPaid) + Number(f.waiverAmount)));
      return remaining > 0;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [fees]
  );

  const recentTransactions = useMemo(() =>
    (transactions || []).slice(0, 3),
    [transactions]
  );

  const firstName = user?.name?.split(' ')[0] || 'Student';

  // ── Tab change handler ────────────────────────────────────────────────────────
  const handleTabChange = (tab) => setActiveTab(tab);

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-slate-900 font-sans">

      {/* ── Inline styles ──────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-wave {
          0% { transform: scale(0.9); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .wave-effect { animation: pulse-wave 2s infinite ease-out; }
        .perspective-container { perspective: 1000px; }
        .card-inner { transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); transform-style: preserve-3d; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-front, .card-back { backface-visibility: hidden; position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100/80">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 h-[72px] md:h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => setActiveTab('home')} className="flex-shrink-0 flex items-center">
            <img
              src="/campuspay-logo.png"
              alt="CampusPay"
              className="w-[115px] md:w-[145px] object-contain object-left"
            />
          </button>

          {/* Right: notification bell (mobile only) + avatar */}
          <div className="flex items-center gap-3">
            {upcomingFees.length > 0 && (
              <button
                onClick={() => setActiveTab('invoices')}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
              </button>
            )}
            <AvatarMenu user={user} onTabChange={handleTabChange} />
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 pb-24 md:pb-16 pt-6 space-y-0 no-print">

        {/* Global Desktop Back Button */}
        {activeTab !== 'home' && (
          <button 
            onClick={() => setActiveTab('home')}
            className="hidden md:flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
        )}

        {/* ═══════════════════════════════════════════════════════
            HOME TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div>
            {/* HERO CAROUSEL */}
            <HeroCarousel
              slides={DEFAULT_SLIDES}
              onCtaClick={handleTabChange}
              userName={firstName}
            />

            {/* FOUR ACTION CARDS */}
            <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <ActionCard
                icon={Receipt}
                iconBg="bg-indigo-50 text-indigo-600"
                title="Active Fees"
                subtitle="View & pay dues"
                badge={calculations.activeInvoicesCount > 0 ? `${calculations.activeInvoicesCount} due` : null}
                onClick={() => setActiveTab('invoices')}
              />
              <ActionCard
                icon={History}
                iconBg="bg-emerald-50 text-emerald-600"
                title="Transactions"
                subtitle="Payments & receipts"
                onClick={() => setActiveTab('receipts')}
              />
              <ActionCard
                icon={MessageSquare}
                iconBg="bg-violet-50 text-violet-600"
                title="Conversations"
                subtitle="School messages"
                onClick={() => setActiveTab('messages')}
              />
              <ActionCard
                icon={User}
                iconBg="bg-rose-50 text-rose-500"
                title="My Profile"
                subtitle="Personal & academic info"
                onClick={() => setActiveTab('profile')}
              />
            </div>



            <div className="h-8" />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            INVOICES TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'invoices' && (
          <div className="pt-2 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Fees</h1>
              <p className="text-sm text-slate-400 font-medium mt-1">Manage and pay your academic invoices</p>
            </div>

            {feesLoading ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : fees && fees.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {fees.map((fee) => {
                  const due = Number(fee.amountDue);
                  const paid = Number(fee.amountPaid);
                  const waiver = Number(fee.waiverAmount);
                  const penalty = Number(fee.penaltyAmount);
                  const remaining = Math.max(0, (due + penalty) - (paid + waiver));
                  const isPaid = remaining === 0;
                  return (
                    <div key={fee.id} className="flex items-center justify-between px-5 py-5 hover:bg-slate-50/40 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900">{fee.feeStructure?.feeType?.name}</h4>
                        <div className="text-xs text-slate-400 font-medium">
                          Due {new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {Number(fee.penaltyAmount) > 0 && <span className="text-rose-500 ml-2">+{formatCurrency(fee.penaltyAmount)} penalty</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(remaining)}</span>
                        {!isPaid ? (
                          <button
                            onClick={() => handleStartPayment(fee)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                          >
                            Pay
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="font-bold text-slate-700">No active invoices</p>
                <p className="text-xs text-slate-400 mt-1">You're all clear.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            RECEIPTS TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'receipts' && (
          <div className="pt-2 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h1>
              <p className="text-sm text-slate-400 font-medium mt-1">All your payment receipts in one place</p>
            </div>

            {txnsLoading ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : transactions && transactions.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/40 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{tx.studentFee?.feeStructure?.feeType?.name || 'School Fee'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{tx.receiptUrl?.substring(0, 12) || `CP-${tx.id.substring(0, 8).toUpperCase()}`}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(tx.amount)}</span>
                      <button
                        onClick={() => handleTriggerPrint(tx)}
                        className="text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700">No transactions yet</p>
                <p className="text-xs text-slate-400 mt-1">Your payment history will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            PROFILE TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="pt-2 pb-12 max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
            </div>

            {/* Identity Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center p-6 gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-2xl md:text-3xl shadow-lg border-4 border-white flex-shrink-0">
                {user?.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">{user?.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm font-medium text-slate-500">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">{user?.studentProfile?.rollNumber || 'No Roll #'}</span>
                  <span>•</span>
                  <span>Class {user?.studentProfile?.class || 'N/A'}</span>
                  <span>•</span>
                  <span>Section {user?.studentProfile?.section || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                    <span className="text-sm font-semibold text-slate-900 truncate">{user?.name}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Date of Birth</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.dateOfBirth ? new Date(user.studentProfile.dateOfBirth).toLocaleDateString('en-GB') : '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Email</span>
                    <span className="text-sm font-semibold text-slate-900 truncate block">{user?.email || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.phone || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Gender</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.gender || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Blood Group</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.bloodGroup || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-4">Academic Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Institution</span>
                    <span className="text-sm font-semibold text-slate-900 truncate block">{user?.schoolName || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Admission Date</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.admissionDate ? new Date(user.studentProfile.admissionDate).toLocaleDateString('en-GB') : '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.rollNumber || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Class & Section</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.class || '—'} {user?.studentProfile?.section || ''}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-4">Guardian Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Guardian Name</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.guardianName || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Guardian Phone</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.guardianPhone || '—'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Guardian Email</span>
                    <span className="text-sm font-semibold text-slate-900 truncate block">{user?.studentProfile?.guardianEmail || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-4">Address</h3>
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Residential Address</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.studentProfile?.address || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            MESSAGES TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'messages' && (
          <div className="pt-2">
            <div className="mb-5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Conversations</h1>
              <p className="text-sm text-slate-400 font-medium mt-1">Messages from your school</p>
            </div>
            <MessagesView />
          </div>
        )}

      </main>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────────── */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-safe z-50 shadow-[0_-1px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-16 max-w-sm mx-auto px-2">
          {[
            { k: 'home', icon: Home, label: 'Home' },
            { k: 'invoices', icon: Receipt, label: 'Fees', badge: calculations.activeInvoicesCount },
            { k: 'receipts', icon: History, label: 'History' },
            { k: 'messages', icon: MessageSquare, label: 'Messages' },
            { k: 'profile', icon: User, label: 'Profile' },
          ].map(tab => (
            <button
              key={tab.k}
              onClick={() => setActiveTab(tab.k)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 transition-colors ${
                activeTab === tab.k ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={activeTab === tab.k ? 2.5 : 2} />
              {tab.badge > 0 && (
                <span className="absolute -top-0.5 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                  {tab.badge}
                </span>
              )}
              <span className={`text-[9px] font-bold ${activeTab === tab.k ? 'font-black' : ''}`}>{tab.label}</span>
              {activeTab === tab.k && (
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          CHECKOUT GATEWAY MODAL (100% PRESERVED)
      ════════════════════════════════════════════════════════ */}
      {selectedFee && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm no-print animate-in fade-in duration-200">

          {/* Processing overlay */}
          {checkoutStep === 'processing' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
              <div className="relative w-36 h-36 flex items-center justify-center mb-8">
                <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full wave-effect" />
                <div className="absolute w-28 h-28 bg-indigo-500/10 rounded-full wave-effect" style={{ animationDelay: '0.5s' }} />
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white text-2xl font-bold relative z-10">
                  <Banknote className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-4 max-w-xs mx-auto">
                <div className="text-3xl font-black font-mono text-white">{formatCurrency(totalPayableAmount)}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Processing payment…</div>
                <div className="pt-6">
                  <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">{processingStage}</div>
                  <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressVal}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Checkout container */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] relative">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xs text-indigo-600 uppercase tracking-wider">CampusPay</h3>
                <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">Secure Payment Gateway</span>
              </div>
              <button
                onClick={() => setSelectedFee(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-100"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between min-h-[360px]">

              {/* STEP 1: Summary */}
              {checkoutStep === 'summary' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{selectedFee.feeStructure?.feeType?.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                            Due: {new Date(selectedFee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-b border-slate-100 py-3.5 space-y-2 text-[11px] text-slate-500 font-semibold">
                        <div className="flex justify-between"><span>Base Fee:</span><span className="text-slate-800">{formatCurrency(Number(selectedFee.amountDue))}</span></div>
                        {Number(selectedFee.penaltyAmount) > 0 && <div className="flex justify-between text-rose-500"><span>Late Penalty:</span><span>+{formatCurrency(Number(selectedFee.penaltyAmount))}</span></div>}
                        {Number(selectedFee.waiverAmount) > 0 && <div className="flex justify-between text-emerald-500"><span>Scholarship:</span><span>-{formatCurrency(Number(selectedFee.waiverAmount))}</span></div>}
                        {Number(selectedFee.amountPaid) > 0 && <div className="flex justify-between text-slate-400"><span>Paid:</span><span>{formatCurrency(Number(selectedFee.amountPaid))}</span></div>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-slate-500 font-bold">Total:</span>
                      <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(totalPayableAmount)}</span>
                    </div>
                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Payment Method</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { k: 'UPI', icon: <Smartphone className="w-4 h-4" />, label: 'UPI' },
                          { k: 'CARD', icon: <CreditCard className="w-4 h-4" />, label: 'Card' },
                          { k: 'NETBANKING', icon: <Landmark className="w-4 h-4" />, label: 'Net Banking' },
                          { k: 'WALLET', icon: <Wallet className="w-4 h-4" />, label: 'Wallet' }
                        ].map((method) => (
                          <button
                            key={method.k}
                            type="button"
                            onClick={() => setPayMethod(method.k)}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              payMethod === method.k
                                ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {method.icon}{method.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm mt-4 flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Details */}
              {checkoutStep === 'details' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <button
                    onClick={() => setCheckoutStep('summary')}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors w-fit flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Summary
                  </button>

                  <div className="space-y-4 flex-1">
                    {/* UPI */}
                    {payMethod === 'UPI' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center space-y-3 relative">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scan QR Code</span>
                          <div
                            onClick={() => setEnlargeQr(!enlargeQr)}
                            className={`bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-3 shadow-sm cursor-pointer transition-all duration-300 ${enlargeQr ? 'scale-110' : 'hover:scale-105'}`}
                          >
                            <QrCode className={`${enlargeQr ? 'w-28 h-28' : 'w-20 h-20'} text-slate-800 transition-all duration-300`} />
                            <span className="text-[7px] font-mono text-slate-400 mt-1.5 uppercase font-bold tracking-wider">
                              {enlargeQr ? 'Touch to Minimize' : 'Touch to Enlarge'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold space-y-1 text-center">
                            <span className="flex items-center gap-1 text-indigo-600 justify-center">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              Time Remaining: {formatTimer(countdown)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block text-center">Waiting for Payment…</span>
                          <div className="grid grid-cols-3 gap-2">
                            {['Open GPay', 'Open PhonePe', 'Open Paytm'].map((app, i) => (
                              <button key={i} type="button" onClick={handleConfirmCheckout}
                                className="py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[10px] font-bold text-slate-600 transition-colors shadow-sm text-center">
                                {app}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CARD */}
                    {payMethod === 'CARD' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="perspective-container w-full h-[145px] relative mx-auto max-w-[260px]">
                          <div className={`card-inner w-full h-full relative ${isCardFlipped ? 'flipped' : ''}`}>
                            <div className="card-front bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-4 text-white flex flex-col justify-between shadow-md border border-white/10 overflow-hidden">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-bold tracking-wider text-indigo-300">CampusPay Visa</span>
                                <CreditCard className="w-6 h-4 text-yellow-400" />
                              </div>
                              <div className="text-sm font-mono tracking-widest text-center py-2">{cardNumber || '•••• •••• •••• ••••'}</div>
                              <div className="flex justify-between items-end text-[8px] font-mono uppercase tracking-wider text-slate-300">
                                <div><span className="block text-[5px] text-slate-400 mb-0.5">Cardholder</span><span className="font-bold">{cardName || 'YOUR NAME'}</span></div>
                                <div className="text-right"><span className="block text-[5px] text-slate-400 mb-0.5">Expiry</span><span className="font-bold">{cardExpiry || 'MM/YY'}</span></div>
                              </div>
                            </div>
                            <div className="card-back bg-gradient-to-br from-slate-950 to-indigo-950 rounded-xl p-4 text-white flex flex-col justify-between shadow-md border border-white/10 overflow-hidden">
                              <div className="w-full h-7 bg-slate-800 -mx-4 mt-1" />
                              <div className="flex justify-end items-center gap-3 mt-1">
                                <div className="w-3/4 h-5 bg-white/10 rounded border border-white/5" />
                                <div className="text-right">
                                  <span className="block text-[5px] text-slate-400 mb-0.5 uppercase">CVV</span>
                                  <span className="font-mono text-[10px] font-bold text-indigo-300 bg-black/30 px-1.5 py-0.5 rounded">{cardCvv || '•••'}</span>
                                </div>
                              </div>
                              <div className="text-[6px] text-slate-500 font-semibold tracking-wider uppercase">Secured Sandbox</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600">
                          {[
                            { label: 'Cardholder Name', ph: 'YOUR NAME', val: cardName, set: (v) => setCardName(v.toUpperCase()), flip: false },
                            { label: 'Card Number', ph: '4111 2222 3333 4444', val: cardNumber, set: handleCardNumberChange, flip: false, raw: true },
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block mb-0.5 uppercase tracking-wider text-[7px]">{f.label}</label>
                              <input type="text" placeholder={f.ph} value={f.val}
                                onChange={f.raw ? f.set : (e) => f.set(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                onFocus={() => setIsCardFlipped(false)} />
                            </div>
                          ))}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block mb-0.5 uppercase tracking-wider text-[7px]">Expiry</label>
                              <input type="text" placeholder="MM/YY" value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                onFocus={() => setIsCardFlipped(false)} maxLength={5} />
                            </div>
                            <div>
                              <label className="block mb-0.5 uppercase tracking-wider text-[7px]">CVV</label>
                              <input type="password" placeholder="•••" value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                onFocus={() => setIsCardFlipped(true)} onBlur={() => setIsCardFlipped(false)} maxLength={3} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Net Banking */}
                    {payMethod === 'NETBANKING' && (
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Select Banking Partner</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none">
                          <option value="sbi">State Bank of India (Sandbox)</option>
                          <option value="hdfc">HDFC Bank (Sandbox)</option>
                          <option value="icici">ICICI Bank (Sandbox)</option>
                        </select>
                      </div>
                    )}

                    {/* Wallet */}
                    {payMethod === 'WALLET' && (
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                        <label className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Select Wallet Partner</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none">
                          <option value="paytm">Paytm Wallet (Sandbox)</option>
                          <option value="phonepe">PhonePe Wallet (Sandbox)</option>
                          <option value="amazon">Amazon Pay (Sandbox)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {payMethod !== 'UPI' && (
                    <form onSubmit={handleConfirmCheckout}>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm mt-4"
                      >
                        Pay {formatCurrency(totalPayableAmount)}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 4: Success */}
              {checkoutStep === 'success' && (
                <div className="my-auto text-center space-y-6 py-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Payment Successful</h3>
                    <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                      {createdTxn ? formatCurrency(Number(createdTxn.amount)) : ''}
                    </div>
                  </div>
                  {createdTxn && (
                    <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] space-y-2 text-slate-500 font-bold text-left max-w-xs mx-auto">
                      <div className="flex justify-between border-b border-slate-200 pb-1.5">
                        <span>Receipt ID</span>
                        <span className="font-mono text-slate-800 uppercase">CP-{(createdTxn.id || '').substring(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Channel</span>
                        <span className="text-slate-800 uppercase">{createdTxn.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receipt Copy</span>
                        <span className="text-emerald-500 flex items-center gap-1">Generated <CheckCircle2 className="w-3 h-3" /></span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                    <button
                      onClick={() => {
                        if (createdTxn) {
                          const printableObj = {
                            ...createdTxn,
                            studentFee: { ...selectedFee, student: { user: { name: user.name } } }
                          };
                          handleTriggerPrint(printableObj);
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Download Receipt
                    </button>
                    <button
                      onClick={() => setSelectedFee(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-xl text-sm font-bold transition-colors"
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

      {/* ── PRINT PORTAL ─────────────────────────────────────────────────────── */}
      {printReceiptData && createPortal(
        <div className="print-only fixed inset-0 z-[10000] bg-white text-black p-0">
          <PrintReceipt transaction={printReceiptData} />
        </div>,
        document.body
      )}

    </div>
  );
}

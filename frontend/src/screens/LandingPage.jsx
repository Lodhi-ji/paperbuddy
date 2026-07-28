import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  CheckCircle2,
  Lock,
  Download,
  Users,
  Loader2,
  Check,
  ChevronRight,
  Layers,
  ShieldCheck,
  Zap,
  FileText,
  Activity,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Building,
  GraduationCap
} from 'lucide-react';

// ==========================================
// 1. ANCILLARY COMPONENTS
// ==========================================

// Simple CountUp animation for ledger numbers
function AnimatedLedgerNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 1000; // ms
    const startTime = performance.now();

    const updateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.floor(start + (end - start) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value]);

  return <span>₹{displayValue.toLocaleString('en-IN')}</span>;
}

// Simulated Transactions List
const SIMULATED_TXS = [
  { name: 'Rahul Sharma', fee: 'Tuition Fee', amount: 2500, ledgerStart: 42500, ledgerEnd: 45000, method: 'UPI', code: 'CP-28491' },
  { name: 'Priya Patel', fee: 'Transport Fee', amount: 1100, ledgerStart: 18400, ledgerEnd: 19500, method: 'CARD', code: 'CP-19042' },
  { name: 'Aarav Gupta', fee: 'Exam Fee', amount: 800, ledgerStart: 31200, ledgerEnd: 32000, method: 'UPI', code: 'CP-87291' },
  { name: 'Sneha Verma', fee: 'Laboratory Fee', amount: 2000, ledgerStart: 51000, ledgerEnd: 53000, method: 'CASH', code: 'CP-44023' }
];

// ==========================================
// 2. RECONCILIATION CANVAS (DARK GLASS SYSTEM)
// ==========================================
function ReconciliationCanvas() {
  const [txIndex, setTxIndex] = useState(0);
  const [step, setStep] = useState(0); // 0: Idle, 1: Processing, 2: Reconciled, 3: Settle
  const [ledgerVal, setLedgerVal] = useState(SIMULATED_TXS[0].ledgerStart);

  const activeTx = SIMULATED_TXS[txIndex];

  useEffect(() => {
    let interval;
    const runCycle = () => {
      setStep(1);
      
      setTimeout(() => {
        setStep(2);
        setLedgerVal(SIMULATED_TXS[txIndex].ledgerEnd);
        
        setTimeout(() => {
          setStep(3);
          
          setTimeout(() => {
            setStep(0);
            setTxIndex((prev) => (prev + 1) % SIMULATED_TXS.length);
          }, 2000);
        }, 2200);
      }, 1800);
    };

    const initialTimeout = setTimeout(runCycle, 1000);
    interval = setInterval(runCycle, 7500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [txIndex]);

  useEffect(() => {
    if (step === 0 || step === 1) {
      setLedgerVal(SIMULATED_TXS[txIndex].ledgerStart);
    }
  }, [txIndex, step]);

  return (
    <div className="relative w-full max-w-[480px] h-[400px] select-none font-sans">
      
      {/* 1. Transaction Pipeline Panel (Dark Glass) */}
      <div className="absolute top-2 left-2 w-[290px] z-20">
        <div className="bg-[#13172D]/85 border border-[#23294E] p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transaction Pipeline</span>
            <span className="flex items-center gap-1 text-[8px] font-bold text-[#5B5CEB] bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {step === 1 ? 'PROCESSING' : step >= 2 ? 'VERIFIED' : 'ACTIVE'}
            </span>
          </div>

          <div className="space-y-2">
            <div className={`p-3 rounded-xl border transition-all duration-300 ${
              step === 1 ? 'border-indigo-500/60 bg-indigo-500/5' : step >= 2 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800/60 bg-slate-900/20'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[10px] font-black text-slate-100 leading-none">{activeTx.name}</h4>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{activeTx.fee}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-white">₹{activeTx.amount.toLocaleString('en-IN')}</span>
                  <div className="text-[7px] font-bold text-slate-400 mt-0.5">{activeTx.method}</div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-3 flex items-center justify-between text-[8px] font-bold">
                <span className="text-slate-400">Status</span>
                {step === 1 ? (
                  <span className="text-indigo-400 flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Matching records
                  </span>
                ) : step >= 2 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Reconciled ✓
                  </span>
                ) : (
                  <span className="text-slate-400">Awaiting payload</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Institution Ledger Card */}
      <div className="absolute top-[125px] right-2 w-[240px] z-30">
        <div className="bg-[#030712]/95 border border-[#1E293B] p-5 rounded-2xl text-white shadow-xl flex flex-col gap-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Institution Ledger</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
            <AnimatedLedgerNumber value={ledgerVal} />
          </div>

          <div className="text-[8px] font-semibold text-slate-400 mt-1 border-t border-[#1E293B] pt-2 flex justify-between">
            <span>Account Status</span>
            <span className="text-emerald-400">Reconciled in real-time</span>
          </div>
        </div>
      </div>

      {/* 3. Dotted Receipt slip card (Dark) */}
      <div className="absolute bottom-2 left-6 w-[220px] z-20">
        <div className={`bg-[#13172D]/90 border border-dashed p-4 rounded-xl shadow-premium backdrop-blur-md transition-all duration-500 transform ${
          step >= 2 ? 'opacity-100 translate-y-0 border-slate-600' : 'opacity-30 translate-y-2 border-slate-800'
        }`}>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{activeTx.code}</span>
            <span className="text-[7px] font-bold text-slate-500 uppercase">INVOICE</span>
          </div>
          
          <div className="space-y-1.5 text-[9px] font-semibold text-slate-300">
            <div className="flex justify-between">
              <span>Student</span>
              <span className="text-white font-bold">{activeTx.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Particulars</span>
              <span className="text-white font-bold">{activeTx.fee}</span>
            </div>
            <div className="flex justify-between">
              <span>Settled Sum</span>
              <span className="text-white font-bold">₹{activeTx.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Barcode */}
          <div className="flex gap-0.5 h-5 mt-3.5 items-stretch opacity-60">
            <div className="w-[1px] bg-slate-400" />
            <div className="w-[3px] bg-slate-400" />
            <div className="w-[1px] bg-slate-400" />
            <div className="w-[2px] bg-slate-400" />
            <div className="w-[1px] bg-slate-400" />
            <div className="w-[4px] bg-slate-400" />
            <div className="w-[1.5px] bg-slate-400" />
            <div className="w-[2px] bg-slate-400" />
            <div className="w-[1px] bg-slate-400" />
            <div className="w-[3.5px] bg-slate-400" />
            <div className="w-[1px] bg-slate-400" />
          </div>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// 3. CAPABILITY PREVIEWS
// ==========================================

function PaymentsPreview() {
  return (
    <div className="bg-[#13172D] rounded-2xl border border-[#23294E] p-5 shadow-premium text-white max-w-sm w-full mx-auto font-sans">
      <div className="flex justify-between items-start border-b border-slate-800 pb-3.5 mb-4">
        <div>
          <h5 className="text-xs font-black tracking-tight text-white">Greenwood International</h5>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Active Invoice</span>
        </div>
        <div className="bg-[#5B5CEB]/10 text-[#5B5CEB] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Class 10-A
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-300 bg-[#0F1224] p-2.5 rounded-xl border border-slate-800/40">
          <span>Tuition Fee (Monthly)</span>
          <span className="font-bold text-white">₹5,000</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-300 bg-[#0F1224] p-2.5 rounded-xl border border-slate-800/40">
          <span>Transport Fee (Optional)</span>
          <span className="font-bold text-white">₹1,500</span>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3.5 flex justify-between items-baseline mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
        <span className="text-lg font-black text-white font-mono">₹6,500</span>
      </div>

      <button className="w-full bg-[#5B5CEB] hover:bg-indigo-650 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98]">
        Pay via UPI / Cards <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ReconciliationPreview() {
  const txs = [
    { code: 'TXN-94021', name: 'Rahul Sharma', fee: 'Tuition', amount: '₹5,000', status: 'PAID' },
    { code: 'TXN-10492', name: 'Priya Patel', fee: 'Transport', amount: '₹1,500', status: 'PAID' },
    { code: 'TXN-48201', name: 'Aarav Gupta', fee: 'Library', amount: '₹1,200', status: 'PARTIAL' }
  ];

  return (
    <div className="bg-[#13172D] rounded-2xl border border-[#23294E] p-4 shadow-premium w-full max-w-sm mx-auto font-sans text-white">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ledger Sync</h5>
        <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
          <Activity className="w-2.5 h-2.5 animate-pulse" /> Live synchronized
        </div>
      </div>
      
      <div className="space-y-2 text-[9px] font-medium text-slate-300">
        {txs.map((t, idx) => (
          <div key={idx} className="flex justify-between items-center border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
            <div>
              <div className="font-bold text-slate-200">{t.name}</div>
              <div className="text-[8px] text-slate-400 uppercase tracking-wider">{t.code} • {t.fee}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white">{t.amount}</div>
              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide inline-block mt-0.5 ${
                t.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunicationPreview() {
  return (
    <div className="bg-[#13172D] rounded-2xl border border-[#23294E] p-4.5 shadow-premium w-full max-w-sm mx-auto font-sans flex flex-col gap-3 text-white">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <div className="w-7 h-7 bg-indigo-500/10 rounded-xl flex items-center justify-center text-[#5B5CEB]">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Remind</h5>
          <span className="text-[8px] text-slate-400 font-medium">WhatsApp / SMS / Email channel</span>
        </div>
      </div>

      <div className="bg-[#0F1224] border border-slate-800/40 p-3 rounded-xl flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider leading-none">Reminder Alert</span>
          <span className="text-[8px] font-bold text-slate-500 leading-none">Greenwood ERP</span>
        </div>
        <p className="text-[10px] text-slate-350 font-semibold leading-relaxed">
          "Dear Guardian, Tuition Fee for Aarav Gupta is due on 31-Jul. Total dues: ₹5,000. Tap below to pay instantly."
        </p>
      </div>

      <div className="flex justify-end">
        <button className="bg-[#5B5CEB] text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1 hover:bg-indigo-650 transition-colors shadow">
          Quick Pay <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN LANDING PAGE
// ==========================================

const TypewriterText = ({ phrases }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let timeout;
    const fullText = phrases[currentPhraseIndex];
    
    if (!isDeleting) {
      if (currentText.length < fullText.length) {
        timeout = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }, 50); // typing speed
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2500); // pause before delete
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        }, 30); // deleting speed
      } else {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex, phrases]);

  return (
    <span>
      {currentText}
      <motion.span 
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[6px] h-[1em] bg-[#5B5CEB] ml-1 align-middle translate-y-[-1px]"
      />
    </span>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLifecycleStep, setActiveLifecycleStep] = useState(0);
  
  // Mouse tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle');
  const [contactErrors, setContactErrors] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-advance lifecycle flow
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLifecycleStep((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!contactForm.firstName) errors.firstName = 'Required';
    if (!contactForm.lastName) errors.lastName = 'Required';
    if (!contactForm.email || !/^\S+@\S+\.\S+$/.test(contactForm.email)) errors.email = 'Valid email required';
    if (!contactForm.message) errors.message = 'Required';
    
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    setContactStatus('loading');
    setTimeout(() => {
      setContactStatus('success');
      setContactForm({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setContactStatus('idle'), 3000);
    }, 1500);
  };

  const handleContactChange = (e) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (contactErrors[e.target.name]) {
      setContactErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const lifecycleSteps = [
    {
      num: '01',
      title: 'Student Pays',
      desc: 'The student clicks a reminder link and initiates a UPI, card, or net banking transaction via our checkout client.',
      detail: 'Instantly processes fees via secure multi-channel endpoints.'
    },
    {
      num: '02',
      title: 'Payment Verified',
      desc: 'CampusPay cross-verifies verification codes and processes the transaction under milliseconds.',
      detail: 'Failsafe architecture catches dropped connections.'
    },
    {
      num: '03',
      title: 'School Ledger Updated',
      desc: 'The double-entry ledger is credited immediately. The student’s profile updates to "Paid" in real-time.',
      detail: 'Zero delayed bookkeeper logging.'
    },
    {
      num: '04',
      title: 'Receipt Generated',
      desc: 'An immutable digital PDF receipt is compiled automatically and pushed to the student app/email.',
      detail: 'Native Apple Wallet passes are built for offline verification.'
    },
    {
      num: '05',
      title: 'Finance Synchronized',
      desc: 'The accountant and administrator dashboards dynamically reflect updated metrics and daily totals.',
      detail: 'Complete operations visibility for administrators.'
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0C16] text-[#F8FAFC] font-sans antialiased selection:bg-[#5B5CEB] selection:text-white relative overflow-x-hidden flex flex-col scroll-smooth">
      
      {/* Cinematic Spotlight following cursor */}
      <div 
        className="fixed pointer-events-none inset-0 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(91, 92, 235, 0.06), transparent 80%)`,
        }}
      />

      {/* Dark Grid Lines Overlay */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Subtle ambient light flows */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full filter blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#5B5CEB]/[0.03] rounded-full filter blur-[120px] pointer-events-none" />

      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A0C16]/90 border-b border-slate-800/80 py-1.5 shadow-lg backdrop-blur-md' 
          : 'bg-transparent pt-8 pb-4'
      }`}>
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)] group-active:scale-95 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2C15.772 2 19.056 4.095 20.73 7.152L17.26 9.153C16.14 7.234 14.192 6 12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C14.192 18 16.14 16.766 17.26 14.847L20.73 16.848C19.056 19.905 15.772 22 12 22Z" fill="#0A0C16"/>
                <circle cx="12" cy="12" r="3.5" fill="#0A0C16"/>
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-black text-white tracking-tight group-active:scale-95 transition-transform">
              Campus<span className="text-[#5B5CEB] font-bold">Pay</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-slate-100 text-[#0A0C16] flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group"
            >
              Access Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[2px] transition-transform duration-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-16 md:py-32 max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 min-h-[92vh]">
        
        {/* Left Column (Animated) */}
        <motion.div 
          className="flex-1 text-center lg:text-left flex flex-col justify-center"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
          >
          </motion.div>
          
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="text-2xl md:text-3xl lg:text-[36px] font-black tracking-tight text-white leading-[1.2] mb-3 uppercase"
          >
            THE PAYMENT INFRASTRUCTURE <br className="hidden lg:block"/>
            FOR <span className="text-[#5B5CEB]">EDUCATION</span>
          </motion.h1>
          
          <motion.h2 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.5 } }
            }}
            className="text-base md:text-lg font-semibold text-slate-400 uppercase tracking-widest mb-4 leading-relaxed text-center lg:text-left min-h-[3rem] lg:min-h-0"
          >
            <TypewriterText 
              phrases={[
                "One payment system. Every campus transaction.",
                "Automate your school's financial operations."
              ]} 
            />
          </motion.h2>
          
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
            style={{ color: 'rgba(203, 213, 225, 0.8)' }}
          >
            Campus<span className="text-[#5B5CEB] font-bold">Pay</span> connects students, finance teams and institutions through one synchronized payment and ledger infrastructure. No delayed reconciliations. No manuals logs. Just fluid institutional money movement.
          </motion.p>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#5B5CEB] text-white hover:bg-indigo-600 px-8 py-4 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 group"
            >
              Access Campus<span className="text-white font-bold">Pay</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-[2px] transition-transform duration-200" />
            </button>
            <a 
              href="#lifecycle"
              className="px-8 py-4 rounded-xl text-sm font-bold border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50 transition-all active:scale-95"
            >
              See how it works
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center items-center relative z-20 overflow-visible">
          <ReconciliationCanvas />
        </div>

      </section>

      {/* Mobile simplified stack flow */}
      <section className="lg:hidden relative z-10 py-12 px-6 border-t border-slate-900">
        <div className="flex flex-col items-center gap-8 py-6 w-full max-w-[340px] mx-auto border border-slate-800 rounded-3xl bg-[#13172D]/50 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-[40px] bottom-[40px] left-1/2 w-0.5 bg-slate-800 -translate-x-1/2" />
          
          {/* Student */}
          <div className="relative z-10 bg-[#13172D] border border-slate-800 pl-3 pr-4 py-2 rounded-full flex items-center gap-2.5 w-full">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-400"><GraduationCap className="w-3.5 h-3.5" /></div>
            <span className="text-xs font-bold text-slate-200">Student Pays Fee</span>
          </div>

          {/* Gateway */}
          <div className="relative z-10 bg-[#13172D] border border-[#23294E] pl-3 pr-4 py-2 rounded-full flex items-center gap-2.5 w-full">
            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[#5B5CEB]"><ShieldCheck className="w-3.5 h-3.5" /></div>
            <span className="text-xs font-bold text-slate-200">Verified by Gateway</span>
          </div>

          {/* CampusPay */}
          <div className="relative z-10 bg-[#0F172A] border border-slate-800 pl-3 pr-4 py-2 rounded-full flex items-center gap-2.5 w-full text-white">
            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[#5B5CEB]"><Zap className="w-3.5 h-3.5" /></div>
            <span className="text-xs font-bold">Campus<span className="text-[#5B5CEB] font-bold">Pay</span> Hub</span>
          </div>

          {/* Ledger */}
          <div className="relative z-10 bg-[#13172D] border border-slate-800 pl-3 pr-4 py-2 rounded-full flex items-center gap-2.5 w-full">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-400"><Layers className="w-3.5 h-3.5" /></div>
            <span className="text-xs font-bold text-slate-200">Reconciled in Ledger</span>
          </div>

          {/* Receipt */}
          <div className="relative z-10 bg-[#13172D] border border-slate-800 pl-3 pr-4 py-2 rounded-full flex items-center gap-2.5 w-full">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-400"><FileText className="w-3.5 h-3.5" /></div>
            <span className="text-xs font-bold text-slate-200">Receipt Dispatched</span>
          </div>
        </div>
      </section>

      {/* Interactive Lifecycle Section */}
      <section id="lifecycle" className="relative z-10 py-24 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
              One transaction. Every system updated.
            </h3>
            <p className="text-slate-450 max-w-xl mx-auto font-medium text-xs md:text-sm">
              See the direct path of how Campus<span className="text-[#5B5CEB] font-bold">Pay</span> replaces separate manual workloads with a single pipeline of unified events.
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 max-w-5xl mx-auto relative group">
            {/* Background connecting line (visible on desktop) */}
            <div className="hidden lg:block absolute top-[30px] left-[10%] right-[10%] h-[1px] bg-slate-800/50 z-0">
              <div className="h-full bg-gradient-to-r from-transparent via-[#5B5CEB] to-transparent w-1/3 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_3s_linear_infinite] transition-opacity" style={{ animation: "flowRight 3s linear infinite" }} />
            </div>

            {lifecycleSteps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveLifecycleStep(idx)}
                className={`cursor-pointer transition-all duration-300 p-5 rounded-2xl border relative z-10 overflow-hidden ${
                  activeLifecycleStep === idx 
                    ? 'bg-[#13172D]/80 border-[#5B5CEB] shadow-[0_12px_24px_-8px_rgba(91,92,235,0.25)] -translate-y-1' 
                    : 'bg-[#0F1224]/50 border-slate-900 hover:border-slate-800 hover:bg-[#13172D]/50'
                }`}
              >
                {/* Flow Progress Bar */}
                {activeLifecycleStep === idx && (
                  <div className="absolute bottom-0 left-0 h-1 bg-[#5B5CEB] animate-[fillBar_4s_linear]" />
                )}
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <span className={`text-[10px] font-black font-mono leading-none ${activeLifecycleStep === idx ? 'text-[#5B5CEB]' : 'text-slate-650'}`}>
                    {step.num}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${activeLifecycleStep === idx ? 'bg-[#5B5CEB] animate-pulse shadow-[0_0_8px_rgba(91,92,235,0.8)]' : 'bg-slate-805'}`} />
                </div>
                <h4 className={`text-xs font-bold mb-1 transition-colors ${activeLifecycleStep === idx ? 'text-white' : 'text-slate-300'}`}>{step.title}</h4>
                <p className={`text-[10px] leading-normal font-medium mb-3 transition-colors ${activeLifecycleStep === idx ? 'text-slate-300' : 'text-slate-500'}`}>{step.desc}</p>
                <span className={`text-[8px] font-bold block uppercase tracking-wider transition-all duration-300 ${activeLifecycleStep === idx ? 'text-[#5B5CEB] opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  {step.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="relative z-10 py-20 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-6">

          {/* What CampusPay Actually Does */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {[
              { value: '4', label: 'Role Dashboards', sub: 'Super Admin · School Admin · Accountant · Student' },
              { value: '∞', label: 'Multi-School', sub: 'one platform, unlimited schools' },
              { value: 'Live', label: 'Ledger Sync', sub: 'real-time double-entry reconciliation' },
              { value: 'Auto', label: 'Fee Engine', sub: 'penalties, reminders & receipts' },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-[#0F1224]/60 text-center hover:border-[#5B5CEB]/30 transition-colors">
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{stat.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Built-in Capabilities */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: '📧', text: 'Email & In-App Reminders' },
              { icon: '📄', text: 'Auto PDF Receipts' },
              { icon: '📊', text: 'Excel Bulk Import' },
              { icon: '💬', text: 'Student Messaging' },
              { icon: '🔐', text: 'Role-Based Access' },
              { icon: '📱', text: 'UPI & Multi-Method Payments' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-bold">
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-slate-500 py-8 text-center border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-7 h-7 rounded-full bg-slate-500 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2C15.772 2 19.056 4.095 20.73 7.152L17.26 9.153C16.14 7.234 14.192 6 12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C14.192 18 16.14 16.766 17.26 14.847L20.73 16.848C19.056 19.905 15.772 22 12 22Z" fill="#0A0C16"/>
                <circle cx="12" cy="12" r="3.5" fill="#0A0C16"/>
              </svg>
            </div>
            <span className="text-lg font-black text-slate-400 tracking-tight">
              Campus<span className="text-slate-500 font-bold">Pay</span>
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Campus Pay. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  CheckCircle2,
  Lock,
  Download,
  Users,
  ArrowDown,
  Loader2,
  Check,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Layers,
  ShieldCheck,
  Zap,
  DollarSign,
  FileText,
  Activity,
  ArrowUpRight
} from 'lucide-react';

// ==========================================
// 1. ANCILLARY COMPONENTS FOR ANIMATION
// ==========================================

// Simple CountUp animation for ledger numbers
function AnimatedLedgerNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 1200; // ms
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

// Interactive Network Node
function NetworkNode({ x, y, label, icon: Icon, statusText, isActive, isSuccess, tooltip, onHover }) {
  const [hovered, setHovered] = useState(false);

  return (
    <g 
      className="cursor-pointer"
      onMouseEnter={() => {
        setHovered(true);
        if (onHover) onHover(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (onHover) onHover(false);
      }}
    >
      {/* Outer Pulse */}
      {isActive && (
        <circle 
          cx={x} 
          cy={y} 
          r={28} 
          className={`fill-none stroke-2 opacity-50 ${isSuccess ? 'stroke-emerald-500' : 'stroke-indigo-500'}`}
        >
          <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Node Background */}
      <circle 
        cx={x} 
        cy={y} 
        r={22} 
        className={`stroke-[1.5] transition-all duration-300 ${
          isSuccess 
            ? 'fill-emerald-50 stroke-emerald-500 shadow-emerald-100' 
            : isActive 
              ? 'fill-indigo-50 stroke-indigo-500 shadow-indigo-100' 
              : hovered 
                ? 'fill-slate-50 stroke-indigo-400' 
                : 'fill-white stroke-slate-200'
        }`}
        style={{ filter: hovered ? 'drop-shadow(0 4px 12px rgba(91,92,235,0.08))' : 'none' }}
      />

      {/* Icon */}
      <g transform={`translate(${x - 9}, ${y - 9})`} className={`transition-colors duration-300 ${isSuccess ? 'text-emerald-600' : isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
        <Icon className="w-[18px] h-[18px] stroke-[2]" />
      </g>

      {/* Labels */}
      <text 
        x={x} 
        y={y + 38} 
        textAnchor="middle" 
        className="text-[10px] font-bold text-slate-800 tracking-tight fill-current select-none"
      >
        {label}
      </text>

      {statusText && (
        <text 
          x={x} 
          y={y + 50} 
          textAnchor="middle" 
          className={`text-[9px] font-semibold tracking-normal fill-current select-none animate-pulse ${isSuccess ? 'text-emerald-500' : 'text-indigo-500'}`}
        >
          {statusText}
        </text>
      )}

      {/* Elegant Tooltip overlay */}
      {hovered && tooltip && (
        <foreignObject x={x - 100} y={y - 85} width={200} height={60} className="overflow-visible pointer-events-none z-50">
          <div className="bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl border border-slate-800 text-center flex flex-col gap-0.5 backdrop-blur-md bg-opacity-95 transform -translate-y-2 transition-transform duration-300">
            <span className="font-bold text-slate-200">{label}</span>
            <span className="text-[9px] text-slate-400 font-medium leading-normal">{tooltip}</span>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// Beautiful SVG Path
function NetworkPath({ d, isActive, isSuccess, isHovered }) {
  return (
    <g>
      {/* Background Path */}
      <path 
        d={d} 
        fill="none" 
        className={`transition-colors duration-300 stroke-[1.5] ${
          isHovered 
            ? 'stroke-indigo-200' 
            : 'stroke-slate-100'
        }`} 
      />

      {/* Active Glowing Path overlay */}
      {isActive && (
        <motion.path 
          d={d} 
          fill="none" 
          className={`stroke-[2.5] ${isSuccess ? 'stroke-emerald-400' : 'stroke-indigo-400'}`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      )}
    </g>
  );
}

// Simulated Transactions List
const SIMULATED_TXS = [
  { name: 'Rahul Sharma', fee: 'Tuition Fee', amount: 2500, ledgerStart: 42500, ledgerEnd: 45000, method: 'UPI', code: 'CP-28491' },
  { name: 'Priya Patel', fee: 'Transport Fee', amount: 1100, ledgerStart: 18400, ledgerEnd: 19500, method: 'CARD', code: 'CP-19042' },
  { name: 'Aarav Gupta', fee: 'Exam Fee', amount: 800, ledgerStart: 31200, ledgerEnd: 32000, method: 'UPI', code: 'CP-87291' },
  { name: 'Sneha Verma', fee: 'Laboratory Fee', amount: 2000, ledgerStart: 51000, ledgerEnd: 53000, method: 'CASH', code: 'CP-44023' }
];

// ==========================================
// 2. HERO PAYMENT NETWORK
// ==========================================
function HeroPaymentNetwork({ activeNodeHover, setActiveNodeHover }) {
  const [txIndex, setTxIndex] = useState(0);
  const [animationStep, setAnimationStep] = useState(0); // 0: Idle, 1: Student -> Payment, 2: Processing, 3: Verified, 4: Splitting, 5: Ledger -> School, 6: Settle
  const [progress, setProgress] = useState(0);
  const [ledgerVal, setLedgerVal] = useState(SIMULATED_TXS[0].ledgerStart);

  const activeTx = SIMULATED_TXS[txIndex];

  // Animation cycle loop
  useEffect(() => {
    let interval;
    const runCycle = async () => {
      // Step 1: Student -> Payment (Token moves)
      setAnimationStep(1);
      setProgress(0);
      let start = performance.now();
      const duration = 1200;
      
      const animateToken = (time) => {
        const elapsed = time - start;
        const p = Math.min(elapsed / duration, 1);
        setProgress(p);
        if (p < 1) {
          requestAnimationFrame(animateToken);
        } else {
          // Step 2: Processing at Payment node
          setAnimationStep(2);
          setTimeout(() => {
            // Step 3: Verified (Token moves Payment -> CampusPay)
            setAnimationStep(3);
            setProgress(0);
            let start2 = performance.now();
            const animateToken2 = (time2) => {
              const elapsed2 = time2 - start2;
              const p2 = Math.min(elapsed2 / duration, 1);
              setProgress(p2);
              if (p2 < 1) {
                requestAnimationFrame(animateToken2);
              } else {
                // Step 4: Split (Tokens move CampusPay -> Ledger & CampusPay -> Receipt)
                setAnimationStep(4);
                setProgress(0);
                let start3 = performance.now();
                const animateToken3 = (time3) => {
                  const elapsed3 = time3 - start3;
                  const p3 = Math.min(elapsed3 / duration, 1);
                  setProgress(p3);
                  if (p3 < 1) {
                    requestAnimationFrame(animateToken3);
                  } else {
                    // Update ledger number
                    setLedgerVal(activeTx.ledgerEnd);
                    // Step 5: Ledger -> School
                    setAnimationStep(5);
                    setProgress(0);
                    let start4 = performance.now();
                    const animateToken4 = (time4) => {
                      const elapsed4 = time4 - start4;
                      const p4 = Math.min(elapsed4 / duration, 1);
                      setProgress(p4);
                      if (p4 < 1) {
                        requestAnimationFrame(animateToken4);
                      } else {
                        // Settle
                        setAnimationStep(6);
                        // Prepare next transaction
                        setTimeout(() => {
                          setAnimationStep(0);
                          setTxIndex((prev) => (prev + 1) % SIMULATED_TXS.length);
                        }, 3500);
                      }
                    };
                    requestAnimationFrame(animateToken4);
                  }
                };
                requestAnimationFrame(animateToken3);
              }
            };
            requestAnimationFrame(animateToken2);
          }, 800);
        }
      };
      requestAnimationFrame(animateToken);
    };

    // Initial timeout
    const initialTimeout = setTimeout(() => {
      runCycle();
      interval = setInterval(runCycle, 9500);
    }, 1500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [txIndex]);

  // Sync ledger value reset when index shifts
  useEffect(() => {
    if (animationStep === 0 || animationStep === 1) {
      setLedgerVal(SIMULATED_TXS[txIndex].ledgerStart);
    }
  }, [txIndex, animationStep]);

  // Node coordinates (Desktop 500x450 canvas)
  const nodes = {
    student: { x: 250, y: 35, label: 'Student', icon: GraduationCap, tooltip: 'Initiates payment for tuition or other campus fees.' },
    payment: { x: 250, y: 125, label: 'Payment Gateway', icon: ShieldCheck, tooltip: 'Handles secure routing, card processing, or UPI intent.' },
    campuspay: { x: 250, y: 220, label: 'CampusPay Hub', icon: Zap, tooltip: 'Central clearinghouse that coordinates verify statuses and synchronizes records.' },
    ledger: { x: 100, y: 320, label: 'School Ledger', icon: Layers, tooltip: 'Real-time double-entry book keeping ledger of all transactions.' },
    receipt: { x: 400, y: 320, label: 'Digital Receipt', icon: FileText, tooltip: 'Legally compliant automated invoices, generated on settlement.' },
    school: { x: 100, y: 405, label: 'Institution Admin', icon: Users, tooltip: 'School finance staff, accountants and managers synchronized.' }
  };

  // Paths
  const paths = {
    studToPay: "M 250 35 L 250 125",
    payToCP: "M 250 125 L 250 220",
    cpToLedger: "M 250 220 C 180 250 120 280 100 320",
    cpToReceipt: "M 250 220 C 320 250 380 280 400 320",
    ledgerToSchool: "M 100 320 L 100 405"
  };

  // Interpolated Token Positions
  let tokenPos = null;
  let receiptTokenPos = null;
  let isSplitStep = false;

  if (animationStep === 1) {
    // Student -> Payment
    tokenPos = {
      x: nodes.student.x,
      y: nodes.student.y + (nodes.payment.y - nodes.student.y) * progress
    };
  } else if (animationStep === 3) {
    // Payment -> CampusPay
    tokenPos = {
      x: nodes.payment.x,
      y: nodes.payment.y + (nodes.campuspay.y - nodes.payment.y) * progress
    };
  } else if (animationStep === 4) {
    // CampusPay -> Ledger & Receipt (Splitting)
    isSplitStep = true;
    
    // Curved interpolation for CP -> Ledger (M 250 220 C 180 250 120 280 100 320)
    // Using simple Quadratic Bezier approximation for neat motion
    const t = progress;
    const cx1 = 180, cy1 = 250; // control point 1
    tokenPos = {
      x: (1-t)*(1-t)*nodes.campuspay.x + 2*(1-t)*t*cx1 + t*t*nodes.ledger.x,
      y: (1-t)*(1-t)*nodes.campuspay.y + 2*(1-t)*t*cy1 + t*t*nodes.ledger.y
    };

    // CP -> Receipt (M 250 220 C 320 250 380 280 400 320)
    const cx2 = 320, cy2 = 250; // control point 2
    receiptTokenPos = {
      x: (1-t)*(1-t)*nodes.campuspay.x + 2*(1-t)*t*cx2 + t*t*nodes.receipt.x,
      y: (1-t)*(1-t)*nodes.campuspay.y + 2*(1-t)*t*cy2 + t*t*nodes.receipt.y
    };
  } else if (animationStep === 5) {
    // Ledger -> School
    tokenPos = {
      x: nodes.ledger.x,
      y: nodes.ledger.y + (nodes.school.y - nodes.ledger.y) * progress
    };
  }

  // Handle active states for nodes
  const nodeStates = {
    student: { active: animationStep === 1, success: false, text: null },
    payment: {
      active: animationStep === 2,
      success: animationStep > 2,
      text: animationStep === 2 ? 'Processing...' : animationStep > 2 ? 'Routed ✓' : null
    },
    campuspay: {
      active: animationStep === 3,
      success: animationStep > 3,
      text: animationStep === 3 ? 'Verifying...' : animationStep > 3 ? 'Verified ✓' : null
    },
    ledger: {
      active: animationStep === 4,
      success: animationStep > 4,
      text: null
    },
    receipt: {
      active: animationStep === 4,
      success: animationStep > 4,
      text: null
    },
    school: {
      active: animationStep === 5,
      success: animationStep > 5,
      text: animationStep > 5 ? 'Reconciled ✓' : null
    }
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-[500/460] bg-slate-50/50 border border-slate-100 rounded-3xl p-6 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.02)] overflow-visible">
      {/* Decorative center logo glow */}
      <div className="absolute top-[220px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/[0.03] blur-[40px] rounded-full pointer-events-none" />

      {/* SVG Canvas for lines and tokens */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-10" viewBox="0 0 500 460">
        {/* Paths */}
        <NetworkPath d={paths.studToPay} isActive={animationStep === 1} isHovered={activeNodeHover === 'Student' || activeNodeHover === 'Payment Gateway'} />
        <NetworkPath d={paths.payToCP} isActive={animationStep === 3} isHovered={activeNodeHover === 'Payment Gateway' || activeNodeHover === 'CampusPay Hub'} />
        <NetworkPath d={paths.cpToLedger} isActive={animationStep === 4} isHovered={activeNodeHover === 'CampusPay Hub' || activeNodeHover === 'School Ledger'} />
        <NetworkPath d={paths.cpToReceipt} isActive={animationStep === 4} isHovered={activeNodeHover === 'CampusPay Hub' || activeNodeHover === 'Digital Receipt'} />
        <NetworkPath d={paths.ledgerToSchool} isActive={animationStep === 5} isHovered={activeNodeHover === 'School Ledger' || activeNodeHover === 'Institution Admin'} />

        {/* Nodes */}
        <NetworkNode 
          {...nodes.student} 
          isActive={nodeStates.student.active} 
          isSuccess={nodeStates.student.success}
          statusText={nodeStates.student.text}
          onHover={(hover) => setActiveNodeHover(hover ? 'Student' : null)}
        />
        <NetworkNode 
          {...nodes.payment} 
          isActive={nodeStates.payment.active} 
          isSuccess={nodeStates.payment.success}
          statusText={nodeStates.payment.text}
          onHover={(hover) => setActiveNodeHover(hover ? 'Payment Gateway' : null)}
        />
        <NetworkNode 
          {...nodes.campuspay} 
          isActive={nodeStates.campuspay.active} 
          isSuccess={nodeStates.campuspay.success}
          statusText={nodeStates.campuspay.text}
          onHover={(hover) => setActiveNodeHover(hover ? 'CampusPay Hub' : null)}
        />
        <NetworkNode 
          {...nodes.ledger} 
          isActive={nodeStates.ledger.active} 
          isSuccess={nodeStates.ledger.success}
          statusText={nodeStates.ledger.text}
          onHover={(hover) => setActiveNodeHover(hover ? 'School Ledger' : null)}
        />
        <NetworkNode 
          {...nodes.receipt} 
          isActive={nodeStates.receipt.active} 
          isSuccess={nodeStates.receipt.success}
          statusText={nodeStates.receipt.text}
          onHover={(hover) => setActiveNodeHover(hover ? 'Digital Receipt' : null)}
        />
        <NetworkNode 
          {...nodes.school} 
          isActive={nodeStates.school.active} 
          isSuccess={nodeStates.school.success}
          statusText={nodeStates.school.text}
          onHover={(hover) => setActiveNodeHover(hover ? 'Institution Admin' : null)}
        />

        {/* Floating animated Payment Token Pill */}
        {tokenPos && (
          <g transform={`translate(${tokenPos.x}, ${tokenPos.y})`} className="pointer-events-none">
            <rect 
              x="-40" 
              y="-12" 
              width="80" 
              height="24" 
              rx="12" 
              className={`shadow-md stroke-[1.5] ${animationStep === 5 ? 'fill-emerald-500 stroke-emerald-600' : 'fill-indigo-600 stroke-indigo-700'}`} 
            />
            <text 
              y="4" 
              textAnchor="middle" 
              className="text-[9px] font-black text-white tracking-wider fill-current"
            >
              ₹{activeTx.amount.toLocaleString('en-IN')}
            </text>
          </g>
        )}

        {/* Second Token Pill for Receipt splitting */}
        {isSplitStep && receiptTokenPos && (
          <g transform={`translate(${receiptTokenPos.x}, ${receiptTokenPos.y})`} className="pointer-events-none">
            <rect 
              x="-40" 
              y="-12" 
              width="80" 
              height="24" 
              rx="12" 
              className="fill-indigo-600 stroke-indigo-700 shadow-md stroke-[1.5]" 
            />
            <text 
              y="4" 
              textAnchor="middle" 
              className="text-[9px] font-black text-white tracking-wider fill-current"
            >
              ₹{activeTx.amount.toLocaleString('en-IN')}
            </text>
          </g>
        )}
      </svg>

      {/* Floating Status Widgets based on step */}
      
      {/* 1. Transaction Toast */}
      <div className="absolute top-2 left-6 right-6 z-20 transition-all duration-300">
        <AnimatePresence mode="wait">
          {animationStep >= 1 && animationStep <= 5 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl shadow-premium flex items-center justify-between gap-3 backdrop-blur-md bg-opacity-95"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                <div>
                  <div className="text-[10px] font-bold text-slate-800 leading-none">{activeTx.name}</div>
                  <div className="text-[8px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{activeTx.fee}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-black text-indigo-600">₹{activeTx.amount.toLocaleString('en-IN')}</div>
                <div className="text-[8px] font-bold text-slate-400 mt-0.5">{activeTx.method} Payout</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Real-time updating Ledger widget overlaying Ledger Node */}
      <div className="absolute bottom-[105px] left-1 z-20">
        <div className="bg-white border border-slate-200/80 px-3 py-2 rounded-xl shadow-premium flex flex-col gap-0.5 min-w-[90px] text-center backdrop-blur-md bg-opacity-95">
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Ledger Sum</span>
          <span className="text-xs font-black font-mono text-slate-800 mt-0.5 leading-none transition-all">
            <AnimatedLedgerNumber value={ledgerVal} />
          </span>
        </div>
      </div>

      {/* 3. Slide-out Receipt widget overlaying Receipt Node */}
      <div className="absolute bottom-[105px] right-1 z-20 overflow-visible">
        <AnimatePresence>
          {animationStep >= 4 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-premium flex flex-col gap-1 min-w-[125px] text-left backdrop-blur-md bg-opacity-95"
            >
              <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{activeTx.code}</span>
                <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded uppercase tracking-wide">SAVED</span>
              </div>
              <div className="flex flex-col mt-0.5">
                <span className="text-[9px] font-black text-slate-800 leading-tight">{activeTx.fee}</span>
                <span className="text-[8px] font-semibold text-slate-500 mt-0.5">{activeTx.name}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] font-black font-mono text-slate-800">₹{activeTx.amount.toLocaleString('en-IN')}</span>
                <Download className="w-2.5 h-2.5 text-indigo-500 hover:text-indigo-600 cursor-pointer" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// 3. CAPABILITY SECTION PREVIEWS
// ==========================================

// Preview UI: Checkout Modal
function PaymentsPreview() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium text-slate-800 max-w-sm w-full mx-auto font-sans">
      <div className="flex justify-between items-start border-b border-slate-100 pb-3.5 mb-4">
        <div>
          <h5 className="text-xs font-black tracking-tight text-slate-800">Greenwood International</h5>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Active Invoice</span>
        </div>
        <div className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Class 10-A
        </div>
      </div>
      
      {/* Fees List */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
          <span>Tuition Fee (Monthly)</span>
          <span className="font-bold text-slate-800">₹5,000</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
          <span>Transport Fee (Optional)</span>
          <span className="font-bold text-slate-800">₹1,500</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3.5 flex justify-between items-baseline mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
        <span className="text-lg font-black text-slate-900 font-mono">₹6,500</span>
      </div>

      <button className="w-full bg-[#5B5CEB] hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98]">
        Pay via UPI / Cards <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Preview UI: Reconciled Transactions Table
function ReconciliationPreview() {
  const txs = [
    { code: 'TXN-94021', name: 'Rahul Sharma', fee: 'Tuition', amount: '₹5,000', status: 'PAID', date: '29 Jul' },
    { code: 'TXN-10492', name: 'Priya Patel', fee: 'Transport', amount: '₹1,500', status: 'PAID', date: '29 Jul' },
    { code: 'TXN-48201', name: 'Aarav Gupta', fee: 'Library', amount: '₹1,200', status: 'PARTIAL', date: '28 Jul' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-premium w-full max-w-sm mx-auto font-sans">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ledger Sync</h5>
        <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          <Activity className="w-2.5 h-2.5 animate-pulse" /> Live synchronized
        </div>
      </div>
      
      <div className="space-y-2 text-[9px] font-medium text-slate-600">
        {txs.map((t, idx) => (
          <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div>
              <div className="font-bold text-slate-800">{t.name}</div>
              <div className="text-[8px] text-slate-400 uppercase tracking-wider">{t.code} • {t.fee}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">{t.amount}</div>
              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide inline-block mt-0.5 ${
                t.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
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

// Preview UI: Chat Notification Widget
function CommunicationPreview() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-premium w-full max-w-sm mx-auto font-sans flex flex-col gap-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-7 h-7 bg-indigo-50 rounded-xl flex items-center justify-center text-[#5B5CEB]">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Auto Remind</h5>
          <span className="text-[8px] text-slate-400 font-medium">WhatsApp / SMS / Email channel</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider leading-none">Reminder Alert</span>
          <span className="text-[8px] font-bold text-slate-400 leading-none">Greenwood ERP</span>
        </div>
        <p className="text-[10px] text-slate-700 font-semibold leading-relaxed">
          "Dear Guardian, Tuition Fee for Aarav Gupta is due on 31-Jul. Total dues: ₹5,000. Tap below to pay instantly."
        </p>
      </div>

      <div className="flex justify-end">
        <button className="bg-[#5B5CEB] text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1 hover:bg-indigo-600 transition-colors shadow">
          Quick Pay <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN LANDING PAGE COMPONENT
// ==========================================
export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNodeHover, setActiveNodeHover] = useState(null);

  // Active step for lifecycle transition
  const [activeLifecycleStep, setActiveLifecycleStep] = useState(0);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle'); // idle, loading, success, error
  const [contactErrors, setContactErrors] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Lifecycle Steps Config
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
    <div className="min-h-screen bg-[#FCFCFD] text-[#0F172A] font-sans antialiased selection:bg-[#5B5CEB] selection:text-white relative overflow-x-hidden flex flex-col scroll-smooth">
      
      {/* Background Technical Grid and Spotlight */}
      <div className="absolute inset-0 z-0 opacity-[0.35] pointer-events-none overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full stroke-slate-200/50 [mask-image:radial-gradient(100%_70%_at_top_right,white,transparent_80%)]" aria-hidden="true">
          <defs>
            <pattern id="grid-pattern" width="56" height="56" patternUnits="userSpaceOnUse" x="-1" y="-1">
              <path d="M.5 56V.5H56" fill="none" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" strokeWidth="0" />
        </svg>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[100px]" />
      </div>

      {/* Floating Header / Nav */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          {/* Real CampusPay Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/campuspay-logo.png" 
              alt="Campus Pay" 
              className="w-[155px] object-contain transition-transform duration-300 active:scale-95" 
            />
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold text-slate-600 hover:text-[#5B5CEB] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#0F172A] hover:bg-slate-800 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:translate-x-[1px] active:scale-95 group"
            >
              Access Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[2px] transition-transform duration-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:py-36 max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 min-h-[92vh]">
        
        {/* Left Headline Column */}
        <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-6 mx-auto lg:mx-0 w-fit select-none">
            <Lock className="w-3 h-3 text-[#5B5CEB]" />
            <span>Multi-Tenant Infrastructure</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-[45px] font-black tracking-tight text-slate-900 leading-[1.15] mb-5">
            THE PAYMENT INFRASTRUCTURE <br className="hidden lg:block"/>
            FOR <span className="text-[#5B5CEB]">EDUCATION</span>
          </h1>
          
          <h2 className="text-base md:text-lg font-bold text-slate-800 leading-snug mb-4">
            One payment system. Every campus transaction.
          </h2>
          
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
            CampusPay connects students, finance teams and institutions through one synchronized payment and ledger infrastructure. 
            No delayed reconciliations. No manuals logs. Just fluid institutional money movement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#5B5CEB] text-white hover:bg-indigo-600 px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 group"
            >
              Access CampusPay <ArrowRight className="w-4 h-4 group-hover:translate-x-[2px] transition-transform duration-200" />
            </button>
            <a 
              href="#lifecycle"
              className="px-6 py-3 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Right Animated Payment Network (Interactive Visual) */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center items-center relative z-20">
          <HeroPaymentNetwork activeNodeHover={activeNodeHover} setActiveNodeHover={setActiveNodeHover} />
        </div>

      </section>

      {/* Interactive Lifecycle Section (One Transaction. Every System Updated.) */}
      <section id="lifecycle" className="relative z-10 py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-4 mx-auto select-none">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>Fluid Lifecycle</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A] mb-3">
              One transaction. Every system updated.
            </h3>
            <p className="text-slate-500 max-w-xl mx-auto font-medium text-xs md:text-sm">
              See the direct path of how CampusPay replaces separate manual workloads with a single pipeline of unified events.
            </p>
          </div>

          {/* Desktop & Mobile Interactive Steps wrapper */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {lifecycleSteps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveLifecycleStep(idx)}
                className={`cursor-pointer transition-all duration-300 p-5 rounded-2xl border ${
                  activeLifecycleStep === idx 
                    ? 'bg-[#FCFCFD] border-[#5B5CEB] shadow-[0_12px_24px_-8px_rgba(91,92,235,0.06)]' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black font-mono leading-none ${activeLifecycleStep === idx ? 'text-[#5B5CEB]' : 'text-slate-300'}`}>
                    {step.num}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${activeLifecycleStep === idx ? 'bg-[#5B5CEB] animate-pulse' : 'bg-slate-200'}`} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
                <p className="text-[10px] text-slate-500 leading-normal font-medium mb-3">{step.desc}</p>
                <span className={`text-[8px] font-bold block uppercase tracking-wider transition-opacity duration-300 ${activeLifecycleStep === idx ? 'text-[#5B5CEB] opacity-100' : 'opacity-0'}`}>
                  {step.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Proof Section */}
      <section className="relative z-10 py-16 bg-[#FCFCFD] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="p-4 flex flex-col gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">Real-Time</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ledger synchronization</span>
            </div>
            <div className="p-4 flex flex-col gap-1 border-t md:border-t-0 md:border-x border-slate-200/50">
              <span className="text-2xl font-black text-slate-900 tracking-tight">Instant</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Receipt generation</span>
            </div>
            <div className="p-4 flex flex-col gap-1 border-t md:border-t-0">
              <span className="text-2xl font-black text-slate-900 tracking-tight">Multi-Role</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Financial operations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Editorial Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black text-[#5B5CEB] uppercase tracking-widest mb-3">Capabilities</h2>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Engineered for School Finance</h3>
            <p className="text-slate-500 max-w-xl mx-auto font-medium text-xs leading-normal">
              Instead of generic tools, CampusPay addresses the specific administrative and reporting requirements unique to schools.
            </p>
          </div>

          <div className="space-y-16 max-w-5xl mx-auto">
            {/* Section 1: Payments */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 border-b border-slate-55 pb-16 last:border-0 last:pb-0">
              <div className="flex-1 space-y-4">
                <span className="text-[9px] font-black text-[#5B5CEB] uppercase tracking-widest">01 / Collection</span>
                <h4 className="text-xl font-bold text-slate-955 tracking-tight">Payments</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Allow students and parents to settle dues instantly via custom checkout portals. Full support for UPI intent, credit/debit cards, bank transfers, and offline payment logging (cash/cheques) in a single unified interface.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-505" /> UPI intent & payment links
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-505" /> Manual cash/cheque capture
                </div>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <PaymentsPreview />
              </div>
            </div>

            {/* Section 2: Reconciliation */}
            <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-12 border-b border-slate-55 pb-16 last:border-0 last:pb-0">
              <div className="flex-1 space-y-4">
                <span className="text-[9px] font-black text-[#5B5CEB] uppercase tracking-widest">02 / Auditing</span>
                <h4 className="text-xl font-bold text-slate-955 tracking-tight">Reconciliation</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  No more sorting through bank statements. Every successfully cleared fee updates student profiles and reconciles directly inside the accountant ledger, meaning instant auditing without error-prone spreadsheet work.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-505" /> Real-time profile status updates
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-505" /> Dynamic late penalties calculation
                </div>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <ReconciliationPreview />
              </div>
            </div>

            {/* Section 3: Communication */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 border-b border-slate-55 pb-16 last:border-0 last:pb-0">
              <div className="flex-1 space-y-4">
                <span className="text-[9px] font-black text-[#5B5CEB] uppercase tracking-widest">03 / Outreach</span>
                <h4 className="text-xl font-bold text-slate-955 tracking-tight">Communication</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Bridge the gap between billing and collection. Set automated billing notifications, payment receipts, late fee reminders, and broadcast emails to keep students and guardians informed before dues pile up.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-505" /> Dynamic reminder alerts
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-505" /> PDF billing statements
                </div>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <CommunicationPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Contact Form */}
      <section id="contact" className="relative z-10 bg-[#FCFCFD] py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-[#5B5CEB] uppercase tracking-widest mb-3">Get in Touch</h2>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Contact Our Operations Team</h3>
            <p className="text-slate-500 max-w-xl mx-auto font-medium text-xs leading-normal">
              Have questions about onboarding, multi-tenant billing, or security? Let us know and we’ll reach out directly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-3xl border border-slate-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.02)] max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="flex flex-col justify-between gap-10">
              <div>
                <h4 className="text-lg font-bold text-slate-950 mb-6">Immediate Support</h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-50/50 text-[#5B5CEB] rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/50">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Response Window</div>
                      <div className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
                        Typical sales inquiries are reviewed and answered within 2-4 business hours.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-50/50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/50">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Security Assured</div>
                      <div className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
                        All contact submissions are stored securely and processed in compliance with local privacy frameworks.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                CampusPay Inc. <br />
                Financial Tech for Modern Universities.
              </div>
            </div>
            
            {/* Contact Form */}
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                  <input 
                    name="firstName"
                    value={contactForm.firstName}
                    onChange={handleContactChange}
                    type="text" 
                    placeholder="Jane" 
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                      contactErrors.firstName ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500'
                    } focus:outline-none focus:ring-1 transition-all shadow-sm`}
                  />
                  {contactErrors.firstName && <p className="text-[9px] text-red-500 font-bold mt-1">{contactErrors.firstName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    name="lastName"
                    value={contactForm.lastName}
                    onChange={handleContactChange}
                    type="text" 
                    placeholder="Doe" 
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                      contactErrors.lastName ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500'
                    } focus:outline-none focus:ring-1 transition-all shadow-sm`}
                  />
                  {contactErrors.lastName && <p className="text-[9px] text-red-500 font-bold mt-1">{contactErrors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Work Email</label>
                <input 
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  type="email" 
                  placeholder="jane@school.edu" 
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                    contactErrors.email ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500'
                  } focus:outline-none focus:ring-1 transition-all shadow-sm`}
                />
                {contactErrors.email && <p className="text-[9px] text-red-500 font-bold mt-1">{contactErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                <textarea 
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  rows="3" 
                  placeholder="How can we help?" 
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                    contactErrors.message ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500'
                  } focus:outline-none focus:ring-1 transition-all resize-none shadow-sm`}
                ></textarea>
                {contactErrors.message && <p className="text-[9px] text-red-500 font-bold mt-1">{contactErrors.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={contactStatus === 'loading' || contactStatus === 'success'}
                className={`w-full font-bold py-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 text-xs ${
                  contactStatus === 'success' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-[#0F172A] text-white hover:bg-slate-800 active:scale-95 group'
                }`}
              >
                {contactStatus === 'idle' && <>Send Message <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>}
                {contactStatus === 'loading' && <><Loader2 className="w-4 h-4 animate-spin" /> Transmitting...</>}
                {contactStatus === 'success' && <><Check className="w-4 h-4" /> Transmission Successful</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Clean Call to Action fold */}
      <section className="relative z-10 py-32 bg-white text-center px-6 overflow-hidden border-t border-slate-100">
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Ready to synchronize your campus?
          </h2>
          <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed max-w-md mx-auto">
            Log in to the dashboard to test invoicing, automated notifications, and points-of-sale collections.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#5B5CEB] hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 mx-auto active:scale-95 group"
          >
            Enter Dashboard Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 bg-[#FCFCFD] text-slate-400 py-8 text-center border-t border-slate-150">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/campuspay-logo.png" alt="Campus Pay" className="h-16 w-auto object-contain" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Campus Pay. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet,
  ArrowRight,
  GraduationCap,
  PieChart,
  Smartphone,
  CheckCircle2,
  Lock,
  Download,
  Users,
  ArrowDown,
  Play,
  Loader2,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle'); // idle, loading, success, error
  const [contactErrors, setContactErrors] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden flex flex-col scroll-smooth">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img src="/campuspay-logo.png" alt="Campus Pay" className={`w-auto object-contain drop-shadow-sm transition-all duration-300 ${isScrolled ? 'h-24' : 'h-32'}`} />
          </div>
          <div>
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 hover:scale-105 group"
            >
              Access Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 pt-40 pb-24 max-w-7xl mx-auto w-full gap-16 min-h-[90vh]">
        
        {/* Left: Copy */}
        <motion.div 
          className="flex-1 text-center lg:text-left z-20"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8">
            <Lock className="w-3.5 h-3.5" />
            <span>Bank-Grade Institutional Payments</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Modernize Your <br className="hidden lg:block"/>
            <span className="text-indigo-600">Campus</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
            The all-in-one payment gateway for modern education. Automate fee collection, manage dynamic penalties, and simplify operations across your entire campus.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white hover:bg-indigo-500 px-8 py-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl hover:shadow-indigo-500/25 active:scale-95 hover:scale-105 group"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features"
              className="px-8 py-4 rounded-xl text-sm font-bold border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 hover:scale-105"
            >
              Explore Features
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm font-bold text-slate-500">
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Apple Wallet Passes</div>
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Real-time Sync</div>
          </motion.div>
        </motion.div>

        {/* Right: Abstract UI Visualization */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[500px] flex items-center justify-center pointer-events-none hidden md:flex">
           {/* Decorative Blur */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
           
           {/* Floating Card 1: Balance */}
           <motion.div 
              initial={{ y: 0 }}
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 left-10 lg:left-0 z-20 bg-white/80 backdrop-blur-xl p-5 rounded-2xl w-64 border border-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
           >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center"><Wallet className="w-5 h-5 text-indigo-600"/></div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Due</span>
              </div>
              <div className="text-3xl font-black font-mono text-slate-800">₹45,500</div>
              <div className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1">Includes ₹500 Late Penalty</div>
           </motion.div>

           {/* Floating Card 2: Receipt */}
           <motion.div 
              initial={{ y: 0 }}
              animate={{ y: [8, -8, 8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 right-10 lg:right-0 z-30 bg-white/90 backdrop-blur-xl p-5 rounded-2xl w-72 border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]"
           >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600"/></div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Tuition Fee Paid</div>
                  <div className="text-[10px] font-semibold text-slate-400">Transaction Successful</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-xl font-black font-mono">₹25,000</span>
                 <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1 uppercase">
                   PDF <Download className="w-3 h-3" />
                 </div>
              </div>
           </motion.div>

           {/* Floating Graphic/Chart */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-80 h-80 rounded-full border border-slate-100 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border border-indigo-50 flex items-center justify-center relative shadow-inner bg-slate-50/50">
                 <div className="absolute top-0 right-10 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
                 <div className="w-32 h-32 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full shadow-inner opacity-90"></div>
              </div>
           </div>
        </div>
      </main>

      {/* Enhanced Visual Flowchart Section */}
      <motion.section 
        className="relative z-10 py-32 bg-slate-50 border-t border-slate-200 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div variants={fadeUp} className="text-center mb-24">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Users className="w-3.5 h-3.5" /> Platform Ecosystem
             </div>
             <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">The Campus Flow</h3>
             <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
                Witness the seamless journey of a transaction. From a student's mobile payment to the administrator's real-time analytics dashboard.
             </p>
          </motion.div>

          <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-6">
            
            {/* Connecting Background Line (Desktop only) */}
            <div className="hidden lg:block absolute top-[120px] left-40 right-40 h-1 bg-slate-200 z-0 overflow-hidden rounded-full">
               <div className="h-full w-1/4 bg-indigo-500 blur-sm animate-[moveRight_4s_ease-in-out_infinite]"></div>
            </div>

            <style>{`
              @keyframes moveRight {
                0% { transform: translateX(-100%); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateX(400%); opacity: 0; }
              }
            `}</style>
            
            {/* 1. Student Node */}
            <motion.div variants={fadeUp} className="group relative z-10 w-full lg:w-[32%] bg-white border border-slate-200 p-8 md:p-10 rounded-[32px] hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:border-indigo-300 flex flex-col cursor-default">
               <div className="relative z-10 flex-1 flex flex-col">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                   <GraduationCap className="w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 text-center mb-2">1. Student</h4>
                 <p className="text-xs text-indigo-500 font-bold text-center uppercase tracking-widest mb-8">The Initiator</p>
                 <ul className="text-sm text-slate-600 font-medium space-y-4 flex-1">
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Pays tuition & fees securely via UPI or Cards</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Downloads immutable PDF digital receipts</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Exports payment passes to Apple Wallet</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Tracks upcoming dues & automatic late penalties</span></li>
                 </ul>
               </div>
            </motion.div>

            <div className="flex lg:hidden items-center justify-center text-slate-400 py-4">
              <ArrowDown className="w-10 h-10 animate-bounce text-indigo-300" />
            </div>

            {/* 2. Accountant Node */}
            <motion.div variants={fadeUp} className="group relative z-10 w-full lg:w-[32%] bg-white border border-slate-200 p-8 md:p-10 rounded-[32px] hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:border-indigo-300 flex flex-col cursor-default">
               <div className="relative z-10 flex-1 flex flex-col">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                   <Wallet className="w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 text-center mb-2">2. Accountant</h4>
                 <p className="text-xs text-indigo-500 font-bold text-center uppercase tracking-widest mb-8">The Verifier</p>
                 <ul className="text-sm text-slate-600 font-medium space-y-4 flex-1">
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Logs manual cash or cheque payments</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Reconciles bounced or pending cheque statuses</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Applies custom late penalties to specific accounts</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Monitors daily point-of-sale collection metrics</span></li>
                 </ul>
               </div>
            </motion.div>

            <div className="flex lg:hidden items-center justify-center text-slate-400 py-4">
              <ArrowDown className="w-10 h-10 animate-bounce text-indigo-300" />
            </div>

            {/* 3. Admin Node */}
            <motion.div variants={fadeUp} className="group relative z-10 w-full lg:w-[32%] bg-white border border-slate-200 p-8 md:p-10 rounded-[32px] hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:border-indigo-300 flex flex-col cursor-default">
               <div className="relative z-10 flex-1 flex flex-col">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                   <PieChart className="w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 text-center mb-2">3. School Admin</h4>
                 <p className="text-xs text-indigo-500 font-bold text-center uppercase tracking-widest mb-8">The Overseer</p>
                 <ul className="text-sm text-slate-600 font-medium space-y-4 flex-1">
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Views real-time financial health analytics</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Designs complex fee structures (Tuition, Lab, Exam)</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Approves critical merit & sports scholarship waivers</span></li>
                   <li className="flex items-start gap-3 group/item"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-200" /> <span>Manages system access for students & staff</span></li>
                 </ul>
               </div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="relative z-10 bg-white py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3">Platform Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Purpose-Built for Every Stakeholder</h3>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
              Campus Pay isn't just a payment gateway. It's an end-to-end financial ecosystem designed specifically for the complex needs of educational institutions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 p-8 rounded-3xl hover:border-indigo-300 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Fee Collection</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Accept payments via UPI, Credit/Debit Cards, and NetBanking. The system automatically calculates precise dues based on built-in penalty rules and scholarship waivers.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 p-8 rounded-3xl hover:border-indigo-300 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Digital Receipts & Wallet</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every transaction generates an immutable PDF receipt. Students can also download their payment records as native Apple Wallet Passes for offline access.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 p-8 rounded-3xl hover:border-indigo-300 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Role-Based Portals</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated, secure dashboards for Students (to pay), Accountants (to verify), School Admins (to manage), and Super Admins (to oversee multiple institutions).
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Video Showcase Section */}
      <motion.section 
        className="relative z-10 py-32 bg-slate-50 border-t border-slate-200"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3">See CampusPay in Action</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Experience the Platform</h3>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
              Watch how students, accountants, and admins use the platform in real time to streamline their daily operations.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="max-w-4xl mx-auto relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative aspect-video bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
                <Play className="w-8 h-8 ml-1 group-hover:text-indigo-100 transition-colors" fill="currentColor" />
              </div>
              <span className="text-sm font-bold text-indigo-400">Demo video coming soon</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Us Section */}
      <motion.section 
        id="contact" 
        className="relative z-10 bg-white py-32 border-t border-slate-200"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3">Get in Touch</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Contact Our Team</h3>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
              Have questions about integrating Campus Pay into your institution? We're here to help.
            </p>
          </motion.div>
          
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            {/* Contact Info */}
            <div>
              <h4 className="text-2xl font-bold text-slate-900 mb-8">Reach Out Directly</h4>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Phone Support</div>
                    <div className="text-slate-500 mt-1 font-medium leading-relaxed">+1 (800) 123-4567<br/>Mon-Fri, 9am - 6pm EST</div>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Sales Inquiries</div>
                    <div className="text-slate-500 mt-1 font-medium leading-relaxed">sales@campuspay.example.com<br/>Average response: 2 hours</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <form className="space-y-5" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">First Name</label>
                  <input 
                    name="firstName"
                    value={contactForm.firstName}
                    onChange={handleContactChange}
                    type="text" 
                    placeholder="Jane" 
                    className={`w-full px-4 py-3.5 rounded-xl border ${contactErrors.firstName ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500'} focus:outline-none focus:ring-1 transition-all text-sm font-medium shadow-sm`}
                  />
                  {contactErrors.firstName && <p className="text-xs text-red-500 font-medium mt-1">{contactErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Name</label>
                  <input 
                    name="lastName"
                    value={contactForm.lastName}
                    onChange={handleContactChange}
                    type="text" 
                    placeholder="Doe" 
                    className={`w-full px-4 py-3.5 rounded-xl border ${contactErrors.lastName ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500'} focus:outline-none focus:ring-1 transition-all text-sm font-medium shadow-sm`}
                  />
                  {contactErrors.lastName && <p className="text-xs text-red-500 font-medium mt-1">{contactErrors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Work Email</label>
                <input 
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  type="email" 
                  placeholder="jane@school.edu" 
                  className={`w-full px-4 py-3.5 rounded-xl border ${contactErrors.email ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500'} focus:outline-none focus:ring-1 transition-all text-sm font-medium shadow-sm`}
                />
                {contactErrors.email && <p className="text-xs text-red-500 font-medium mt-1">{contactErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message</label>
                <textarea 
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  rows="4" 
                  placeholder="How can we help?" 
                  className={`w-full px-4 py-3.5 rounded-xl border ${contactErrors.message ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500'} focus:outline-none focus:ring-1 transition-all text-sm font-medium resize-none shadow-sm`}
                ></textarea>
                {contactErrors.message && <p className="text-xs text-red-500 font-medium mt-1">{contactErrors.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={contactStatus === 'loading' || contactStatus === 'success'}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg mt-2 flex items-center justify-center gap-2 ${contactStatus === 'success' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl active:scale-95 hover:scale-105 group'}`}
              >
                {contactStatus === 'idle' && <>Send Message <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                {contactStatus === 'loading' && <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>}
                {contactStatus === 'success' && <><Check className="w-5 h-5" /> Message Sent</>}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative z-10 py-40 bg-white text-center px-6 overflow-hidden border-t border-slate-200"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
        {/* Animated Gradient Blob */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full blur-[120px] -z-10"
        ></motion.div>
        
        <motion.div variants={fadeUp} className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Ready to streamline your campus?</h2>
          <p className="text-slate-500 mb-10 text-xl font-medium">Log in to your portal to experience the future of educational fee management.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl text-base font-bold transition-all shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center gap-2 mx-auto active:scale-95 hover:scale-105 group"
          >
            Go to Login <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-50 text-slate-500 py-10 text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center justify-center md:justify-start gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img src="/campuspay-logo.png" alt="Campus Pay" className="h-24 w-auto" />
          </div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Campus Pay. Built for modern education.
          </div>
        </div>
      </footer>
    </div>
  );
}

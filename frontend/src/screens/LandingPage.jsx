import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Wallet,
  ArrowRight,
  GraduationCap,
  PieChart,
  Smartphone,
  CheckCircle2,
  Lock,
  Download,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden flex flex-col">
      {/* Background gradients matching index.css body styles but enhanced for the landing page */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 25%),
          radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.15), transparent 25%),
          radial-gradient(at 0% 0%, rgba(243, 239, 255, 0.6) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(235, 243, 255, 0.6) 0px, transparent 50%)
        `,
        backgroundAttachment: 'fixed'
      }}></div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out 2s infinite; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <img src="/campuspay-logo.png" alt="Campus Pay" className="h-32 w-auto object-contain drop-shadow-sm" />
        </div>
        <div>
          <button 
            onClick={() => navigate('/login')}
            className="glass-btn-primary flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 pt-2 pb-24 max-w-7xl mx-auto w-full gap-16">
        
        {/* Left: Copy */}
        <div className="flex-1 text-center lg:text-left z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-indigo-100 shadow-sm text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8">
            <Lock className="w-3.5 h-3.5" />
            <span>Bank-Grade Institutional Payments</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Modernize Your <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Campus Finances</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
            Eliminate manual fee collection. Campus Pay offers automated UPI & card payments, dynamic penalty/waiver calculations, and role-specific dashboards for everyone from students to super-admins.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="glass-btn-secondary px-8 py-4 text-sm font-bold"
            >
              Explore Features
            </button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm font-bold text-slate-500">
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Apple Wallet Passes</div>
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Real-time Sync</div>
          </div>
        </div>

        {/* Right: Abstract UI Visualization */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[500px] flex items-center justify-center pointer-events-none hidden md:flex">
           {/* Decorative Blur */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full"></div>
           
           {/* Floating Card 1: Balance */}
           <div className="absolute top-10 left-10 lg:left-0 z-20 animate-float glass-panel p-5 rounded-2xl w-64 border-t border-l border-white/80">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><Wallet className="w-5 h-5 text-indigo-600"/></div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Due</span>
              </div>
              <div className="text-3xl font-black font-mono text-slate-800">₹45,500</div>
              <div className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1">Includes ₹500 Late Penalty</div>
           </div>

           {/* Floating Card 2: Receipt */}
           <div className="absolute bottom-20 right-10 lg:right-0 z-30 animate-float-delayed glass-panel p-5 rounded-2xl w-72 border-t border-l border-white/80 bg-white/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600"/></div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Tuition Fee Paid</div>
                  <div className="text-[10px] font-semibold text-slate-400">Transaction Successful</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-xl font-black font-mono">₹25,000</span>
                 <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1 uppercase">
                   PDF <Download className="w-3 h-3" />
                 </button>
              </div>
           </div>

           {/* Floating Card 3: Graphic/Chart */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 glass-panel w-80 h-80 rounded-full border-4 border-white/40 flex items-center justify-center opacity-80">
              <div className="w-56 h-56 rounded-full border border-indigo-200/50 flex items-center justify-center relative shadow-inner">
                 <div className="absolute top-0 right-10 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
                 <div className="w-32 h-32 bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-full shadow-2xl opacity-90 blur-sm"></div>
              </div>
           </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-white shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3">Platform Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Purpose-Built for Every Stakeholder</h3>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
              Campus Pay isn't just a payment gateway. It's an end-to-end financial ecosystem designed specifically for the complex needs of educational institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Smart Fee Collection</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Accept payments via UPI, Credit/Debit Cards, and NetBanking. The system automatically calculates precise dues based on built-in penalty rules and scholarship waivers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Digital Receipts & Wallet</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every transaction generates an immutable PDF receipt. Students can also download their payment records as native Apple Wallet Passes for offline access.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Role-Based Portals</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated, secure dashboards for Students (to pay), Accountants (to verify), School Admins (to manage), and Super Admins (to oversee multiple institutions).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-slate-900 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to streamline your campus?</h2>
          <p className="text-slate-400 mb-10 text-lg">Log in to your portal to experience the future of educational fee management.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-4 rounded-xl text-base font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 mx-auto"
          >
            Go to Login <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 text-slate-500 py-8 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center md:justify-start gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <img src="/campuspay-logo.png" alt="Campus Pay" className="h-20 w-auto" />
          </div>
          <div className="text-xs font-semibold">
            &copy; {new Date().getFullYear()} Campus Pay. Built for modern education.
          </div>
        </div>
      </footer>
    </div>
  );
}

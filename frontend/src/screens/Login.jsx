import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, Sparkles, School, Eye, EyeOff, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, Landmark, TrendingUp, Users, GraduationCap, Smartphone, FileText, Briefcase } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState(''); // '', 'verify_node', 'auth_user', 'load_workspace', 'welcome'
  const [error, setError] = useState('');
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Mouse coordinate tracking for spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Demo autofill helper
  const handleQuickFill = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAuthStep('verify_node');

    try {
      // Direct API validation
      const data = await api.post('/auth/login', { email, password });
      
      // Sequence cinematic transitions
      setTimeout(() => {
        setAuthStep('auth_user');
        setTimeout(() => {
          setAuthStep('load_workspace');
          setTimeout(() => {
            setAuthStep('welcome');
            setTimeout(() => {
              loginStore(data.user, data.accessToken, data.refreshToken);
              if (data.user.role === 'SUPER_ADMIN') navigate('/super-admin');
              else if (data.user.role === 'SCHOOL_ADMIN') navigate('/school-admin');
              else if (data.user.role === 'ACCOUNTANT') navigate('/accountant');
              else if (data.user.role === 'STUDENT') navigate('/student');
              else navigate('/');
            }, 600);
          }, 700);
        }, 700);
      }, 700);

    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please try again.');
      setAuthStep('');
      setIsLoading(false);
    }
  };

  // Orbit Node Definitions
  const nodes = [
    { id: 'admin', icon: <TrendingUp className="w-5 h-5 text-indigo-400" />, label: 'Admin Hub', angle: 0, orbit: 180 },
    { id: 'parent', icon: <Users className="w-5 h-5 text-indigo-400" />, label: 'Parent Portal', angle: 60, orbit: 240 },
    { id: 'student', icon: <GraduationCap className="w-5 h-5 text-indigo-400" />, label: 'Student App', angle: 120, orbit: 180 },
    { id: 'upi', icon: <Smartphone className="w-5 h-5 text-indigo-400" />, label: 'UPI Payout', angle: 180, orbit: 240 },
    { id: 'receipt', icon: <FileText className="w-5 h-5 text-indigo-400" />, label: 'Receipt Ledger', angle: 240, orbit: 180 },
    { id: 'accountant', icon: <Briefcase className="w-5 h-5 text-indigo-400" />, label: 'POS Terminal', angle: 300, orbit: 240 },
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-[#070913] text-white font-sans antialiased overflow-hidden relative flex flex-col md:flex-row items-center justify-between"
    >
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-lg"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </button>

      {/* 1. Cinematic Spotlight following cursor */}
      <div 
        className="absolute pointer-events-none inset-0 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(91, 92, 235, 0.07), transparent 80%)`,
        }}
      />

      {/* 2. Grid lines moving overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* 3. Subtle ambient light flows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5B5CEB]/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* LEFT AREA: The Orbiting Financial Ecosystem */}
      <div className="relative z-10 w-full md:w-1/2 h-[50vh] md:h-screen flex items-center justify-center select-none overflow-hidden">
        
        {/* Immersive Orbital rings */}
        <div className="absolute w-[360px] h-[360px] border border-white/5 rounded-full z-0 pointer-events-none" />
        <div className="absolute w-[480px] h-[480px] border border-white/5 rounded-full z-0 pointer-events-none animate-pulse" />

        {/* Dynamic transaction flow particles along lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full absolute inset-0 text-indigo-500/10" xmlns="http://www.w3.org/2000/svg">
            {nodes.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const x2 = 50 + (node.orbit / 8) * Math.cos(rad);
              const y2 = 50 + (node.orbit / 8) * Math.sin(rad);
              return (
                <g key={i}>
                  <line 
                    x1="50%" y1="50%" 
                    x2={`${x2}%`} y2={`${y2}%`} 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4"
                  />
                  {/* Moving transaction packet animation */}
                  <circle r="4" fill="#5B5CEB" className="shadow-lg">
                    <animateMotion 
                      dur={`${3 + i}s`}
                      repeatCount="indefinite"
                      path={`M ${window.innerWidth * 0.25} ${window.innerHeight * 0.5} L ${window.innerWidth * 0.25 + (node.orbit * Math.cos(rad))} ${window.innerHeight * 0.5 + (node.orbit * Math.sin(rad))}`} 
                    />
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>

        {/* HERO LOGO: The central node of the ecosystem */}
        <motion.div 
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-20 w-32 h-32 rounded-full bg-white border border-[#E5E7EB] shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-[#5B5CEB]/10 to-white blur-sm" />
          <img src="/campuspay-logo.png" alt="CampusPay" className="h-14 w-auto object-contain relative z-10 scale-[1.2] transform-gpu" />
          
          {/* Logo labels */}
          <div className="absolute -bottom-8 whitespace-nowrap text-center">
            <span className="font-black text-sm tracking-widest uppercase">CampusPay</span>
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Core Gateway</span>
          </div>
        </motion.div>

        {/* Orbiting system nodes */}
        {nodes.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = node.orbit * Math.cos(rad);
          const y = node.orbit * Math.sin(rad);

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: [x, x + 5 * Math.sin(i), x],
                y: [y, y + 5 * Math.cos(i), y],
              }}
              transition={{
                x: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                delay: i * 0.1,
              }}
              className="absolute z-15 w-14 h-14 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg flex flex-col items-center justify-center p-2 text-center hover:border-[#5B5CEB]/50 transition-colors cursor-pointer group"
            >
              <div className="group-hover:scale-110 transition-transform duration-300">{node.icon}</div>
              <span className="text-[7px] text-slate-400 font-bold tracking-wider uppercase mt-1 whitespace-nowrap hidden group-hover:block transition-all absolute -bottom-5 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5">
                {node.label}
              </span>
            </motion.div>
          );
        })}

        {/* Live product flow narrative loops */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-center text-center">
          <div className="px-5 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md text-[10px] text-slate-400 tracking-wider font-semibold max-w-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={Math.floor(Date.now() / 3000) % 4}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {Math.floor(Date.now() / 3000) % 4 === 0 && "⚡ Greenwood Tuition Invoice generated successfully"}
                {Math.floor(Date.now() / 3000) % 4 === 1 && "✓ UPI Payment processed for GW-26-1025"}
                {Math.floor(Date.now() / 3000) % 4 === 2 && "📄 Standard Receipt copy updated to Student Wallet"}
                {Math.floor(Date.now() / 3000) % 4 === 3 && "📈 Accountant billing workstation ledger synchronized"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* RIGHT AREA: Immersive Glass Login Panel */}
      <div className="relative z-10 w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-between items-center h-[50vh] md:min-h-screen">
        
        {/* Spacer */}
        <div className="hidden md:block" />

        {/* Immersive Auth Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[420px] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In</h2>
            <p className="text-xs font-medium text-slate-400">Access your school billing workplace</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 text-[#EF4444] text-xs font-semibold rounded-xl"
            >
              ⚠ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-455 text-slate-400 uppercase tracking-widest">School Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-10 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-[#5B5CEB] focus:outline-none transition-all rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[9px] font-bold text-[#5B5CEB] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-[#5B5CEB] focus:outline-none transition-all rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-455 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit/Dynamic Stepper Trigger */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white flex items-center justify-center rounded-xl text-sm font-semibold tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  {authStep === 'verify_node' && 'Verifying School...'}
                  {authStep === 'auth_user' && 'Authenticating User...'}
                  {authStep === 'load_workspace' && 'Loading Workspace...'}
                  {authStep === 'welcome' && '✓ Welcome Back'}
                </div>
              ) : (
                <span className="flex items-center gap-1.5">
                  Continue <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>

          </form>

          {/* Quick Demo Access Credentials */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
              Quick Demo Login
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                { role: 'Super Admin', email: 'superadmin@campuspay.com', pass: 'SuperAdmin123!' },
                { role: 'School Admin', email: 'admin@greenwood.com', pass: 'Admin123!' },
                { role: 'Accountant', email: 'accountant@greenwood.com', pass: 'Accountant123!' },
                { role: 'Student', email: 'student@greenwood.com', pass: 'Student123!' }
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickFill(item.email, item.pass)}
                  className="px-3 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-[9px] font-semibold"
                >
                  ○ {item.role}
                </button>
              ))}
            </div>
          </div>

        </motion.div>

        {/* Security badges footer */}
        <div className="pt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[8px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">🔒 256-Bit SSL</span>
          <span>•</span>
          <span>PCI-DSS Ready</span>
          <span>•</span>
          <span>Sandbox Mode</span>
          <span>•</span>
          <span>SOC2 Compliant</span>
        </div>

      </div>

    </div>
  );
}

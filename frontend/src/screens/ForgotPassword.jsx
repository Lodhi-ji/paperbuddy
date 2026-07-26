import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, Sparkles, School, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResetUrl('');

    try {
      const data = await api.post('/auth/forgot-password', { email });
      
      // Artificial delay for cinematic feel
      setTimeout(() => {
        setSuccess(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please verify the email and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-[#070913] text-white font-sans antialiased overflow-hidden relative flex items-center justify-center p-4 md:p-8"
    >
      
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

      {/* Immersive Auth Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[440px] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 relative z-10 text-left"
      >
        
        {/* Logo Icon on Top */}
        <div className="flex items-center gap-3 pb-2 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-white/10 overflow-hidden">
            <img src="/favicon.svg" alt="CampusPay" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">CampusPay</span>
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Reset Center</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">Forgot Password</h2>
          <p className="text-xs font-medium text-slate-400">Enter your email and we'll generate a secure reset link.</p>
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

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success-state"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-center py-4"
            >
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Reset Request Generated</h3>
                <p className="text-xs text-slate-400 font-medium">
                  In production, a secure magic link is dispatched to your registered mailbox.
                </p>
              </div>

              {resetUrl && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-2">
                  <span className="block text-[9px] uppercase tracking-wider text-indigo-400 font-bold">Development Magic Link:</span>
                  <a
                    href={resetUrl}
                    className="block text-xs font-semibold text-[#5B5CEB] hover:underline break-all"
                  >
                    {resetUrl}
                  </a>
                  <p className="text-[9px] text-slate-500">Click to bypass SMTP sandbox and verify the flow.</p>
                </div>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="form-state"
              onSubmit={handleSubmit} 
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#5B5CEB] hover:bg-[#4a4bd1] text-white flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Generating Link...
                  </span>
                ) : (
                  'Generate Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel & Return
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>

    </div>
  );
}

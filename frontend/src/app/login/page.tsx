"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Silakan periksa email dan password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ═══════ DESKTOP: Split Layout ═══════ */}

      {/* Background blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-100 via-white to-slate-50" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-50/50 blur-3xl" />
      </div>

      {/* Left Panel - Desktop Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-10">
              <motion.div
                className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-sky-200/50 border border-white/80 overflow-hidden mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <img src="/logo.png" alt="HBM Logo" className="w-full h-full object-contain p-3" />
              </motion.div>

              <motion.h1
                className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                HBM <br />
                <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Budgeting</span>{' '}
                <span className="text-slate-400 font-light text-4xl">System</span>
              </motion.h1>

              <motion.p
                className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Sistem Pengajuan & Persetujuan Anggaran Staff yang terintegrasi
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex -space-x-3">
                {['bg-sky-500', 'bg-blue-500', 'bg-indigo-500'].map((bg, i) => (
                  <motion.div
                    key={i}
                    className={`w-9 h-9 ${bg} rounded-full border-2 border-white flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                  >
                    <ShieldCheck className="w-4 h-4 text-white/90" />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-slate-400 font-semibold">
                Keamanan berlapis & approval multi-level
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -top-10 right-0 w-20 h-20 bg-sky-100/50 rounded-2xl rotate-12"
            animate={{ y: [0, -15, 0], rotate: [12, 18, 12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 -right-10 w-14 h-14 bg-blue-100/40 rounded-xl -rotate-12"
            animate={{ y: [0, 10, 0], rotate: [-12, -6, -12] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
      </div>

      {/* ═══════ Desktop Right Panel / Mobile Full Screen ═══════ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-0 lg:p-12 relative z-10">

        {/* Desktop Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[420px] hidden lg:block"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-slate-200/50 p-10 border border-white/60">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk</h2>
              <p className="text-slate-400 text-sm font-semibold mt-1.5">
                Silakan login untuk melanjutkan
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-start gap-3"
                  >
                    <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-xs">!</span>
                    </div>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5">Email</label>
                <div className={`relative rounded-2xl transition-all duration-300 ${
                  focusedField === 'email' ? 'ring-4 ring-sky-100 shadow-lg shadow-sky-100/50' : 'ring-0 shadow-none'
                }`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className={`w-[18px] h-[18px] transition-colors duration-300 ${focusedField === 'email' ? 'text-sky-500' : 'text-slate-300'}`} />
                  </div>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-sky-400 transition-colors font-semibold text-slate-900 placeholder:text-slate-300 text-sm bg-slate-50/50 focus:bg-white"
                    placeholder="nama@hbmcorp.co.id"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5">Password</label>
                <div className={`relative rounded-2xl transition-all duration-300 ${
                  focusedField === 'password' ? 'ring-4 ring-sky-100 shadow-lg shadow-sky-100/50' : 'ring-0 shadow-none'
                }`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className={`w-[18px] h-[18px] transition-colors duration-300 ${focusedField === 'password' ? 'text-sky-500' : 'text-slate-300'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-sky-400 transition-colors font-semibold text-slate-900 placeholder:text-slate-300 text-sm bg-slate-50/50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              <motion.button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-sky-200/50 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm tracking-wide uppercase mt-2"
                whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Sistem
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>→</motion.span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <p className="mt-8 text-center text-slate-300 text-xs font-bold tracking-wide">
            © {new Date().getFullYear()} CV Hasil Barokah Mandiri — All rights reserved
          </p>
        </motion.div>

        {/* ═══════ MOBILE APP-LIKE LAYOUT ═══════ */}
        <div className="lg:hidden w-full flex flex-col min-h-[100dvh] relative bg-white">

          {/* ── Blue Header Area (normal flow, NOT absolute) ── */}
          <div className="relative overflow-hidden flex-shrink-0">
            {/* Gradient background */}
            <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-blue-600 px-6 pt-14 pb-20 flex flex-col items-center relative">
              {/* Floating blobs */}
              <motion.div
                className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-20 -left-12 w-40 h-40 rounded-full bg-white/10 blur-2xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              {/* Logo */}
              <motion.div
                className="w-20 h-20 bg-white rounded-[22px] flex items-center justify-center shadow-2xl shadow-sky-900/30 overflow-hidden mb-4 relative z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <img src="/logo.png" alt="HBM Logo" className="w-full h-full object-contain p-2" />
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-xl font-black text-white tracking-tight text-center relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                HBM Budgeting
              </motion.h1>
              <motion.p
                className="text-sky-100 text-xs font-semibold mt-1 text-center relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Sistem Pengajuan & Persetujuan Anggaran
              </motion.p>
            </div>

            {/* SVG Wave — sits at the very bottom of the blue area */}
            <svg
              className="absolute bottom-0 left-0 w-full"
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
              style={{ height: '40px', display: 'block' }}
            >
              <path d="M0,15 C100,40 200,0 300,20 C350,30 380,10 400,15 L400,40 L0,40 Z" fill="white" />
            </svg>
          </div>

          {/* ── White Form Area (normal flow) ── */}
          <motion.div
            className="flex-1 flex flex-col px-7 -mt-4 relative z-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1">Masuk ke Akun</h2>
            <p className="text-slate-400 text-xs font-semibold mb-6">
              Login untuk melanjutkan ke dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs font-bold border border-red-100 flex items-start gap-2.5"
                  >
                    <div className="w-4 h-4 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-[10px] font-black">!</span>
                    </div>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email</label>
                <div className={`relative rounded-2xl transition-all duration-300 ${
                  focusedField === 'email' ? 'ring-3 ring-sky-100 shadow-md shadow-sky-100/50' : ''
                }`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-sky-500' : 'text-slate-300'}`} />
                  </div>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-sky-400 transition-all font-semibold text-slate-900 placeholder:text-slate-300 text-sm bg-slate-50/80 focus:bg-white"
                    placeholder="nama@hbmcorp.co.id"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Password</label>
                <div className={`relative rounded-2xl transition-all duration-300 ${
                  focusedField === 'password' ? 'ring-3 ring-sky-100 shadow-md shadow-sky-100/50' : ''
                }`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-sky-500' : 'text-slate-300'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-sky-400 transition-all font-semibold text-slate-900 placeholder:text-slate-300 text-sm bg-slate-50/80 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-6" />

              {/* Submit */}
              <motion.button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 active:from-sky-700 active:to-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-sky-200/40 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm tracking-wide uppercase"
                whileTap={{ scale: 0.97 }}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>→</motion.span>
                  </>
                )}
              </motion.button>

              <p className="text-center text-slate-300 text-[10px] font-bold tracking-wide pt-1 pb-4">
                © {new Date().getFullYear()} CV Hasil Barokah Mandiri
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

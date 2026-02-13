"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-sky-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-sky-100 border border-sky-50 overflow-hidden">
            <img src="/logo.png" alt="HBM Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">HBM Budgeting</h1>
          <p className="text-slate-500 text-sm font-medium">Sistem Pengajuan & Persetujuan Anggaran Staff</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Alamat Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all font-medium text-slate-900 placeholder:text-slate-500"
              placeholder="name@hbm.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all font-medium text-slate-900 placeholder:text-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-sky-100 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Masuk ke Sistem
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                   →
                </motion.span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} CV Hasil Barokah Mandiri
        </p>
      </motion.div>
    </div>
  );
}

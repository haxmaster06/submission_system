"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft } from 'lucide-react';

export default function MaintenancePage() {
  const router = useRouter();

  // Periodically check if maintenance is over
  useEffect(() => {
    const check = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance-status`);
        const data = await res.json();
        if (!data.maintenance) {
          router.replace('/dashboard');
        }
      } catch {}
    }, 15000);

    return () => clearInterval(check);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-24 h-24 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8"
        >
          <Wrench size={48} className="text-amber-400" />
        </motion.div>

        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
          Sedang Dalam Perawatan
        </h1>
        <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
          Sistem sedang menjalani pemeliharaan terjadwal untuk meningkatkan kinerja dan keamanan. 
          Silakan kembali dalam beberapa saat.
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 inline-block">
          <p className="text-xs text-slate-500 font-bold">
            Halaman ini akan otomatis refresh ketika sistem kembali normal.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

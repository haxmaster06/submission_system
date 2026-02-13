"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowRight, CornerDownRight, Receipt, AlertCircle, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SubmissionDetailView from '@/components/submissions/SubmissionDetailView';

export default function RealizationsDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'under' | 'over' | 'exact'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const { user } = useAuth();
  const isFinance = user?.roles?.some((r: any) => r.name === 'Finance' || r.name === 'Super Admin');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // We fetch approved submissions which are targets for realization
      const res = await api.get('/submissions', { 
        params: { status: 'approved', per_page: 100 } 
      });
      setSubmissions(res.data.submissions?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logic to calculate summary for each submission
  const processedSubmissions = submissions.map(s => {
    const totalRealized = s.realizations?.reduce((acc: number, r: any) => {
        return acc + r.details.reduce((sum: number, d: any) => sum + parseFloat(d.total), 0);
    }, 0) || 0;

    const diff = Math.round((parseFloat(s.total) - totalRealized) * 100) / 100;
    let status: 'under' | 'over' | 'exact' = 'exact';
    if (diff > 0) status = 'under';
    if (diff < 0) status = 'over';
    if (diff === 0) status = 'exact';

    return { ...s, totalRealized, diff, status };
  });

  const filtered = processedSubmissions.filter(s => {
    const matchesSearch = s.no_pengajuan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Monitoring Realisasi</h1>
            <p className="text-slate-500 font-medium">Pantau serapan anggaran vs pengajuan aktual.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari No Pengajuan atau Nama..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
             {(['all', 'under', 'over', 'exact'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    filterStatus === s 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {s === 'all' ? 'Semua' : s === 'under' ? 'Under Budget' : s === 'over' ? 'Over Budget' : 'Sesuai Budget'}
                </button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <Loader2 size={40} className="animate-spin mb-4" />
             <p className="font-bold">Memuat data realisasi...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-slate-200" size={40} />
             </div>
             <p className="text-slate-500 font-bold text-lg text-slate-800">Tidak ada data ditemukan</p>
             <p className="text-slate-400 text-sm mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filtered.map(s => (
                <motion.div 
                  layout
                  key={s.id}
                  onClick={() => setSelectedSubmission(s)}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-100 transition-all cursor-pointer group flex flex-col"
                >
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                         <Receipt size={24} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.status === 'over' ? 'bg-rose-50 text-rose-600' : s.status === 'exact' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {s.status === 'over' ? 'Over Budget' : s.status === 'exact' ? 'Sesuai Budget' : 'Under Budget'}
                      </div>
                   </div>

                   <h3 className="font-black text-slate-900 leading-tight mb-1">{s.no_pengajuan}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{s.user?.name}</p>

                   <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-medium">Budget:</span>
                         <span className="font-mono font-bold text-slate-700">Rp {parseFloat(s.total).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-medium">Terpakai:</span>
                         <span className="font-mono font-bold text-sky-600">Rp {s.totalRealized.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                         <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {s.diff < 0 ? 'Kelebihan' : 'Sisa Budget'}
                         </span>
                         <span className={`font-mono font-black text-sm ${s.diff < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            Rp {Math.abs(s.diff).toLocaleString('id-ID')}
                         </span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between text-sky-500 font-bold text-xs">
                      <span>Lihat Detail</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </motion.div>
             ))}
          </div>
        )}

        <AnimatePresence>
          {selectedSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedSubmission(null)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="relative w-full max-w-5xl bg-slate-50 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
               >
                  <div className="p-8 pb-0 flex justify-between items-center">
                     <h2 className="text-2xl font-black text-slate-900">Detail Pengajuan</h2>
                     <button 
                       onClick={() => setSelectedSubmission(null)}
                       className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                     >
                        <AlertCircle size={20} />
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8">
                     <SubmissionDetailView 
                        submission={selectedSubmission} 
                        showPrintButton={true}
                        onClose={() => setSelectedSubmission(null)}
                     />
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}

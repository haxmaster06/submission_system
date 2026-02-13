"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, CheckCircle, AlertCircle, TrendingUp, 
  ArrowRight, Loader2, BarChart3, PieChart as PieIcon, 
  History, Shield, Zap, Calendar, User
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: any = {
    'management': 'Supervision & Strategy',
    'division': 'Departmental Overview',
    'staff': 'Personal Workspace'
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
           <div className="relative">
              <Loader2 size={48} className="animate-spin text-sky-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping" />
              </div>
           </div>
           <p className="mt-4 font-black uppercase tracking-widest text-[10px]">Menyiapkan Dashboard Anda...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
        {/* Modern Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={12} />
                  {roleLabels[data?.role_scope] || 'Standard Access'}
               </span>
               {data?.user_division && (
                 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {data.user_division}
                 </span>
               ) }
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Halo, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 font-medium">Berikut adalah analitik anggaran hari ini.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                  <Clock size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Approval</p>
                  <p className="text-lg font-black text-slate-900 leading-none">{data?.aging} Hari</p>
               </div>
            </div>

            {data?.approvals_count > 0 && (
              <Link href="/approvals">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-sky-500 text-white p-4 pr-6 rounded-3xl shadow-xl shadow-sky-200 flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-black text-lg">
                    {data.approvals_count}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Queue</p>
                    <p className="font-black text-sm uppercase tracking-tight">Butuh Persetujuan</p>
                  </div>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform ml-2" />
                </motion.button>
              </Link>
            )}
          </div>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {[
            { label: 'Total Pengajuan', val: data?.counters?.total, icon: FileText, col: 'sky', delay: 0 },
            { label: 'Menunggu', val: data?.counters?.pending, icon: Clock, col: 'amber', delay: 0.1 },
            { label: 'Disetujui', val: data?.counters?.approved, icon: CheckCircle, col: 'emerald', delay: 0.2 },
            { label: 'Outstanding', val: data?.counters?.outstanding ?? 0, icon: Zap, col: 'indigo', delay: 0.3 },
            { label: 'Ditolak', val: data?.counters?.rejected, icon: AlertCircle, col: 'rose', delay: 0.4 }
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.delay }}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl bg-${s.col}-50 text-${s.col}-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                  <s.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{s.val}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Trend Chart (Budget vs Realization) */}
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">Tren Anggaran & Realisasi</h2>
                  <p className="text-slate-400 text-sm font-medium">Histori pengajuan vs aktual (6 bulan terakhir)</p>
               </div>
               <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-sky-500" />
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-emerald-400" />
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Actual</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[300px] w-full min-w-0">
               {data?.trends && (
                 <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                        tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', padding: '12px' }}
                        itemStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}
                        labelStyle={{ fontWeight: 'black', color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="budget" 
                        stroke="#0ea5e9" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorBudget)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="realization" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorReal)" 
                      />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
          </div>

          {/* Category Breakdown (Pie Chart) */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col items-center">
            <div className="w-full text-left mb-6">
              <h2 className="text-xl font-black text-slate-900 leading-tight">Analisis Kategori</h2>
              <p className="text-slate-400 text-sm font-medium">Distribusi berdasarkan tipe pengajuan.</p>
            </div>
            
            <div className="h-[240px] w-full min-w-0">
              {data?.categories && (
                <ResponsiveContainer width="99%" height="100%">
                   <PieChart>
                      <Pie
                        data={data.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {data.categories.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                        itemStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}
                        labelStyle={{ display: 'none' }}
                      />
                   </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-4">
               {data?.categories.map((cat: any, i: number) => (
                 <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase truncate">{cat.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Ranking & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ranking Divisi / Urgency Insights */}
          <div className="lg:col-span-2 space-y-8">
             {data?.role_scope === 'management' && (
               <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                       <h2 className="text-xl font-black text-slate-900 leading-tight">Ranking Pengeluaran Divisi</h2>
                       <p className="text-slate-400 text-sm font-medium">Total budget disetujui per divisi.</p>
                    </div>
                    <Link href="/reporting">
                       <button className="text-sky-500 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                          Laporan Lengkap <ArrowRight size={14} />
                       </button>
                    </Link>
                 </div>

                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data?.division_ranking} layout="vertical" margin={{ left: 40, right: 40 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                          />
                          <Tooltip 
                            formatter={(val?: number | string) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`}
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                            itemStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}
                            labelStyle={{ fontWeight: 'black', color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                          />
                          <Bar 
                            dataKey="total" 
                            fill="#0ea5e9" 
                            radius={[0, 10, 10, 0]} 
                            barSize={30}
                          />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Urgency Summary */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                   <h2 className="text-xl font-black mb-6 relative z-10 text-white">Indikator Urgensi</h2>
                   <div className="space-y-4 relative z-10">
                       {[
                        { label: 'Darurat', val: data?.urgency['urgent'] || 0, col: 'bg-rose-500' },
                        { label: 'Biasa', val: data?.urgency['normal'] || 0, col: 'bg-sky-500' }
                      ].map(u => (
                        <div key={u.label} className="flex items-center gap-4">
                           <div className={`w-12 h-12 ${u.col} rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border border-white/20`}>
                              {u.val}
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{u.label}</p>
                              <p className="text-sm font-bold text-slate-100">{u.val > 0 ? `${u.val} Pengajuan aktif` : 'Tidak ada'}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <Zap size={140} className="absolute -right-8 -bottom-8 text-white/5 -rotate-12" />
                </div>

                {/* Helpful Widgets / Reminders */}
                <div className="bg-sky-600 rounded-[40px] p-8 text-white flex flex-col justify-between">
                   <div>
                      <Calendar size={40} className="mb-4 text-white/40" />
                      <h3 className="text-2xl font-black leading-tight mb-2 text-white">Tertib Administrasi<br/>Adalah Kunci</h3>
                      <p className="text-sky-50 text-sm font-medium">Jangan lupa lampirkan seluruh bukti kuitansi di menu Monitoring Realisasi untuk setiap pengajuan yang sudah diselesaikan.</p>
                   </div>
                   <Link href="/realizations" className="mt-6">
                      <button className="w-full py-4 bg-white text-sky-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                         Update Realisasi Sekarang
                      </button>
                   </Link>
                </div>
             </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-8 pb-4">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <h2 className="font-black text-slate-900 text-xl tracking-tight leading-none uppercase">Live Activity</h2>
               </div>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Real-time Updates</p>
            </div>
            
            <div className="flex-1 p-8 pt-4 overflow-y-auto space-y-8 scrollbar-hide">
              {data?.activities?.length > 0 ? (
                data.activities.map((act: any, idx: number) => (
                  <div key={idx} className="flex gap-4 group relative">
                    {idx !== data.activities.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-8 bg-slate-50" />
                    )}
                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${
                      act.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {act.status === 'approved' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-snug">
                         <span className="font-black">{act.actor_name}</span> has 
                         <span className={`mx-1 font-bold ${act.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>{act.status}</span> 
                         submission <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{act.no_pengajuan}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <Clock size={10} /> {new Date(act.updated_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })} • Today
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 pb-8 py-20">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <History size={40} className="text-slate-100" />
                   </div>
                   <p className="text-lg font-black text-slate-300">Quiet for now...</p>
                </div>
              )}
            </div>
            
            <Link href="/submissions">
               <div className="p-6 bg-slate-50 text-center border-t border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lihat Semua Riwayat</span>
               </div>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

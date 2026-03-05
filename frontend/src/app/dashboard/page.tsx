"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, AlertCircle, TrendingUp,
  ArrowRight, Loader2, BarChart3, PieChart as PieIcon,
  History, Shield, Zap, Calendar, User, Users, Activity,
  AlertTriangle, ChevronRight, Paperclip, Smartphone, Download
} from 'lucide-react';
import api from '@/lib/api';
import { mobileAppsApi, MobileAppRelease } from '@/lib/mobileApps';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy-load Recharts (SSR disabled — ~200KB saved from initial bundle)
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeApps, setActiveApps] = useState<MobileAppRelease[]>([]);

  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'Super Admin');

  useEffect(() => {
    if (user) {
      fetchStats();
      if (!isSuperAdmin) fetchActiveApps();
    } else {
      setData(null);
    }
  }, [user, isSuperAdmin]); // Dependency to re-fetch if role loads or user changes

  const fetchActiveApps = async () => {
    try {
      const res = await mobileAppsApi.getAll(true);
      setActiveApps(res.data || []);
    } catch (err) {
      console.error('Failed to fetch mobile apps', err);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const endpoint = isSuperAdmin ? '/admin/dashboard-stats' : '/dashboard/stats';
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: any = {
    'management': 'Pengawasan & Strategis',
    'division': 'Ikhtisar Departemen',
    'staff': 'Area Kerja Pribadi'
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

  // ============== SUPER ADMIN DASHBOARD ==============
  if (isSuperAdmin && data) {
    const formatRp = (val: number, compact = false) => {
      const options: any = { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 };
      if (compact) {
        options.notation = 'compact';
        options.compactDisplay = 'short';
        options.maximumFractionDigits = 0;
      }
      return new Intl.NumberFormat('id-ID', options).format(val);
    };

    return (
      <Shell>
        <div className="max-w-7xl mx-auto pb-12 2xl:pb-20 px-4 sm:px-6">
          <header className="mb-6 xl:mb-8 2xl:mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-100 w-fit">
                <Shield size={12} /> System Administrator
              </span>
              <h1 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Ikhtisar <span className="text-amber-500">Sistem</span>
              </h1>
              <p className="text-slate-500 font-semibold text-sm">Metrik keseluruhan sistem HBM Budgeting.</p>
            </div>
            {data?.maintenance && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Maintenance Mode Active</span>
              </div>
            )}
          </header>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-8">
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pengguna</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-black text-slate-900 leading-none">{data?.users?.total}</p>
                  <span className="text-[10px] font-bold text-emerald-500 mb-0.5">{data?.users?.active_7d} aktif 7h</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-200">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pengajuan</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-black text-slate-900 leading-none">{data?.submissions?.total}</p>
                  <span className="text-[10px] font-bold text-amber-500 mb-0.5">{data?.submissions?.pending} pending</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anggaran Disetujui</p>
                <p className="text-xl font-black text-slate-900 leading-none truncate">
                  {formatRp(data?.budget?.total_approved || 0, true)}
                </p>
                <p className="text-[9px] font-mono font-medium text-slate-400 mt-1 opacity-80">
                  {formatRp(data?.budget?.total_approved || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Realisasi</p>
                <p className="text-xl font-black text-slate-900 leading-none truncate">
                  {formatRp(data?.budget?.total_realized || 0, true)}
                </p>
                <p className="text-[9px] font-mono font-medium text-slate-400 mt-1 opacity-80">
                  {formatRp(data?.budget?.total_realized || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Division Ranking */}
            <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity size={16} className="text-sky-500" /> Top Divisi (Anggaran)
              </h2>
              <div className="space-y-4 flex-1">
                {data.division_ranking?.map((div: any, i: number) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-6 h-6 rounded-md bg-slate-50 text-[10px] font-black text-slate-400 flex items-center justify-center shrink-0">#{i+1}</div>
                      <p className="text-xs font-bold text-slate-700 truncate">{div.name}</p>
                    </div>
                    <p className="text-xs font-black text-emerald-600 ml-2">{formatRp(div.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} className="text-indigo-500" /> Audit Log Terbaru
                </h2>
                <Link href="/admin/audit-logs" className="text-[10px] font-bold text-sky-500 hover:text-sky-600 uppercase tracking-widest">
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-3 flex-1">
                {data.recent_logs?.map((log: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Shield size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] uppercase">{log.action}</span>
                        {log.model} <span className="text-slate-400 font-medium">#{log.model_id}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                        <User size={10} /> {log.user} <span className="text-slate-300">•</span> {new Date(log.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
                {data.recent_logs?.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada log.</p>}
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ============== NORMAL DASHBOARD ==============
  const formatRp = (val: number, compact = false) => {
    const options: any = { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 };
    if (compact) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
      options.maximumFractionDigits = 0;
    }
    return new Intl.NumberFormat('id-ID', options).format(val);
  };

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12 2xl:pb-20 px-4 sm:px-6">
        {/* Modern Header */}
        <header className="mb-6 xl:mb-8 2xl:mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-4 xl:gap-6 2xl:gap-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-sky-100">
                <Shield size={12} />
                {roleLabels[data?.role_scope] || 'Akses Standar'}
              </span>
              {data?.user_division && (
                <span className="px-3 py-1 bg-white text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                  {data.user_division}
                </span>
              )}
            </div>
            <h1 className="text-3xl xl:text-3xl 2xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Halo, <span className="text-sky-500">{user?.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 font-semibold text-sm xl:text-sm 2xl:text-lg">Berikut adalah analitik anggaran hari ini.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">



          </div>
        </header>

        {/* Mobile App Download Banner */}
        {activeApps.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
                  <Smartphone size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight mb-1">Aplikasi Mobile Tersedia!</h2>
                  <p className="text-sky-100 text-sm font-medium mb-3">Unduh aplikasi HBM Budgeting untuk akses lebih cepat dan mudah langsung dari genggaman Anda.</p>
                  <div className="flex flex-wrap gap-3">
                    {activeApps.map(app => (
                      <a 
                        key={app.id} 
                        href={mobileAppsApi.getDownloadUrl(app.id)}
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm"
                      >
                        <Download size={16} />
                        Download {app.platform === 'android' ? 'Android' : 'iOS'} (v{app.version})
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -right-10 -bottom-20 opacity-20"><Smartphone size={200} /></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Need Your Attention Section */}
        <AnimatePresence>
          {data?.pending_tasks?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={18} />
                </div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Perlu Perhatian Anda</h2>
                <div className="h-0.5 bg-slate-100 flex-1 mx-2 rounded-full" />
                <Link href="/approvals" className="text-[10px] font-black text-sky-500 hover:text-sky-600 transition-colors uppercase tracking-widest flex items-center gap-1.5 mr-3">
                  Buka Antrean <ArrowRight size={14} />
                </Link>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-widest animate-pulse">
                  {data.pending_tasks?.length ?? 0} Pending
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.pending_tasks ?? []).map((task: any, idx: number) => (
                  <Link key={`${task.type}-${idx}`} href={`/submissions?view=${task.submission_id}`}>
                    <motion.div 
                      whileHover={{ scale: 1.01, x: 5 }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-white group p-4 rounded-[24px] border border-amber-100 shadow-sm hover:shadow-xl hover:shadow-amber-100/30 transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        task.type === 'approval' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-500'
                      }`}>
                        {task.type === 'approval' ? <Shield size={22} /> : <Paperclip size={22} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                            {task.no_pengajuan}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                            task.type === 'approval' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {task.type === 'approval' ? 'Approval' : 'Attachment'}
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-800 truncate pr-4">{task.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {new Date(task.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                      
                      {/* Decorative elements */}
                      <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-4 xl:gap-4 2xl:gap-6 mb-8 2xl:mb-12">
          {[
            { 
              label: data?.role_scope === 'management' ? 'Total Pengajuan (System)' : (data?.role_scope === 'division' ? 'Pengajuan Divisi' : 'Pengajuan Saya'), 
              val: data?.counters?.total, 
              icon: FileText, 
              col: 'sky', 
              grad: 'from-sky-500 to-sky-600', 
              delay: 0 
            },
            { label: 'Menunggu', val: data?.counters?.pending, icon: Clock, col: 'amber', grad: 'from-amber-400 to-amber-500', delay: 0.1 },
            { label: 'Disetujui', val: data?.counters?.approved, icon: CheckCircle, col: 'emerald', grad: 'from-emerald-500 to-emerald-600', delay: 0.2 },
            { 
              label: data?.role_scope === 'staff' ? 'Ditolak' : 'Outstanding', 
              val: data?.role_scope === 'staff' ? data?.counters?.rejected : data?.counters?.outstanding ?? 0, 
              icon: data?.role_scope === 'staff' ? AlertCircle : Zap, 
              col: data?.role_scope === 'staff' ? 'rose' : 'indigo', 
              grad: data?.role_scope === 'staff' ? 'from-rose-500 to-rose-600' : 'from-indigo-500 to-indigo-600', 
              delay: 0.3 
            },
            ...(data?.role_scope !== 'staff' && data ? [
              { 
                label: data?.role_scope === 'management' ? 'Total Anggaran' : 'Anggaran Divisi', 
                val: formatRp(data?.budget?.total_approved || 0, true), 
                title: formatRp(data?.budget?.total_approved || 0),
                icon: TrendingUp, 
                col: 'emerald', 
                grad: 'from-emerald-600 to-emerald-700', 
                delay: 0.4 
              }
            ] : (data ? [
              { label: 'Draf Saya', val: data?.counters?.drafts ?? 0, icon: FileText, col: 'slate', grad: 'from-slate-400 to-slate-500', delay: 0.4 }
            ] : [])),
          ].map((s: any) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: s.delay }}
              className="bg-white p-4 2xl:p-6 rounded-[20px] 2xl:rounded-[36px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden cursor-pointer"
              onClick={() => s.link && router.push(s.link)}
              title={s.title}
            >
              <div className="flex items-center gap-3 2xl:gap-5 relative z-10">
                <div className={`w-11 h-11 2xl:w-14 2xl:h-14 rounded-xl 2xl:rounded-2xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shrink-0`}>
                  <s.icon className="w-5 h-5 2xl:w-7 2xl:h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 2xl:mb-2">{s.label}</p>
                  <p className={`text-2xl font-black text-slate-900 leading-none ${s.label === 'Disetujui' && 'text-emerald-600'}`}>{s.val}</p>
                  {s.title && (
                    <p className="text-[9px] font-mono font-medium text-slate-400 mt-1.5 opacity-80 leading-tight">
                      {s.title}
                    </p>
                  )}
                  {data?.budget?.absorption_rate !== undefined && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data?.budget?.absorption_rate}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                      <span className="text-[10px] font-black text-emerald-600">{data?.budget?.absorption_rate}% Serap</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.col}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
            </motion.div>
          ))}
        </div>

        {data?.role_scope !== 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 2xl:gap-8 mb-6 2xl:mb-10">

            {/* Trend Chart (Budget vs Realization) */}
            <div className="lg:col-span-2 bg-white rounded-[24px] 2xl:rounded-[40px] border border-slate-100 shadow-sm p-5 2xl:p-8 flex flex-col">
              <div className="flex justify-between items-start mb-4 2xl:mb-8">
                <div>
                  <h2 className="text-base 2xl:text-xl font-black text-slate-900 leading-tight">
                    {data?.role_scope === 'management' ? 'Tren Anggaran & Realisasi (Perusahaan)' : 'Tren Anggaran & Realisasi (Divisi)'}
                  </h2>
                  <p className="text-slate-400 text-xs 2xl:text-sm font-medium">Histori pengajuan vs aktual (6 bulan terakhir)</p>
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

              <div className="h-[200px] xl:h-[200px] 2xl:h-[300px] w-full min-w-0">
                {data?.trends && (
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={data?.trends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                        width={60}
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                        tickFormatter={(val) => formatRp(val, true)}
                      />
                      <Tooltip
                        formatter={(value: any) => formatRp(Number(value))}
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
            <div className="bg-white rounded-[24px] 2xl:rounded-[40px] border border-slate-100 shadow-sm p-5 2xl:p-8 flex flex-col items-center">
              <div className="w-full text-left mb-4 2xl:mb-6">
                <h2 className="text-base 2xl:text-xl font-black text-slate-900 leading-tight">Analisis Kategori</h2>
                <p className="text-slate-400 text-xs 2xl:text-sm font-medium">
                  {data?.role_scope === 'management' ? 'Distribusi global tipe pengajuan.' : 'Distribusi tipe pengajuan divisi.'}
                </p>
              </div>

              <div className="h-[180px] 2xl:h-[240px] w-full min-w-0">
                {data?.categories && (
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={(data.categories ?? []).map((entry: any, index: number) => ({
                          ...entry,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="name"
                        stroke="none"
                      >
                        {(data.categories ?? []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [value, name]}
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                        itemStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-4">
                {(data?.categories ?? []).slice(0, 4).map((cat: any, i: number) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section: Ranking & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 2xl:gap-8">

          {/* Ranking Divisi / Urgency Insights */}
          <div className="lg:col-span-2 space-y-5 2xl:space-y-8">
            {data?.role_scope === 'management' && (
              <div className="bg-white rounded-[24px] 2xl:rounded-[40px] border border-slate-100 shadow-sm p-5 2xl:p-8">
                <div className="flex justify-between items-center mb-4 2xl:mb-8">
                  <div>
                    <h2 className="text-base 2xl:text-xl font-black text-slate-900 leading-tight">Ranking Pengeluaran Divisi</h2>
                    <p className="text-slate-400 text-xs 2xl:text-sm font-medium">Total budget disetujui per divisi.</p>
                  </div>
                  <Link href="/reporting">
                    <button className="text-sky-500 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                      Laporan Lengkap <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>

                <div className="h-[180px] 2xl:h-[250px] w-full">
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
                        formatter={(val: any) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`}
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

            {data?.role_scope === 'management' && data?.high_value_pending?.length > 0 && (
              <div className="bg-white rounded-[24px] 2xl:rounded-[40px] border border-slate-100 shadow-sm p-6 2xl:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base 2xl:text-xl font-black text-slate-900 leading-tight">Fokus Strategis (Nilai Tinggi)</h2>
                    <p className="text-slate-400 text-xs 2xl:text-sm font-medium">Pengajuan dengan nominal terbesar yang menunggu approval.</p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    Top 5 Prioritas
                  </div>
                </div>

                <div className="space-y-4">
                  {(data?.high_value_pending ?? []).map((item: any, idx: number) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/submissions?view=${item.id}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-100 w-fit mb-1">{item.no}</p>
                        <p className="text-sm font-black text-slate-800 truncate mb-0.5">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Users size={10} /> {item.division} <span className="text-slate-300">•</span> <Clock size={10} /> {new Date(item.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.nominal)}
                        </p>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Butuh Review</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 2xl:gap-8">
              {/* Urgency Summary */}
              <div className="bg-slate-900 rounded-[24px] 2xl:rounded-[40px] p-5 2xl:p-8 text-white relative overflow-hidden">
                <h2 className="text-base 2xl:text-xl font-black mb-4 2xl:mb-6 relative z-10 text-white">Indikator Urgensi</h2>
                <div className="space-y-4 relative z-10">
                  {[
                    { label: 'Darurat', val: data?.urgency?.urgent || data?.urgency?.['urgent'] || 0, col: 'bg-rose-500' },
                    { label: 'Biasa', val: data?.urgency?.normal || data?.urgency?.['normal'] || 0, col: 'bg-sky-500' }
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
              {user?.roles?.some((r: any) => ['Super Admin', 'Director', 'GM', 'Finance'].includes(r.name)) && (
              <div className="bg-sky-600 rounded-[24px] 2xl:rounded-[40px] p-5 2xl:p-8 text-white flex flex-col justify-between">
                <div>
                  <Calendar size={40} className="mb-4 text-white/40" />
                  <h3 className="text-xl 2xl:text-2xl font-black leading-tight mb-2 text-white">Tertib Administrasi<br />Adalah Kunci</h3>
                  <p className="text-sky-50 text-sm font-medium">Jangan lupa lampirkan seluruh bukti kuitansi di menu Monitoring Realisasi untuk setiap pengajuan yang sudah diselesaikan.</p>
                </div>
                <Link href="/realizations" className="mt-6">
                  <button className="w-full py-4 bg-white text-sky-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                    Update Realisasi Sekarang
                  </button>
                </Link>
              </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[24px] 2xl:rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-5 2xl:p-8 pb-3 2xl:pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <h2 className="font-black text-slate-900 text-base 2xl:text-xl tracking-tight leading-none uppercase">Aktivitas Langsung</h2>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Update Real-time</p>
            </div>

            <div className="flex-1 p-5 2xl:p-8 pt-3 2xl:pt-4 overflow-y-auto space-y-5 2xl:space-y-8 scrollbar-hide">
              {data?.activities?.length > 0 ? (
                (data?.activities ?? []).map((act: any, idx: number) => (
                  <div key={idx} className="flex gap-4 group relative">
                    {idx !== (data?.activities?.length ?? 0) - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-8 bg-slate-50" />
                    )}
                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${act.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                      }`}>
                      {act.status === 'approved' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-snug">
                        <span className="font-black">{act.actor_name}</span> telah
                        <span className={`mx-1 font-bold ${act.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>{act.status === 'approved' ? 'menyetujui' : 'menolak'}</span>
                        pengajuan <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{act.no_pengajuan}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <Clock size={10} /> {new Date(act.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 pb-8 py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <History size={40} className="text-slate-100" />
                  </div>
                    <p className="text-lg font-black text-slate-300">Belum ada aktivitas baru...</p>
                  </div>
                )}
              </div>

            <Link href="/submissions">
              <div className="p-4 2xl:p-6 bg-slate-50 text-center border-t border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lihat Semua Riwayat</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

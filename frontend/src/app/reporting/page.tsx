"use client";

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import {
  BarChart3,
  Search,
  Filter,
  ChevronDown,
  X,
  FileText,
  Printer,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import SubmissionDetailView from '@/components/submissions/SubmissionDetailView';
import { Eye } from 'lucide-react';

export default function ReportingPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [lookups, setLookups] = useState<any>({ 
    divisions: [], 
    jenis_pengajuan: [],
    jenis_perjalanan: [],
    uoms: [] 
  });

  // Detail View States
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const printIframeRef = React.useRef<HTMLIFrameElement>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    division_id: '',
    jenis_pengajuan_id: '',
    date_from: '',
    date_to: '',
    month: '',
    year: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        ...filters
      };
      const [dataRes, lookupsRes] = await Promise.all([
        api.get('/reports/submissions', { params }),
        api.get('/lookups')
      ]);
      setSubmissions(dataRes.data);
      setLookups(lookupsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]); // Refetch on filter change. Search has debounced-like manual trigger? No, let's just use effect for all.

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        search,
        ...filters
      }).toString();

      const response = await api.get(`/reports/submissions/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report-Submissions-${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);
      const params = new URLSearchParams({
        search,
        ...filters
      }).toString();

      const response = await api.get(`/reports/submissions/print-url?${params}`);
      const { url } = response.data;
      
      if (printIframeRef.current) {
        printIframeRef.current.onload = function() {
          setTimeout(() => {
            if (printIframeRef.current?.contentWindow) {
              printIframeRef.current.contentWindow.focus();
              printIframeRef.current.contentWindow.print();
            }
          }, 500);
        };
        printIframeRef.current.src = url;
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat halaman cetak');
    } finally {
      setTimeout(() => setPrinting(false), 2000);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setFilters({
      status: 'all',
      division_id: '',
      jenis_pengajuan_id: '',
      date_from: '',
      date_to: '',
      month: '',
      year: '',
    });
  };

  const handleView = async (id: number) => {
    setSelectedSubmission(null);
    setIsDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/submissions/${id}`);
      setSelectedSubmission(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat detail pengajuan');
      setIsDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Hitung agregat keseluruhan
  let grandTotalPengajuan = 0;
  let grandTotalRealisasi = 0;
  
  // Kelompokkan pengajuan berdasarkan Divisi
  const groupedSubmissions: Record<string, any[]> = {};
  submissions.forEach(sub => {
      const divName = sub.division?.name || 'Unknown Division';
      if(!groupedSubmissions[divName]) groupedSubmissions[divName] = [];
      groupedSubmissions[divName].push(sub);

      // Hanya hitung ke budget jika sudah disetujui (Approved) ATAU jika filter status spesifik sedang aktif
      if (filters.status !== 'all' || sub.final_status === 'approved') {
          grandTotalPengajuan += parseFloat(sub.total) || 0;
      }
      
      let realizationTotal = 0;
      if (sub.realizations && Array.isArray(sub.realizations)) {
          realizationTotal = sub.realizations
              .reduce((sum: number, r: any) => {
                  const detailSum = r.details && Array.isArray(r.details) 
                      ? r.details.reduce((dSum: number, d: any) => dSum + parseFloat(d.total), 0)
                      : 0;
                  return sum + detailSum;
              }, 0);
      }
      grandTotalRealisasi += realizationTotal;
  });

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 font-bold">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <BarChart3 className="text-sky-500" />
              Laporan Realisasi & Budget
            </h1>
            <p className="text-slate-500 text-sm mt-1">Saring dan ekspor perbandingan budget vs aktual</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <button
                onClick={handlePrint}
                disabled={printing || submissions.length === 0}
                className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {printing ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
                Cetak Laporan
             </button>
             <button
               onClick={handleExport}
               disabled={exporting || submissions.length === 0}
               className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
             >
               {exporting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
               Ekspor ke PDF
             </button>
          </div>
        </header>

        {/* Filter Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari No. Pengajuan atau Deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-700 bg-slate-50/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border font-bold text-sm transition-all ${showFilters ? 'bg-slate-800 border-slate-100 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={18} />
              {showFilters ? 'Tutup Filter' : 'Filter Lanjutan'}
              <ChevronDown className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} size={16} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Menunggu</option>
                      <option value="approved">Disetujui</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Divisi</label>
                    <select
                      value={filters.division_id}
                      onChange={(e) => setFilters({ ...filters, division_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="">Semua Divisi</option>
                      {lookups.divisions?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis</label>
                    <select
                      value={filters.jenis_pengajuan_id}
                      onChange={(e) => setFilters({ ...filters, jenis_pengajuan_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="">Semua Jenis</option>
                      {lookups.jenis_pengajuan?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dari Tanggal</label>
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bulan</label>
                    <select
                      value={filters.month}
                      onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="">Semua Bulan</option>
                      <option value="1">Januari</option>
                      <option value="2">Februari</option>
                      <option value="3">Maret</option>
                      <option value="4">April</option>
                      <option value="5">Mei</option>
                      <option value="6">Juni</option>
                      <option value="7">Juli</option>
                      <option value="8">Agustus</option>
                      <option value="9">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tahun</label>
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="">Semua Tahun</option>
                      {Array.from({ length: new Date().getFullYear() - 2024 + 2 }, (_, i) => 2024 + i).map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest"
                  >
                    <X size={14} />
                    Reset Semua Filter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tiket</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{submissions.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 h-full">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pengajuan vs Actual (Approved)</p>
                  <div className="flex items-baseline gap-3">
                      <h3 className="text-3xl font-black text-sky-600 tracking-tight">Rp {grandTotalPengajuan.toLocaleString('id-ID')}</h3>
                      <span className="text-lg font-black text-slate-400">/</span>
                      <h3 className="text-2xl font-black text-emerald-600 tracking-tight">Rp {grandTotalRealisasi.toLocaleString('id-ID')}</h3>
                  </div>
               </div>
               <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selisih Keseluruhan</p>
                   <p className={`text-xl font-black tracking-tight ${grandTotalPengajuan - grandTotalRealisasi < 0 ? 'text-rose-600' : 'text-amber-500'}`}>
                       Rp {(grandTotalPengajuan - grandTotalRealisasi).toLocaleString('id-ID')}
                   </p>
               </div>
            </div>
          </div>
        </div>

        {/* Results Tables - Grouped by Division */}
        <div className="space-y-8">
            {loading ? (
                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-20 text-center">
                    <Loader2 className="animate-spin text-sky-500 mx-auto mb-3" size={32} />
                    <p className="text-slate-400 font-bold">Memuat laporan dan agregat realisasi...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-20 text-center">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Tidak ada data untuk laporan ini</p>
                </div>
            ) : (
                Object.keys(groupedSubmissions).sort().map((divName) => {
                    const divSubs = groupedSubmissions[divName];
                    let divTotalPengajuan = 0;
                    let divTotalRealisasi = 0;
                    
                    divSubs.forEach(sub => {
                        if (filters.status !== 'all' || sub.final_status === 'approved') {
                            divTotalPengajuan += parseFloat(sub.total) || 0;
                        }
                        let realizationTotal = 0;
                        if (sub.realizations && Array.isArray(sub.realizations)) {
                            realizationTotal = sub.realizations
                                .reduce((sum: number, r: any) => {
                                    const detailSum = r.details && Array.isArray(r.details) 
                                        ? r.details.reduce((dSum: number, d: any) => dSum + parseFloat(d.total), 0)
                                        : 0;
                                    return sum + detailSum;
                                }, 0);
                        }
                        divTotalRealisasi += realizationTotal;
                    });

                    return (
                    <div key={divName} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        {/* Division Header */}
                        <div className="bg-slate-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-0.5">Divisi</h3>
                                <p className="font-bold text-lg">{divName}</p>
                            </div>
                            <div className="flex gap-6 text-right">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Subtotal Budget (Approved)</p>
                                    <p className="font-mono font-bold text-sky-400 tracking-tight">Rp {divTotalPengajuan.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Subtotal Realisasi</p>
                                    <p className="font-mono font-bold text-emerald-400 tracking-tight">Rp {divTotalRealisasi.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">No. Pengajuan</th>
                                <th className="px-6 py-4">Status & Tanggal</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4 text-right border-l border-slate-100">Budget Awal</th>
                                <th className="px-6 py-4 text-right bg-emerald-50/50">Realisasi (Actual)</th>
                                <th className="px-6 py-4 text-right bg-slate-50 border-l border-slate-100">Sisa / Selisih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {divSubs.map((sub) => {
                                    let realizationTotal = 0;
                                    if (sub.realizations && Array.isArray(sub.realizations)) {
                                        realizationTotal = sub.realizations
                                            .reduce((sum: number, r: any) => {
                                                const detailSum = r.details && Array.isArray(r.details) 
                                                    ? r.details.reduce((dSum: number, d: any) => dSum + parseFloat(d.total), 0)
                                                    : 0;
                                                return sum + detailSum;
                                            }, 0);
                                    }
                                    const nilaiPengajuan = parseFloat(sub.total) || 0;
                                    const selisih = nilaiPengajuan - realizationTotal;

                                    return (
                                    <tr key={sub.id} className="hover:bg-sky-50/30 transition-all group cursor-pointer" onClick={() => handleView(sub.id)}>
                                        <td className="px-6 py-4 text-sm font-black text-slate-700">{sub.no_pengajuan}</td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${sub.final_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                sub.final_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {sub.final_status}
                                                </span>
                                                <p className="text-xs font-bold text-slate-500">{new Date(sub.tanggal_pengajuan).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-[200px] truncate">{sub.description}</td>
                                        
                                        {/* FINANCIALS */}
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700 text-right border-l border-slate-100 group-hover:bg-slate-50/50 transition-colors">
                                            Rp {nilaiPengajuan.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-emerald-600 text-right bg-emerald-50/20 group-hover:bg-emerald-50/50 transition-colors">
                                            Rp {realizationTotal.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-mono font-black text-right border-l border-slate-100 transition-colors ${selisih < 0 ? 'text-rose-500 bg-rose-50/30' : (selisih === 0 ? 'text-slate-400' : 'text-amber-500 bg-amber-50/20')}`}>
                                            Rp {selisih.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                            <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Subtotal Divisi
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-sky-600 border-l border-slate-200">
                                        Rp {divTotalPengajuan.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-emerald-600 bg-emerald-50">
                                        Rp {divTotalRealisasi.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-amber-600 border-l border-slate-200">
                                        Rp {(divTotalPengajuan - divTotalRealisasi).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tfoot>
                            </table>
                        </div>

                        {/* Mobile View inside Loop */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {divSubs?.map((sub: any) => {
                                let realizationTotal = 0;
                                if (sub.realizations && Array.isArray(sub.realizations)) {
                                    realizationTotal = sub.realizations
                                        .reduce((sum: number, r: any) => {
                                            const detailSum = r.details && Array.isArray(r.details) 
                                                ? r.details.reduce((dSum: number, d: any) => dSum + parseFloat(d.total), 0)
                                                : 0;
                                            return sum + detailSum;
                                        }, 0);
                                }
                                const nilaiPengajuan = parseFloat(sub.total) || 0;
                                const selisih = nilaiPengajuan - realizationTotal;

                                return (
                                <div key={sub.id} className="p-5 space-y-4 active:bg-slate-50 transition-colors" onClick={() => handleView(sub.id)}>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-tight leading-none">{sub.no_pengajuan}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(sub.tanggal_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${sub.final_status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                        sub.final_status === 'rejected' ? 'bg-red-50 text-red-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {sub.final_status}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-600 line-clamp-2 leading-snug">{sub.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PENGAJUAN</p>
                                            <p className="text-sm font-black text-slate-700 leading-none">Rp {nilaiPengajuan.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">REALISASI</p>
                                            <p className="text-sm font-black text-emerald-600 leading-none">Rp {realizationTotal.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )})
            )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detail Laporan"
        size="2xl"
      >
        <div className="p-0">
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4 text-sky-500" size={40} />
              <p className="font-bold">Memuat detail...</p>
            </div>
          ) : selectedSubmission ? (
            <SubmissionDetailView
              submission={selectedSubmission}
              showPrintButton={true}
            />
          ) : (
            <p className="text-center text-slate-400 py-10">Data tidak ditemukan</p>
          )}
        </div>
      </Modal>

      {/* Hidden iframe file printer */}
      <iframe ref={printIframeRef} style={{ display: 'none' }} title="Print Reporting" />
    </Shell>
  );
}

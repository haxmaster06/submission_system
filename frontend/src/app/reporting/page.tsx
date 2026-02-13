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
  const [lookups, setLookups] = useState<any>({ divisions: [], jenis_pengajuan: [] });

  // Detail View States
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    division_id: '',
    jenis_pengajuan_id: '',
    date_from: '',
    date_to: '',
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

  const resetFilters = () => {
    setSearch('');
    setFilters({
      status: 'all',
      division_id: '',
      jenis_pengajuan_id: '',
      date_from: '',
      date_to: '',
    });
  };

  const handleView = async (id: number) => {
    setSelectedSubmission(null);
    setIsDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/submissions/${id}`);
      setSelectedSubmission(res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat detail pengajuan');
      setIsDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalNominal = submissions.reduce((sum, sub) => sum + parseFloat(sub.total), 0);

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 font-bold">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <BarChart3 className="text-sky-500" />
              Laporan Pengajuan
            </h1>
            <p className="text-slate-500 text-sm mt-1">Saring dan ekspor data pengajuan budget</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || submissions.length === 0}
            className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
            Ekspor ke PDF
          </button>
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
                <div className="pt-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-t border-slate-100">
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
                      {lookups.divisions.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                      {lookups.jenis_pengajuan.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pengajuan</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{submissions.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Nominal</p>
            <h3 className="text-3xl font-black text-sky-600 tracking-tight">Rp {totalNominal.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">No. Pengajuan</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Divisi</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin text-sky-500 mx-auto mb-3" size={32} />
                      <p className="text-slate-400 font-bold">Memuat laporan...</p>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">Tidak ada data untuk laporan ini</p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4 text-sm font-black text-slate-700">{sub.no_pengajuan}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{new Date(sub.tanggal_pengajuan).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{sub.division.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate">{sub.description}</td>
                      <td className="px-6 py-4 text-sm font-black text-sky-600 text-right">Rp {parseFloat(sub.total).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.final_status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          sub.final_status === 'rejected' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                          {sub.final_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleView(sub.id)}
                          className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
                          title="Lihat Detail & Cetak"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-10 text-center">
                <Loader2 className="animate-spin text-sky-500 mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-10 text-center">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kosong</p>
              </div>
            ) : (
              submissions.map((sub) => (
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Divisi: <span className="text-slate-900">{sub.division.name}</span></p>
                    <p className="text-[11px] font-bold text-slate-600 line-clamp-1">{sub.description}</p>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">TOTAL</p>
                    <p className="text-lg font-black text-sky-600 leading-none">Rp {parseFloat(sub.total).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detail Pengajuan"
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
    </Shell>
  );
}

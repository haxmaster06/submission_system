"use client";

import { useState, useEffect, Suspense } from 'react';
import Shell from '@/components/layout/Shell';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Eye,
  AlertCircle,
  TrendingUp,
  Save,
  Check,
  Info,
  Calendar,
  Banknote,
  Search,
  Filter,
  ChevronDown,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Pagination, { PaginationMeta } from '@/components/ui/Pagination';

const SubmissionDetailView = dynamic(() => import('@/components/submissions/SubmissionDetailView'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
});

function SubmissionsPageContent() {

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const { user } = useAuth();

  const hasRole = (roleName: string) => user?.roles.some(r => r.name === roleName);
  const canSeeAll = hasRole('Super Admin') || hasRole('Director') || hasRole('Finance') || hasRole('GM');

  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    division_id: '',
    jenis_pengajuan_id: '',
    status_urgent: '',
    date_from: '',
    date_to: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false); // New state for view modal
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null); // New state for selected submission
  const [submitting, setSubmitting] = useState(false);
  const [lookups, setLookups] = useState<any>({
    divisions: [],
    jenis_pengajuan: [],
    jenis_perjalanan: [],
    uoms: []
  });
  const [counts, setCounts] = useState<any>({
    all: 0,
    draf: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [form, setForm] = useState({
    division_id: '',
    jenis_pengajuan_id: '',
    jenis_perjalanan_id: '',
    status_urgent: 'normal',
    description: '',
    notes: '',
    tanggal_pengajuan: new Date().toISOString().split('T')[0],
    items: [{ description: '', qty: 0, uom_id: '', nominal: 0 }]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const viewId = searchParams.get('view');

  useEffect(() => {
    if (viewId && !isModalOpen && !viewModalOpen) {
      // Find submission in current list or fetch it
      const sub = submissions.find(s => s.id === parseInt(viewId));
      if (sub) {
        setSelectedSubmission(sub);
        setViewModalOpen(true);
      } else {
        // If not in list, fetch it (optional, but good for direct links)
        api.get(`/submissions/${viewId}`).then(res => {
          setSelectedSubmission(res.data.data || res.data);
          setViewModalOpen(true);
        }).catch(console.error);
      }
    }
  }, [viewId, submissions]);

  useEffect(() => {
    // Initial lookup fetch once on mount
    api.get('/lookups')
      .then(res => setLookups(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, activeTab, filters, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        search: debouncedSearch,
        status: activeTab,
        page,
        per_page: 25,
        ...filters
      };

      const submissionsRes = await api.get('/submissions', { params });
      const paginatedData = submissionsRes.data.submissions;
      setSubmissions(paginatedData.data);
      setPaginationMeta({
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        from: paginatedData.from,
        to: paginatedData.to,
        total: paginatedData.total,
        per_page: paginatedData.per_page,
      });
      setCounts(submissionsRes.data.counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  const openModal = () => {
    setForm({
      division_id: user?.division_id?.toString() || '',
      jenis_pengajuan_id: '',
      jenis_perjalanan_id: '',
      status_urgent: 'normal',
      description: '',
      notes: '',
      tanggal_pengajuan: new Date().toISOString().split('T')[0],
      items: [{ description: '', qty: 0, uom_id: '', nominal: 0 }]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/submissions', { ...form, is_draft: isDraft });
      await fetchData();
      closeModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Hapus ${selectedIds.length} pengajuan yang dipilih?`)) return;

    setLoading(true);
    try {
      await api.post('/submissions/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map(s => s.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'draf': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'on_hold': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'draf': return <Save className="w-4 h-4" />;
      case 'on_hold': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const total = form.items.reduce((acc, item) => acc + (item.qty * item.nominal), 0);
  const statusCounts = counts;

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: '', qty: 0, uom_id: '', nominal: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  if (isInitialLoading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  const tabs = [
    {
      id: 'all',
      label: 'Semua',
      icon: <FileText size={18} />,
      badge: statusCounts.all,
      content: (
        <SubmissionsList
          submissions={submissions}
          loading={loading}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={(sub: any) => {
            setSelectedSubmission(sub);
            setViewModalOpen(true);
          }}
        />
      )
    },
    {
      id: 'draf',
      label: 'Draf',
      icon: <Save size={18} />,
      badge: statusCounts.draf,
      content: (
        <SubmissionsList
          submissions={submissions}
          loading={loading}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={(sub: any) => {
            setSelectedSubmission(sub);
            setViewModalOpen(true);
          }}
        />
      )
    },
    {
      id: 'pending',
      label: 'Menunggu',
      icon: <Clock size={18} />,
      badge: statusCounts.pending,
      content: (
        <SubmissionsList
          submissions={submissions}
          loading={loading}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={(sub: any) => {
            setSelectedSubmission(sub);
            setViewModalOpen(true);
          }}
        />
      )
    },
    {
      id: 'approved',
      label: 'Disetujui',
      icon: <CheckCircle size={18} />,
      badge: statusCounts.approved,
      content: (
        <SubmissionsList
          submissions={submissions}
          loading={loading}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={(sub: any) => {
            setSelectedSubmission(sub);
            setViewModalOpen(true);
          }}
        />
      )
    },
    {
      id: 'rejected',
      label: 'Ditolak',
      icon: <XCircle size={18} />,
      badge: statusCounts.rejected,
      content: (
        <SubmissionsList
          submissions={submissions}
          loading={loading}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={(sub: any) => {
            setSelectedSubmission(sub);
            setViewModalOpen(true);
          }}
        />
      )
    }
  ];

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pengajuan Saya</h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">Kelola dan lacak riwayat pengajuan anggaran Anda</p>
          </div>
          <button
            onClick={openModal}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Buat Pengajuan Baru
          </button>
        </header>

        {/* Filter Toolbar - MOVED TO TOP */}
        <div className="bg-white border rounded-2xl border-slate-200 p-4 mb-6 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari No. Pengajuan atau Deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all font-medium text-slate-900"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${showFilters || Object.values(filters).some(v => v !== '')
                ? 'bg-sky-50 border-sky-200 text-sky-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <Filter size={18} />
              Filter
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-t border-slate-100">
                  {canSeeAll && (
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
                  )}
                  <div className={canSeeAll ? "" : "md:col-span-2"}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Pengajuan</label>
                    <select
                      value={filters.jenis_pengajuan_id}
                      onChange={(e) => setFilters({ ...filters, jenis_pengajuan_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="">Semua Jenis</option>
                      {lookups.jenis_pengajuan?.map((j: any) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgensi</label>
                    <select
                      value={filters.status_urgent}
                      onChange={(e) => setFilters({ ...filters, status_urgent: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      <option value="">Semua</option>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dari Tanggal</label>
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                    setFilters({ division_id: '', jenis_pengajuan_id: '', status_urgent: '', date_from: '', date_to: '' });
                      setSearch('');
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center gap-2"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-100"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white">
                  {selectedIds.length}
                </div>
                <div>
                  <h3 className="font-black text-red-900 leading-none mb-1 text-lg">Hapus Sekaligus</h3>
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{selectedIds.length} pengajuan telah dipilih</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setSelectedIds([])}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-white transition-all uppercase tracking-widest"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 md:flex-none px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                  Hapus Selamanya
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs tabs={tabs} defaultTab="all" onChange={(tab: string) => { setActiveTab(tab); setPage(1); }} />

        {/* Pagination */}
        {paginationMeta && (
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Pagination pagination={paginationMeta} onPageChange={setPage} />
          </div>
        )}

        {/* Filter Toolbar removed from here */}

        {/* Create Submission Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Buat Pengajuan Baru"
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* General Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Info size={16} className="text-sky-500" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Informasi Umum</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-10 border-l-2 border-slate-100 ml-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-sky-500" />
                    Tanggal Pengajuan
                  </label>
                  <input
                    type="date"
                    value={form.tanggal_pengajuan}
                    onChange={(e) => setForm({ ...form, tanggal_pengajuan: e.target.value })}
                    className={`w-full px-5 py-4 rounded-2xl border ${!hasRole('Super Admin') ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed font-bold opacity-75' : 'bg-white border-slate-200 text-slate-900 font-bold focus:ring-4 focus:ring-sky-50 shadow-sm'} outline-none transition-all`}
                    required
                    disabled={!hasRole('Super Admin')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Divisi</label>
                  <select
                    value={form.division_id}
                    onChange={(e) => setForm({ ...form, division_id: e.target.value })}
                    className={`w-full px-5 py-4 rounded-2xl border ${form.division_id ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'} text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold shadow-sm disabled:opacity-75 disabled:cursor-not-allowed`}
                    required
                    disabled={!!user?.division_id}
                  >
                    <option value="" className="text-slate-400">Pilih Divisi</option>
                    {lookups.divisions?.map((d: any) => <option key={d.id} value={d.id} className="text-slate-900">{d.name} ({d.code})</option>)}
                  </select>
                  {user?.division_id && (
                    <p className="mt-2 text-xs text-sky-600 font-bold flex items-center gap-1.5 px-1">
                      <CheckCircle size={10} /> Otomatis terpilih sesuai profil Anda
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Status Urgensi</label>
                  <div className="flex gap-4">
                    {['normal', 'urgent'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setForm({ ...form, status_urgent: status })}
                        className={`flex-1 py-4 rounded-2xl border text-sm font-black uppercase tracking-wider transition-all shadow-sm ${form.status_urgent === status
                          ? 'bg-sky-600 border-sky-600 text-white ring-4 ring-sky-50'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-900'
                          }`}
                      >
                        {status === 'urgent' ? <AlertCircle className="inline w-4 h-4 mr-1.5" /> : null}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Type */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <FileText size={16} className="text-sky-500" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Jenis Pengajuan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-10 border-l-2 border-slate-100 ml-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Kategori Pengajuan</label>
                  <select
                    value={form.jenis_pengajuan_id}
                    onChange={(e) => setForm({ ...form, jenis_pengajuan_id: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold shadow-sm"
                    required
                  >
                    <option value="" className="text-slate-400 font-bold">Pilih Kategori</option>
                    {lookups.jenis_pengajuan?.map((j: any) => <option key={j.id} value={j.id} className="text-slate-900 font-bold">{j.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Jenis Perjalanan (Opsional)</label>
                  <select
                    value={form.jenis_perjalanan_id}
                    onChange={(e) => setForm({ ...form, jenis_perjalanan_id: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold shadow-sm"
                  >
                    <option value="" className="text-slate-400 font-bold">Tidak Ada</option>
                    {lookups.jenis_perjalanan?.map((j: any) => <option key={j.id} value={j.id} className="text-slate-900 font-bold">{j.name}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-900 mb-3">Judul Pengajuan</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Contoh: Pengajuan Biaya Operasional Kantor Cabang..."
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold shadow-sm resize-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-900 mb-3 cursor-help">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Berikan konteks tambahan jika diperlukan..."
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 placeholder:font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold shadow-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Banknote size={16} className="text-sky-500" />
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Rincian Anggaran</h3>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-sky-100 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Tambah Item
                </button>
              </div>

              <div className="space-y-8 pl-4 border-l-2 border-slate-100 ml-4">
                {form.items.map((item, index) => (
                  <div key={index} className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition-all group">
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-12">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Deskripsi Item {form.items.length > 1 ? `#${index + 1}` : ''}</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Masukkan rincian barang/jasa..."
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Jumlah</label>
                        <input
                          type="number"
                          value={item.qty || ''}
                          onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                          placeholder="0"
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-black"
                          required
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Satuan</label>
                        <select
                          value={item.uom_id}
                          onChange={(e) => updateItem(index, 'uom_id', e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-bold"
                          required
                        >
                          <option value="">Pilih</option>
                          {lookups.uoms?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Harga Satuan</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</div>
                          <input
                            type="number"
                            value={item.nominal || ''}
                            onChange={(e) => updateItem(index, 'nominal', parseFloat(e.target.value) || 0)}
                            min="0"
                            placeholder="0"
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 transition-all font-black text-lg"
                            required
                          />
                        </div>
                      </div>

                      <div className="md:col-span-3 flex flex-col justify-end">
                        <label className="block text-xs font-black text-sky-400 uppercase tracking-widest mb-2 px-1 text-right">Subtotal</label>
                        <div className="bg-sky-50 border border-sky-100 px-5 py-4 rounded-2xl text-right">
                          <span className="font-black text-sky-600">Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(item.qty * item.nominal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="sm:col-span-3 pt-4">
                  <div className="bg-slate-900 rounded-[40px] p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-200">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
                        <Save size={32} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Grand Total Estimasi</p>
                        <p className="text-white text-base font-bold mt-1 opacity-60">Total kumulatif dari {form.items.length} item pengajuan</p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-sky-400 font-black text-5xl block font-mono tracking-tighter">
                        Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 p-8 bg-slate-50 -mx-8 -mb-8 mt-10">
              <button
                type="button"
                onClick={closeModal}
                className="px-10 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black tracking-tight hover:bg-white hover:border-slate-300 transition-all shadow-sm"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(new Event('submit') as any, true)}
                disabled={submitting}
                className="px-8 py-4 rounded-2xl border border-sky-100 text-sky-600 font-black tracking-tight hover:bg-white hover:border-sky-200 transition-all shadow-sm flex items-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-6 h-6" />}
                Simpan Draf
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-12 py-4 rounded-2xl bg-sky-600 text-white font-black tracking-tight hover:bg-sky-500 shadow-xl shadow-sky-100 flex items-center gap-3 disabled:opacity-70 transition-all ring-offset-2 active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                Buat Pengajuan
              </button>
            </div>
          </form>
        </Modal>
      </div>
      {/* View Submission Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedSubmission(null);
          if (typeof window !== 'undefined') {
            router.replace(window.location.pathname, { scroll: false });
          }
        }}
        title="Detail Pengajuan"
        size="2xl"
      >
        {selectedSubmission && (
          <SubmissionDetailView
            submission={selectedSubmission}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedSubmission(null);
              if (typeof window !== 'undefined') {
                router.replace(window.location.pathname, { scroll: false });
              }
            }}
            onDelete={() => {
              setViewModalOpen(false);
              setSelectedSubmission(null);
              if (typeof window !== 'undefined') {
                router.replace(window.location.pathname, { scroll: false });
              }
              fetchData();
            }}
          />
        )}
      </Modal>
    </Shell>
  );
}

function SubmissionsList({
  submissions,
  loading,
  getStatusColor,
  getStatusIcon,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onView // New prop
}: any) {
  const isAllSelected = submissions.length > 0 && selectedIds.length === submissions.length;

  return (
    <div className="p-4 sm:p-6 relative">
      {submissions.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-100 w-fit">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelectAll();
              }}
              className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isAllSelected ? 'bg-sky-500 border-sky-500 shadow-sm shadow-sky-200' : 'border-slate-300 group-hover:border-slate-400'
                }`}
            >
              {isAllSelected && <Check size={14} className="text-white stroke-[4]" />}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Pilih Semua</span>
          </label>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl transition-all">
          <div className="bg-white p-4 rounded-full shadow-2xl border border-slate-100 scale-110">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        </div>
      )}
      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Kosong</p>
          <p className="text-slate-300 font-medium mt-2">Belum ada pengajuan untuk saat ini</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {submissions?.map((sub: any, idx: number) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  {/* Checkbox */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(sub.id);
                      }}
                      className={`w-6 h-6 rounded-lg border-2 mt-1 transition-all flex items-center justify-center shrink-0 cursor-pointer ${selectedIds.includes(sub.id) ? 'bg-sky-500 border-sky-500 shadow-sm shadow-sky-200' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                      {selectedIds.includes(sub.id) && <Check size={16} className="text-white stroke-[4]" />}
                    </div>
                    <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => onToggleSelect(sub.id)}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                          # {sub.no_pengajuan || <small className="text-slate-300 tracking-[0.2em] font-black">DRAF</small>}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-sky-600 transition-colors line-clamp-2 pr-4">{sub.description}</h3>
                    </div>
                  </div>
                  <div
                    onClick={() => onView(sub)}
                    className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-sky-500 group-hover:text-white rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                  >
                    <Eye size={22} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(sub.final_status)}`}>
                    {getStatusIcon(sub.final_status)}
                    {sub.final_status === 'pending'
                      ? (sub.current_step_role ? `Menunggu ${sub.current_step_role}` : 'Menunggu')
                      : (sub.final_status === 'approved' ? 'Disetujui' : (sub.final_status === 'draf' ? 'Draf' : (sub.final_status === 'on_hold' ? 'Ditunda' : 'Ditolak')))}
                  </div>
                  {sub.status_urgent === 'urgent' && (
                    <div className="bg-rose-50 text-rose-500 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5">
                      <AlertCircle size={12} /> URGEN
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
                      <Banknote size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                      <p className="font-black text-slate-900 text-sm">Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(parseFloat(sub.total) || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tanggal</p>
                      <p className="font-bold text-slate-600 text-[11px]">{new Date(sub.final_status === 'draf' && sub.updated_at ? sub.updated_at : (sub.tanggal_pengajuan || sub.created_at || new Date())).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <Calendar size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubmissionsListPage() {
  return (
    <Suspense fallback={
      <Shell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
        </div>
      </Shell>
    }>
      <SubmissionsPageContent />
    </Suspense>
  );
}



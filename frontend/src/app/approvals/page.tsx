"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/layout/Shell';
import api, { STORAGE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, MessageSquare, ShieldCheck, Shield, Info, PenTool, Upload, FileText, Pause } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import Pagination, { PaginationMeta } from '@/components/ui/Pagination';

// Lazy-load heavy modal components
const SignatureCanvas = dynamic(() => import('@/components/submissions/SignatureCanvas'), { ssr: false });
const SubmissionDetailView = dynamic(() => import('@/components/submissions/SubmissionDetailView'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
});

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPaginationMeta, setHistoryPaginationMeta] = useState<PaginationMeta | null>(null);

  // Modal State
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [useSavedSignature, setUseSavedSignature] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'draw' | 'upload'>('draw');
  const [signatureType, setSignatureType] = useState<'canvas' | 'upload'>('canvas');
  const [isDirectorProxy, setIsDirectorProxy] = useState(false);
  const [directorHasSignature, setDirectorHasSignature] = useState(false);
  const [directorName, setDirectorName] = useState<string | null>(null);
  const [checkingDirectorSig, setCheckingDirectorSig] = useState(false);
  const [proof, setProof] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'detail' | 'action'>('detail');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigUploadRef = useRef<HTMLInputElement>(null);

  // Super Admin Override
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'Super Admin');
  const [overrideUsers, setOverrideUsers] = useState<any[]>([]);
  const [overrideUserId, setOverrideUserId] = useState<number | null>(null);

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('data:')) return path;

    // Extract the relative path part after /storage/ if it exists
    let relativePath = path;
    const storageIndex = path.indexOf('/storage/');
    if (storageIndex !== -1) {
      relativePath = path.substring(storageIndex + 9);
    } else if (path.startsWith('http')) {
      const urlMatches = path.match(/^https?:\/\/[^\/]+\/(.*)$/);
      if (urlMatches) relativePath = urlMatches[1];
    }

    const cleanPath = relativePath.replace(/^\/?storage\//, '').replace(/^\/+/, '');
    return `${STORAGE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    fetchApprovals();
    fetchHistory();
    fetchUserSignature();
    fetchOverrideUsers();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyPage]);

  useEffect(() => {
    if (isDirectorProxy) {
      checkDirectorSignature();
    } else {
      setDirectorHasSignature(false);
      setDirectorName(null);
    }
  }, [isDirectorProxy]);

  const checkDirectorSignature = async () => {
    try {
      setCheckingDirectorSig(true);
      const res = await api.get('/approvals/director-signature-status');
      setDirectorHasSignature(res.data.has_signature);
      setDirectorName(res.data.director_name);
    } catch (err) {
      console.error('Failed to check director signature');
    } finally {
      setCheckingDirectorSig(false);
    }
  };

  const fetchOverrideUsers = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get('/admin/users-with-signatures');
      setOverrideUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch override users');
    }
  };

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/approvals/pending');
      setApprovals(res.data.data);
    } catch (err) {
      console.error('Failed to fetch approvals');
    } finally {
      if (activeTab === 'pending') setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/approvals/history', { params: { page: historyPage, per_page: 25 } });
      setHistory(res.data.data);
      setHistoryPaginationMeta({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        from: res.data.from,
        to: res.data.to,
        total: res.data.total,
        per_page: res.data.per_page,
      });
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      if (activeTab === 'history') setLoading(false);
    }
  };

  const fetchUserSignature = async () => {
    try {
      const res = await api.get('/signatures');
      if (res.data.signature_path) {
        setSavedSignature(res.data.signature_path);
        setUseSavedSignature(true);
      } else {
        setSavedSignature(null);
        setUseSavedSignature(false);
      }
    } catch (err) {
      console.error('Failed to fetch signature');
      setSavedSignature(null);
      setUseSavedSignature(false);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Bukti harus berupa gambar (PNG/JPG).');
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran bukti maksimal 2MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canApproveAsDirector = user?.permissions.some(p => p.name === 'proxy director signature');

  const handleAction = async (status: 'approve' | 'reject') => {
    if (!selectedApproval) return;

    // Safety check for required fields
    if (status === 'approve') {
      if (!useSavedSignature && !signature && !isDirectorProxy) {
        alert('Tanda tangan digital wajib diisi.');
        return;
      }

      // Special check for Director Proxy
      if (isDirectorProxy) {
        if (!proof) {
          alert('Bukti tanda tangan (Gambar) wajib diunggah untuk persetujuan mewakili Direktur.');
          return;
        }
        // If director has NO signature, proxy must upload one
        if (!directorHasSignature && !signature) {
          alert('Direktur belum memiliki tanda tangan digital. Anda wajib mengunggah gambar tanda tangan Direktur.');
          return;
        }
      }
    }

    if (status === 'reject' && !notes.trim()) {
      alert('Catatan wajib diisi untuk menolak pengajuan.');
      return;
    }

    setProcessingId(selectedApproval.id);
    try {
      if (status === 'approve') {
        await api.post(`/approvals/${selectedApproval.id}/approve`, {
          notes: notes.trim(),
          signature_path: (isSuperAdmin && overrideUserId) ? null : (useSavedSignature ? null : signature),
          signature_type: signatureType,
          is_director_proxy: isDirectorProxy,
          signed_proof_path: proof,
          override_user_id: overrideUserId || undefined
        });
      } else {
        await api.post(`/approvals/${selectedApproval.id}/reject`, {
          notes: notes.trim()
        });
      }

      // Reset Modal & State
      setSelectedApproval(null);
      setNotes('');
      setSignature('');
      setProof(null);
      setIsDirectorProxy(false);
      
      if (typeof window !== 'undefined') {
        router.replace(window.location.pathname, { scroll: false });
      }

      // Refresh List
      fetchApprovals();
      fetchHistory();
      fetchUserSignature();
    } catch (err: any) {
      console.error('Approval action failed:', err);
      const errorMsg = err.response?.data?.message || 'Gagal memproses keputusan. Silakan coba lagi.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleHold = async () => {
    if (!selectedApproval) return;
    if (!notes.trim()) {
      alert('Catatan wajib diisi untuk menunda pengajuan.');
      return;
    }

    setProcessingId(selectedApproval.id);
    try {
      await api.post(`/approvals/${selectedApproval.id}/hold`, {
        notes: notes.trim()
      });

      setSelectedApproval(null);
      setNotes('');
      setSignature('');
      setProof(null);
      setIsDirectorProxy(false);

      if (typeof window !== 'undefined') {
        router.replace(window.location.pathname, { scroll: false });
      }

      fetchApprovals();
      fetchHistory();
    } catch (err: any) {
      console.error('Hold action failed:', err);
      const errorMsg = err.response?.data?.message || 'Gagal menunda pengajuan. Silakan coba lagi.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <header className="mb-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tugas Persetujuan</h1>
            <p className="text-slate-500 mt-2">Dokumen yang menunggu verifikasi dan riwayat keputusan Anda.</p>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-full md:w-max">
          <button
            onClick={() => { setActiveTab('pending'); setLoading(false); }}
            className={`flex-1 md:w-48 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Antrean ({approvals.length})
          </button>
          <button
            onClick={() => { setActiveTab('history'); setLoading(false); }}
            className={`flex-1 md:w-48 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Riwayat
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {(activeTab === 'pending' ? approvals : history).map((app) => (
            <motion.div
              layout
              key={app.id}
              className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black bg-sky-50 text-sky-600 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-sky-100 italic shadow-sm">
                      {app.submission.no_pengajuan}
                    </span>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 uppercase tracking-tight shadow-sm">
                      Step: {app.role_name}
                    </span>
                    {app.status === 'revised' && (
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-tight shadow-sm animate-pulse">
                        Sudah Direvisi
                      </span>
                    )}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto md:ml-0">{app.submission.user.name.split(' ')[0]}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors uppercase tracking-tight">{app.submission.description}</h3>

                  <div className="flex items-center gap-8 md:gap-12 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-2">Anggaran</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">Rp {parseFloat(app.submission.total).toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-2">Items</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">{app.submission.items?.length || 0} <span className="text-sm text-slate-400">Pcs</span></p>
                    </div>
                  </div>
                    <div>
                      {activeTab === 'history' && app.status !== 'pending' && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border ${
                          app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          app.status === 'on_hold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {app.status === 'approved' ? <Check size={14}/> : app.status === 'on_hold' ? <Pause size={14}/> : <X size={14}/>}
                          {app.status === 'on_hold' ? 'Ditunda' : app.status}
                        </div>
                      )}
                    </div>
                  </div>

                <div className="flex items-center justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 w-full md:w-auto">
                  {activeTab === 'pending' ? (
                    <button
                      onClick={() => setSelectedApproval(app)}
                      className="w-full md:w-auto bg-gradient-to-r from-slate-800 to-slate-900 text-white font-black uppercase tracking-wider py-4 px-10 rounded-2xl hover:from-sky-500 hover:to-sky-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-95 border-b-4 border-slate-950/30"
                    >
                      <ShieldCheck size={22} />
                      Review
                    </button>
                  ) : (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Catatan Anda:</p>
                      <p className="text-sm font-medium text-slate-700 mt-1 max-w-[200px] truncate">{app.notes || '-'}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {(activeTab === 'pending' ? approvals : history).length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Tidak ada data</h3>
              <p className="text-slate-500 mt-2">
                {activeTab === 'pending' 
                  ? 'Tidak ada dokumen yang menunggu persetujuan Anda saat ini.' 
                  : 'Belum ada riwayat persetujuan yang Anda lakukan.'}
              </p>
            </div>
          )}

          {/* Pagination for History tab */}
          {activeTab === 'history' && historyPaginationMeta && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <Pagination pagination={historyPaginationMeta} onPageChange={setHistoryPage} />
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {selectedApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full lg:max-w-[90rem] rounded-none lg:rounded-[32px] shadow-2xl flex flex-col overflow-hidden h-full lg:max-h-[95vh] border-0 lg:border border-white/20"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight truncate">Verifikasi & Detail</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Role: <span className="text-sky-600">{selectedApproval.role_name}</span></p>
                </div>
                <button
                  onClick={() => {
                    setSelectedApproval(null);
                    setNotes('');
                    setSignature('');
                    setProof(null);
                    setIsDirectorProxy(false);
                    setDirectorHasSignature(false);
                    setModalTab('detail');
                    if (typeof window !== 'undefined') {
                      router.replace(window.location.pathname, { scroll: false });
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all shrink-0 ml-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Tab Switcher */}
              <div className="lg:hidden flex bg-slate-100 p-1 mx-4 mt-3 mb-1 rounded-xl shrink-0">
                <button
                  onClick={() => setModalTab('detail')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    modalTab === 'detail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <FileText size={14} />
                  Detail Pengajuan
                </button>
                <button
                  onClick={() => setModalTab('action')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    modalTab === 'action' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <ShieldCheck size={14} />
                  Tindakan
                </button>
              </div>

              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left side: Detail View - always visible on desktop, tab-controlled on mobile */}
                <div className={`lg:w-2/3 p-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 ${modalTab === 'detail' ? 'flex-1' : 'hidden'} lg:block`}>
                  <SubmissionDetailView 
                    submission={selectedApproval.submission} 
                    showPrintButton={true} 
                  />
                </div>

                {/* Right side: Approval Form - always visible on desktop, tab-controlled on mobile */}
                <div className={`lg:w-1/3 p-5 sm:p-8 space-y-8 overflow-y-auto bg-white flex flex-col shrink-0 ${modalTab === 'action' ? 'flex-1' : 'hidden'} lg:flex`}>
                  <div className="flex-1 space-y-8">
                    {/* Proxy Option if applicable */}
                    {selectedApproval.role_name === 'Director' && canApproveAsDirector && (
                      <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-[24px]">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                            <ShieldCheck size={16} />
                          </div>
                          <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Delegasi Wewenang</h3>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isDirectorProxy}
                            onChange={(e) => setIsDirectorProxy(e.target.checked)}
                            className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-[11px] font-black text-amber-800 uppercase tracking-tight">Setujui mewakili Direktur (Proxy)</span>
                        </label>

                        {isDirectorProxy && checkingDirectorSig && (
                          <div className="ml-8 mt-3 text-[10px] text-amber-600 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            Checking Status...
                          </div>
                        )}

                        {isDirectorProxy && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 pt-6 border-t border-amber-200/50 space-y-4"
                          >
                            <label className="block text-[10px] font-black text-amber-900 uppercase tracking-[0.2em]">
                              Bukti Instruksi <span className="text-rose-600">*</span>
                            </label>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleProofChange}
                              className="w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-amber-200 file:text-amber-800 hover:file:bg-amber-300 cursor-pointer"
                            />
                            {proof && (
                              <div className="mt-4 aspect-video rounded-2xl bg-white border border-amber-200 overflow-hidden relative shadow-inner">
                                <img src={getImageUrl(proof) || ''} alt="Proof" className="w-full h-full object-contain" />
                                <button onClick={() => setProof(null)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg">
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                            <p className="text-[9px] text-amber-600/70 font-bold leading-tight flex items-start gap-2">
                              <Info size={12} className="shrink-0" />
                              Format Gambar (PNG/JPG). Maks 2MB. Akan disimpan permanen.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Signature Section */}
                    {(!isDirectorProxy || (isDirectorProxy && !directorHasSignature)) && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <PenTool size={14} className="text-sky-500" />
                            Tanda Tangan Digital
                          </label>
                          {savedSignature ? (
                            <button
                              onClick={() => setUseSavedSignature(!useSavedSignature)}
                              className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest ${useSavedSignature
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-slate-50 text-slate-400 border border-slate-200'
                                }`}
                            >
                              {useSavedSignature ? 'PAKAI TERSIMPAN' : 'GUNAKAN TERSIMPAN'}
                            </button>
                          ) : (
                            <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 font-black uppercase tracking-widest">
                              PROFIL KOSONG
                            </span>
                          )}
                        </div>

                        {useSavedSignature && savedSignature ? (
                          <div className="border-2 border-sky-100 rounded-[24px] bg-sky-50/20 p-4 flex flex-col items-center justify-center aspect-[2/1] relative group overflow-hidden">
                            <img src={getImageUrl(savedSignature) || ''} alt="Saved Signature" className="max-h-full max-w-full object-contain" />
                            <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <button
                                onClick={() => setUseSavedSignature(false)}
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
                              >
                                TULIS BARU
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                              <button
                                onClick={() => { setActiveMode('draw'); setSignatureType('canvas'); setSignature(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${activeMode === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                  }`}
                              >
                                <PenTool size={14} /> Tulis (Canvas)
                              </button>
                              <button
                                onClick={() => { setActiveMode('upload'); setSignatureType('upload'); setSignature(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${activeMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                  }`}
                              >
                                <Upload size={14} /> Upload Gambar
                              </button>
                            </div>

                            {activeMode === 'draw' ? (
                              <div className="border-2 border-slate-200 rounded-[24px] overflow-hidden bg-white/50 backdrop-blur-sm">
                                <SignatureCanvas
                                  onSave={(base64) => {
                                    setSignature(base64);
                                    setSignatureType('canvas');
                                  }}
                                  onClear={() => setSignature('')}
                                />
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-8 text-center bg-slate-50 relative group hover:border-sky-400 hover:bg-sky-50/50 transition-all">
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  ref={sigUploadRef}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                                      if (!validTypes.includes(file.type)) {
                                        alert('Tanda tangan harus berupa gambar dengan format PNG/JPG.');
                                        if (sigUploadRef.current) sigUploadRef.current.value = '';
                                        return;
                                      }
                                      if (file.size > 2 * 1024 * 1024) {
                                        alert('Ukuran tanda tangan maksimal 2MB.');
                                        if (sigUploadRef.current) sigUploadRef.current.value = '';
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setSignature(reader.result as string);
                                        setSignatureType('upload');
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                {signature && signatureType === 'upload' ? (
                                  <div className="relative z-0">
                                    <img src={getImageUrl(signature) || ''} alt="Uploaded Signature" className="mx-auto max-h-32 object-contain" />
                                    <p className="text-[10px] font-bold text-sky-600 mt-4 bg-sky-100 inline-block px-3 py-1 rounded-full">Klik kotak ini untuk mengganti gambar</p>
                                  </div>
                                ) : (
                                  <div className="relative z-0">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400 group-hover:text-sky-500 group-hover:scale-110 transition-all">
                                      <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Pilih atau letakkan file gambar di sini</p>
                                    <p className="text-xs text-slate-400 mt-2">Format: <strong className="text-slate-500">PNG/JPG</strong>. Maks: <strong className="text-slate-500">2MB</strong></p>
                                  </div>
                                )}
                              </div>
                            )}

                            {!savedSignature && (
                              <p className="text-[10px] text-sky-600/80 font-bold leading-tight flex items-start gap-2 mt-2 bg-sky-50 p-2 rounded-lg">
                                <Info size={14} className="shrink-0 mt-0.5" />
                                Karena Profil Anda kosong, tanda tangan ini akan otomatis disimpan secara permanen di akun profil Anda setelah Anda menekan tombol setuju.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {isDirectorProxy && directorHasSignature && (
                      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[24px] flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                          <Check size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Tanda Tangan Direktur Tersedia</p>
                          <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Sistem akan otomatis membubuhkan tanda tangan {directorName}.</p>
                        </div>
                      </div>
                    )}

                    {/* Super Admin Override: Sign As */}
                    {isSuperAdmin && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-[20px]">
                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                          <Shield size={14} className="text-amber-500" />
                          Tanda Tangan Sebagai (Override)
                        </label>
                        <select
                          value={overrideUserId || ''}
                          onChange={(e) => setOverrideUserId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm font-bold text-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-50 outline-none"
                        >
                          <option value="">— Gunakan tanda tangan sendiri —</option>
                          {overrideUsers.map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.roles?.[0]?.name || 'User'})
                            </option>
                          ))}
                        </select>
                        {overrideUserId && (
                          <p className="text-[9px] font-bold text-amber-600 mt-2">
                            ⚠️ Dokumen akan ditandatangani menggunakan tanda tangan user yang dipilih. Aksi ini akan tercatat di Audit Log.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                        <MessageSquare size={14} className="text-sky-500" />
                        Catatan Review
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-5 py-4 rounded-[24px] border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all h-28 font-bold text-sm text-slate-900 placeholder:text-slate-300 shadow-inner"
                        placeholder="Tambahkan feedback atau instruksi Anda di sini..."
                      />
                    </div>
                  </div>

                   <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={processingId === selectedApproval.id}
                      className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 border border-slate-100 shrink-0"
                    >
                      {processingId === selectedApproval.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                      Tolak
                    </button>
                    <button
                      onClick={handleHold}
                      disabled={processingId === selectedApproval.id || !notes.trim()}
                      className="flex-1 py-4 bg-amber-50 text-amber-600 font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 border border-amber-200 shrink-0"
                    >
                      {processingId === selectedApproval.id ? <Loader2 size={16} className="animate-spin" /> : <Pause size={16} />}
                      Tunda
                    </button>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={
                        processingId === selectedApproval.id ||
                        (selectedApproval.role_name === 'Director' && canApproveAsDirector && !isDirectorProxy) ||
                        (!isDirectorProxy && !useSavedSignature && !signature) ||
                        (isDirectorProxy && !proof) ||
                        (isDirectorProxy && !directorHasSignature && !signature)
                      }
                      className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-sky-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 active:scale-[0.98] border-b-4 border-slate-950/30 shrink-0"
                    >
                      {processingId === selectedApproval.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Setujui & TTD
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

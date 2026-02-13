"use client";

import { useState, useEffect, useRef } from 'react';
import Shell from '@/components/layout/Shell';
import api, { STORAGE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, MessageSquare, ShieldCheck, Info, PenTool, Upload } from 'lucide-react';
import SignatureCanvas from '@/components/submissions/SignatureCanvas';
import { useAuth } from '@/context/AuthContext';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigUploadRef = useRef<HTMLInputElement>(null);

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
    fetchUserSignature();
  }, []);

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

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/approvals/pending');
      setApprovals(res.data.data);
    } catch (err) {
      console.error('Failed to fetch approvals');
    } finally {
      setLoading(false);
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
          signature_path: useSavedSignature ? null : signature,
          signature_type: signatureType,
          is_director_proxy: isDirectorProxy,
          signed_proof_path: proof
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
      
      // Refresh List
      fetchApprovals();
      fetchUserSignature();
    } catch (err: any) {
      console.error('Approval action failed:', err);
      const errorMsg = err.response?.data?.message || 'Gagal memproses keputusan. Silakan coba lagi.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Tugas Persetujuan</h1>
          <p className="text-slate-500 mt-2">Dokumen yang menunggu verifikasi dan tanda tangan Anda.</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {approvals.map((app) => (
            <motion.div 
              layout
              key={app.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-black bg-sky-50 text-sky-600 px-3 py-1 rounded-full uppercase tracking-widest border border-sky-100 italic">
                      {app.submission.no_pengajuan}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium text-sm capitalize">{app.submission.user.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                      Step: {app.role_name}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{app.submission.description}</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Anggaran</p>
                      <p className="text-xl font-black text-slate-900">Rp {parseFloat(app.submission.total).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Jumlah Item</p>
                      <p className="text-xl font-black text-slate-900">{app.submission.items?.length || 0} item</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedApproval(app)}
                    className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 flex items-center gap-2"
                  >
                    <ShieldCheck size={20} />
                    Proses Review
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {approvals.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Check size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">Semua Sudah Selesai!</h3>
               <p className="text-slate-500 mt-2">Tidak ada dokumen yang menunggu persetujuan Anda saat ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {selectedApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Verifikasi Akhir</h2>
                  <p className="text-slate-500 text-sm mt-1">Persetujuan sebagai: <span className="font-bold text-sky-600">{selectedApproval.role_name}</span></p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedApproval(null);
                    setNotes('');
                    setSignature('');
                    setSignature('');
                    setProof(null);
                    setIsDirectorProxy(false);
                    setDirectorHasSignature(false);
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Proxy Option if applicable */}
                {selectedApproval.role_name === 'Director' && canApproveAsDirector && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="font-bold text-amber-900">Delegasi Wewenang</h3>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={isDirectorProxy}
                        onChange={(e) => setIsDirectorProxy(e.target.checked)}
                        className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm font-bold text-amber-800 group-hover:text-amber-900 transition-colors">Setujui mewakili Direktur (Proxy Approval)</span>
                    </label>

                    {isDirectorProxy && checkingDirectorSig && (
                        <div className="ml-8 mt-2 text-xs text-amber-600 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            Mengecek status tanda tangan Direktur...
                        </div>
                    )}

                    {isDirectorProxy && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t border-amber-200"
                      >
                        <label className="block text-sm font-bold text-amber-900 mb-3">
                          Unggah Bukti Instruksi/Disposisi <span className="text-rose-600">*</span>
                        </label>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleProofChange}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                        />
                        {proof && (
                          <div className="mt-4 aspect-video rounded-xl bg-white border border-amber-200 overflow-hidden relative">
                             <img src={getImageUrl(proof) || ''} alt="Proof" className="w-full h-full object-contain" />
                             <button onClick={() => setProof(null)} className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg">
                               <X size={12} />
                             </button>
                          </div>
                        )}
                        <p className="text-[11px] text-amber-600 mt-3 flex items-start gap-2">
                          <Info size={14} className="shrink-0" />
                          Format Gambar (PNG/JPG). Bukti ini akan disimpan secara permanen dalam audit trail pengajuan.
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Signature Section - Hide if using Director's existing signature */}
                {(!isDirectorProxy || (isDirectorProxy && !directorHasSignature)) && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-sky-600" />
                                {isDirectorProxy ? 'Upload Tanda Tangan Direktur (Wajib)' : 'Tanda Tangan Digital'}
                            </label>
                            {savedSignature ? (
                                <button 
                                    onClick={() => setUseSavedSignature(!useSavedSignature)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                      useSavedSignature 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                    }`}
                                >
                                    {useSavedSignature ? 'Menggunakan Tanda Tangan Tersimpan' : 'Gunakan Tanda Tangan Tersimpan'}
                                </button>
                            ) : (
                                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 italic">
                                    Belum ada tanda tangan di profil
                                </span>
                            )}
                        </div>

                        {useSavedSignature && savedSignature ? (
                            <div className="border-2 border-sky-100 rounded-2xl bg-sky-50/30 p-4 flex flex-col items-center justify-center aspect-[2/1] relative group">
                                <img src={getImageUrl(savedSignature) || ''} alt="Saved Signature" className="max-h-full max-w-full object-contain" />
                                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                                    <button 
                                        onClick={() => setUseSavedSignature(false)}
                                        className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg border border-slate-200 hover:bg-slate-50"
                                    >
                                        Gunakan Tanda Tangan Baru
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => {
                                            setActiveMode('draw');
                                            setSignatureType('canvas');
                                            setSignature('');
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeMode === 'draw' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <PenTool size={16} />
                                        Gambar
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActiveMode('upload');
                                            setSignatureType('upload');
                                            setSignature('');
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeMode === 'upload' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Upload size={16} />
                                        Upload
                                    </button>
                                </div>

                                {activeMode === 'draw' ? (
                                    <SignatureCanvas onSave={setSignature} onClear={() => setSignature('')} />
                                ) : (
                                    <div className="space-y-4">
                                        <div 
                                            onClick={() => sigUploadRef.current?.click()}
                                            className="aspect-[2/1] bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                                        >
                                            {signature ? (
                                                <>
                                                    <img src={signature} alt="Uploaded Signature" className="max-h-full max-w-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white p-2 rounded-lg shadow-lg">
                                                            <Upload className="text-sky-500" size={20} />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                        <Upload className="text-slate-400 group-hover:text-sky-500" size={20} />
                                                    </div>
                                                    <p className="text-xs font-semibold text-slate-700">Klik untuk upload tanda tangan</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">PNG/JPG, Maks 2MB</p>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={sigUploadRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setSignature(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden" 
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {isDirectorProxy && directorHasSignature && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <Check size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Tanda Tangan Direktur Tersedia</p>
                            <p className="text-xs text-emerald-600">Sistem akan otomatis membubuhkan tanda tangan {directorName} pada dokumen ini.</p>
                        </div>
                    </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} className="text-sky-600" />
                    Catatan Review
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all h-28 font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="Tambahkan feedback atau instruksi Anda di sini..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-8">
                  <button 
                    onClick={() => handleAction('reject')}
                    disabled={processingId === selectedApproval.id}
                    className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processingId === selectedApproval.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <X size={18} />
                    )}
                    Tolak Pengajuan
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
                    title={
                        selectedApproval.role_name === 'Director' && canApproveAsDirector && !isDirectorProxy ? "Wajib centang 'Setujui mewakili Direktur'" :
                        isDirectorProxy && !proof ? "Upload bukti tanda tangan terlebih dahulu" :
                        isDirectorProxy && !directorHasSignature && !signature ? "Upload tanda tangan Direktur terlebih dahulu" :
                        !useSavedSignature && !signature && !isDirectorProxy ? "Tanda tangan wajib diisi" : ""
                    }
                    className="flex-[2] py-4 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-500 transition-all shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processingId === selectedApproval.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Setujui & Tanda Tangan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

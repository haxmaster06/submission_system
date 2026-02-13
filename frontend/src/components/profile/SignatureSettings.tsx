"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import SignatureCanvas from '@/components/submissions/SignatureCanvas';
import api, { STORAGE_URL } from '@/lib/api';
import { Loader2, CheckCircle, ShieldCheck, Trash2, Upload, PenTool } from 'lucide-react';

export default function SignatureSettings() {
  const { user } = useAuth();
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempSignature, setTempSignature] = useState('');
  const [activeMode, setActiveMode] = useState<'draw' | 'upload'>('draw');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSignatureUrl = (path: string | null) => {
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
    fetchSignature();
  }, []);

  const fetchSignature = async () => {
    try {
      const res = await api.get('/signatures');
      setSavedSignature(res.data.signature_path);
    } catch (err) {
      console.error('Failed to fetch signature', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tempSignature) return;
    setSaving(true);
    try {
      await api.post('/signatures', {
        signature: tempSignature,
        type: 'canvas'
      });
      await fetchSignature();
      setTempSignature('');
      alert('Tanda tangan berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan tanda tangan');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('signature', file);
    formData.append('type', 'upload');

    setSaving(true);
    try {
      await api.post('/signatures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchSignature();
      alert('Gambar tanda tangan berhasil diunggah!');
    } catch (err) {
      alert('Gagal mengunggah gambar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await api.delete('/signatures');
      setSavedSignature(null);
      setShowConfirmDelete(false);
      alert('Tanda tangan berhasil dihapus.');
    } catch (err: any) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert('Gagal menghapus tanda tangan: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-sky-500" /></div>;

  const currentFullUrl = getSignatureUrl(savedSignature);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tanda Tangan Digital Saya</h2>
          <p className="text-slate-500 text-sm">Kelola tanda tangan yang akan digunakan untuk persetujuan dokumen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Signature */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tanda Tangan Terdaftar</h3>
            {savedSignature && !showConfirmDelete && (
              <button 
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={saving}
                className="text-rose-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all"
                title="Hapus Tanda Tangan"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <div className="flex-1 aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
            {savedSignature ? (
              <>
                <img src={currentFullUrl || ''} alt="Saved Signature" className="max-h-full max-w-full object-contain" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-2 opacity-0 group-hover:opacity-100 transition-opacity break-all font-mono">
                  URL: {currentFullUrl}
                </div>
              </>
            ) : (
              <div className="text-center p-6 text-slate-400">
                <p className="text-sm font-medium">Belum ada tanda tangan terdaftar</p>
              </div>
            )}

            {/* Confirmation Overlay */}
            {showConfirmDelete && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
                  <Trash2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Hapus Tanda Tangan?</h4>
                <p className="text-[10px] text-slate-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {saving && <Loader2 className="animate-spin w-3 h-3" />}
                    Ya, Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
          {savedSignature && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <CheckCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Aktif & Siap Digunakan</span>
            </div>
          )}
        </div>

        {/* Update Signature */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setActiveMode('draw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeMode === 'draw' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PenTool size={16} />
              Gambar
            </button>
            <button 
              onClick={() => setActiveMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeMode === 'upload' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Upload size={16} />
              Upload
            </button>
          </div>

          {activeMode === 'draw' ? (
            <>
              <SignatureCanvas onSave={setTempSignature} onClear={() => setTempSignature('')} />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || !tempSignature}
                  className="bg-sky-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-sky-100"
                >
                  {saving ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                  Simpan Tanda Tangan
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="text-slate-400 group-hover:text-sky-500" size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Klik untuk upload gambar</p>
                <p className="text-xs text-slate-500 mt-1">PNG atau JPG, Maksimal 2MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-1 bg-amber-100 rounded text-amber-600 shrink-0">
                   <Upload size={14} />
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Tips:</strong> Gunakan gambar tanda tangan dengan latar belakang transparan (PNG) untuk hasil terbaik pada dokumen PDF.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

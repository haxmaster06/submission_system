"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Shell from '@/components/layout/Shell';
import Modal from '@/components/ui/Modal';
import { mobileAppsApi, MobileAppRelease } from '@/lib/mobileApps';
import {
  Smartphone,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
  UploadCloud,
  FileBox,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import Pagination, { PaginationMeta } from '@/components/ui/Pagination';

export default function MobileAppsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<MobileAppRelease[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  // Form state
  const [form, setForm] = useState({
    platform: 'android',
    version: '',
    description: '',
    is_active: false,
    file: null as File | null,
    filename: '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setForm((prev) => ({ ...prev, file, filename: prev.filename || file.name }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: form.platform === 'android' 
      ? { 'application/vnd.android.package-archive': ['.apk'] }
      : { 'application/octet-stream': ['.ipa'] },
    maxFiles: 1,
    multiple: false
  });

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const paginated = await mobileAppsApi.getAll(false, page);
      setReleases(paginated.data);
      setPaginationMeta({
        current_page: paginated.current_page,
        last_page: paginated.last_page,
        from: paginated.from,
        to: paginated.to,
        total: paginated.total,
        per_page: paginated.per_page,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setUploadProgress(0);
    setForm({
      platform: 'android',
      version: '',
      description: '',
      is_active: true,
      file: null,
      filename: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({
      platform: 'android',
      version: '',
      description: '',
      is_active: false,
      file: null,
      filename: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) {
      alert('Silakan pilih file aplikasi (APK/IPA)');
      return;
    }
    
    setSubmitting(true);
    setUploadProgress(0);
    try {
      const threshold = 5 * 1024 * 1024; // 5MB
      let res;

      if (form.file.size > threshold) {
        // Use chunked upload for large files
        res = await mobileAppsApi.createChunked(
          form.file,
          {
            platform: form.platform,
            version: form.version,
            description: form.description,
            is_active: form.is_active ? '1' : '0',
          },
          (progress) => {
            setUploadProgress(progress);
          }
        );
      } else {
        // Traditional upload for small files
        const formData = new FormData();
        formData.append('platform', form.platform);
        formData.append('version', form.version);
        if (form.description) formData.append('description', form.description);
        if (form.filename) formData.append('custom_filename', form.filename);
        formData.append('is_active', form.is_active ? '1' : '0');
        formData.append('file', form.file);

        res = await mobileAppsApi.create(formData, (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
      }
      
      // Refresh list to trigger is_active logic update across all items
      fetchData();
      closeModal();
      alert(res.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah aplikasi');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean, platform: string) => {
    if (currentStatus) return; // Already active, or maybe allow deactivate? Let's just allow activate
    if (!confirm('Apakah Anda yakin ingin mengaktifkan versi ini? Versi lain pada platform yang sama akan dinonaktifkan.')) return;
    
    try {
      await mobileAppsApi.update(id, { is_active: true });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal update status');
    }
  };

  const deleteRelease = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rilis ini secara permanen?')) return;
    try {
      await mobileAppsApi.delete(id);
      setReleases(releases.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus rilis');
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Mobile Apps</h1>
            <p className="text-slate-500 mt-2">Kelola file APK/IPA dan versi aplikasi mobile yang dapat diunduh user</p>
          </div>
          <button
            onClick={openModal}
            className="bg-sky-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-600 shadow-lg shadow-sky-100 flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            <Plus size={20} />
            Unggah Rilis Baru
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-black">Platform</th>
                  <th className="px-6 py-4 font-black">Versi</th>
                  <th className="px-6 py-4 font-black">File Info</th>
                  <th className="px-6 py-4 font-black text-center">Status</th>
                  <th className="px-6 py-4 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      <Smartphone className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      Belum ada rilis aplikasi mobile yang diunggah.
                    </td>
                  </tr>
                ) : (
                  releases.map((release, idx) => (
                    <tr key={release.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          release.platform === 'android' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Smartphone size={14} />
                          {release.platform === 'android' ? 'Android (APK)' : 'iOS (IPA)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">v{release.version}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{new Date(release.created_at).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={release.filename}>
                          {release.filename}
                        </div>
                        {release.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[250px]" title={release.description}>
                            {release.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleActive(release.id, release.is_active, release.platform)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            release.is_active 
                              ? 'bg-sky-50 text-sky-600 cursor-default' 
                              : 'bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-600 border border-slate-200'
                          }`}
                        >
                          {release.is_active ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {release.is_active ? 'Aktif' : 'Set Aktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={mobileAppsApi.getDownloadUrl(release.id)}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download size={18} />
                          </a>
                          <button
                            onClick={() => deleteRelease(release.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {paginationMeta && (
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Pagination pagination={paginationMeta} onPageChange={setPage} />
          </div>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Unggah Rilis Aplikasi (APK/IPA)"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium appearance-none"
                >
                  <option value="android">Android (.apk)</option>
                  <option value="ios">iOS (.ipa)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Versi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="e.g. 1.0.0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Rilis (Opsional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Apa yang baru di versi ini?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">File Instalasi <span className="text-red-500">*</span></label>
              
              {!form.file ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] group
                    ${isDragActive ? 'border-sky-500 bg-sky-50 shadow-inner' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}
                    ${isDragReject ? 'border-red-500 bg-red-50' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 ${isDragActive ? 'bg-sky-100 scale-110' : 'bg-white shadow group-hover:scale-110'}`}>
                    <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {isDragActive ? "Lepaskan file di sini..." : "Tarik & Lepas File Instalasi"}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 px-4">
                    Pilih file APK untuk Android atau IPA untuk iOS. Ukuran file dapat mencapai ratusan MB berkat dukungan <i>chunked upload</i>.
                  </p>
                  <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 px-6 rounded-full shadow-sm group-hover:shadow transition-all">
                    Pilih File Komputer
                  </span>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-sky-50 to-indigo-50/50 border border-sky-100 rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4 w-full overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <FileBox className="text-sky-500 w-7 h-7" />
                    </div>
                    <div className="overflow-hidden w-full">
                      <div className="font-bold text-slate-800 truncate text-base" title={form.file.name}>{form.file.name}</div>
                      <div className="text-sm font-semibold text-slate-500 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100/50 text-emerald-600 text-xs">
                           <Check className="w-3.5 h-3.5" />
                           Siap Diunggah
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {(form.file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, file: null, filename: '' }))}
                    disabled={submitting}
                    className="p-3 text-slate-400 bg-white border border-slate-200 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all shrink-0 w-full md:w-auto flex items-center justify-center disabled:opacity-50"
                  >
                    <XCircle size={20} className="mr-2 md:mr-0" />
                    <span className="md:hidden font-bold">Ganti File</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama File (bisa diubah)</label>
              <input
                type="text"
                value={form.filename}
                onChange={(e) => setForm({ ...form, filename: e.target.value })}
                placeholder="Nama file yang akan ditampilkan ke user"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 text-sky-500 border-slate-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-700 select-none">
                Jadikan versi aktif (menggantikan yang lama di platform ini)
              </label>
            </div>

            {submitting && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className={uploadProgress === 100 ? 'text-emerald-600' : 'text-sky-600'}>
                    {uploadProgress === 0 ? 'Memulai unggahan...' : uploadProgress === 100 ? 'Memproses File...' : 'Mengunggah File...'}
                  </span>
                  <span className={uploadProgress === 100 ? 'text-emerald-600' : 'text-sky-600'}>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner relative">
                  {uploadProgress === 0 ? (
                    <motion.div
                      className="h-full w-1/3 rounded-full bg-sky-400/60"
                      animate={{ x: ['-100%', '300%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    />
                  ) : (
                    <motion.div
                      className={`h-full rounded-full transition-colors duration-300 ${uploadProgress === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  )}
                  {uploadProgress === 100 && (
                    <motion.div 
                      className="absolute inset-0 bg-white/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center gap-2 disabled:opacity-70 transition-all min-w-[160px] justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> 
                    {uploadProgress < 100 ? `${uploadProgress}%` : 'Memproses...'}
                  </>
                ) : 'Unggah Rilis'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
}

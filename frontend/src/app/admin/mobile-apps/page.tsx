"use client";

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Pagination, { PaginationMeta } from '@/components/ui/Pagination';

export default function MobileAppsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<MobileAppRelease[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await mobileAppsApi.getAll(false, page);
      const paginated = res.data;
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
    try {
      const formData = new FormData();
      formData.append('platform', form.platform);
      formData.append('version', form.version);
      if (form.description) formData.append('description', form.description);
      if (form.filename) formData.append('custom_filename', form.filename);
      formData.append('is_active', form.is_active ? '1' : '0');
      formData.append('file', form.file);

      const res = await mobileAppsApi.create(formData);
      
      // Refresh list to trigger is_active logic update across all items
      fetchData();
      closeModal();
      alert(res.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah aplikasi');
    } finally {
      setSubmitting(false);
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">File Instalasi <span className="text-red-500">*</span></label>
              <input
                type="file"
                required
                accept={form.platform === 'android' ? ".apk" : ".ipa"}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, file, filename: file ? file.name : '' });
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all border border-slate-200 rounded-xl p-2"
              />
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center gap-2 disabled:opacity-70 transition-all"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Unggah Rilis'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
}

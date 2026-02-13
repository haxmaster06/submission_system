"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Save, Send, Loader2, Info, FileText, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NewSubmissionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lookups, setLookups] = useState<any>({
    divisions: [],
    jenis_pengajuan: [],
    jenis_perjalanan: [],
    uoms: [],
    urgency_statuses: []
  });

  // Check if user is Super Admin
  const isSuperAdmin = user?.roles?.some(role => role.name === 'Super Admin');

  const [form, setForm] = useState({
    division_id: '',
    jenis_pengajuan_id: '',
    jenis_perjalanan_id: '',
    status_urgent: 'Normal',
    description: '',
    notes: '',
  });

  const [items, setItems] = useState([{
    id: Date.now(),
    description: '',
    qty: 0,
    uom_id: '',
    nominal: 0
  }]);

  // Calculate grand total from all items
  const grandTotal = items.reduce((sum, item) => sum + (item.qty * item.nominal), 0);

  useEffect(() => {
    api.get('/lookups').then(res => {
      setLookups(res.data);
      setLoading(false);
    });
  }, []);

  // Auto-set division_id for non-Super Admin users
  useEffect(() => {
    if (user && !isSuperAdmin && user.division?.id) {
      setForm(prev => ({ ...prev, division_id: String(user.division?.id) }));
    }
  }, [user, isSuperAdmin]);

  const addItem = () => {
    if (items.length >= 20) {
      alert('Maximum 20 items per submission');
      return;
    }
    setItems([...items, {
      id: Date.now(),
      description: '',
      qty: 0,
      uom_id: '',
      nominal: 0
    }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) {
      alert('At least 1 item required');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map(({ id, ...item }) => item) // Remove temporary id
      };
      await api.post('/submissions', payload);
      router.push('/submissions');
    } catch (err) {
      alert('Failed to submit. Please check your input.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Buat Pengajuan Baru</h1>
          <p className="text-slate-500 mt-2">Isi detail pengajuan dan item anggaran dengan lengkap</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Info className="w-4 h-4 text-sky-500" />
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Informasi Umum</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Division - Only show dropdown for Super Admin */}
              {isSuperAdmin ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi</label>
                  <select
                    value={form.division_id}
                    onChange={(e) => setForm({ ...form, division_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                    required
                  >
                    <option value="" className="text-slate-400">Pilih Divisi</option>
                    {lookups.divisions.map((d: any) => <option key={d.id} value={d.id} className="text-slate-900">{d.name} ({d.code})</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi</label>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium">
                    {user?.division?.name} ({user?.division?.code})
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status Urgensi</label>
                <div className="flex gap-4">
                  {lookups.urgency_statuses.map((urgency: any) => (
                    <button
                      key={urgency.code}
                      type="button"
                      onClick={() => setForm({ ...form, status_urgent: urgency.code })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${form.status_urgent === urgency.code
                          ? 'border-transparent text-white shadow-lg'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      style={{
                        backgroundColor: form.status_urgent === urgency.code ? urgency.color : undefined,
                        boxShadow: form.status_urgent === urgency.code ? `0 10px 15px -3px ${urgency.color}33` : undefined
                      }}
                    >
                      {urgency.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Pengajuan</label>
                <select
                  value={form.jenis_pengajuan_id}
                  onChange={(e) => setForm({ ...form, jenis_pengajuan_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                  required
                >
                  <option value="" className="text-slate-400">Pilih Jenis</option>
                  {lookups.jenis_pengajuan.map((j: any) => <option key={j.id} value={j.id} className="text-slate-900">{j.name}</option>)}
                </select>
              </div>

              {lookups.jenis_pengajuan.find((j: any) => j.id == form.jenis_pengajuan_id)?.requires_travel_type && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Perjalanan</label>
                  <select
                    value={form.jenis_perjalanan_id}
                    onChange={(e) => setForm({ ...form, jenis_perjalanan_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                    required
                  >
                    <option value="" className="text-slate-400">Pilih Kategori</option>
                    {lookups.jenis_perjalanan.map((j: any) => <option key={j.id} value={j.id} className="text-slate-900">{j.name}</option>)}
                  </select>
                </motion.div>
              )}
            </div>
          </div>

          {/* Budget Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <FileText className="w-4 h-4 text-sky-500" />
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Rincian Anggaran</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Pengajuan</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium h-32"
                  placeholder="cth: Pengadaan Peralatan Kantor Divisi IT Q1 2024"
                  required
                />
              </div>

              {/* Dynamic Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 text-sm">Item Anggaran ({items.length}/20)</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={items.length >= 20}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={16} />
                    Tambah Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Deskripsi</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase w-32">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase w-40">Satuan</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase w-40">Harga Satuan</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase w-40">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Deskripsi item"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                              required
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.qty || ''}
                              onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                              required
                              min="0.01"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.uom_id}
                              onChange={(e) => updateItem(item.id, 'uom_id', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                              required
                            >
                              <option value="">Pilih</option>
                              {lookups.uoms.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.nominal || ''}
                              onChange={(e) => updateItem(item.id, 'nominal', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                              required
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                            Rp {(item.qty * item.nominal).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Hapus item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-sky-50 border-t-2 border-sky-500">
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-right font-black text-slate-800 uppercase text-sm tracking-wider">
                          Grand Total:
                        </td>
                        <td className="px-4 py-4 text-right font-black text-sky-600 text-lg">
                          Rp {grandTotal.toLocaleString('id-ID')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan (Opsional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium h-24 resize-none"
                  placeholder="Tambahkan catatan tambahan jika diperlukan..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center gap-2 disabled:opacity-70 transition-all"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              Submit Pengajuan
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

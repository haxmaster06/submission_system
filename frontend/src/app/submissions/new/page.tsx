"use client";

import { useState, useEffect, Suspense } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Save, Send, Loader2, Info, FileText, Plus, Trash2, Copy, UploadCloud, File, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function NewSubmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const duplicateId = searchParams.get('duplicate');
  const editId = searchParams.get('edit');

  const [lookups, setLookups] = useState<any>({
    divisions: [],
    jenis_pengajuan: [],
    jenis_perjalanan: [],
    uoms: [],
    urgency_statuses: []
  });
  
  const [showUomInput, setShowUomInput] = useState(false);
  const [newUomName, setNewUomName] = useState('');
  const [uomAdding, setUomAdding] = useState(false);
  const [uomMessage, setUomMessage] = useState<{text: string, type: 'success'|'info'|'error'} | null>(null);

  const isSuperAdmin = user?.roles?.some(role => role.name === 'Super Admin');

  const [form, setForm] = useState({
    division_id: '',
    jenis_pengajuan_id: '',
    jenis_perjalanan_id: '',
    status_urgent: 'Normal',
    description: '',
    notes: '',
    final_status: '',
  });

  const [items, setItems] = useState([{
    id: Date.now(),
    description: '',
    qty: 0,
    uom_id: '',
    nominal: 0
  }]);

  useEffect(() => {
    Promise.all([
      api.get('/lookups'),
      (editId || duplicateId) ? api.get(`/submissions/${editId || duplicateId}`) : Promise.resolve({ data: null })
    ]).then(([lookupsRes, duplicateRes]) => {
      setLookups(lookupsRes.data);
      
      if (duplicateRes.data) {
        const d = duplicateRes.data.data || duplicateRes.data;
        setForm({
          division_id: String(d.division_id || ''),
          jenis_pengajuan_id: String(d.jenis_pengajuan_id || ''),
          jenis_perjalanan_id: String(d.jenis_perjalanan_id || ''),
          status_urgent: d.status_urgent || 'Normal',
          description: d.description || '',
          notes: d.notes || '',
          final_status: d.final_status || '',
        });
        
        if (d.items && d.items.length > 0) {
          setItems(d.items.map((item: any, idx: number) => ({
            id: Date.now() + idx,
            description: item.name || item.description || '',
            qty: parseFloat(item.qty) || 0,
            uom_id: String(item.uom_id || ''),
            nominal: parseFloat(item.price) || parseFloat(item.nominal) || 0
          })));
        }
      } else if (user && !isSuperAdmin && user.division?.id) {
        setForm(prev => ({ ...prev, division_id: String(user.division?.id) }));
      }
      
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [duplicateId, user, isSuperAdmin]);

  const selectedType = lookups.jenis_pengajuan.find((j: any) => j.id == form.jenis_pengajuan_id);

  const addItem = () => {
    if (items.length >= 20) {
      alert('Maximum 20 items per submission');
      return;
    }
    setItems([...items, { id: Date.now(), description: '', qty: 0, uom_id: '', nominal: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) {
      alert('At least 1 item required');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleQuickAddUom = async (itemId: number) => {
    if (!newUomName.trim()) return;
    
    setUomAdding(true);
    setUomMessage(null);
    try {
      const res = await api.post('/uoms/quick-add', { name: newUomName });
      const { exists, message, uom } = res.data;
      
      setUomMessage({ text: message, type: exists ? 'info' : 'success' });
      
      // Refresh lookups to get the latest UOMs
      const lookupsRes = await api.get('/lookups');
      setLookups(lookupsRes.data);
      
      // Auto-select the UOM for the current item
      updateItem(itemId, 'uom_id', String(uom.id));
      
      if (!exists) {
        setNewUomName('');
        setShowUomInput(false);
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setUomMessage(null), 3000);
    } catch (err: any) {
      setUomMessage({ 
        text: err.response?.data?.message || 'Gagal menambah satuan.', 
        type: 'error' 
      });
    } finally {
      setUomAdding(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const selectedFiles = Array.from(e.target.files as FileList);
        const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
        if (validFiles.length !== selectedFiles.length) {
            alert('Beberapa file melebihi batas 10MB dan tidak ditambahkan.');
        }
        setFiles(prev => [...prev, ...validFiles]);
    }
    // reset input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const standardTotal = items.reduce((sum, item) => sum + (item.qty * item.nominal), 0);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (items.length === 1 && (!items[0].description || items[0].nominal === 0)) {
        alert('Mohon isi minimal 1 item anggaran.');
        return;
    }

    setSubmitting(true);
    try {
      let payload: any = { ...form };
      delete payload.final_status; // Remove pure UI state
      payload.items = items.map(({ id, ...item }) => item);
      payload.total = standardTotal;
      payload.is_draft = isDraft;

      const res = editId 
        ? await api.put(`/submissions/${editId}`, payload)
        : await api.post('/submissions', payload);
      
      const newSubmissionId = res.data.id || editId;

      // If user is editing a draft and clicking 'Simpan & Ajukan'/'Terbitkan'
      if (editId && form.final_status === 'draf' && !isDraft) {
        await api.post(`/submissions/${editId}/publish`);
      }

      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          try {
             await api.post(`/submissions/${newSubmissionId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
             });
          } catch (uploadErr: any) {
             console.error('Failed to upload attachment:', file.name, uploadErr);
             alert(`Gagal mengunggah file lampiran: ${file.name}. Error: ${uploadErr.response?.data?.message || uploadErr.message}`);
          }
        }
      }

      router.push('/submissions');
    } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'Gagal mengirim pengajuan. Silakan periksa kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  if(loading) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Buat Pengajuan Baru</h1>
              {duplicateId && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <Copy size={12} /> Mode Duplikat
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {duplicateId ? `Menyalin kerangka data dari pengajuan lama. Silakan sesuaikan nilai.` : 'Isi detail pengajuan dan item anggaran dengan lengkap'}
            </p>
          </div>
          <Link href="/submissions">
            <button className="text-slate-500 font-bold hover:text-slate-800 transition-all flex items-center gap-2 text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
              Batal & Kembali
            </button>
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Info className="w-4 h-4 text-sky-500" />
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Informasi Umum</h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {lookups.divisions.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi</label>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold">
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

              <div className="flex flex-col gap-2">
                  <label className="block text-sm font-semibold text-slate-700">Jenis Pengajuan</label>
                  <select
                    value={form.jenis_pengajuan_id}
                    onChange={(e) => setForm({ ...form, jenis_pengajuan_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                    required
                  >
                    <option value="" className="text-slate-400">Pilih Jenis</option>
                    {lookups.jenis_pengajuan
                        .filter((j: any) => !j.name?.toLowerCase().includes('gaji karyawan harian'))
                        .map((j: any) => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
              </div>

              {selectedType?.requires_travel_type && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Perjalanan</label>
                  <select
                    value={form.jenis_perjalanan_id}
                    onChange={(e) => setForm({ ...form, jenis_perjalanan_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                    required
                  >
                    <option value="" className="text-slate-400">Pilih Kategori</option>
                    {lookups.jenis_perjalanan.map((j: any) => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </motion.div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center gap-2 bg-slate-50/50 border-slate-100">
              <FileText className="w-5 h-5 text-sky-500" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                  Rincian Anggaran
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Judul Pengajuan / Keterangan
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium h-24"
                  placeholder="cth: Pengadaan Peralatan Kantor..."
                  required
                />
              </div>

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
                      {items.map((item) => (
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
                              required min="0.01" step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={item.uom_id}
                                  onChange={(e) => updateItem(item.id, 'uom_id', e.target.value)}
                                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                                  required
                                >
                                  <option value="">Pilih</option>
                                  {lookups.uoms.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setShowUomInput(!showUomInput)}
                                  className={`p-2 rounded-lg border transition-all ${showUomInput ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-200'}`}
                                  title="Tambah Satuan Baru"
                                >
                                  {showUomInput ? <X size={16} /> : <Plus size={16} />}
                                </button>
                              </div>
                              
                              {showUomInput && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }} 
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-2"
                                >
                                  <input
                                    type="text"
                                    placeholder="Nama satuan (misal: Rim, Box)"
                                    value={newUomName}
                                    onChange={(e) => setNewUomName(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 outline-none focus:ring-2 focus:ring-sky-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddUom(item.id)}
                                    disabled={uomAdding || !newUomName.trim()}
                                    className="w-full py-1.5 bg-sky-500 text-white rounded text-[10px] font-bold hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-1"
                                  >
                                    {uomAdding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                                    Tambah
                                  </button>
                                  {uomMessage && (
                                    <p className={`text-[9px] font-bold text-center ${uomMessage.type === 'error' ? 'text-rose-500' : uomMessage.type === 'info' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                      {uomMessage.text}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.nominal || ''}
                              onChange={(e) => updateItem(item.id, 'nominal', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                              required min="0" step="0.01"
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
                          Rp {standardTotal.toLocaleString('id-ID')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* General Notes for Both */}
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

          {/* File Upload Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center gap-2 bg-slate-50/50 border-slate-100">
              <UploadCloud className="w-5 h-5 text-sky-500" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                  Lampiran Pendukung
              </h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
               <label className="block text-sm font-semibold text-slate-700 mb-2">Upload File Dokumen / Bukti</label>
               <input 
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  className="block w-full text-sm text-slate-500 hover:file:bg-sky-100 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 transition-all border border-slate-200 rounded-xl cursor-pointer bg-white"
               />
               <p className="text-[10px] text-slate-400 mt-2">Format yang didukung: JPG, PNG, PDF, DOCX, XLSX. Maksimal 10MB per file.</p>
               
               {files.length > 0 && (
                   <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {files.map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                               <div className="flex items-center gap-3 overflow-hidden">
                                   <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                                      <File className="w-4 h-4 text-sky-600" />
                                   </div>
                                   <div className="truncate min-w-0">
                                      <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                   </div>
                               </div>
                               <button 
                                  type="button" 
                                  onClick={() => removeFile(idx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                               >
                                  <X size={16} />
                               </button>
                           </div>
                       ))}
                   </div>
               )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(new Event('submit') as any, true)}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl border border-sky-200 text-sky-600 font-bold hover:bg-sky-50 transition-all text-center flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              Simpan Sebagai Draf
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {editId 
                ? (form.final_status === 'draf' ? 'TERBITKAN' : 'Simpan Perubahan') 
                : 'Submit Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

export default function NewSubmissionPage() {
  return (
    <Suspense fallback={<Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div></Shell>}>
      <NewSubmissionContent />
    </Suspense>
  );
}

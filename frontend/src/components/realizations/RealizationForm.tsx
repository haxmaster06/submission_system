"use client";

import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface RealizationFormProps {
  submission: any;
  editData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RealizationForm({ submission, editData, onClose, onSuccess }: RealizationFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    realization_date: editData ? editData.realization_date.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: editData ? (editData.notes || '') : '',
    items: editData ? editData.details.map((item: any) => ({
      item_name: item.item_name,
      qty: item.qty,
      nominal: item.nominal,
    })) : (submission.items && submission.items.length > 0) ? submission.items.map((item: any) => ({
      item_name: item.description || '',
      qty: item.qty || 0,
      nominal: item.nominal || 0,
    })) : [{
      item_name: `Anggaran ${submission.jenis_pengajuan || 'Global'}`,
      qty: 1,
      nominal: submission.total || 0,
    }]
  });

  const totalRealization = form.items.reduce((acc: number, item: any) => acc + (parseFloat(item.qty as any) * parseFloat(item.nominal as any) || 0), 0);
  const diff = parseFloat(submission.total) - totalRealization;

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { item_name: '', qty: 1, nominal: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editData) {
        await api.put(`/realizations/${editData.id}`, {
          ...form
        });
      } else {
        await api.post('/realizations', {
          submission_id: submission.id,
          ...form
        });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan realisasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
             <h3 className="font-bold text-slate-800 text-lg">{editData ? 'Edit Realisasi Anggaran' : 'Input Realisasi Anggaran'}</h3>
             <p className="text-xs text-slate-400">Pengajuan: {submission.no_pengajuan}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Tanggal Realisasi</label>
                <input 
                  type="date"
                  value={form.realization_date}
                  onChange={e => setForm(prev => ({ ...prev, realization_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium text-slate-800 bg-white shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Catatan / Keterangan</label>
                <input 
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Misal: Nota terlampir"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium text-slate-800 bg-white shadow-sm"
                />
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Item Penggunaan Aktual</label>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1"
                >
                  <Plus size={14} /> Tambah Item
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       <tr>
                          <th className="px-4 py-3 min-w-[300px]">Item Name</th>
                          <th className="px-4 py-3 w-24 text-center">Qty</th>
                          <th className="px-4 py-3 w-44 text-right">Nominal</th>
                          <th className="px-4 py-3 w-44 text-right">Total</th>
                          <th className="px-4 py-3 w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {form.items.map((item: any, index: number) => (
                          <tr key={index}>
                             <td className="px-4 py-3">
                                <input 
                                  type="text"
                                  value={item.item_name}
                                  onChange={e => updateItem(index, 'item_name', e.target.value)}
                                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 p-0"
                                  placeholder="Nama item ekspedisi / belanja..."
                                  required
                                />
                             </td>
                             <td className="px-4 py-3">
                                <input 
                                  type="number"
                                  value={item.qty}
                                  onChange={e => updateItem(index, 'qty', e.target.value)}
                                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-center text-slate-800 p-0"
                                  required
                                  min="0"
                                  step="any"
                                />
                             </td>
                             <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                   <span className="text-slate-400 text-xs font-mono">Rp</span>
                                   <input 
                                      type="number"
                                      value={item.nominal}
                                      onChange={e => updateItem(index, 'nominal', e.target.value)}
                                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-right text-slate-800 p-0 font-mono"
                                      required
                                      min="0"
                                      step="0.00001"
                                   />
                                </div>
                             </td>
                             <td className="px-4 py-3 text-right">
                                <p className="text-sm font-bold text-slate-800 font-mono">
                                   Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(parseFloat(item.qty as any) * parseFloat(item.nominal as any) || 0)}
                                </p>
                             </td>
                             <td className="px-4 py-3 text-center">
                                {form.items.length > 1 && (
                                   <button 
                                      type="button"
                                      onClick={() => removeItem(index)}
                                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Budget Disetujui</p>
                    <p className="text-sm font-bold text-slate-700 font-mono">Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(parseFloat(submission.total))}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Realisasi</p>
                    <p className="text-sm font-bold text-sky-600 font-mono">Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(totalRealization)}</p>
                 </div>
              </div>
              
              <div className="text-right">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Selisih Anggaran</p>
                 <div className="flex items-center justify-end gap-2">
                    {diff < 0 ? (
                       <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded text-xs font-black">
                          <AlertCircle size={14} /> OVER BUDGET
                       </div>
                    ) : diff === 0 ? (
                       <div className="text-sky-500 bg-sky-50 px-2 py-1 rounded text-xs font-black">
                         SESUAI BUDGET
                       </div>
                    ) : (
                       <div className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded text-xs font-black">
                         UNDER BUDGET
                       </div>
                    )}
                    <p className={`text-2xl font-black font-mono ${diff < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                       Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 5 }).format(Math.abs(diff))}
                    </p>
                 </div>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-black tracking-wide text-sm hover:bg-slate-50 transition-all uppercase"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] py-4 px-6 rounded-2xl bg-sky-500 text-white font-black tracking-wide text-sm hover:bg-sky-600 transition-all shadow-xl shadow-sky-100 uppercase flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {editData ? 'Perbarui Realisasi' : 'Simpan Realisasi'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}

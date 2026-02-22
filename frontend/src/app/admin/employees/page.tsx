"use client";

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { Plus, Search as SearchIcon, Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

export default function EmployeesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [bulkData, setBulkData] = useState<any[]>([{ id: Date.now(), name: '', department: '', base_salary: 0, is_active: true }]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Validate permission on mount
  useEffect(() => {
    const isAllowed = user?.permissions.some(p => p.name === 'manage employees') || user?.roles.some(r => r.name === 'Super Admin');
    if (!isAllowed && user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/master/employees');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setBulkData([{ id: Date.now(), name: '', department: '', base_salary: 0, is_active: true }]);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return;
    try {
      await api.delete(`/master/employees/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingItem) {
        await api.put(`/master/employees/${editingItem.id}`, formData);
      } else {
        const payload = bulkData.map(({ id, ...rest }) => rest);
        await api.post(`/master/employees`, { employees: payload });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-sky-100">
                <Users size={12} />
                HR & GA
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Master <span className="text-sky-500">Karyawan</span>
            </h1>
            <p className="text-slate-500 font-semibold text-lg">Kelola nama, bagian, dan informasi gaji pokok karyawan.</p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full lg:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:to-sky-700 text-white px-8 py-4 rounded-[28px] font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-sky-100 flex items-center justify-center gap-3 active:scale-95 border-b-4 border-sky-700/30"
          >
            <Plus size={22} strokeWidth={3} />
            Tambah Karyawan
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cari data berdasarkan nama atau bagian..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-sky-50 focus:border-sky-500 outline-none text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-sky-500" size={32} />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Memuat data...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Data Karyawan Kosong</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Nama Lengkap</th>
                        <th className="px-6 py-4">Bagian / Departemen</th>
                        <th className="px-6 py-4 text-right">Gaji Pokok / Harian</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.map((item) => (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-[14px] font-bold text-slate-900">{item.name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{item.department}</td>
                          <td className="px-6 py-4 text-sm text-slate-900 text-right font-black tracking-tight">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.base_salary)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-black text-[9px] uppercase ${item.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {item.is_active ? 'Aktif' : 'Non-Aktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <div key={item.id} className="p-5 flex items-center justify-between gap-4 active:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-col gap-1">
                          <h4 className="font-black text-slate-900 text-[15px] truncate tracking-tight">{item.name}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.department}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2">
                          <span className="text-[13px] font-black text-slate-900 font-mono">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.base_salary)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleEdit(item)} className="w-10 h-10 flex items-center justify-center text-slate-400 active:bg-sky-50 active:text-sky-500 rounded-xl transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 flex items-center justify-center text-slate-400 active:bg-red-50 active:text-red-500 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru (Multi)'}
          size={editingItem ? "lg" : "xl"}
        >
          <form onSubmit={handleSave} className="space-y-6">
            {editingItem ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nama Lengkap</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Muhammad Joni"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bagian / Departemen</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Produksi Harian"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Set Gaji (Pokok/Harian)</label>
                  <input
                    required
                    type="number"
                    placeholder="Masukkan nominal"
                    value={formData.base_salary === 0 ? '' : formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white font-mono"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm leading-none">Status Karyawan Aktif</span>
                      <span className="text-[10px] text-slate-400 mt-1">Hilangkan centang jika resign.</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Nama Lengkap</th>
                          <th className="px-4 py-3">Departemen</th>
                          <th className="px-4 py-3 w-40">Gaji Pokok/Hari</th>
                          <th className="px-4 py-3 w-16 text-center">Aktif</th>
                          <th className="px-4 py-3 w-16 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkData.map((row, index) => (
                          <tr key={row.id}>
                            <td className="p-2">
                               <input required type="text" placeholder="Nama..." value={row.name} onChange={(e) => {
                                  let newArr = [...bulkData]; newArr[index].name = e.target.value; setBulkData(newArr);
                               }} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold bg-white" />
                            </td>
                            <td className="p-2">
                               <input required type="text" placeholder="Bagian..." value={row.department} onChange={(e) => {
                                  let newArr = [...bulkData]; newArr[index].department = e.target.value; setBulkData(newArr);
                               }} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold bg-white" />
                            </td>
                            <td className="p-2">
                               <input required type="number" placeholder="Nominal" value={row.base_salary === 0 ? '' : row.base_salary} onChange={(e) => {
                                  let newArr = [...bulkData]; newArr[index].base_salary = parseFloat(e.target.value) || 0; setBulkData(newArr);
                               }} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-mono font-bold bg-white" />
                            </td>
                            <td className="p-2 text-center">
                               <input type="checkbox" checked={row.is_active} onChange={(e) => {
                                  let newArr = [...bulkData]; newArr[index].is_active = e.target.checked; setBulkData(newArr);
                               }} className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500" />
                            </td>
                            <td className="p-2 text-center">
                               <button type="button" onClick={() => {
                                  if (bulkData.length > 1) setBulkData(bulkData.filter(b => b.id !== row.id));
                               }} disabled={bulkData.length === 1} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 flex items-center justify-center w-full">
                                  <Trash2 size={16} />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <button type="button" onClick={() => setBulkData([...bulkData, { id: Date.now(), name: '', department: '', base_salary: 0, is_active: true }])} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 px-2 py-1">
                      <Plus size={14} /> Tambah Baris Karyawan
                  </button>
                </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-[1] py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || (!editingItem && bulkData.length === 0)}
                className="flex-[2] py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                {saving ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Semua')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import Tabs from '@/components/ui/Tabs';
import api from '@/lib/api';
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

import Modal from '@/components/ui/Modal';

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('divisions');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formDataList, setFormDataList] = useState<any[]>([{}]); // For Bulk Create
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'divisions', label: 'Divisi' },
    { id: 'types', label: 'Jenis Pengajuan' },
    { id: 'urgency', label: 'Status Urgensi' },
    { id: 'travel-types', label: 'Jenis Perjalanan' },
    { id: 'uoms', label: 'Satuan (UOM)' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/master/${activeTab}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const { user } = useAuth();
  const isSuperAdmin = user?.roles.some(r => r.name === 'Super Admin');

  const handleCreate = () => {
    setEditingItem(null);
    setFormDataList([{}]); // Reset to 1 empty row
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleAddRow = () => {
    setFormDataList([...formDataList, {}]);
  };

  const handleRemoveRow = (index: number) => {
    if (formDataList.length > 1) {
      setFormDataList(formDataList.filter((_, i) => i !== index));
    }
  };

  const handleBulkChange = (index: number, field: string, value: any) => {
    const newList = [...formDataList];
    newList[index] = { ...newList[index], [field]: value };
    setFormDataList(newList);
  };

  const handleReorder = async (newOrder: any[]) => {
    setData(newOrder);
    try {
      await api.post(`/master/urgency/reorder`, {
        ids: newOrder.map(item => item.id)
      });
    } catch (err) {
      console.error('Failed to update order:', err);
      fetchData(); // Reset on error
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await api.delete(`/master/${activeTab}/${id}`);
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
        // Single Update
        await api.put(`/master/${activeTab}/${editingItem.id}`, formData);
      } else {
        // Bulk Create
        // Filter out empty rows if needed, or validate
        const promises = formDataList.map(item => api.post(`/master/${activeTab}`, item));
        await Promise.all(promises);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal menyimpan data via Modal');
    } finally {
      setSaving(false);
    }
  };

  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-sky-100">
                <Database size={12} />
                Administrator
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Master Data <span className="text-sky-500">Manajemen</span>
            </h1>
            <p className="text-slate-500 font-semibold text-lg">Kelola data dasar sistem budgeting HBM</p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full lg:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:to-sky-700 text-white px-8 py-4 rounded-[28px] font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-sky-100 flex items-center justify-center gap-3 active:scale-95 border-b-4 border-sky-700/30"
          >
            <Plus size={22} strokeWidth={3} />
            Tambah Data Baru
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 p-2">
            <Tabs
              tabs={tabs.map(t => ({ id: t.id, label: t.label, content: null }))}
              defaultTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cari data berdasarkan nama atau kode..."
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
                <Search className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Data tidak ditemukan</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        {isSuperAdmin && <th className="px-6 py-4">ID</th>}
                        {activeTab === 'urgency' && <th className="px-6 py-4 w-10"></th>}
                        <th className="px-6 py-4">Nama</th>
                        {(activeTab === 'divisions' || activeTab === 'uoms' || activeTab === 'urgency') && <th className="px-6 py-4">Kode</th>}
                        {activeTab === 'divisions' && <th className="px-6 py-4 text-right">Budget Limit</th>}
                        {(activeTab === 'types' && isSuperAdmin) && <th className="px-6 py-4 text-center">Travel?</th>}
                        {activeTab === 'urgency' && <th className="px-6 py-4">Level</th>}
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    {activeTab === 'urgency' ? (
                      <Reorder.Group as="tbody" axis="y" values={filteredData} onReorder={handleReorder} className="divide-y divide-slate-50">
                        {filteredData.map((item) => (
                          <Reorder.Item
                            as="tr"
                            key={item.id}
                            value={item}
                            className="hover:bg-slate-50/50 transition-colors bg-white cursor-move group"
                          >
                            {isSuperAdmin && <td className="px-6 py-4 text-xs font-bold text-slate-400">#{item.id}</td>}
                            <td className="px-6 py-4">
                              <GripVertical className="text-slate-300 group-hover:text-slate-500 transition-colors" size={16} />
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                {item.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.code}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{item.level}</td>
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
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                      <tbody className="divide-y divide-slate-50">
                        {filteredData.map((item) => (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            {isSuperAdmin && <td className="px-6 py-4 text-xs font-bold text-slate-400">#{item.id}</td>}
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                            {(activeTab === 'divisions' || activeTab === 'uoms' || activeTab === 'urgency') && (
                              <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.code}</td>
                            )}
                            {activeTab === 'divisions' && (
                              <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.budget_limit || 0)}
                              </td>
                            )}
                            {activeTab === 'types' && isSuperAdmin && (
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded-md font-black text-[9px] uppercase ${item.requires_travel_type ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {item.requires_travel_type ? 'PELANCONG' : 'TIDAK'}
                                </span>
                              </td>
                            )}
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
                    )}
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <div key={item.id} className="p-5 flex items-center justify-between gap-4 active:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {activeTab === 'urgency' && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />}
                          <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{item.name}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {isSuperAdmin && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.id}</span>}
                          {(activeTab === 'divisions' || activeTab === 'uoms' || activeTab === 'urgency') && (
                            <span className="text-[10px] font-black text-sky-500 font-mono tracking-tighter bg-sky-50 px-1.5 py-0.5 rounded leading-none">{item.code}</span>
                          )}
                          {activeTab === 'divisions' && (
                            <span className="text-[10px] font-black text-emerald-600 font-mono">
                              Lim: {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(item.budget_limit || 0)}
                            </span>
                          )}
                          {activeTab === 'types' && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none ${item.requires_travel_type ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {item.requires_travel_type ? 'TRAVEL' : 'REGULAR'}
                            </span>
                          )}
                          {activeTab === 'urgency' && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LV: {item.level}</span>}
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
          title={editingItem ? 'Edit Data' : `Tambah ${tabs.find(t => t.id === activeTab)?.label} Baru`}
          size={editingItem ? 'lg' : '2xl'}
        >
          <form onSubmit={handleSave} className="space-y-6">

            {/* EDIT MODE (Single Item) */}
            {editingItem && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nama</label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white"
                  />
                </div>

                {(activeTab === 'divisions' || activeTab === 'uoms' || activeTab === 'urgency') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kode</label>
                    <input
                      required
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white uppercase"
                    />
                  </div>
                )}

                {activeTab === 'divisions' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Budget Limit (Bulanan)</label>
                    <input
                      type="number"
                      value={formData.budget_limit || 0}
                      onChange={(e) => setFormData({ ...formData, budget_limit: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white text-right font-mono"
                    />
                  </div>
                )}

                {activeTab === 'urgency' && (
                  <>
                    {isSuperAdmin && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Level</label>
                        <input
                          required
                          type="number"
                          value={formData.level || 0}
                          onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 transition-all bg-white"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Warna</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={formData.color || '#000000'}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="h-10 w-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color || ''}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'types' && (
                  <div className="space-y-4 pt-2">
                    {isSuperAdmin && (
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.requires_travel_type || false}
                          onChange={(e) => setFormData({ ...formData, requires_travel_type: e.target.checked })}
                          className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                        />
                        <span className="font-bold text-slate-700 text-sm">Membutuhkan Kategori Perjalanan?</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BULK CREATE MODE (Multi Item) */}
            {!editingItem && (
              <div className="space-y-4">
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left bg-slate-50/50">
                    <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Nama</th>
                        {(activeTab === 'divisions' || activeTab === 'uoms' || activeTab === 'urgency') && (
                          <th className="px-4 py-3">Kode (Unik)</th>
                        )}
                        {activeTab === 'divisions' && <th className="px-4 py-3 text-right">Budget Limit</th>}
                        {activeTab === 'urgency' && <th className="px-4 py-3">Level</th>}
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {formDataList.map((row, index) => (
                        <tr key={index} className="group hover:bg-slate-50">
                          <td className="p-2">
                            <input
                              required
                              placeholder="Nama..."
                              value={row.name || ''}
                              onChange={(e) => handleBulkChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-500 bg-white"
                            />
                          </td>
                          {(activeTab === 'divisions' || activeTab === 'uoms' || activeTab === 'urgency') && (
                            <td className="p-2">
                              <input
                                required
                                placeholder="KODE..."
                                value={row.code || ''}
                                onChange={(e) => handleBulkChange(index, 'code', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-mono uppercase text-slate-900 placeholder:text-slate-500 bg-white"
                              />
                            </td>
                          )}
                          {activeTab === 'divisions' && (
                            <td className="p-2">
                              <input
                                type="number"
                                placeholder="0"
                                value={row.budget_limit || ''}
                                onChange={(e) => handleBulkChange(index, 'budget_limit', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-mono text-right text-slate-900 placeholder:text-slate-500 bg-white"
                              />
                            </td>
                          )}
                          {activeTab === 'urgency' && (
                            <td className="p-2 w-24">
                              <input
                                type="number"
                                placeholder="1"
                                value={row.level || ''}
                                onChange={(e) => handleBulkChange(index, 'level', parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm text-slate-900 placeholder:text-slate-500 bg-white"
                              />
                            </td>
                          )}
                          <td className="p-2 text-center">
                            {formDataList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Tambah Baris
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
                disabled={saving}
                className="flex-[2] py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 text-sm flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={18} />}
                {saving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
}

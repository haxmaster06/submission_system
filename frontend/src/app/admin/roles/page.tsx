"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { Shield, CheckCircle2, XCircle, Loader2, Info, Edit2, Save, Circle, Search, ClipboardList, PenTool, Wallet, Settings, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';

export default function RolesPermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Permission Editor Modal states
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Add Role Modal states
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [addingRole, setAddingRole] = useState(false);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      const res = await api.get('/roles-permissions');
      setRoles(res.data.roles);
      setPermissions(res.data.permissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPermissionModal = (role: any) => {
    if (role.name === 'Super Admin') {
      alert('Super Admin tidak dapat diubah.');
      return;
    }
    setEditingRole(role);
    setSelectedPermissions(role.permissions.map((p: any) => p.name));
    setIsPermissionModalOpen(true);
  };

  const closePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  const togglePermission = (permissionName: string) => {
    if (selectedPermissions.includes(permissionName)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionName]);
    }
  };

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPermissions.length === 0) {
      alert('Minimal harus ada 1 permission untuk role ini.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengubah permission untuk role "${editingRole.name}"?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/roles/${editingRole.id}/permissions`, {
        permissions: selectedPermissions
      });

      // Refresh data
      await fetchRolesAndPermissions();
      alert('Permission berhasil diperbarui!');
      closePermissionModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setAddingRole(true);
    try {
      await api.post('/roles-permissions', {
        name: newRoleName,
        permissions: [] // Start as empty
      });
      await fetchRolesAndPermissions();
      setIsAddRoleModalOpen(false);
      setNewRoleName('');
      alert('Role berhasil dibuat!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat role');
    } finally {
      setAddingRole(false);
    }
  };

  const handleDeleteRole = async (role: any) => {
    const protectedRoles = ['Super Admin', 'Staff', 'HRD', 'GA Legal', 'Finance', 'GM', 'Director'];
    if (protectedRoles.includes(role.name)) {
      alert('Role bawaan sistem tidak dapat dihapus.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"? Terdapat pengecekan keamanan untuk memastikan role tidak sedang digunakan.`)) {
      return;
    }

    try {
      await api.delete(`/roles/${role.id}`);
      await fetchRolesAndPermissions();
      alert('Role berhasil dihapus!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus role');
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-sky-500" />
                <h1 className="text-3xl font-bold text-slate-900">Peran & Hak Akses</h1>
              </div>
              <p className="text-slate-500">
                Matriks lengkap yang menunjukkan hak akses (permissions) untuk setiap peran (role) di sistem.
              </p>
            </div>
            <button
              onClick={() => setIsAddRoleModalOpen(true)}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-600 shadow-lg shadow-sky-100 flex items-center gap-2 transition-all self-start md:self-center"
            >
              <Plus size={20} />
              Tambah Role
            </button>
          </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari permission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-50 focus:border-sky-500 outline-none transition-all font-medium text-slate-900"
            />
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-5 py-3 flex items-center gap-3 shrink-0">
            <Info className="w-5 h-5 text-sky-500 shrink-0" />
            <p className="text-xs text-sky-800 font-bold">
              <span className="font-black">Super Admin</span> memiliki akses penuh secara otomatis.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table Matrix */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md bg-white/80">
                  <th className="px-6 py-5 text-sm font-black text-slate-900 sticky left-0 bg-white/95 z-30 border-r border-slate-200 uppercase tracking-tighter">
                    Hak Akses (Permissions)
                  </th>
                  {roles.map((role) => (
                    <th key={role.id} className="px-4 py-5 text-center text-sm font-bold text-slate-700 min-w-[140px] group transition-all hover:bg-sky-50/50">
                      <div className="flex flex-col items-center gap-3">
                        <div className={`p-2 rounded-xl transition-all ${role.name === 'Super Admin' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600 group-hover:scale-110'}`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-slate-900">{translateRole(role.name)}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            onClick={() => openPermissionModal(role)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider ${role.name === 'Super Admin'
                                ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                                : 'text-sky-600 bg-white border border-sky-100 hover:bg-sky-500 hover:text-white hover:border-sky-500 shadow-sm'
                              }`}
                            disabled={role.name === 'Super Admin'}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          {!['Super Admin', 'Staff', 'HRD', 'GA Legal', 'Finance', 'GM', 'Director'].includes(role.name) && (
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                              title="Hapus Role"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupPermissions(permissions)).map(([group, groupPerms]: [string, any]) => {
                  const filteredGroupPerms = groupPerms.filter((p: string) =>
                    p.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    translatePermission(p).toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredGroupPerms.length === 0) return null;

                  return (
                    <React.Fragment key={group}>
                      <tr className="bg-slate-50/80">
                        <td colSpan={roles.length + 1} className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-500">
                              {getGroupIcon(group)}
                            </div>
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
                              {group}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {filteredGroupPerms.map((permission: string, idx: number) => (
                        <motion.tr
                          key={permission}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-sky-50/20 group transition-all border-b border-slate-50/50"
                        >
                          <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 transition-colors group-hover:bg-sky-50/30">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{translatePermission(permission)}</span>
                              <span className="text-[10px] text-slate-500 font-mono font-medium opacity-80">{permission}</span>
                            </div>
                          </td>
                          {roles.map((role) => {
                            const hasPermission = role.permissions.some((p: any) => p.name === permission);
                            return (
                              <td key={role.id} className="px-4 py-4 text-center transition-all group-hover:bg-sky-50/10">
                                <div className="flex justify-center">
                                  {hasPermission ? (
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200 transition-all hover:scale-110">
                                      <CheckCircle2 size={18} />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-200/50 opacity-40">
                                      <Circle size={14} />
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-Based Matrix */}
          <div className="md:hidden divide-y divide-slate-100">
            {roles.map((role) => (
              <div key={role.id} className="bg-white">
                <div className="p-5 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Shield size={16} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{translateRole(role.name)}</h3>
                  </div>
                  {role.name !== 'Super Admin' && (
                    <button
                      onClick={() => openPermissionModal(role)}
                      className="text-[10px] font-black text-sky-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-sky-100 shadow-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-6">
                  {Object.entries(groupPermissions(permissions)).map(([group, groupPerms]: [string, any]) => (
                    <div key={group} className="space-y-3">
                      <div className="flex items-center gap-2 border-l-4 border-sky-400 pl-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{group}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {groupPerms.map((perm: string) => {
                          const hasP = role.permissions.some((p: any) => p.name === perm);
                          return (
                            <div key={perm} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 border-dashed">
                              <span className="text-[10px] font-bold text-slate-700 leading-tight">{translatePermission(perm)}</span>
                              {hasP ? (
                                <CheckCircle2 size={14} className="text-emerald-500 shadow-sm" />
                              ) : (
                                <Circle size={10} className="text-slate-200" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-500" />
              Deskripsi Peran (Role)
            </h3>
            <div className="space-y-2 text-sm">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start gap-2">
                  <span className="font-semibold text-sky-600 min-w-[120px]">{translateRole(role.name)}:</span>
                  <span className="text-slate-600">{getRoleDescription(role.name)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-3">Deskripsi Hak Akses (Permission)</h3>
            <div className="space-y-2 text-sm">
              {permissions.map((permission) => (
                <div key={permission} className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700">{translatePermission(permission)} <span className="text-[10px] text-slate-400 font-mono italic ml-2">({permission})</span></span>
                  <span className="text-slate-500 text-xs">{getPermissionDescription(permission)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Editor Modal */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={closePermissionModal}
        title={`Edit Hak Akses: ${editingRole?.name || ''}`}
        size="lg"
      >
        <form onSubmit={handlePermissionSubmit} className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-sm text-sky-800">
              <p className="font-semibold mb-1">Panduan Edit Permission:</p>
              <ul className="list-disc list-inside space-y-1 text-sky-700">
                <li>Centang permission yang ingin diberikan ke role ini</li>
                <li>Minimal harus ada 1 permission yang dipilih</li>
                <li>Perubahan akan dicatat dalam audit log</li>
              </ul>
            </div>
          </div>

          <div className="space-y-10 max-h-[550px] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-sky-300 transition-colors">
            {Object.entries(groupPermissions(permissions)).map(([group, groupPerms]: [string, any]) => {
              const filteredGroupPerms = groupPerms.filter((p: string) =>
                p.toLowerCase().includes(searchQuery.toLowerCase()) ||
                translatePermission(p).toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredGroupPerms.length === 0) return null;

              return (
                <div key={group} className="relative">
                  <div className="flex items-center gap-3 mb-5 sticky top-0 bg-white py-2 z-10 border-b border-slate-100">
                    <div className="p-2 bg-sky-50 rounded-xl text-sky-600 shadow-sm">
                      {getGroupIcon(group)}
                    </div>
                    <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">{group}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGroupPerms.map((permission: string) => {
                      const isSelected = selectedPermissions.includes(permission);
                      return (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          key={permission}
                          onClick={() => togglePermission(permission)}
                          className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm ${isSelected
                              ? 'border-sky-500 bg-sky-50/50 ring-4 ring-sky-500/5'
                              : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                            }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isSelected ? (
                              <div className="w-7 h-7 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 transition-all group-hover:rotate-12">
                                <CheckCircle2 size={18} />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-xl border-2 border-slate-100 bg-slate-50 group-hover:border-slate-300 group-hover:bg-white transition-all" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-black text-[15px] leading-tight mb-1.5 ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                              {translatePermission(permission)}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] text-slate-600 font-mono font-bold tracking-tight uppercase border border-slate-200 group-hover:bg-slate-200 transition-colors">
                                {permission}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed transition-colors ${isSelected ? 'text-sky-700/80' : 'text-slate-500 font-medium'}`}>
                              {getPermissionDescription(permission)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closePermissionModal}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || selectedPermissions.length === 0}
              className="px-10 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Role Modal */}
      <Modal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        title="Tambah Role Baru"
        size="md"
      >
        <form onSubmit={handleCreateRole} className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-800 leading-relaxed">
              Buat peran baru untuk mengelompokkan hak akses tertentu. Setelah dibuat, Anda dapat mengatur permission secara detail melalui matriks utama.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Role</label>
            <input
              type="text"
              required
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Compliance Officer"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-50 focus:border-sky-500 outline-none transition-all font-medium text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddRoleModalOpen(false)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={addingRole || !newRoleName.trim()}
              className="px-8 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-lg disabled:opacity-50 transition-all text-sm flex items-center gap-2"
            >
              {addingRole ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={18} />}
              Buat Role
            </button>
          </div>
        </form>
      </Modal>
    </Shell>
  );
}

function groupPermissions(permissions: string[]) {
  const groups: Record<string, string[]> = {
    'Pengajuan (Submissions)': [
      'create submissions',
      'view submissions',
      'delete submissions',
      'complete submissions',
      'request attachments'
    ],
    'Persetujuan (Approvals)': [
      'approve submissions',
      'reject submissions'
    ],
    'Keuangan & Realisasi (Finance)': [
      'manage realizations',
      'view reports',
      'proxy director signature'
    ],
    'Master Data & Sistem (Admin)': [
      'manage master data',
      'manage employees',
      'manage users',
      'manage signatures'
    ]
  };

  const categorized: Record<string, string[]> = {};
  Object.entries(groups).forEach(([name, perms]) => {
    categorized[name] = permissions.filter(p => perms.includes(p));
  });

  // Oher/Uncategorized
  const uncategorized = permissions.filter(p => !Object.values(groups).flat().includes(p));
  if (uncategorized.length > 0) {
    categorized['Lainnya'] = uncategorized;
  }

  return categorized;
}

function getGroupIcon(groupName: string) {
  if (groupName.includes('Pengajuan')) return <ClipboardList className="w-4 h-4" />;
  if (groupName.includes('Persetujuan')) return <PenTool className="w-4 h-4" />;
  if (groupName.includes('Keuangan')) return <Wallet className="w-4 h-4" />;
  if (groupName.includes('Master')) return <Settings className="w-4 h-4" />;
  return <LayoutGrid className="w-4 h-4" />;
}

function getRoleDescription(roleName: string): string {
  const descriptions: Record<string, string> = {
    'Staff': 'Karyawan umum yang dapat membuat dan melihat pengajuan anggaran',
    'HRD': 'Human Resource Development - Menyetujui pengajuan terkait SDM',
    'GA Legal': 'General Affairs & Legal - Menyetujui pengajuan administrasi dan hukum',
    'Finance': 'Keuangan - Menyetujui pengajuan dan dapat menggunakan tanda tangan proxy Director',
    'GM': 'General Manager - Menyetujui pengajuan level manajerial',
    'Director': 'Direktur - Persetujuan tertinggi untuk semua pengajuan',
    'Super Admin': 'Administrator sistem dengan akses penuh ke semua fitur termasuk manajemen user'
  };
  return descriptions[roleName] || 'Tidak ada deskripsi';
}

function translateRole(role: string): string {
  const mapping: Record<string, string> = {
    'Staff': 'Staff/Karyawan',
    'HRD': 'HRD',
    'GA Legal': 'GA & Legal',
    'Finance': 'Keuangan',
    'GM': 'General Manager',
    'Director': 'Direktur',
    'Super Admin': 'Super Admin'
  };
  return mapping[role] || role;
}

function translatePermission(permission: string): string {
  const mapping: Record<string, string> = {
    'create submissions': 'Buat Pengajuan',
    'view submissions': 'Lihat Pengajuan',
    'approve submissions': 'Setujui Pengajuan',
    'reject submissions': 'Tolak Pengajuan',
    'manage signatures': 'Kelola Tanda Tangan',
    'manage users': 'Kelola User',
    'view reports': 'Lihat Laporan',
    'proxy director signature': 'Proxy Tanda Tangan Direktur',
    'manage master data': 'Kelola Data Master',
    'manage employees': 'Kelola Data Karyawan',
    'manage realizations': 'Kelola Realisasi',
    'complete submissions': 'Selesaikan Pengajuan',
    'delete submissions': 'Hapus Pengajuan',
    'request attachments': 'Minta Lampiran'
  };
  return mapping[permission] || permission;
}

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    'create submissions': 'Membuat pengajuan anggaran baru',
    'view submissions': 'Melihat daftar dan detail pengajuan',
    'approve submissions': 'Menyetujui pengajuan anggaran',
    'reject submissions': 'Menolak pengajuan anggaran',
    'manage signatures': 'Mengelola tanda tangan digital (upload/canvas)',
    'manage users': 'Mengelola user sistem (CRUD, assign role)',
    'view reports': 'Melihat laporan dan export PDF',
    'proxy director signature': 'Menggunakan tanda tangan Director sebagai proxy (khusus Finance)',
    'manage master data': 'Mengelola Data Master (Divisi, Jenis, UOM, dll)',
    'manage employees': 'Mengelola Data Karyawan',
    'manage realizations': 'Mencatat dan mengelola realisasi anggaran hasil pengajuan',
    'complete submissions': 'Menandai pengajuan selesai secara manual',
    'delete submissions': 'Menghapus data pengajuan (Super Admin Only)',
    'request attachments': 'Meminta lampiran tambahan kepada user tertentu'
  };
  return descriptions[permission] || 'Tidak ada deskripsi';
}

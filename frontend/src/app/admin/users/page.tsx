"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { 
  Users, 
  Shield, 
  FileText,
  Plus, 
  Edit2, 
  Trash2,
  Loader2, 
  Search,
  Briefcase,
  User,
  Mail,
  Lock,
  Save,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [lookups, setLookups] = useState<any>({ divisions: [], roles: [] });
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    division_id: '',
    role: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, lookupsRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles-permissions'),
        api.get('/lookups')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data.roles);
      setPermissions(rolesRes.data.permissions);
      setLookups(lookupsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '',
        division_id: user.division_id || '',
        role: user.roles[0]?.name || '',
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        division_id: '',
        role: '',
      });
    }
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      division_id: '',
      role: '',
    });
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const res = await api.put(`/users/${editingUser.id}`, userForm);
        setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
      } else {
        const res = await api.post('/users', userForm);
        setUsers([...users, res.data]);
      }
      closeUserModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan user');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  const tabs = [
    {
      id: 'users',
      label: 'Daftar User',
      icon: <Users size={18} />,
      badge: users.length,
      content: (
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari user berdasarkan nama atau email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
            <button 
              onClick={() => openUserModal()}
              className="bg-sky-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-600 shadow-lg shadow-sky-100 flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              Tambah User Baru
            </button>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Briefcase size={14} className="text-slate-400" />
                          <span className="text-slate-600 font-medium">{user.division?.name || 'No Division'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield size={14} className="text-sky-500" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 uppercase">
                            {translateRole(user.roles[0]?.name)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openUserModal(user)}
                      className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'roles',
      label: 'Peran & Hak Akses',
      icon: <Shield size={18} />,
      badge: roles.length,
      content: (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-bold text-slate-700 sticky left-0 bg-slate-50 z-10">
                    Hak Akses
                  </th>
                  {roles.map((role) => (
                    <th key={role.id} className="px-4 py-4 text-center text-sm font-bold text-slate-700 min-w-[120px]">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="w-4 h-4 text-sky-500" />
                        <span>{translateRole(role.name)}</span>
                        <Link href={`/admin/roles/${role.id}/edit`}>
                          <button 
                            className={`p-1.5 rounded-lg transition-all text-xs ${
                              role.name === 'Super Admin' 
                                ? 'text-slate-300 cursor-not-allowed bg-slate-100' 
                                : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50 border border-slate-200'
                            }`}
                            disabled={role.name === 'Super Admin'}
                            title={role.name === 'Super Admin' ? 'Super Admin tidak dapat diubah' : `Edit ${role.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((permission) => (
                  <tr key={permission} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 sticky left-0 bg-white z-10 flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-900">{translatePermission(permission)}</span>
                      <span className="text-[10px] text-slate-400 font-mono italic">({permission})</span>
                    </td>
                    {roles.map((role) => {
                      const hasPermission = role.permissions.some((p: any) => p.name === permission);
                      return (
                        <td key={role.id} className="px-4 py-4 text-center">
                          {hasPermission ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: <FileText size={18} />,
      content: (
        <div className="p-6 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Audit Trail Coming Soon</p>
          <p className="text-slate-400 text-sm mt-2">History management user akan ditampilkan di sini</p>
        </div>
      )
    }
  ];

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Manajemen User & Akses</h1>
          <p className="text-slate-500 mt-2">Kelola user, role, permission, dan audit trail dari satu tempat</p>
        </header>

        <Tabs tabs={tabs} defaultTab="users" onChange={setActiveTab} />

        {/* User Form Modal */}
        <Modal 
          isOpen={isUserModalOpen} 
          onClose={closeUserModal}
          title={editingUser ? 'Edit User' : 'Tambah User Baru'}
          size="md"
        >
          <form onSubmit={handleUserSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="e.g. john@hbm.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password {editingUser && <span className="text-slate-400 font-normal ml-1">(Kosongkan jika tidak diubah)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <select 
                    value={userForm.division_id}
                    onChange={(e) => setUserForm({...userForm, division_id: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium appearance-none"
                  >
                    <option value="" className="text-slate-400">Tidak Ada Divisi</option>
                    {lookups.divisions.map((d: any) => <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Peran / Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5 pointer-events-none" />
                  <select 
                    required
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium appearance-none"
                  >
                    <option value="" className="text-slate-400">Pilih Role</option>
                    {lookups.roles.map((r: any) => <option key={r.id} value={r.name} className="text-slate-900">{translateRole(r.name)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={closeUserModal}
                className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-10 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center gap-2 disabled:opacity-70 transition-all"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {editingUser ? 'Perbarui User' : 'Buat User'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
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
    'proxy director signature': 'Proxy Tanda Tangan Direktur'
  };
  return mapping[permission] || permission;
}

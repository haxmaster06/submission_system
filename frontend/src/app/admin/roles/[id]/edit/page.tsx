"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Shield, 
  CheckCircle2,
  Circle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function EditRolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<any>(null);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    try {
      const [roleRes, allRes] = await Promise.all([
        api.get(`/roles/${roleId}`),
        api.get('/roles-permissions')
      ]);
      
      setRole(roleRes.data);
      setAllPermissions(allRes.data.permissions);
      setSelectedPermissions(roleRes.data.permissions.map((p: any) => p.name));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memuat data');
      router.push('/admin/roles');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionName: string) => {
    if (selectedPermissions.includes(permissionName)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPermissions.length === 0) {
      alert('Minimal harus ada 1 permission untuk role ini.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengubah permission untuk role "${role.name}"?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/roles/${roleId}/permissions`, {
        permissions: selectedPermissions
      });
      alert('Permission berhasil diperbarui!');
      router.push('/admin/roles');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  if (!role) return null;

  const isSuperAdmin = role.name === 'Super Admin';

  return (
    <Shell>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 font-medium"
          >
            <ArrowLeft size={18} />
            Kembali ke Daftar Peran
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-sky-500" />
            <h1 className="text-3xl font-bold text-slate-900">Edit Hak Akses: {role.name}</h1>
          </div>
          <p className="text-slate-500">
            Pilih permission yang ingin diberikan kepada role ini.
          </p>
        </header>

        {isSuperAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Role Super Admin Tidak Dapat Diubah</p>
              <p className="text-red-700">
                Super Admin secara otomatis memiliki semua hak akses dan tidak dapat dimodifikasi untuk menjaga keamanan sistem.
              </p>
            </div>
          </div>
        )}

        {!isSuperAdmin && (
          <>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-sm text-sky-800">
                <p className="font-semibold mb-1">Panduan Edit Permission:</p>
                <ul className="list-disc list-inside space-y-1 text-sky-700">
                  <li>Centang permission yang ingin diberikan ke role ini</li>
                  <li>Minimal harus ada 1 permission yang dipilih</li>
                  <li>Perubahan akan dicatat dalam audit log</li>
                  <li>User dengan role ini akan otomatis mendapatkan permission baru</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 mb-6">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sky-500" />
                  Daftar Permission ({selectedPermissions.length} dari {allPermissions.length} dipilih)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPermissions.map((permission, idx) => {
                    const isSelected = selectedPermissions.includes(permission);
                    return (
                      <motion.div
                        key={permission}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <label 
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-sky-500 bg-sky-50 shadow-sm' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center h-6">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-sky-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${isSelected ? 'text-sky-900' : 'text-slate-700'}`}>
                              {permission}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {getPermissionDescription(permission)}
                            </p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission)}
                            className="sr-only"
                          />
                        </label>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => router.push('/admin/roles')}
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
          </>
        )}

        {isSuperAdmin && (
          <div className="text-center py-12">
            <button 
              onClick={() => router.push('/admin/roles')}
              className="px-8 py-3 rounded-xl bg-slate-500 text-white font-bold hover:bg-slate-600 transition-all"
            >
              Kembali ke Daftar Peran
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
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
    'proxy director signature': 'Menggunakan tanda tangan Director sebagai proxy (khusus Finance)'
  };
  return descriptions[permission] || 'Tidak ada deskripsi';
}

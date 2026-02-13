"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Briefcase 
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function UserFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params.id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [lookups, setLookups] = useState<any>({ divisions: [], roles: [] });
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    division_id: '',
    role: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lookupRes = await api.get('/lookups');
        setLookups(lookupRes.data);

        if (isEdit) {
          const userRes = await api.get(`/users/${params.id}`);
          const user = userRes.data;
          setForm({
            name: user.name,
            email: user.email,
            password: '',
            division_id: user.division_id || '',
            role: user.roles[0]?.name || '',
          });
        }
      } catch (err) {
        console.error(err);
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/users/${params.id}`, form);
      } else {
        await api.post('/users', form);
      }
      router.push('/admin/users');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-sky-500" /></div></Shell>;

  return (
    <Shell>
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 font-medium"
          >
            <ArrowLeft size={18} />
            Back to User List
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{isEdit ? 'Edit User' : 'Add New User'}</h1>
          <p className="text-slate-500 mt-2">
            {isEdit ? 'Update user information and access levels.' : 'Create a new account and assign roles and divisions.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Nama Lengkap"
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
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="cth. john@hbm.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password {isEdit && <span className="text-slate-400 font-normal ml-1">(Kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="password"
                    required={!isEdit}
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Division</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <select 
                      value={form.division_id}
                      onChange={(e) => setForm({...form, division_id: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium appearance-none"
                    >
                      <option value="" className="text-slate-400">No Division</option>
                      {lookups.divisions.map((d: any) => <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role / Access Level</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5 pointer-events-none" />
                    <select 
                      required
                      value={form.role}
                      onChange={(e) => setForm({...form, role: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium appearance-none"
                    >
                      <option value="" className="text-slate-400">Select Role</option>
                      {lookups.roles.map((r: any) => <option key={r.id} value={r.name} className="text-slate-900">{r.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => router.push('/admin/users')}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-10 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-xl shadow-sky-100 flex items-center gap-2 disabled:opacity-70 transition-all"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

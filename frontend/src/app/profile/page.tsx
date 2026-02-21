"use client";

import Shell from '@/components/layout/Shell';
import Tabs from '@/components/ui/Tabs';
import SignatureSettings from '@/components/profile/SignatureSettings';
import PasswordSettings from '@/components/profile/PasswordSettings';
import { User, Shield, Info, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  const tabs = [
    {
      id: 'signature',
      label: 'Tanda Tangan',
      icon: <Shield size={18} />,
      content: <SignatureSettings />
    },
    {
      id: 'account',
      label: 'Informasi Akun',
      icon: <User size={18} />,
      content: (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                <User size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{user?.name}</h3>
                <p className="text-slate-500 font-medium">{user?.roles[0]?.name} • {user?.division?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alamat Email</label>
                <div className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-medium">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Divisi Kerabat</label>
                <div className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-medium">
                  {user?.division?.name} ({user?.division?.code})
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
              <Info className="text-amber-500 shrink-0 mt-1" size={20} />
              <p className="text-sm text-amber-700 leading-relaxed font-medium">
                Untuk pembaruan data akun (Email, Peran, atau Divisi), harap hubungi **Super Admin** atau tim IT melalui sistem pendukung.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Keamanan',
      icon: <Lock size={18} />,
      content: <PasswordSettings />
    }
  ];

  return (
    <Shell>
      <div className="max-w-5xl mx-auto pb-20">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Pengaturan Profil</h1>
          <p className="text-slate-500 mt-3 text-lg">Kelola identitas digital dan preferensi keamanan Anda</p>
        </header>

        <Tabs tabs={tabs} defaultTab="signature" />
      </div>
    </Shell>
  );
}

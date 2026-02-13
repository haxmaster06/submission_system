"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X,
  User,
  Users,
  Shield,
  Bell,
  Settings,
  Database,
  BarChart3,
  GitBranch,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from '@/components/ui/NotificationDropdown';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isApprover = user?.permissions.some(p => p.name === 'view submissions') || 
                     user?.roles.some(r => ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'].includes(r.name));
  
  const isPrivileged = user?.roles.some(r => ['Super Admin', 'Director', 'Finance', 'GM'].includes(r.name));
  
  const isSuperAdmin = user?.roles.some(r => r.name === 'Super Admin');

  const navGroups = [
    {
      group: 'MENU UTAMA',
      items: [
        { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Profil & Tanda Tangan', href: '/profile', icon: Settings },
      ]
    },
    {
      group: 'PENGANGGARAN',
      items: [
        user?.permissions.some(p => p.name === 'create submissions') && { name: 'Buat Pengajuan Baru', href: '/submissions/new', icon: PlusCircle },
        { name: 'Pengajuan Saya', href: '/submissions', icon: FileText },
      ].filter(Boolean)
    },
    isApprover && {
      group: 'KONTROL & PERSETUJUAN',
      items: [
        { name: 'Persetujuan', href: '/approvals', icon: CheckSquare },
      ]
    },
    isPrivileged && {
      group: 'MANAJEMEN DATA',
      items: [
        { name: 'Master Data', href: '/admin/master', icon: Database },
        { name: 'Alur Persetujuan', href: '/admin/approval-flow', icon: GitBranch },
        { name: 'Monitoring Realisasi', href: '/realizations', icon: Receipt },
      ]
    },
    isPrivileged && {
      group: 'LAPORAN',
      items: [
        { name: 'Reporting', href: '/reporting', icon: BarChart3 },
      ]
    },
    isSuperAdmin && {
      group: 'ADMINISTRATOR',
      items: [
        { name: 'Manajemen User', href: '/admin/users', icon: Users },
        { name: 'Peran & Hak Akses', href: '/admin/roles', icon: Shield },
      ]
    }
  ].filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          {isSidebarOpen && <span className="font-bold text-slate-800 truncate">HBM Budgeting</span>}
        </div>

        <nav className="flex-1 px-4 space-y-6 pt-4 overflow-y-auto scrollbar-none pb-8">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1.5">
              {isSidebarOpen && (
                <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {group.group}
                </p>
              )}
              {group.items.map((item: any) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}>
                      <item.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} />
                      {isSidebarOpen && <span className={`font-semibold text-sm ${isActive ? 'text-sky-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{item.name}</span>}
                      {isActive && isSidebarOpen && (
                        <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-sky-500 rounded-full" />
                      )}
                    </div>
                  </Link>
                );
              })}
              {!isSidebarOpen && <div className="h-px bg-slate-100 mx-3 my-4 opacity-50 last:hidden" />}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <NotificationDropdown userId={user?.id || 0} />
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user?.roles[0]?.display_name || user?.roles[0]?.name || 'User'} • {user?.division?.code}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <section className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </section>
      </main>
    </div>
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

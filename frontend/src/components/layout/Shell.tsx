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
  Receipt,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { useNotification } from '@/context/NotificationContext';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { isSupported, isSubscribed, permission, subscribeToPush } = useNotification();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isApprover = user?.permissions.some(p => p.name === 'view submissions') ||
    user?.roles.some(r => ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'].includes(r.name));

  const isSuperAdmin = user?.roles.some(r => r.name === 'Super Admin');

  const isMasterDataAdmin = user?.permissions.some(p => p.name === 'manage master data') || isSuperAdmin;
  const isEmployeeAdmin = user?.permissions.some(p => p.name === 'manage employees') || isSuperAdmin;
  const showManajemenData = isMasterDataAdmin || isEmployeeAdmin;

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
        (isEmployeeAdmin && { name: 'Pengajuan Gaji', href: '/submissions/salary/new', icon: Users }),
        { name: 'Pengajuan Saya', href: '/submissions', icon: FileText },
      ].filter(Boolean)
    },
    isApprover && {
      group: 'KONTROL & PERSETUJUAN',
      items: [
        { name: 'Persetujuan', href: '/approvals', icon: CheckSquare },
      ]
    },
    showManajemenData && {
      group: 'MANAJEMEN DATA',
      items: [
        (isMasterDataAdmin && { name: 'Master Data', href: '/admin/master', icon: Database }),
        (isEmployeeAdmin && { name: 'Data Karyawan', href: '/admin/employees', icon: Users }),
        (isMasterDataAdmin && { name: 'Alur Persetujuan', href: '/admin/approval-flow', icon: GitBranch }),
        (isMasterDataAdmin && { name: 'Monitoring Realisasi', href: '/realizations', icon: Receipt }),
      ].filter(Boolean)
    },
    isMasterDataAdmin && {
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
    },
    {
      group: 'BANTUAN',
      items: [
        { name: 'Panduan Pengguna', href: '/manual', icon: HelpCircle },
      ]
    }
  ].filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] xl:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[70] shadow-2xl xl:hidden flex flex-col"
            >
              <div className="p-8 landscape:p-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-4 landscape:gap-3">
                  <div className="w-12 h-12 landscape:w-8 landscape:h-8 bg-white rounded-2xl landscape:rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-sky-100 border border-white overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1.5 landscape:p-1" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block text-lg landscape:text-sm leading-none">HBM</span>
                    <span className="text-[10px] landscape:text-[8px] font-black text-sky-500 uppercase tracking-[0.2em]">Budgeting</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 landscape:p-1.5 bg-slate-100 text-slate-500 rounded-2xl landscape:rounded-xl hover:bg-slate-200 transition-colors">
                  <X size={20} className="landscape:w-4 landscape:h-4" />
                </button>
              </div>

              <nav className="flex-1 px-5 landscape:px-4 space-y-8 landscape:space-y-4 pt-8 landscape:pt-4 overflow-y-auto custom-scrollbar pb-10 landscape:pb-6">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-3 landscape:space-y-2">
                    <p className="px-4 text-[10px] landscape:text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {group.group}
                    </p>
                    <div className="space-y-1 landscape:space-y-0.5">
                      {group.items.map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <div className={`flex items-center gap-4 landscape:gap-3 px-4 py-4 landscape:py-2.5 rounded-[20px] landscape:rounded-[12px] transition-all ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-500 active:bg-slate-50'}`}>
                              <item.icon className={`w-5 h-5 landscape:w-4 landscape:h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className={`font-bold text-sm landscape:text-xs ${isActive ? 'text-white' : 'text-slate-700'}`}>{item.name}</span>
                              {isActive && <motion.div layoutId="mobile-active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-6 landscape:p-3 border-t border-slate-100 bg-slate-50/30">
                <button onClick={logout} className="w-full flex items-center gap-4 landscape:gap-3 px-4 py-4 landscape:py-2 rounded-[24px] landscape:rounded-[16px] text-red-500 bg-red-50/50 active:bg-red-50 transition-colors">
                  <div className="w-10 h-10 landscape:w-8 landscape:h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <LogOut className="w-5 h-5 landscape:w-4 landscape:h-4 shrink-0" />
                  </div>
                  <span className="font-black text-sm landscape:text-xs uppercase tracking-wider">Keluar</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 hidden xl:flex flex-col ${isSidebarOpen ? 'xl:w-56 2xl:w-64' : 'w-20'}`}>
        <div className="p-4 2xl:p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          {isSidebarOpen && <span className="font-bold text-slate-800 truncate">HBM Budgeting</span>}
        </div>

        <nav className="flex-1 px-3 2xl:px-4 space-y-4 2xl:space-y-6 pt-3 2xl:pt-4 overflow-y-auto scrollbar-none pb-6 2xl:pb-8">
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
                    <div className={`flex items-center gap-3 px-3 py-2 2xl:py-2.5 rounded-xl transition-all group ${isActive ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}>
                      <item.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} />
                      {isSidebarOpen && <span className={`font-semibold text-xs 2xl:text-sm ${isActive ? 'text-sky-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{item.name}</span>}
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
        <header className="h-16 2xl:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 xl:px-6 2xl:px-8 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors shadow-sm active:scale-95"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden xl:block p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationDropdown userId={user?.id || 0} />
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user?.roles[0]?.display_name || user?.roles[0]?.name || 'User'} • {user?.division?.code}</p>
              </div>
              <div className="w-10 h-10 2xl:w-12 2xl:h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
                <User size={24} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 xl:p-5 2xl:p-8 bg-slate-50/50">
          {!user?.signature_path && pathname !== '/profile' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0 shadow-sm border border-amber-200 mt-0.5">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">Perhatian: Pendaftaran Tanda Tangan Digital</h4>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Sistem mendeteksi Anda belum mengatur tanda tangan digital. Harap segera daftarkan tanda tangan Anda di menu <Link href="/profile" className="font-bold underline text-amber-900 hover:text-amber-700 transition-colors">Profil & Tanda Tangan</Link> agar dapat melakukan pengajuan dan persetujuan dokumen.
                </p>
              </div>
            </div>
          )}

          {isSupported && !isSubscribed && permission !== 'denied' && permission !== 'loading' && (
            <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-start gap-4 relative z-10 w-full sm:w-auto">
                <div className="p-2 bg-sky-100 rounded-xl text-sky-600 shrink-0 shadow-sm border border-sky-200 mt-0.5">
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-sky-900 uppercase tracking-tight mb-1">Aktifkan Notifikasi Desktop</h4>
                  <p className="text-xs text-sky-800 leading-relaxed font-medium">
                    Jangan lewatkan pembaruan penting! Izinkan sistem mengirim notifikasi persetujuan (approval) langsung ke layar Anda meskipun aplikasi sedang ditutup.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => subscribeToPush()}
                className="w-full sm:w-auto flex-shrink-0 relative z-10 whitespace-nowrap bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/20 active:scale-95 transition-all"
              >
                Izinkan Sekarang
              </button>
            </div>
          )}

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

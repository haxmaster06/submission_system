"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
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
  HelpCircle,
  Activity,
  Wrench,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Smartphone,
  Eye,
  XCircle,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { useNotification } from '@/context/NotificationContext';

// Global formatter override to dynamically hide or show decimal numbers
if (typeof window !== 'undefined' && !(window as any).__hbm_intl_overridden) {
  (window as any).__hbm_intl_overridden = true;
  const OriginalNumberFormat = window.Intl.NumberFormat;
  
  class CustomNumberFormat extends OriginalNumberFormat {
    constructor(locales?: string | string[], options?: Intl.NumberFormatOptions) {
      let modifiedOptions = options;
      if (localStorage.getItem('hbm_show_decimals') === 'false') {
        if (options) {
          if (options.maximumFractionDigits !== undefined || options.minimumFractionDigits !== undefined || options.style === 'currency') {
            modifiedOptions = {
              ...options,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            };
          }
        } else {
          modifiedOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          };
        }
      }
      super(locales, modifiedOptions);
    }
  }
  
  window.Intl.NumberFormat = CustomNumberFormat as any;
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout, activateSimulation, deactivateSimulation } = useAuth();
  const { isSupported, isSubscribed, permission, subscribeToPush } = useNotification();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDecimals, setShowDecimals] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('hbm_show_decimals');
      setShowDecimals(val !== 'false');
    }
  }, []);

  const handleToggleDecimals = () => {
    const nextVal = !showDecimals;
    localStorage.setItem('hbm_show_decimals', String(nextVal));
    setShowDecimals(nextVal);
    window.location.reload();
  };
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const isApprover = user?.permissions.some(p => p.name === 'view submissions') ||
    user?.roles.some(r => ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'].includes(r.name));

  const isSuperAdmin = user?.roles.some(r => r.name === 'Super Admin') || (user as any)?.original_role === 'Super Admin';
  const isSimulating = (user as any)?.is_simulating === true;
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // Simulation states
  const [showSimDropdown, setShowSimDropdown] = useState(false);
  const [simRoles, setSimRoles] = useState<any[]>([]);
  const [simDivisions, setSimDivisions] = useState<any[]>([]);
  const [simSelectedRole, setSimSelectedRole] = useState('');
  const [simSelectedDivision, setSimSelectedDivision] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const simRef = useRef<HTMLDivElement>(null);

  // Close sim dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (simRef.current && !simRef.current.contains(e.target as Node)) setShowSimDropdown(false);
    };
    if (showSimDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSimDropdown]);

  // Fetch simulation options when dropdown opens
  useEffect(() => {
    if (showSimDropdown && simRoles.length === 0) {
      api.get('/simulation/available-roles').then(res => {
        setSimRoles(res.data.roles || []);
        setSimDivisions(res.data.divisions || []);
      }).catch(console.error);
    }
  }, [showSimDropdown]);

  const handleActivateSimulation = async () => {
    if (!simSelectedRole) return;
    setSimLoading(true);
    try {
      await activateSimulation(simSelectedRole, simSelectedDivision ? parseInt(simSelectedDivision) : undefined);
      setShowSimDropdown(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengaktifkan simulasi');
    } finally {
      setSimLoading(false);
    }
  };

  const handleDeactivateSimulation = async () => {
    setSimLoading(true);
    try {
      await deactivateSimulation();
    } catch (err) {
      alert('Gagal menonaktifkan simulasi');
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      api.get('/maintenance-status').then((res: any) => setIsMaintenance(res.data.maintenance)).catch(() => {});
    }
  }, [isSuperAdmin]);

  const handleToggleMaintenance = async () => {
    const action = isMaintenance ? 'mematikan' : 'MENGAKTIFKAN';
    if (!confirm(`Apakah Anda yakin ingin ${action} Mode Maintenance? \n\nJika aktif, semua user selain Super Admin tidak akan bisa mengakses sistem.`)) return;
    
    setTogglingMaintenance(true);
    try {
      const res = await api.post('/admin/maintenance', { enabled: !isMaintenance });
      setIsMaintenance(res.data.maintenance);
      alert(res.data.message);
    } catch (err) {
      alert('Gagal mengubah status maintenance');
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const isMasterDataAdmin = user?.permissions.some(p => p.name === 'manage master data') || isSuperAdmin;
  const isEmployeeAdmin = user?.permissions.some(p => p.name === 'manage employees') || isSuperAdmin;
  const canManageApprovalFlows = user?.permissions.some(p => p.name === 'manage approval flows') || isSuperAdmin;
  const canMonitorRealizations = user?.permissions.some(p => p.name === 'monitor realizations') || user?.permissions.some(p => p.name === 'manage realizations') || isSuperAdmin;
  const canViewReports = user?.permissions.some(p => p.name === 'view reports') || isSuperAdmin;
  const showManajemenData = isMasterDataAdmin || isEmployeeAdmin || canManageApprovalFlows || canMonitorRealizations;

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
        (canManageApprovalFlows && { name: 'Alur Persetujuan', href: '/admin/approval-flow', icon: GitBranch }),
        (canMonitorRealizations && { name: 'Monitoring Realisasi', href: '/realizations', icon: Receipt }),
      ].filter(Boolean)
    },
    canViewReports && {
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
        { name: 'Mobile Apps', href: '/admin/mobile-apps', icon: Smartphone },
        { name: 'Audit Log', href: '/admin/audit-logs', icon: Activity },
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
                    <span className="text-[10px] landscape:text-[8px] font-black text-sky-500 uppercase tracking-[0.2em] mb-1 block">Budgeting</span>
                    {user && (
                      <div className="mt-1 pt-1 border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">{user.roles?.[0]?.display_name || user.roles?.[0]?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 landscape:p-1.5 bg-slate-100 text-slate-500 rounded-2xl landscape:rounded-xl hover:bg-slate-200 transition-colors self-start">
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
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 hidden xl:flex flex-col sticky top-0 h-screen ${isSidebarOpen ? 'xl:w-72 2xl:w-80' : 'w-24'}`}>
        <div className="p-4 2xl:p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          {isSidebarOpen && <span className="font-bold text-slate-800 truncate">HBM Budgeting</span>}
        </div>

        <nav className="flex-1 px-3 2xl:px-4 space-y-4 2xl:space-y-6 pt-3 2xl:pt-4 overflow-y-auto custom-scrollbar pb-6 2xl:pb-8">
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

        <div className="p-4 border-t border-slate-100 mt-auto space-y-2">
          {isSuperAdmin && (
            <button
              onClick={handleToggleMaintenance}
              disabled={togglingMaintenance}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isMaintenance 
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Wrench className={`w-5 h-5 shrink-0 ${isMaintenance ? 'animate-pulse' : ''}`} />
              {isSidebarOpen && (
                <div className="flex-1 flex justify-between items-center text-sm font-bold">
                  <span>Maintenance</span>
                  {togglingMaintenance ? <Loader2 size={16} className="animate-spin" /> : (isMaintenance ? <ToggleRight size={20} className="text-amber-600" /> : <ToggleLeft size={20} />)}
                </div>
              )}
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <header className="h-16 2xl:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 xl:px-6 2xl:px-8 sticky top-0 z-50">
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
            {/* Simulation Toggle for Super Admin */}
            {(isSuperAdmin && !isSimulating) && (
              <div className="relative" ref={simRef}>
                <button
                  onClick={() => setShowSimDropdown(!showSimDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-100 transition-colors border border-violet-200"
                >
                  <Eye size={14} />
                  <span className="hidden sm:inline">Simulasi Role</span>
                  <ChevronDown size={12} />
                </button>

                <AnimatePresence>
                  {showSimDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-4 space-y-3"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulasi Sebagai</p>
                      <select
                        value={simSelectedRole}
                        onChange={e => setSimSelectedRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="">Pilih Role...</option>
                        {simRoles.map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                      <select
                        value={simSelectedDivision}
                        onChange={e => setSimSelectedDivision(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="">Divisi (Opsional)...</option>
                        {simDivisions.map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <button
                        disabled={!simSelectedRole || simLoading}
                        onClick={handleActivateSimulation}
                        className="w-full py-2.5 bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-violet-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {simLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                        Aktifkan Simulasi
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Decimals Format Toggle */}
            <button
              onClick={handleToggleDecimals}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                showDecimals 
                  ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-sm animate-in fade-in' 
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
              title={showDecimals ? 'Sembunyikan Desimal (.00)' : 'Tampilkan Desimal (.00)'}
            >
              <span className="font-mono font-black">.00</span>
              <span className="hidden md:inline">{showDecimals ? 'Desimal: On' : 'Desimal: Off'}</span>
            </button>

            <NotificationDropdown userId={user?.id || 0} />
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user?.roles[0]?.display_name || user?.roles[0]?.name || 'User'} • {user?.division?.code}</p>
                </div>
                <div className={`w-10 h-10 2xl:w-12 2xl:h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border shadow-sm overflow-hidden transition-all ${isProfileOpen ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200 group-hover:border-slate-300'}`}>
                  <User size={24} className="text-slate-400" />
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {user?.roles[0]?.display_name || user?.roles[0]?.name || 'User'} • {user?.division?.code}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={16} className="text-slate-400" />
                        Profil & Tanda Tangan
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-slate-400" />
                        Beranda
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={() => { setIsProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <section className="flex-1 p-4 sm:p-6 xl:p-5 2xl:p-8 bg-slate-50/50">
          {/* Simulation Banner */}
          {isSimulating && (
            <div className="mb-4 p-3 rounded-2xl bg-violet-50 border-2 border-violet-200 flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl text-violet-600 shrink-0">
                  <Eye size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-violet-800 uppercase tracking-widest">
                    Mode Simulasi Aktif: {(user as any)?.simulated_role}
                    {(user as any)?.simulated_division ? ` • ${(user as any)?.simulated_division?.name}` : ''}
                  </p>
                  <p className="text-[10px] text-violet-500 font-medium">Semua aksi tercatat di audit log dengan penanda [SIM]</p>
                </div>
              </div>
              <button
                onClick={handleDeactivateSimulation}
                disabled={simLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shrink-0"
              >
                {simLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                Kembali ke Super Admin
              </button>
            </div>
          )}

          {!user?.signature_path && pathname !== '/profile' && !isSimulating && (
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

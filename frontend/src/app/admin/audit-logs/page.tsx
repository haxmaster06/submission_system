"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Search, Filter, Calendar, ChevronDown, ChevronRight,
  Loader2, User, Clock, Activity, Shield
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState<any>({ actions: [], models: [] });

  // Filter state
  const [action, setAction] = useState('');
  const [model, setModel] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, action, model, dateFrom, dateTo]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 20 };
      if (action) params.action = action;
      if (model) params.model = model;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (search) params.search = search;

      const { data } = await api.get('/admin/audit-logs', { params });
      setLogs(data.logs.data);
      setPagination(data.logs);
      setFilters(data.filters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const getActionColor = (act: string) => {
    const lower = act.toLowerCase();
    if (lower.includes('create') || lower === 'created') return 'bg-emerald-100 text-emerald-700';
    if (lower.includes('approve')) return 'bg-sky-100 text-sky-700';
    if (lower.includes('reject')) return 'bg-red-100 text-red-700';
    if (lower.includes('delete') || lower.includes('bulk')) return 'bg-red-100 text-red-600';
    if (lower.includes('completed')) return 'bg-violet-100 text-violet-700';
    if (lower.includes('override')) return 'bg-amber-100 text-amber-700';
    if (lower.includes('attachment') || lower.includes('upload')) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-600';
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <Shell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Activity size={20} />
            </div>
            Audit Log
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Riwayat seluruh aktivitas sistem</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari user / ID..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-sky-500 focus:ring-2 focus:ring-sky-50 outline-none"
              />
            </div>

            {/* Action filter */}
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:border-sky-500 outline-none bg-white"
            >
              <option value="">Semua Aksi</option>
              {filters.actions.map((a: string) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {/* Model filter */}
            <select
              value={model}
              onChange={(e) => { setModel(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:border-sky-500 outline-none bg-white"
            >
              <option value="">Semua Model</option>
              {filters.models.map((m: string) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Date from */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:border-sky-500 outline-none"
            />

            {/* Date to */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-sky-500" size={32} />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Activity size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">Belum ada log</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">IP</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log: any) => (
                    <>
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                              <User size={12} className="text-slate-400" />
                            </div>
                            <span className="font-bold text-slate-700 text-xs">{log.user?.name || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-600">{log.model}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">#{log.model_id}</td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ip_address}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {expandedId === log.id ? <ChevronDown size={16} className="text-sky-500" /> : <ChevronRight size={16} className="text-slate-400" />}
                          </button>
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={7} className="px-4 py-4 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4 max-w-4xl">
                              {log.old_data && (
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Lama</p>
                                  <pre className="text-xs bg-white rounded-xl p-3 border border-slate-200 overflow-auto max-h-48 text-slate-600">{JSON.stringify(log.old_data, null, 2)}</pre>
                                </div>
                              )}
                              {log.new_data && (
                                <div>
                                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Data Baru</p>
                                  <pre className="text-xs bg-white rounded-xl p-3 border border-emerald-200 overflow-auto max-h-48 text-slate-600">{JSON.stringify(log.new_data, null, 2)}</pre>
                                </div>
                              )}
                              {!log.old_data && !log.new_data && (
                                <p className="text-xs text-slate-400 italic">Tidak ada data detail</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {logs.map((log: any) => (
                <div key={log.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(log.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User size={12} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{log.user?.name || 'System'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {log.model} #{log.model_id} • IP: {log.ip_address}
                  </p>
                  {(log.old_data || log.new_data) && (
                    <button
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="text-[10px] font-bold text-sky-500 mt-2 flex items-center gap-1"
                    >
                      {expandedId === log.id ? 'Sembunyikan' : 'Lihat Detail'}
                      {expandedId === log.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                  )}
                  {expandedId === log.id && (
                    <div className="mt-2 space-y-2">
                      {log.old_data && (
                        <pre className="text-[10px] bg-slate-50 rounded-xl p-2 border border-slate-200 overflow-auto max-h-32 text-slate-600">{JSON.stringify(log.old_data, null, 2)}</pre>
                      )}
                      {log.new_data && (
                        <pre className="text-[10px] bg-emerald-50 rounded-xl p-2 border border-emerald-200 overflow-auto max-h-32 text-slate-600">{JSON.stringify(log.new_data, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-bold">
                  {pagination.from}-{pagination.to} dari {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          page === p ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {pagination.last_page > 5 && (
                    <>
                      <span className="text-slate-300">...</span>
                      <button
                        onClick={() => setPage(pagination.last_page)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          page === pagination.last_page ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {pagination.last_page}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

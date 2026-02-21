
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, User, Calendar, CreditCard, Printer, Loader2, Trash2, Receipt, History, AlertCircle, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import RealizationForm from '@/components/realizations/RealizationForm';

interface SubmissionDetailViewProps {
  submission: any;
  onClose?: () => void;
  showPrintButton?: boolean;
  onDelete?: () => void;
}

export default function SubmissionDetailView({ submission, onClose, showPrintButton = true, onDelete }: SubmissionDetailViewProps) {
  const [printing, setPrinting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);

  const [realizations, setRealizations] = React.useState<any[]>([]);
  const [loadingRealizations, setLoadingRealizations] = React.useState(false);
  const [showRealizationForm, setShowRealizationForm] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<'detail' | 'realization' | 'logs'>('detail');
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const printIframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (activeTab === 'realization') {
      fetchRealizations();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, submission.id]);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get(`/audit-logs/submissions/${submission.id}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchRealizations = async () => {
    try {
      setLoadingRealizations(true);
      const res = await api.get(`/submissions/${submission.id}/realizations`);
      setRealizations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRealizations(false);
    }
  };

  const privilegedRoles = ['Super Admin', 'Finance', 'GM', 'Director'];
  const canDelete = user?.roles?.some((r: any) => privilegedRoles.includes(r.name));

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/submissions/${submission.id}`);
      setShowDeleteConfirm(false);
      if (onDelete) {
        onDelete();
      } else {
        router.push('/submissions');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengajuan');
      setDeleting(false);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await api.post(`/submissions/${submission.id}/complete`);
      setShowCompleteConfirm(false);
      // Refresh window to reflect status change
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan pengajuan');
      setCompleting(false);
    }
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);

      // Get the signed URL for HTML print view
      const response = await api.get(`/submissions/${submission.id}/print-url`);
      const { url } = response.data;

      if (printIframeRef.current) {
        printIframeRef.current.src = url;
      }
    } catch (err) {
      console.error('Failed to load print preview', err);
      alert('Gagal memuat Print Preview');
    } finally {
      // Small delay to allow iframe to trigger print before re-enabling button
      setTimeout(() => setPrinting(false), 2000);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.get(`/submissions/${submission.id}/export`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Submission-${submission.no_pengajuan}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Gagal mengekspor PDF');
    } finally {
      setExporting(false);
    }
  };

  const getStepStatusIcon = (status: string, isCurrent: boolean) => {
    if (status === 'approved') return <CheckCircle className="text-emerald-500 w-6 h-6" />;
    if (status === 'rejected') return <XCircle className="text-rose-500 w-6 h-6" />;
    if (isCurrent) return <Clock className="text-amber-500 w-6 h-6 animate-pulse" />;
    return <div className="w-6 h-6 rounded-full border-2 border-slate-200" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions if needed */}
      {showPrintButton && (
        <div className="flex justify-end mb-4 gap-3">
          {user?.roles?.some((r: any) => privilegedRoles.includes(r.name)) && submission.final_status === 'approved' && !submission.is_completed && (
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <CheckCircle className="w-4 h-4" />
              Selesaikan
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          )}
          <button
            onClick={handlePrint}
            disabled={printing || exporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-70 border border-slate-200"
          >
            {printing ? <Loader2 className="animate-spin w-4 h-4" /> : <Printer className="w-4 h-4" />}
            Print
          </button>
          <button
            onClick={handleExport}
            disabled={printing || exporting}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-70"
          >
            {exporting ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            Export PDF
          </button>
        </div>
      )}

      <div className="flex border-b border-slate-200 mb-6 gap-8">
        <button
          onClick={() => setActiveTab('detail')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'detail' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Detail Pengajuan
        </button>
        <button
          onClick={() => setActiveTab('realization')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'realization' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Realisasi Anggaran
          {realizations.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-sky-100 text-sky-600 rounded text-[10px]">{realizations.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'logs' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Riwayat Log
        </button>
      </div>

      {activeTab === 'detail' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upper Section: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{submission.no_pengajuan}</h1>
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{submission.jenis_pengajuan?.name}</p>
                </div>
                <div className="md:text-right w-full md:w-auto p-4 md:p-0 bg-slate-50 md:bg-transparent rounded-2xl border border-slate-100 md:border-0 shadow-inner md:shadow-none">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em] mb-2 leading-none">TOTAL ANGGARAN</p>
                  <p className="text-3xl font-black text-sky-600 font-mono tracking-tighter leading-none whitespace-nowrap">Rp {parseFloat(submission.total).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm border border-white">
                    <User className="text-slate-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Pengaju</p>
                    <p className="text-[11px] font-black text-slate-900 line-clamp-1">{submission.user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm border border-white">
                    <CreditCard className="text-slate-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Divisi</p>
                    <p className="text-[11px] font-black text-slate-900 line-clamp-1">{submission.division?.name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm border border-white">
                    <Calendar className="text-slate-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Tanggal</p>
                    <p className="text-[11px] font-black text-slate-900">{new Date(submission.tanggal_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] ml-1">Judul Pengajuan</h3>
                <div className="bg-slate-50/50 p-5 rounded-[24px] text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-50 shadow-inner">
                  {submission.description}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-8 h-fit">
              <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 ml-1">Approval Timeline</h3>
              <div className="space-y-6 relative">
                <div className="absolute left-[9px] top-1.5 bottom-1.5 w-0.5 bg-slate-50" />
                {submission.approvals?.sort((a: any, b: any) => a.step_order - b.step_order).map((approval: any) => {
                  const isCurrent = submission.current_approval_step === approval.step_order && submission.final_status === 'pending';
                  const isDone = approval.status !== 'pending';
                  return (
                    <div key={approval.id} className="relative flex gap-4">
                      <div className="bg-white relative z-10 p-0.5 scale-75 -ml-1">
                        {getStepStatusIcon(approval.status, isCurrent)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[11px] font-black uppercase tracking-tight ${isCurrent ? 'text-amber-600' : 'text-slate-900'}`}>{approval.role_name}</p>
                          {approval.approved_at && (
                            <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest">
                              {new Date(approval.approved_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{isDone ? `By ${approval.approver?.name.split(' ')[0]}` : 'Waiting...'}</p>
                        {approval.notes && (
                          <div className="mt-2 text-[10px] text-slate-500 font-bold bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 italic">"{approval.notes}"</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Budget Items Breakdown - Full Width Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100 text-sky-600"><CreditCard size={20} /></div>
                    Budget Items Breakdown
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 ml-13">Perincian item anggaran yang diajukan.</p>
                </div>
              </div>

              {submission.items && submission.items.length > 0 ? (
                <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-inner">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]">Description</th>
                          <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Qty</th>
                          <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">UoM</th>
                          <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Unit Price</th>
                          <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-56">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {submission.items.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 text-[14px] font-bold text-slate-700 leading-relaxed">{item.description}</td>
                            <td className="px-6 py-5 text-right font-black text-slate-900 text-[14px]">{parseFloat(item.qty).toLocaleString('id-ID')}</td>
                            <td className="px-6 py-5 text-center text-slate-500 font-bold text-xs uppercase">{item.uom?.code || item.uom?.name}</td>
                            <td className="px-6 py-5 text-right font-bold text-slate-900 text-[14px] whitespace-nowrap">Rp {parseFloat(item.nominal).toLocaleString('id-ID')}</td>
                            <td className="px-6 py-5 text-right font-black text-sky-600 text-[15px] whitespace-nowrap">Rp {parseFloat(item.total).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-sky-50 border-t-2 border-sky-100">
                        <tr>
                          <td colSpan={4} className="px-8 py-8 text-right font-black text-slate-400 uppercase text-[11px] tracking-widest whitespace-nowrap">Grand Total:</td>
                          <td className="px-8 py-8 text-right font-black text-sky-600 text-3xl tracking-tight whitespace-nowrap">Rp {parseFloat(submission.total).toLocaleString('id-ID')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="md:hidden divide-y divide-slate-100">
                    {submission.items.map((item: any) => (
                      <div key={item.id} className="p-5 space-y-4 active:bg-slate-50 transition-colors bg-white">
                        <h4 className="font-black text-slate-900 text-sm leading-tight uppercase tracking-tight line-clamp-2">{item.description}</h4>
                        <div className="flex items-end justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Price x Qty</p>
                            <p className="text-xs font-bold text-slate-600">
                              <span className="font-black text-slate-900">Rp {parseFloat(item.nominal).toLocaleString('id-ID')}</span>
                              <span className="text-[10px] text-slate-300 mx-1.5 font-black">X</span>
                              <span className="font-black text-slate-900">{parseFloat(item.qty).toLocaleString('id-ID')}</span>
                              <span className="text-[9px] font-black text-slate-300 ml-1 uppercase">{item.uom?.code || item.uom?.name}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Subtotal</p>
                            <p className="text-lg font-black text-sky-600 tracking-tighter leading-none">Rp {parseFloat(item.total).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-sky-50/50 p-6 flex items-center justify-between border-t border-sky-100 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GRAND TOTAL</span>
                      <span className="text-2xl font-black text-sky-600 tracking-normal font-mono leading-none whitespace-nowrap ml-4">Rp {parseFloat(submission.total).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-xl">
                  <div className="flex items-center justify-between py-5 border-b border-slate-100">
                    <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Quantity ({submission.uom?.code})</span>
                    <span className="text-slate-900 font-black text-lg">{parseFloat(submission.qty).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between py-5 border-b border-slate-100">
                    <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Nominal per unit</span>
                    <span className="text-slate-900 font-black text-xl">Rp {parseFloat(submission.nominal).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between py-8">
                    <span className="text-sky-600 font-black uppercase text-xs tracking-[0.3em]">Total Grand</span>
                    <span className="text-sky-600 font-black text-3xl">Rp {parseFloat(submission.total).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {submission.notes && (
                <div className="mt-8 pt-6 md:pt-8 border-t border-slate-100 space-y-3">
                  <h3 className="text-[9px] font-black text-amber-600 uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    Catatan
                  </h3>
                  <div className="bg-amber-50/50 p-6 md:p-8 rounded-[32px] text-sm font-bold text-amber-900 leading-relaxed whitespace-pre-wrap border border-amber-200 shadow-inner border-l-4 border-l-amber-500">
                    {submission.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : activeTab === 'realization' ? (
        /* Realization Tab Content */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Realisasi</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pencatatan penggunaan aktual dana pengajuan.</p>
            </div>
            {user?.roles?.some((r: any) => r.name === 'Finance' || r.name === 'Super Admin') && submission.final_status === 'approved' && (
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-50 active:scale-95"
                onClick={() => setShowRealizationForm(true)}
              >
                <Plus size={16} />
                Baru
              </button>
            )}
          </div>

          {loadingRealizations ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" /> Memuat data...
            </div>
          ) : realizations.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Receipt className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-medium">Belum ada data realisasi untuk pengajuan ini.</p>
              {submission.final_status !== 'approved' && (
                <p className="text-xs text-slate-400 mt-2 italic flex items-center justify-center gap-1">
                  <AlertCircle size={12} /> Realisasi hanya tersedia setelah pengajuan disetujui.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {realizations.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                        <History className="text-sky-500" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Realisasi Tgl {new Date(r.realization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-slate-400">{r.notes || 'Tidak ada catatan'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Realisasi</p>
                      <p className="text-lg font-bold text-sky-600 font-mono">Rp {parseFloat(r.details.reduce((acc: number, d: any) => acc + parseFloat(d.total), 0)).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3 text-center w-24">Qty</th>
                            <th className="px-6 py-3 text-right w-40">Nominal</th>
                            <th className="px-6 py-3 text-right w-60">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {r.details.map((d: any) => (
                            <tr key={d.id} className="text-slate-600 hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{d.item_name}</td>
                              <td className="px-6 py-4 text-center font-black text-slate-900">{parseFloat(d.qty).toLocaleString('id-ID')}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-700">Rp {parseFloat(d.nominal).toLocaleString('id-ID')}</td>
                              <td className="px-6 py-4 text-right font-black text-emerald-600">Rp {parseFloat(d.total).toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden divide-y divide-slate-50">
                      {r.details.map((d: any) => (
                        <div key={d.id} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
                          <h5 className="font-black text-slate-900 text-xs uppercase tracking-tight">{d.item_name}</h5>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-500">
                              <span className="font-black">{parseFloat(d.qty).toLocaleString('id-ID')}</span>
                              <span className="mx-1 text-slate-300">x</span>
                              <span className="font-black text-slate-800">Rp {parseFloat(d.nominal).toLocaleString('id-ID')}</span>
                            </p>
                            <p className="text-sm font-black text-emerald-600 tracking-tighter">Rp {parseFloat(d.total).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Audit Log Tab Content */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Aktivitas</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Jejak rekam perubahan data pengajuan.</p>
            </div>
          </div>

          {loadingLogs ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" /> Memuat data log...
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <History className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-medium">Belum ada riwayat aktivitas tercatat.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pl-8 py-2">
              {logs.map((log, idx) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-2 border-sky-500 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{log.user?.name || 'Sistem'}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                          {log.action}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Changes Details */}
                    {log.details && (
                      <div className="mt-3 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                        {Object.entries(log.details).map(([key, val]: [string, any]) => (
                          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                            <span className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">{key.replace('_', ' ')}</span>
                            <div className="sm:col-span-2 text-slate-700 font-medium break-all">
                              <span className="text-slate-400 line-through mr-2">{String(val.old || '-')}</span>
                              <span className="text-emerald-600 font-bold">→ {String(val.new || '-')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!log.details && (
                      <p className="text-xs text-slate-500 italic">Melakukan aktivitas {log.action.toLowerCase()} pada pengajuan ini.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
      }

      <iframe
        ref={printIframeRef}
        style={{ width: 0, height: 0, position: 'absolute', border: 'none', visibility: 'hidden' }}
        title="print-frame"
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="text-red-500" size={22} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Hapus Pengajuan?</h3>
                <p className="text-slate-500 text-sm mb-2">
                  <span className="font-semibold text-slate-700">{submission.no_pengajuan}</span>
                </p>
                <p className="text-slate-400 text-xs mb-6">
                  Data pengajuan, item, approval, dan lampiran akan dihapus permanen.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />}
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompleteConfirm(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-emerald-500" size={22} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Selesaikan Pengajuan?</h3>
                <p className="text-slate-500 text-sm mb-2">
                  <span className="font-semibold text-slate-700">{submission.no_pengajuan}</span>
                </p>
                <p className="text-slate-400 text-xs mb-6 px-4">
                  Pengajuan yang diselesaikan tidak akan muncul lagi di daftar Urgensi Dashboard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompleteConfirm(false)}
                    disabled={completing}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={14} />}
                    Ya, Selesai
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRealizationForm && (
          <RealizationForm
            submission={submission}
            onClose={() => setShowRealizationForm(false)}
            onSuccess={() => {
              setShowRealizationForm(false);
              fetchRealizations();
            }}
          />
        )}
      </AnimatePresence>
    </div >
  );
}

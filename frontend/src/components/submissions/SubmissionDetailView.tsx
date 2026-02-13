
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
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{submission.no_pengajuan}</h1>
                <p className="text-slate-500 mt-1">{submission.jenis_pengajuan?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-sky-600 font-mono">Rp {parseFloat(submission.total).toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 py-6 border-y border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                  <User className="text-slate-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Submitter</p>
                  <p className="text-sm font-bold text-slate-700">{submission.user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Calendar className="text-slate-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date Submitted</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(submission.tanggal_pengajuan).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Description</h3>
              <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                {submission.description}
              </div>
            </div>
          </div>

          {/* Budget Items Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <CreditCard size={14} className="text-sky-500" />
               Budget Items Breakdown
             </h3>
             
             {submission.items && submission.items.length > 0 ? (
               <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                 <table className="w-full min-w-[600px]">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                       <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Description</th>
                       <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase w-24">Qty</th>
                       <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase w-24">UoM</th>
                       <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase w-40">Unit Price</th>
                       <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase w-40">Total</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {submission.items.map((item: any) => (
                       <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-4 py-3 text-slate-700">{item.description}</td>
                         <td className="px-4 py-3 text-right font-medium text-slate-900">{parseFloat(item.qty).toLocaleString('id-ID')}</td>
                         <td className="px-4 py-3 text-center text-slate-600 text-sm">{item.uom?.code || item.uom?.name}</td>
                         <td className="px-4 py-3 text-right font-bold text-slate-900">Rp {parseFloat(item.nominal).toLocaleString('id-ID')}</td>
                         <td className="px-4 py-3 text-right font-black text-sky-600">Rp {parseFloat(item.total).toLocaleString('id-ID')}</td>
                       </tr>
                     ))}
                   </tbody>
                   <tfoot className="bg-sky-50 border-t-2 border-sky-500">
                     <tr>
                       <td colSpan={4} className="px-4 py-4 text-right font-black text-slate-800 uppercase text-sm tracking-wider">
                         Grand Total:
                       </td>
                       <td className="px-4 py-4 text-right font-black text-sky-600 text-xl whitespace-nowrap" >
                         Rp {parseFloat(submission.total).toLocaleString('id-ID')}
                       </td>
                     </tr>
                   </tfoot>
                 </table>
               </div>
             ) : (
               /* Legacy single item display for old submissions */
               <>
                 <div className="flex items-center justify-between py-4 border-b border-slate-50">
                   <span className="text-slate-500 font-medium">Quantity ({submission.uom?.code})</span>
                   <span className="text-slate-900 font-black">{parseFloat(submission.qty).toLocaleString('id-ID')}</span>
                 </div>
                 <div className="flex items-center justify-between py-4 border-b border-slate-50">
                   <span className="text-slate-500 font-medium">Nominal per unit</span>
                   <span className="text-slate-900 font-black text-lg">Rp {parseFloat(submission.nominal).toLocaleString('id-ID')}</span>
                 </div>
                 <div className="flex items-center justify-between py-4 pt-6">
                   <span className="text-sky-600 font-black uppercase text-sm tracking-widest">Total Grand</span>
                   <span className="text-sky-600 font-black text-2xl">Rp {parseFloat(submission.total).toLocaleString('id-ID')}</span>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Stepper / Timeline */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 h-fit">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Approval Timeline</h3>
              <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

                {submission.approvals?.sort((a:any, b:any) => a.step_order - b.step_order).map((approval: any) => {
                  const isCurrent = submission.current_approval_step === approval.step_order && submission.final_status === 'pending';
                  const isDone = approval.status !== 'pending';
                  
                  return (
                    <div key={approval.id} className="relative flex gap-4">
                      <div className="bg-white relative z-10 p-0.5">
                        {getStepStatusIcon(approval.status, isCurrent)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isCurrent ? 'text-amber-600' : 'text-slate-800'}`}>
                          {approval.role_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {isDone ? `Approved by ${approval.approver?.name || 'User'}` : 'Waiting Approval'}
                        </p>
                        {approval.notes && (
                          <div className="mt-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 italic">
                            "{approval.notes}"
                          </div>
                        )}
                        {approval.approved_at && (
                          <p className="text-[9px] text-slate-300 mt-2 font-bold uppercase tracking-widest">
                            {new Date(approval.approved_at).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
      ) : (
        /* Realization Tab Content */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Riwayat Realisasi</h2>
              <p className="text-sm text-slate-500">Pencatatan penggunaan aktual dari pengajuan ini.</p>
            </div>
            {user?.roles?.some((r: any) => r.name === 'Finance' || r.name === 'Super Admin') && submission.final_status === 'approved' && (
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                onClick={() => setShowRealizationForm(true)}
              >
                <Plus size={18} />
                Tambah Realisasi
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
                             Realisasi Tgl {new Date(r.realization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-slate-400">{r.notes || 'Tidak ada catatan'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Realisasi</p>
                        <p className="text-lg font-bold text-sky-600 font-mono">Rp {parseFloat(r.details.reduce((acc: number, d: any) => acc + parseFloat(d.total), 0)).toLocaleString('id-ID')}</p>
                      </div>
                   </div>
                   
                   <div className="overflow-hidden rounded-xl border border-slate-100">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <tr>
                               <th className="px-4 py-2">Item</th>
                               <th className="px-4 py-2 text-center">Qty</th>
                               <th className="px-4 py-2 text-right">Nominal</th>
                               <th className="px-4 py-2 text-right">Total</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {r.details.map((d: any) => (
                               <tr key={d.id} className="text-slate-600">
                                  <td className="px-4 py-3 font-medium">{d.item_name}</td>
                                  <td className="px-4 py-3 text-center">{parseFloat(d.qty).toLocaleString('id-ID')}</td>
                                  <td className="px-4 py-3 text-right">Rp {parseFloat(d.nominal).toLocaleString('id-ID')}</td>
                                  <td className="px-4 py-3 text-right font-bold text-slate-800">Rp {parseFloat(d.total).toLocaleString('id-ID')}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
    </div>
  );
}

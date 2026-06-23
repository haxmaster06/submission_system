"use client";

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { Loader2, Send, User, CheckCircle } from 'lucide-react';

interface RequestAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number;
  /** If provided, the requester is an Approver — lock target to submission owner */
  lockedTarget?: { id: number; name: string } | null;
  onSuccess?: () => void;
}

export default function RequestAttachmentModal({
  isOpen,
  onClose,
  submissionId,
  lockedTarget,
  onSuccess
}: RequestAttachmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      setDescription('');

      if (lockedTarget) {
        // Approver mode: auto-select submission owner
        setSelectedUserId(String(lockedTarget.id));
      } else {
        // Owner mode: fetch all selectable users
        setSelectedUserId('');
        fetchSelectableUsers();
      }
    }
  }, [isOpen, lockedTarget]);

  const fetchSelectableUsers = async () => {
    try {
      setFetchingUsers(true);
      const res = await api.get('/users/selectable');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !description.trim()) {
      setError('Pilih user dan isi deskripsi berkas!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/attachment-requests', {
        submission_id: submissionId,
        target_user_id: selectedUserId,
        file_description: description.trim()
      });
      
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      // Reset form but don't close yet if we want to show success
      setSelectedUserId(lockedTarget ? String(lockedTarget.id) : '');
      setDescription('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Minta Lampiran Baru"
      size="md"
    >
        {isSuccess ? (
          <div className="py-8 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-xl shadow-emerald-50/50">
              <CheckCircle size={40} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Permintaan Terkirim!</h3>
              <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-[280px]">
                {lockedTarget
                  ? `Permintaan telah dikirim ke ${lockedTarget.name}. Silakan tunggu berkas diunggah.`
                  : 'Silakan tunggu user target untuk mengunggah berkas yang diminta.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all border-b-4 border-slate-700 shadow-xl shadow-slate-100"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-widest animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {lockedTarget ? 'Ditujukan Kepada' : 'Pilih User Penerima'}
                </label>

                {lockedTarget ? (
                  /* Approver mode: show locked target (read-only) */
                  <div className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl p-4 pl-12 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500">
                      <User size={18} />
                    </div>
                    <span className="font-black text-sky-600">{lockedTarget.name}</span>
                    <span className="text-[9px] ml-2 text-slate-400 font-black uppercase tracking-widest">Pembuat Pengajuan</span>
                  </div>
                ) : (
                  /* Owner mode: show user dropdown */
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                      <User size={18} />
                    </div>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      disabled={fetchingUsers}
                      className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 block p-4 pl-12 transition-all outline-none appearance-none disabled:opacity-50"
                    >
                      <option value="">Pilih User...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.division?.name || 'No Division'})
                        </option>
                      ))}
                    </select>
                    {fetchingUsers && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-sky-500" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Deskripsi Berkas yang Diminta
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Invoice Hotel, Tiket Pesawat, dll..."
                  className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 block p-4 transition-all outline-none min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || (!lockedTarget && fetchingUsers)}
                className="flex-3 py-4 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group border-b-4 border-sky-700/30"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                    Kirim Permintaan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
    </Modal>
  );
}

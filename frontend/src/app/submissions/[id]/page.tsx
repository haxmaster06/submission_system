"use client";

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, CornerDownRight, User, Calendar, CreditCard } from 'lucide-react';

import SubmissionDetailView from '@/components/submissions/SubmissionDetailView';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/submissions/${id}`)
      .then(res => {
        setSubmission(res.data);
      })
      .catch(err => {
        console.error('Error fetching submission:', err);
        setError('Pengajuan tidak ditemukan atau telah dihapus.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
    </div>
  );

  if (error) return (
    <Shell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <XCircle size={48} className="mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Terjadi Kesalahan</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <div className="max-w-5xl mx-auto pb-12">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
          <span>Submissions</span>
          <CornerDownRight size={14} />
          <span className="font-semibold text-slate-600">{submission?.no_pengajuan}</span>
        </div>

        <SubmissionDetailView submission={submission} showPrintButton={true} />
      </div>
    </Shell>
  );
}

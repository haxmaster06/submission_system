"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Shell from '@/components/layout/Shell';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/submissions?view=${id}`);
    }
  }, [id, router]);

  return (
    <Shell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-sky-500" />
          <p className="font-medium">Mengalihkan ke tampilan detail...</p>
        </div>
      </div>
    </Shell>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
  per_page: number;
}

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { current_page, last_page, from, to, total } = pagination;

  if (last_page <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const delta = 2; // pages around current

    if (last_page <= 7) {
      for (let i = 1; i <= last_page; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, current_page - delta);
      const end = Math.min(last_page - 1, current_page + delta);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < last_page - 1) pages.push('...');
      pages.push(last_page);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
      <p className="text-xs text-slate-500 font-bold">
        Menampilkan <span className="text-slate-700">{from ?? 0}–{to ?? 0}</span> dari <span className="text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                current_page === p
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

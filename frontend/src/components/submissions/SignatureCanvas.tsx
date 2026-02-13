"use client";

import React, { useRef, useState, useEffect } from 'react';

interface SignatureCanvasProps {
  onSave: (base64: string) => void;
  onClear: () => void;
}

export default function SignatureCanvas({ onSave, onClear }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      offsetX: (clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-slate-300 rounded-2xl bg-white cursor-crosshair overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          style={{ touchAction: 'none' }}
          className="w-full h-[200px] block touch-none"
        />
        <div className="absolute top-4 left-4 pointer-events-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 px-2 py-1 rounded shadow-sm">Area Tanda Tangan Digital</p>
        </div>
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-2"
      >
        <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">✕</span>
        Hapus Tanda Tangan
      </button>
    </div>
  );
}

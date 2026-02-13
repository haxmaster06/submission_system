"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'left' | 'right';
}

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  position = 'right'
}: DrawerProps) {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const slideAnimation = {
    initial: position === 'right' ? { x: '100%' } : { x: '-100%' },
    animate: { x: 0 },
    exit: position === 'right' ? { x: '100%' } : { x: '-100%' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={slideAnimation.initial}
            animate={slideAnimation.animate}
            exit={slideAnimation.exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full w-full ${sizeClasses[size]} bg-white shadow-2xl z-50 flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

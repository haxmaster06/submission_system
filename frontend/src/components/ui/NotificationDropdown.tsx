"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import echo from '@/lib/echo';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    link?: string;
    title?: string;
    status?: string;
    created_at?: string;
  };
  read_at: string | null;
  created_at: string;
}

export default function NotificationDropdown({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Setup Realtime Listener
    if (userId) {

      const channel = echo.private(`App.Models.User.${userId}`);

      channel.notification((notification: any) => {


        // Reverb/Pusher notification payload structure might vary
        // Local fallback if data is nested
        const notificationData = notification.data || notification;

        const newNotif: Notification = {
          id: notification.id || `notif-${Date.now()}`,
          type: notification.type || 'App\\Notifications\\NewSubmissionNotification',
          data: notificationData,
          read_at: null,
          created_at: notificationData.created_at || new Date().toISOString()
        };

        setNotifications(prev => {
          const filtered = prev.filter(n => n.id !== newNotif.id);
          return [newNotif, ...filtered];
        });

        setUnreadCount(prev => prev + 1);

        // Haptic/Visual cue instead of sound if missing

      });

      return () => {
        echo.leave(`App.Models.User.${userId}`);
      };
    }
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative rounded-full hover:bg-slate-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                >
                  <Check size={14} /> Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Bell size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.data.status === 'approved' ? 'bg-emerald-500' :
                            notif.data.status === 'rejected' ? 'bg-red-500' :
                              'bg-sky-500'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={notif.data.link || '#'}
                            onClick={() => setIsOpen(false)}
                            className="block"
                          >
                            <p className="text-sm font-semibold text-slate-800 truncate mb-0.5">
                              {notif.data.title || notif.data.message}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {notif.data.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                              {new Date(notif.created_at).toLocaleString('id-ID', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </Link>
                        </div>
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all self-start"
                          title="Tandai sudah dibaca"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 5 && (
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button className="text-xs text-slate-500 hover:text-sky-600 font-medium transition-colors">
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

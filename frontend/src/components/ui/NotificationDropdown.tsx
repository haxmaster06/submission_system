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

// Helper to fix slow redirect routing
const optimizeLink = (link: string | undefined) => {
  if (!link) return "#";
  const match = link.match(/^\/submissions\/(\d+)$/);
  if (match) {
    return `/submissions?view=${match[1]}`;
  }
  return link;
};

export default function NotificationDropdown({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Setup Custom Event Listener for realtime updates from NotificationPopupContext
    if (typeof window !== 'undefined') {
      const handleNewNotif = (event: Event) => {
        const customEvent = event as CustomEvent;
        const notification = customEvent.detail;
        const notificationData = notification.data || notification;

        const newNotif: Notification = {
          id: notification.id || `notif-${Date.now()}`,
          type: notification.type || 'App\\Notifications\\NewSubmissionNotification',
          data: notificationData,
          read_at: null,
          created_at: notificationData.created_at || new Date().toISOString()
        };

        setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
        setUnreadCount(prev => prev + 1);
      };

      window.addEventListener('new_app_notification', handleNewNotif);

      return () => {
        window.removeEventListener('new_app_notification', handleNewNotif);
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
      setUnreadCount(res.data.data.filter((n: Notification) => !n.read_at).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Optimistic update
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read_at) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      try {
        await api.put(`/notifications/${id}/read`);
      } catch (err) {
        console.error('Failed to mark as read', err);
        fetchNotifications(); // Revert on failure
      }
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
      await api.put('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read', err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const isUnread = !notifications.find(n => n.id === id)?.read_at;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
      
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('Failed to delete notification', err);
      fetchNotifications();
    }
  };

  const deleteAllRead = async () => {
    try {
      setNotifications(prev => prev.filter(n => !n.read_at));
      await api.delete('/notifications/batch', { data: { type: 'read' } });
    } catch (err) {
      console.error('Failed to delete read notifications', err);
      fetchNotifications();
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
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 bg-sky-50 px-2 py-1 rounded hover:bg-sky-100 transition-colors"
                  >
                    <Check size={12} /> Tandai dibaca
                  </button>
                )}
                {notifications.some(n => n.read_at) && (
                  <button
                    onClick={deleteAllRead}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    title="Hapus semua notifikasi yang sudah dibaca"
                  >
                    <Trash2 size={12} /> Bersihkan
                  </button>
                )}
              </div>
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
                  {notifications.map((notif) => {
                    const isUnread = !notif.read_at;
                    return (
                      <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors group relative ${isUnread ? 'bg-sky-50/20' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isUnread ? (notif.data.status === 'approved' ? 'bg-emerald-500' :
                              notif.data.status === 'rejected' ? 'bg-red-500' :
                                'bg-sky-500') : 'bg-slate-300'
                            }`} />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={optimizeLink(notif.data.link)}
                              onClick={() => {
                                if (isUnread) markAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="block"
                            >
                              <p className={`text-sm ${isUnread ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'} truncate mb-0.5`}>
                                {notif.data.title || notif.data.message}
                              </p>
                              <p className={`text-xs ${isUnread ? 'text-slate-600' : 'text-slate-500'} line-clamp-2 leading-relaxed`}>
                                {notif.data.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                {new Date(notif.created_at).toLocaleString('id-ID', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </Link>
                          </div>
                          <div className="flex flex-col gap-1 items-end justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUnread && (
                              <button
                                onClick={(e) => markAsRead(notif.id, e)}
                                className="p-1.5 hover:bg-sky-100 rounded-lg text-sky-500 transition-all shadow-sm bg-white border border-slate-100"
                                title="Tandai sudah dibaca"
                              >
                                <Eye size={13} />
                              </button>
                            )}
                            <button
                              onClick={(e) => deleteNotification(notif.id, e)}
                              className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-all shadow-sm bg-white border border-slate-100"
                              title="Hapus notifikasi ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

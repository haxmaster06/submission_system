"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import echo from "@/lib/echo";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  created_at: string;
}

interface NotificationPopupContextType {}

const NotificationPopupContext = createContext<NotificationPopupContextType | undefined>(undefined);

// Helper to fix slow redirect routing
const optimizeLink = (link: string | undefined) => {
  if (!link) return "#";
  // The backend sends /submissions/123. The frontend page /submissions/[id] just redirects to /submissions?view=123.
  // By returning the finalized URL here, we skip the slow redirect component.
  const match = link.match(/^\/submissions\/(\d+)$/);
  if (match) {
    return `/submissions?view=${match[1]}`;
  }
  return link;
};

export const NotificationPopupProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const [popups, setPopups] = useState<Notification[]>([]);

  // Clear popups automatically after 8 seconds
  useEffect(() => {
    if (popups.length > 0) {
      const timer = setTimeout(() => {
        setPopups(prev => prev.slice(1));
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [popups]);

  // Fetch today's unread notifications ONLY ONCE per browser session (login)
  useEffect(() => {
    if (user && token && typeof window !== 'undefined') {
      const hasShown = sessionStorage.getItem(`login_notifs_${user.id}`);
      if (!hasShown) {
        sessionStorage.setItem(`login_notifs_${user.id}`, 'true');
        
        const fetchTodayUnread = async () => {
          try {
            const res = await api.get('/notifications');
            const today = new Date().toISOString().split('T')[0];
            
            const todaysUnread = res.data.data.filter((n: any) => {
              if (n.read_at) return false;
              const notifDate = n.created_at.split('T')[0];
              return notifDate === today;
            }).slice(0, 3); // Max 3 popups

            if (todaysUnread.length > 0) {
              const mappedPopups = todaysUnread.map((n: any) => ({
                id: n.id,
                title: n.data.title || 'Notifikasi Baru',
                message: n.data.message || '',
                link: n.data.link,
                created_at: n.created_at
              }));
              
              setTimeout(() => {
                setPopups(prev => [...prev, ...mappedPopups]);
              }, 1000);
            }
          } catch (err) {
            console.error("Failed to fetch login notifications", err);
          }
        };
        fetchTodayUnread();
      }
    }
  }, [user, token]);

  // Listen to Reverb for real-time notifications - SINGLE SOURCE OF TRUTH
  useEffect(() => {
    if (user && user.id) {
      const channel = echo.private(`App.Models.User.${user.id}`);

      channel.notification((notification: any) => {
        const data = notification.data || notification;
        
        // 1. Show the popup toast
        const newPopup: Notification = {
          id: notification.id || `notif-${Date.now()}`,
          title: data.title || 'Notifikasi Baru',
          message: data.message || '',
          link: data.link,
          created_at: new Date().toISOString()
        };

        setPopups(prev => {
          const updated = [...prev, newPopup];
          if (updated.length > 5) return updated.slice(updated.length - 5);
          return updated;
        });

        // 2. Broadcast custom event so the Dropdown updates silently without fighting for the Reverb channel
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('new_app_notification', { detail: notification }));
        }
      });

      return () => {
        echo.leave(`App.Models.User.${user.id}`);
      };
    }
  }, [user]);

  const removePopup = (id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  return (
    <NotificationPopupContext.Provider value={{}}>
      {children}
      
      {/* Global Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none sm:max-w-md w-[calc(100%-2rem)] sm:w-auto">
        <AnimatePresence>
          {popups.map(popup => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden pointer-events-auto flex items-start"
            >
              <div className="p-4 shrink-0 border-r border-slate-50 bg-sky-50/50">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 shadow-inner">
                  <Bell size={20} className="animate-pulse" />
                </div>
              </div>
              <div className="p-4 flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate pr-4">{popup.title}</h4>
                  <button 
                    onClick={() => removePopup(popup.id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-2 -mt-2 rounded-lg hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                  {popup.message}
                </p>
                {popup.link && (
                  <Link 
                    href={optimizeLink(popup.link)}
                    onClick={() => removePopup(popup.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    <span>Lihat Detail</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationPopupContext.Provider>
  );
};

export function useNotificationPopups() {
  const ctx = useContext(NotificationPopupContext);
  if (!ctx) throw new Error("useNotificationPopups must be used within NotificationPopupProvider");
  return ctx;
}

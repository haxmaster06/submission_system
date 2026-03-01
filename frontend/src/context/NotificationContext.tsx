"use client";

import React, { createContext, useContext, useEffect } from "react";

// Dummy context to avoid breaking existing imports across the app
interface NotificationContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | "loading";
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // We keep this to clean up the service workers if they still exist from previous versions
  useEffect(() => {
    if (typeof window !== "undefined" && "navigator" in window && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          const swUrl = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || '';
          if (swUrl && swUrl.includes('firebase-messaging-sw.js')) {
            reg.unregister();
            console.log('[FCM] Cleaned up obsolete service worker');
          }
        }
      });
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      isSupported: false,
      isSubscribed: false,
      permission: "default",
      subscribeToPush: async () => false,
      unsubscribeFromPush: async () => {}
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

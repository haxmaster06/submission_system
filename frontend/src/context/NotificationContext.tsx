'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

interface NotificationContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'loading';
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  isSupported: false,
  isSubscribed: false,
  permission: 'default',
  subscribeToPush: async () => false,
  unsubscribeFromPush: async () => false,
});

export const useNotification = () => useContext(NotificationContext);

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'loading'>('loading');

  useEffect(() => {
    // Check if browser supports service workers and native push
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check if we already have an active subscription
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
            try {
                // Verify with backend if THIS active user owns this specific browser subscription
                if (token) {
                    const response = await api.post('/web-push/check', { endpoint: sub.endpoint });
                    setIsSubscribed(response.data.is_subscribed);
                } else {
                    setIsSubscribed(false);
                }
            } catch (error) {
                console.error("Failed to verify push subscription ownership.", error);
                setIsSubscribed(false);
            }
        } else {
            setIsSubscribed(false);
        }
      });
      
      // Listen for permission changes outside of our app (e.g. user changes browser settings)
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' }).then((notificationPerm) => {
          notificationPerm.onchange = () => {
             setPermission(Notification.permission);
          };
        });
      }
    } else {
      setPermission('denied');
    }
  }, [token]);

  const subscribeToPush = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      // 1. Ask for permission if not already granted
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);
      
      if (currentPermission !== 'granted') {
        console.warn('Push notification permission denied.');
        return false;
      }

      // 2. Register or fetch existing Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Subscribe via PushManager 
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID Public Key is missing from frontend env.');
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 4. Send the subscription object to our Laravel backend
      await api.post('/web-push/subscribe', subscription.toJSON());
      
      // Update local state to hide the banner instantly
      setPermission('granted');
      setIsSubscribed(true);
      return true;

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe locally in browser
        await subscription.unsubscribe();

        // Unsubscribe from backend DB
        await api.post('/web-push/unsubscribe', { endpoint: subscription.endpoint });
      }
      setIsSubscribed(false);
      return true;
    } catch (error) {
       console.error('Failed to unsubscribe:', error);
       return false;
    }
  };

  return (
    <NotificationContext.Provider value={{ isSupported, isSubscribed, permission, subscribeToPush, unsubscribeFromPush }}>
      {children}
    </NotificationContext.Provider>
  );
};

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { API_URL } from '@/lib/api';

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

let echo: any;

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'hbm_key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '36.92.42.135',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 3030,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 3030,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        Accept: 'application/json',
      },
    },
  });
}

// Update token dynamically if needed
export const updateEchoAuth = (token: string) => {
  if (echo) {
    echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
  }
};

export default echo;

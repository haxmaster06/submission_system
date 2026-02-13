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
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'uagfg51czkh5jkxaqxdd',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 6001,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws'],
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

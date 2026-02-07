'use client';

import { useEffect } from 'react';
import { cacheOfflineData, isCacheFresh } from '@/lib/offline-data';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service worker registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('[PWA] New version available');
                  // Optionally show update notification
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('[PWA] Service worker registration failed:', error);
        });
    }

    // Cache offline data if not fresh
    if (!isCacheFresh()) {
      console.log('[PWA] Caching offline data...');
      cacheOfflineData();
    }
  }, []);

  return null;
}

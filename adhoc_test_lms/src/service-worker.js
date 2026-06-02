// src/service-worker.js
// Simple Service Worker using Workbox (if available) for caching static assets.
// This file will be served at /service-worker.js.

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Cache-first strategy for same-origin assets (CSS, JS, images)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.open('static-assets').then((cache) => {
        return cache.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
          );
        });
      })
    );
  }
});

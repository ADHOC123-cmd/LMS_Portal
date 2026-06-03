// public/service-worker.js
// Simple Service Worker using Workbox (if available) for caching static assets.
// This file will be served at /service-worker.js.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    event.respondWith(
      caches.open("static-assets").then((cache) =>
        cache.match(event.request).then(
          (response) =>
            response ||
            fetch(event.request).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }),
        ),
      ),
    );
  }
});

// src/service-worker.js
// Service Worker with versioned cache, Network-First navigation, and safe fallback responses.
const CACHE_NAME = "static-assets-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignore cross-origin and API requests
  if (url.origin !== location.origin || url.pathname.startsWith("/api")) {
    return;
  }

  // Network-First for HTML navigation / document requests
  if (
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/"
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;

          const fallback = (await caches.match("/")) || (await caches.match("/index.html"));
          if (fallback) return fallback;

          return new Response("Offline content not available", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" }
          });
        }),
    );
    return;
  }

  // Cache-First for static assets (hashed JS, CSS, images, etc.)
  if (event.request.method === "GET") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const fallback = await cache.match(event.request);
          if (fallback) return fallback;

          return new Response("Resource unavailable", {
            status: 404,
            statusText: "Not Found",
            headers: { "Content-Type": "text/plain" }
          });
        }
      }),
    );
  }
});

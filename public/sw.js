const CACHE_NAME = "gameorwait-v2";
const PRECACHE_URLS = ["/", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (self.registration.navigationPreload) {
          await self.registration.navigationPreload.disable();
        }
      } catch {
        /* ignore */
      }
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (!request.url.startsWith(self.location.origin)) return;

  // Let the browser handle documents / soft navigations. Intercepting them without
  // consuming `preloadResponse` spams console and cancels navigation preload (Chrome).
  if (request.mode === "navigate" || request.destination === "document") {
    return;
  }

  // Cache-first for precached entries only; everything else is network-only.
  // Avoids unbounded Cache Storage growth (RAM) from caching every asset on every visit.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request);
    }),
  );
});

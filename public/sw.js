const CACHE_NAME = "rinbow-aqua-v1.5.0";
const OFFLINE_URL = "/offline.html";
const ASSET_MANIFEST_URL = "/sw-assets.json";
const NETWORK_TIMEOUT_MS = 8000;
const PRECACHE_TIMEOUT_MS = 15000;

const CORE_ASSETS = [
  OFFLINE_URL,
  "/connection-check.txt",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];

const fetchWithTimeout = (request, timeoutMs = NETWORK_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(request, { signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
};

const cacheAssetResponse = async (cache, request, response) => {
  if (response && response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
};

const precacheAssetList = async (cache, assets, timeoutMs = NETWORK_TIMEOUT_MS) => {
  await Promise.all(
    assets.map(async (assetPath) => {
      try {
        const response = await fetchWithTimeout(
          new Request(assetPath, { cache: "reload" }),
          timeoutMs
        );
        await cacheAssetResponse(cache, assetPath, response);
      } catch (error) {}
    })
  );
};

const precacheHashedAssets = async (cache) => {
  try {
    const manifestResponse = await fetchWithTimeout(
      new Request(ASSET_MANIFEST_URL, { cache: "no-store" })
    );

    if (!manifestResponse.ok) {
      throw new Error(`Manifest request failed with ${manifestResponse.status}`);
    }

    const manifest = await manifestResponse.json();
    const assetPaths = Array.isArray(manifest.assetPaths) ? manifest.assetPaths : [];

    await precacheAssetList(cache, assetPaths, PRECACHE_TIMEOUT_MS);
  } catch (error) {}
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await precacheAssetList(cache, CORE_ASSETS);
      await precacheHashedAssets(cache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  const requestToHandle =
    url.pathname === "/favicon.ico" ? new Request("/favicon-16x16.png") : event.request;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetchWithTimeout(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          const networkResponse = fetchWithTimeout(event.request)
            .then((response) => cacheAssetResponse(cache, event.request, response))
            .catch(
              () =>
                cachedResponse || new Response(null, { status: 503, statusText: "Offline" })
            );

          return networkResponse;
        })
      )
    );
    return;
  }

  if (url.pathname.startsWith("/videos/rinbow-loader-bird.mp4")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          const networkResponse = fetchWithTimeout(event.request, PRECACHE_TIMEOUT_MS)
            .then((response) => cacheAssetResponse(cache, event.request, response))
            .catch(
              () =>
                cachedResponse || new Response(null, { status: 503, statusText: "Offline" })
            );

          return cachedResponse || networkResponse;
        })
      )
    );
    return;
  }

  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  if (!/\.(?:css|js|png|jpg|jpeg|svg|webp|gif|ico|json|mp4|webm)$/i.test(url.pathname)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(requestToHandle).then((cachedResponse) => {
        const networkResponse = fetchWithTimeout(requestToHandle)
          .then((response) => cacheAssetResponse(cache, requestToHandle, response))
          .catch(() => {
            if (cachedResponse) {
              return cachedResponse;
            }

            if (url.pathname === "/favicon.ico") {
              return cache.match("/favicon-16x16.png").then(
                (iconResponse) => iconResponse || new Response(null, { status: 204 })
              );
            }

            return new Response(null, { status: 204 });
          });

        return cachedResponse || networkResponse;
      })
    );
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || "New update from Rinbow Aqua!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Rinbow Aqua", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});

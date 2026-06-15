const CACHE_NAME = "receptbok-de47a5b";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/images/heroImageLandingPage.jpg",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
];

const isDocumentRequest = (request) =>
  request.mode === "navigate" ||
  request.headers.get("accept")?.includes("text/html");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.url.includes("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // HTML alltid nätverk först — undvik två olika landningssidor i cache.
  if (isDocumentRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => caches.match("/recept"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        if (response.ok && requestUrl.pathname.startsWith("/images/")) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

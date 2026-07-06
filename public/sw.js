const IMAGE_CACHE = "ambasphere-images-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ambasphere-images-") && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isImageRequest(request) {
  if (request.method !== "GET") return false;
  if (request.destination === "image") return true;
  return /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(request.url);
}

self.addEventListener("fetch", (event) => {
  if (!isImageRequest(event.request)) return;

  event.respondWith(
    caches.open(IMAGE_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});

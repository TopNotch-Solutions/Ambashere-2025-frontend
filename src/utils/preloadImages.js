import {
  AUTHENTICATED_IMAGES,
  PUBLIC_IMAGES,
} from "../constants/appImages";

const loadedUrls = new Set();

export function preloadImages(urls, { highPriority = false } = {}) {
  if (!Array.isArray(urls)) return;

  urls.forEach((url) => {
    if (!url || loadedUrls.has(url)) return;
    loadedUrls.add(url);

    if (highPriority && typeof document !== "undefined") {
      const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = url;
        document.head.appendChild(link);
      }
    }

    const image = new Image();
    image.decoding = "async";
    image.src = url;
  });
}

export function preloadImagesForApp({ pathname, isAuthenticated }) {
  const isPublicRoute = pathname === "/" || pathname === "/login";

  if (isPublicRoute) {
    const heroImage = pathname === "/login" ? PUBLIC_IMAGES[1] : PUBLIC_IMAGES[0];
    preloadImages([heroImage, PUBLIC_IMAGES[2], PUBLIC_IMAGES[3]], {
      highPriority: true,
    });
  }

  if (isAuthenticated) {
    preloadImages(AUTHENTICATED_IMAGES);
  }
}

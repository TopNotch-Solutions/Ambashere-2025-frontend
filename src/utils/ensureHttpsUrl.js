export function ensureHttpsUrl(url) {
  if (typeof url !== "string" || !url) return url;

  // Local backend runs HTTP only; forcing HTTPS causes axios "Network Error"
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return url;
  }

  return url.replace(/^http:\/\//i, "https://");
}

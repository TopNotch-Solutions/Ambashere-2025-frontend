export function ensureHttpsUrl(url) {
  if (typeof url !== "string" || !url) return url;
  return url.replace(/^http:\/\//i, "https://");
}

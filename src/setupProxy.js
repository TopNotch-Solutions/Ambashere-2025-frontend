const CSP_REPORT_GROUP = "csp-endpoint";
const CSP_REPORT_MAX_AGE_SECONDS = 10886400;

function normalizeCspReportUrl(url) {
  if (!url) return url;
  return String(url)
    .trim()
    .replace(/^https:\/\/http:\/\//i, "http://")
    .replace(/^http:\/\/https:\/\//i, "https://");
}

function getCspReportUrl() {
  return (
    normalizeCspReportUrl(
      process.env.REACT_APP_CSP_REPORT_URL || process.env.CSP_REPORT_URL
    ) || "https://ambaspherebackend.mtc.com.na/csp-report"
  );
}

function getConnectSrc() {
  const apiUrl =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_SOCKET_URL ||
    "https://ambaspherebackend.mtc.com.na";

  const origins = new Set([
    "'self'",
    "https://ambaspherebackend.mtc.com.na",
    "ws://localhost:4000",
    "https://ambaspherebackend.mtc.com.na",
    "wss://ambaspherebackend.mtc.com.na",
    "https://ambasphereuat.mtc.com.na",
    "https://ambasphere.mtc.com.na",
  ]);

  try {
    const parsed = new URL(apiUrl);
    origins.add(parsed.origin);
    if (parsed.protocol === "https:") {
      origins.add(`wss://${parsed.host}`);
    } else if (parsed.protocol === "http:") {
      origins.add(`ws://${parsed.host}`);
    }
  } catch (_) {
    // ignore invalid env URL
  }

  return `connect-src ${Array.from(origins).join(" ")}`;
}

/**
 * SPA CSP:
 * - Blocks plugins/framing
 * - Allows self scripts/styles, Google Fonts, API/socket connections
 * - Dev needs unsafe-eval for CRA webpack HMR
 */
function buildCspHeader({ isDev = false } = {}) {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    getConnectSrc(),
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    `report-to ${CSP_REPORT_GROUP}`,
  ].join("; ");
}

function buildReportToHeader(reportUrl) {
  return JSON.stringify({
    group: CSP_REPORT_GROUP,
    max_age: CSP_REPORT_MAX_AGE_SECONDS,
    endpoints: [{ url: reportUrl }],
  });
}

/**
 * Applies security headers on the CRA dev server.
 */
module.exports = function setupProxy(app) {
  const reportUrl = getCspReportUrl();
  const isDev = process.env.NODE_ENV !== "production";

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", buildCspHeader({ isDev }));
    res.setHeader(
      "Reporting-Endpoints",
      `${CSP_REPORT_GROUP}="${reportUrl}"`
    );
    res.setHeader("Report-To", buildReportToHeader(reportUrl));
    next();
  });
};

module.exports.buildCspHeader = buildCspHeader;
module.exports.CSP_REPORT_GROUP = CSP_REPORT_GROUP;

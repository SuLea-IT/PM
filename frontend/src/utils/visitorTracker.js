import { apiConfig } from "../config/apiConfig";

function buildPayload(to) {
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  return {
    route:
      to?.fullPath ||
      window.location.hash.replace(/^#/, "") ||
      window.location.pathname ||
      "/",
    title: document.title || "",
    referrer: document.referrer || "",
    language: navigator.language || "",
    timezone,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: navigator.userAgent || "",
  };
}

let lastTrackKey = "";
let lastTrackAt = 0;

export function trackVisitorRoute(to) {
  if (typeof window === "undefined") return;

  const payload = buildPayload(to);
  const currentKey = payload.route;
  const now = Date.now();

  if (currentKey === lastTrackKey && now - lastTrackAt < 1500) {
    return;
  }

  lastTrackKey = currentKey;
  lastTrackAt = now;

  const body = JSON.stringify(payload);
  const trackUrl = `${apiConfig.baseURL}/analytics/track`;

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(trackUrl, blob);
      return;
    }
  } catch (error) {
    console.warn("sendBeacon visitor tracking failed:", error);
  }

  fetch(trackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch((error) => {
    console.warn("visitor tracking request failed:", error);
  });
}

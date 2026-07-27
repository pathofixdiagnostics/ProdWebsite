// Lightweight, in-house page-view tracking. No third-party analytics, no
// cookies — just a per-tab session id in sessionStorage and a fire-and-forget
// beacon to our own API. Same-origin in production; the dev proxy forwards it.

const API = import.meta.env.VITE_API_URL || "";
const SESSION_KEY = "pf_sid";

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // Private mode / storage disabled — fall back to a throwaway id
    return Math.random().toString(36).slice(2);
  }
}

export function trackPageview(path: string): void {
  // Never count admin console traffic
  if (path.startsWith("/admin")) return;

  let timezone: string | undefined;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch { /* ignore */ }

  try {
    void fetch(`${API}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), path, timezone }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore — analytics must never break the page */
  }
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Lock,
  LogOut,
  RefreshCw,
  Download,
  Upload,
  CalendarCheck,
  Handshake,
  Users,
  Eye,
  ShieldAlert,
  Loader2,
  Calendar,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Globe,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

// ── Types ───────────────────────────────────────────────────────────────

type Stats = {
  bookingsInPeriod: number;
  bookingsTotal: number;
  partnerRequestsInPeriod: number;
  partnerRequestsTotal: number;
  visitsInPeriod: number;
  visitsTotal: number;
  pageViewsInPeriod: number;
  pageViewsTotal: number;
  bookingsByMonth: { month: string; count: number }[];
  partnersByMonth: { month: string; count: number }[];
  visitsByMonth: { month: string; count: number }[];
  from: string | null;
  to: string | null;
};

type BookingRow = {
  id: number;
  patient_name: string;
  phone: string;
  email: string | null;
  test_package: string;
  preferred_date: string;
  collection_type: string;
  preferred_time_slot: string;
  address: string | null;
  notes: string | null;
  created_at: string;
};

type InsightsData = {
  testPackages: { name: string; count: number }[];
  collectionTypes: { type: string; count: number }[];
  locations: { city: string; region: string; country: string; count: number }[];
  timezones: { timezone: string; count: number }[];
};

// ── API helper ──────────────────────────────────────────────────────────

const TOKEN_KEY = "pf_admin_token";

async function api(path: string, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${API}${path}`, { credentials: "include", ...init, headers });
}

// ── Utilities ───────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function periodLabel(stats: Stats): string {
  if (stats.from && stats.to) return `${fmtDate(stats.from)} – ${fmtDate(stats.to)}`;
  if (stats.from) return `From ${fmtDate(stats.from)}`;
  if (stats.to) return `Until ${fmtDate(stats.to)}`;
  return "This month";
}

function collectionLabel(ct: string): string {
  return ct === "homeCollection" ? "Home Collection" : "Lab Drop-In";
}

function buildChartData(
  data: { month: string; count: number }[],
  from: string | null,
  to: string | null,
) {
  const byMonth = new Map(data.map((d) => [d.month, d.count]));
  const now = new Date();

  const startDate = from
    ? (() => { const d = new Date(from + "T00:00:00"); return new Date(d.getFullYear(), d.getMonth(), 1); })()
    : new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const endDate = to
    ? (() => { const d = new Date(to + "T00:00:00"); return new Date(d.getFullYear(), d.getMonth(), 1); })()
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const multiYear = startDate.getFullYear() !== endDate.getFullYear();
  const out: { label: string; count: number }[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      label: cursor.toLocaleString("en-US", {
        month: "short",
        ...(multiYear ? { year: "2-digit" } : {}),
      }),
      count: byMonth.get(key) ?? 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

function buildMonthTable(stats: Stats) {
  const months = new Set([
    ...stats.bookingsByMonth.map((d) => d.month),
    ...stats.partnersByMonth.map((d) => d.month),
    ...stats.visitsByMonth.map((d) => d.month),
  ]);
  const bm = new Map(stats.bookingsByMonth.map((d) => [d.month, d.count]));
  const pm = new Map(stats.partnersByMonth.map((d) => [d.month, d.count]));
  const vm = new Map(stats.visitsByMonth.map((d) => [d.month, d.count]));

  return [...months]
    .sort()
    .reverse()
    .map((month) => {
      const [yr, mo] = month.split("-");
      const label = new Date(Number(yr), Number(mo) - 1, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      return {
        month,
        label,
        bookings: bm.get(month) ?? 0,
        partners: pm.get(month) ?? 0,
        visits: vm.get(month) ?? 0,
      };
    });
}

// Maps IANA timezone → country name for display
function buildLocationData(insights: InsightsData): {
  data: { label: string; count: number }[];
  precise: boolean;
} {
  if (insights.locations.length > 0) {
    return {
      precise: true,
      data: insights.locations.map((l) => ({
        label: l.region ? `${l.city}, ${l.region}` : l.city,
        count: l.count,
      })),
    };
  }
  // Fallback: aggregate timezone → country
  const TZ_COUNTRY: Record<string, string> = {
    "Asia/Kolkata": "India", "Asia/Calcutta": "India", "Asia/Mumbai": "India",
    "Asia/Chennai": "India", "Asia/Dubai": "UAE", "Asia/Riyadh": "Saudi Arabia",
    "Asia/Karachi": "Pakistan", "Asia/Dhaka": "Bangladesh", "Asia/Singapore": "Singapore",
    "Asia/Colombo": "Sri Lanka", "Asia/Kathmandu": "Nepal", "Asia/Tokyo": "Japan",
    "Asia/Shanghai": "China", "Asia/Bangkok": "Thailand", "Asia/Kuala_Lumpur": "Malaysia",
    "Europe/London": "United Kingdom", "Europe/Paris": "France", "Europe/Berlin": "Germany",
    "America/New_York": "United States", "America/Chicago": "United States",
    "America/Los_Angeles": "United States", "America/Toronto": "Canada",
    "Australia/Sydney": "Australia", "Australia/Melbourne": "Australia",
  };
  const map = new Map<string, number>();
  for (const { timezone, count } of insights.timezones) {
    const country = TZ_COUNTRY[timezone]
      ?? (timezone.startsWith("America/") ? "United States"
        : timezone.startsWith("Australia/") ? "Australia"
        : timezone.split("/")[0] || timezone);
    map.set(country, (map.get(country) ?? 0) + count);
  }
  return {
    precise: false,
    data: [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}

// ── Sub-components ──────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: ElementType;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Horizontal bar chart tick that truncates long labels
function HBarTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const text = (payload?.value ?? "").length > 22
    ? (payload?.value ?? "").slice(0, 20) + "…"
    : (payload?.value ?? "");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#94a3b8" fontSize={11}>
        {text}
      </text>
    </g>
  );
}

// ── Date filter row (reusable) ───────────────────────────────────────────

function DateFilterRow({
  from, to, active, loading,
  onFromChange, onToChange, onApply, onClear,
}: {
  from: string; to: string; active: boolean; loading: boolean;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">From</label>
        <Input type="date" value={from} max={to || undefined} onChange={(e) => onFromChange(e.target.value)} className="w-full sm:w-44" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">To</label>
        <Input type="date" value={to} min={from || undefined} onChange={(e) => onToChange(e.target.value)} className="w-full sm:w-44" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onApply} disabled={loading || (!from && !to)} className="gap-1.5">
          <Calendar className="h-4 w-4" />
          Apply
        </Button>
        {active && (
          <Button variant="outline" size="sm" onClick={onClear} disabled={loading} className="gap-1.5">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

export default function Admin() {
  // Auth
  const [phase, setPhase] = useState<"loading" | "unconfigured" | "login" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "insights">("overview");

  // Overview tab
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [chartTab, setChartTab] = useState<"bookings" | "partners" | "visits">("bookings");

  // Bookings tab
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [bookingsMeta, setBookingsMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [bSearch, setBSearch] = useState("");
  const [bCollType, setBCollType] = useState("");
  const [bFrom, setBFrom] = useState("");
  const [bTo, setBTo] = useState("");
  const [exportBusy, setExportBusy] = useState(false);

  // Insights tab
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [iFrom, setIFrom] = useState("");
  const [iTo, setITo] = useState("");

  // Backup/restore
  const [backupBusy, setBackupBusy] = useState(false);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Track first-visit for each tab
  const bookingsInitRef = useRef(false);
  const insightsInitRef = useRef(false);

  useEffect(() => {
    document.title = "Admin Console | PATHOFIX DIAGNOSTICS";
  }, []);

  // ── Data loaders ──────────────────────────────────────────────────────

  const loadStats = useCallback(async (from?: string, to?: string) => {
    setRefreshing(true);
    setStatsError(null);
    try {
      const p = new URLSearchParams();
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      const qs = p.toString();
      const res = await api(`/api/admin/stats${qs ? `?${qs}` : ""}`);
      if (res.status === 401) { setPhase("login"); return; }
      if (!res.ok) throw new Error();
      setStats((await res.json()) as Stats);
    } catch {
      setStatsError("Could not load stats. Try refreshing.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadBookings = useCallback(async (
    page: number,
    search: string,
    collType: string,
    from: string,
    to: string,
  ) => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const p = new URLSearchParams({ page: String(page) });
      if (search) p.set("search", search);
      if (collType) p.set("collectionType", collType);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      const res = await api(`/api/admin/bookings?${p}`);
      if (res.status === 401) { setPhase("login"); return; }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        bookings: BookingRow[];
        total: number;
        page: number;
        pages: number;
      };
      setBookings(data.bookings);
      setBookingsMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch {
      setBookingsError("Could not load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const loadInsights = useCallback(async (from: string, to: string) => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const p = new URLSearchParams();
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      const qs = p.toString();
      const res = await api(`/api/admin/insights${qs ? `?${qs}` : ""}`);
      if (res.status === 401) { setPhase("login"); return; }
      if (!res.ok) throw new Error();
      setInsights((await res.json()) as InsightsData);
    } catch {
      setInsightsError("Could not load insights.");
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  // Session check on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/admin/me");
        const data = (await res.json()) as { configured: boolean; authenticated: boolean };
        if (!data.configured) setPhase("unconfigured");
        else if (data.authenticated) { setPhase("ready"); void loadStats(); }
        else setPhase("login");
      } catch {
        setPhase("login");
      }
    })();
  }, [loadStats]);

  // Lazy-load tab data on first visit
  useEffect(() => {
    if (phase !== "ready") return;
    if (activeTab === "bookings" && !bookingsInitRef.current) {
      bookingsInitRef.current = true;
      void loadBookings(1, "", "", "", "");
    }
    if (activeTab === "insights" && !insightsInitRef.current) {
      insightsInitRef.current = true;
      void loadInsights("", "");
    }
  }, [activeTab, phase, loadBookings, loadInsights]);

  // ── Auth handlers ─────────────────────────────────────────────────────

  const login = useCallback(async () => {
    if (!password) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      const res = await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { token?: string };
        if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        setPassword("");
        setPhase("ready");
        void loadStats();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setAuthError(data.error ?? "Login failed.");
      }
    } catch {
      setAuthError("Could not reach the server.");
    } finally {
      setAuthBusy(false);
    }
  }, [password, loadStats]);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    await api("/api/admin/logout", { method: "POST" }).catch(() => {});
    setStats(null);
    setBookings(null);
    setInsights(null);
    bookingsInitRef.current = false;
    insightsInitRef.current = false;
    setPhase("login");
  }, []);

  // ── Backup/restore ────────────────────────────────────────────────────

  const downloadBackup = useCallback(async (): Promise<boolean> => {
    const res = await api("/api/admin/backup");
    if (!res.ok) return false;
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") ?? "";
    const match = cd.match(/filename="([^"]+)"/);
    const name = match?.[1] ?? `pathofix-backup-${Date.now()}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    return true;
  }, []);

  const handleBackup = useCallback(async () => {
    setBackupBusy(true); setNotice(null);
    try {
      const ok = await downloadBackup();
      setNotice(ok ? { kind: "ok", text: "Backup downloaded." } : { kind: "err", text: "Backup failed." });
    } catch {
      setNotice({ kind: "err", text: "Backup failed." });
    } finally { setBackupBusy(false); }
  }, [downloadBackup]);

  const handleRestoreFile = useCallback(async (file: File) => {
    const confirmed = window.confirm(
      "Restore will REPLACE all current data with the contents of this backup.\n\n" +
      "A backup of the current data will be downloaded first as a safety copy.\n\nContinue?",
    );
    if (!confirmed) { if (fileRef.current) fileRef.current.value = ""; return; }

    setRestoreBusy(true); setNotice(null);
    try {
      const safetySaved = await downloadBackup();
      if (!safetySaved) {
        setNotice({ kind: "err", text: "Could not save a safety backup — restore cancelled. Nothing changed." });
        return;
      }
      const text = await file.text();
      let payload: unknown;
      try { payload = JSON.parse(text); }
      catch { setNotice({ kind: "err", text: "That file isn't valid JSON." }); return; }

      const res = await api("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        restored?: { bookings: number; partnerRequests: number; pageViews: number };
      };
      if (res.ok && data.restored) {
        setNotice({ kind: "ok", text: `Restored ${data.restored.bookings} bookings, ${data.restored.partnerRequests} partner requests, ${data.restored.pageViews} page views.` });
        void loadStats();
      } else {
        setNotice({ kind: "err", text: data.error ?? "Restore failed." });
      }
    } catch {
      setNotice({ kind: "err", text: "Restore failed." });
    } finally {
      setRestoreBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [downloadBackup, loadStats]);

  // ── CSV export ────────────────────────────────────────────────────────

  const exportCSV = useCallback(async (
    search: string, collType: string, from: string, to: string,
  ) => {
    setExportBusy(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (collType) p.set("collectionType", collType);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      const res = await api(`/api/admin/bookings/export?${p}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      const name = match?.[1] ?? `pathofix-bookings-${Date.now()}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportBusy(false);
    }
  }, []);

  // ── Auth phase renders ────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (phase === "unconfigured") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardHeader>
            <div className="mx-auto mb-2 rounded-full bg-amber-100 p-3 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-center text-lg">Admin console not configured</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-slate-600">
            Set <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD_HASH</code> and{" "}
            <code className="rounded bg-slate-100 px-1">ADMIN_SESSION_SECRET</code> on the server,
            then restart the API. See DEPLOYMENT.md → Admin console.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-slate-50 to-secondary/5 px-4">
        <Card className="w-full max-w-sm border-slate-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2.5">
              <img src="/logo.png" alt="PathoFix Diagnostics" className="h-10 w-10 rounded-lg object-cover shadow-sm" />
              <div className="text-left leading-none">
                <p className="font-extrabold text-primary text-base tracking-tight">PATHOFIX</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Diagnostics</p>
              </div>
            </div>
            <div className="mx-auto mb-1 rounded-full bg-primary/10 p-2.5 text-primary w-fit">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">PathoFix Diagnostics Admin</CardTitle>
            <p className="text-sm text-slate-500">Enter the admin password to continue.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password" value={password} autoFocus placeholder="Admin password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void login(); }}
              className="h-11"
            />
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <Button className="h-11 w-full font-semibold" onClick={() => void login()} disabled={authBusy || !password}>
              {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Ready phase ───────────────────────────────────────────────────────

  const overviewLabel = stats ? periodLabel(stats) : "This month";
  const hasOverviewFilter = !!(stats?.from || stats?.to);

  const chartData = stats
    ? buildChartData(
        chartTab === "bookings" ? stats.bookingsByMonth
        : chartTab === "partners" ? stats.partnersByMonth
        : stats.visitsByMonth,
        stats.from, stats.to,
      )
    : [];

  const monthTable = stats ? buildMonthTable(stats) : [];

  const locationResult = insights ? buildLocationData(insights) : null;
  const locationData = locationResult?.data ?? [];
  const locationPrecise = locationResult?.precise ?? false;
  const collTotal = insights
    ? insights.collectionTypes.reduce((s, c) => s + c.count, 0)
    : 0;

  const TABS = [
    { key: "overview" as const, label: "Overview", icon: BarChart2 },
    { key: "bookings" as const, label: "Bookings", icon: CalendarCheck },
    { key: "insights" as const, label: "Insights", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PathoFix Diagnostics" className="h-9 w-9 rounded-lg object-cover shadow-sm" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl leading-tight">
                PathoFix Diagnostics Admin Console
              </h1>
              <p className="text-xs text-slate-500">Bookings, partners, visits &amp; backups</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "overview" && (
              <Button variant="outline" size="sm"
                onClick={() => void loadStats(stats?.from ?? undefined, stats?.to ?? undefined)}
                disabled={refreshing} className="gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => void logout()} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mx-auto flex max-w-6xl gap-0 px-4 sm:px-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Date filter */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <DateFilterRow
                  from={filterFrom} to={filterTo}
                  active={hasOverviewFilter} loading={refreshing}
                  onFromChange={setFilterFrom} onToChange={setFilterTo}
                  onApply={() => void loadStats(filterFrom || undefined, filterTo || undefined)}
                  onClear={() => { setFilterFrom(""); setFilterTo(""); void loadStats(); }}
                />
                {hasOverviewFilter && (
                  <p className="mt-3 text-xs text-slate-500">
                    Showing: <span className="font-medium text-slate-700">{overviewLabel}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {statsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {statsError}
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={CalendarCheck} label="Bookings"
                value={stats?.bookingsInPeriod ?? "—"}
                sub={stats ? `${stats.bookingsTotal} all time · ${overviewLabel}` : undefined}
              />
              <StatCard icon={Handshake} label="Partner requests"
                value={stats?.partnerRequestsInPeriod ?? "—"}
                sub={stats ? `${stats.partnerRequestsTotal} all time · ${overviewLabel}` : undefined}
              />
              <StatCard icon={Users} label="Visits"
                value={stats?.visitsInPeriod ?? "—"}
                sub={stats ? `${stats.visitsTotal} all time · ${overviewLabel}` : undefined}
              />
              <StatCard icon={Eye} label="Page views"
                value={stats?.pageViewsInPeriod ?? "—"}
                sub={stats ? `${stats.pageViewsTotal} all time · ${overviewLabel}` : undefined}
              />
            </div>

            {/* Month-wise chart */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Month-wise breakdown
                  </CardTitle>
                  <div className="flex gap-1 self-start rounded-lg bg-slate-100 p-1 sm:self-auto">
                    {(["bookings", "partners", "visits"] as const).map((tab) => (
                      <button key={tab} onClick={() => setChartTab(tab)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          chartTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "hsl(276 69% 40% / 0.06)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                      <Bar dataKey="count" fill="hsl(276 69% 40%)" radius={[4, 4, 0, 0]} maxBarSize={44} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly summary table */}
            {monthTable.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">Monthly summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Month", "Bookings", "Partners", "Visits"].map((h, i) => (
                            <th key={h} className={`px-6 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {monthTable.map((row) => (
                          <tr key={row.month} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-700">{row.label}</td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-600">{row.bookings}</td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-600">{row.partners}</td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-600">{row.visits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Backup & restore */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Database backup &amp; restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notice && (
                  <div className={`rounded-lg border px-4 py-3 text-sm ${notice.kind === "ok" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {notice.text}
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => void handleBackup()} disabled={backupBusy} className="gap-2 sm:w-auto">
                    {backupBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download backup
                  </Button>
                  <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={restoreBusy}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/5 sm:w-auto"
                  >
                    {restoreBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Restore from backup
                  </Button>
                  <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleRestoreFile(f); }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Backups are JSON snapshots of all bookings, partner requests and page views. Restoring
                  replaces current data; a safety copy downloads automatically before any restore. Keep
                  backup files secure — they contain customers' personal details.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── BOOKINGS TAB ─────────────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Filter bar */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search by name or phone"
                        value={bSearch}
                        onChange={(e) => setBSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            void loadBookings(1, bSearch, bCollType, bFrom, bTo);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={bCollType}
                      onChange={(e) => setBCollType(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">All types</option>
                      <option value="homeCollection">Home Collection</option>
                      <option value="labDropIn">Lab Drop-In</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">From</label>
                      <Input type="date" value={bFrom} max={bTo || undefined} onChange={(e) => setBFrom(e.target.value)} className="w-40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">To</label>
                      <Input type="date" value={bTo} min={bFrom || undefined} onChange={(e) => setBTo(e.target.value)} className="w-40" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => void loadBookings(1, bSearch, bCollType, bFrom, bTo)} disabled={bookingsLoading} className="gap-1.5">
                        <Search className="h-4 w-4" />
                        Search
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5"
                        onClick={() => { setBSearch(""); setBCollType(""); setBFrom(""); setBTo(""); void loadBookings(1, "", "", "", ""); }}
                        disabled={bookingsLoading}
                      >
                        <X className="h-4 w-4" />
                        Clear
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 ml-auto"
                        onClick={() => void exportCSV(bSearch, bCollType, bFrom, bTo)}
                        disabled={exportBusy}
                      >
                        {exportBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bookingsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {bookingsError}
              </div>
            )}

            {/* Table */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    {bookingsLoading ? "Loading…" : `${bookingsMeta.total} booking${bookingsMeta.total !== 1 ? "s" : ""}`}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bookingsLoading && bookings === null ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : bookings !== null && bookings.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-400">No bookings found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Patient", "Phone", "Test Package", "Preferred Date", "Type", "Booked On"].map((h, i) => (
                            <th key={h} className={`px-4 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 0 ? "text-left" : "text-left"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(bookings ?? []).map((b) => (
                          <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{b.patient_name}</td>
                            <td className="px-4 py-3 tabular-nums text-slate-600">{b.phone}</td>
                            <td className="max-w-[180px] px-4 py-3 text-slate-600">
                              <span className="line-clamp-1" title={b.test_package}>{b.test_package}</span>
                            </td>
                            <td className="px-4 py-3 tabular-nums text-slate-600">{b.preferred_date}</td>
                            <td className="px-4 py-3 text-slate-600">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                b.collection_type === "homeCollection"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-green-50 text-green-700"
                              }`}>
                                {collectionLabel(b.collection_type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{fmtTimestamp(b.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {bookingsMeta.pages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Page {bookingsMeta.page} of {bookingsMeta.pages} &nbsp;·&nbsp; {bookingsMeta.total} total
                    </p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm"
                        disabled={bookingsMeta.page <= 1 || bookingsLoading}
                        onClick={() => void loadBookings(bookingsMeta.page - 1, bSearch, bCollType, bFrom, bTo)}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <Button variant="outline" size="sm"
                        disabled={bookingsMeta.page >= bookingsMeta.pages || bookingsLoading}
                        onClick={() => void loadBookings(bookingsMeta.page + 1, bSearch, bCollType, bFrom, bTo)}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── INSIGHTS TAB ─────────────────────────────────────────── */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            {/* Date filter */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <DateFilterRow
                  from={iFrom} to={iTo}
                  active={!!(insights?.testPackages && (iFrom || iTo))}
                  loading={insightsLoading}
                  onFromChange={setIFrom} onToChange={setITo}
                  onApply={() => void loadInsights(iFrom, iTo)}
                  onClear={() => { setIFrom(""); setITo(""); void loadInsights("", ""); }}
                />
              </CardContent>
            </Card>

            {insightsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {insightsError}
              </div>
            )}

            {insightsLoading && !insights ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : insights ? (
              <>
                {/* Test package popularity */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Test package popularity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {insights.testPackages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-400">No booking data yet.</p>
                    ) : (
                      <div style={{ height: Math.max(200, insights.testPackages.length * 36) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={insights.testPackages}
                            layout="vertical"
                            margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <YAxis type="category" dataKey="name" width={140} tick={HBarTick as any} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: "hsl(276 69% 40% / 0.06)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                            <Bar dataKey="count" fill="hsl(276 69% 40%)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Collection type + country charts side by side */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Collection type split */}
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-slate-900">
                        Collection type split
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {insights.collectionTypes.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-400">No data yet.</p>
                      ) : (
                        insights.collectionTypes.map((ct) => {
                          const pct = collTotal > 0 ? Math.round((ct.count / collTotal) * 100) : 0;
                          return (
                            <div key={ct.type}>
                              <div className="mb-1.5 flex justify-between text-sm">
                                <span className="font-medium text-slate-700">{collectionLabel(ct.type)}</span>
                                <span className="tabular-nums text-slate-500">{ct.count} ({pct}%)</span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all ${ct.type === "homeCollection" ? "bg-blue-500" : "bg-green-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  {/* Visits by city / region */}
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {locationPrecise ? "Visits by city / region" : "Visits by country"}
                        </CardTitle>
                        {locationData.length > 0 && (
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            locationPrecise
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {locationPrecise ? "Precise · IP-based" : "Approximate · Timezone-based"}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {locationData.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-400">
                          No location data yet — collected automatically from new visits.
                        </p>
                      ) : (
                        <div style={{ height: Math.max(160, locationData.length * 36) }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={locationData}
                              layout="vertical"
                              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <YAxis type="category" dataKey="label" width={150} tick={HBarTick as any} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{ fill: "hsl(276 69% 40% / 0.06)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                              <Bar dataKey="count" fill="hsl(200 80% 45%)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

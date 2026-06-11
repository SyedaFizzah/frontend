import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.png";

const heroImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect fill='%23E5E7EB' width='800' height='600'/%3E%3C/svg%3E";

interface SafeguardUser {
  loggedIn: boolean;
  name: string;
  email?: string;
  role: string;
}

const getUser = (): SafeguardUser | null => {
  const stored = localStorage.getItem("safeguard_user");
  return stored ? JSON.parse(stored) : null;
};

const clearUser = () => {
  localStorage.removeItem("safeguard_user");
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | SafeGuard AI" }] }),
  component: DashboardPage,
});

type Section = "overview" | "analytics" | "violations" | "reports" | "settings";

interface Violation {
  id: string;
  name: string;
  trackId: number;
  violation: string;
  timestamp: string;
  confidence: string;
  status: "Critical" | "High" | "Medium";
}

const dummyViolations: Violation[] = [
  { id: "V-001", name: "Fatima Khan", trackId: 1, violation: "no_helmet", timestamp: "2026-05-13 18:42:51", confidence: "70.3%", status: "Critical" },
  { id: "V-002", name: "Fatima Khan", trackId: 1, violation: "no_goggle", timestamp: "2026-05-13 18:42:51", confidence: "70.1%", status: "High" },
  { id: "V-003", name: "Fatima Khan", trackId: 1, violation: "no_helmet", timestamp: "2026-05-13 16:11:08", confidence: "82.4%", status: "Critical" },
  { id: "V-017", name: "Fizza Ahmed", trackId: 2, violation: "no_helmet", timestamp: "2026-05-12 08:22:14", confidence: "77.8%", status: "Critical" },
  { id: "V-018", name: "Fizza Ahmed", trackId: 2, violation: "no_gloves", timestamp: "2026-05-12 08:24:01", confidence: "68.5%", status: "Medium" },
  { id: "V-019", name: "Raza Javed", trackId: 5, violation: "no_vest", timestamp: "2026-05-12 11:45:02", confidence: "80.2%", status: "Medium" },
  { id: "V-024", name: "Ahmed Hassan", trackId: 3, violation: "no_boots", timestamp: "2026-05-11 15:05:33", confidence: "61.2%", status: "Medium" },
  { id: "V-025", name: "Ahmed Hassan", trackId: 3, violation: "no_helmet", timestamp: "2026-05-11 09:18:22", confidence: "88.7%", status: "Critical" },
];

interface ActivityEvent {
  key: number;
  type: "violation" | "compliant" | "info";
  severity: "critical" | "high" | "medium" | "ok" | "info";
  msg: string;
  time: string;
}

const activityTemplates: Omit<ActivityEvent, "key" | "time">[] = [
  { type: "violation", severity: "critical", msg: "Fatima Khan entered Zone A without a safety helmet" },
  { type: "compliant", severity: "ok", msg: "Track #36 confirmed fully compliant — all equipment in place" },
  { type: "violation", severity: "high", msg: "Safety goggles missing near heavy machinery in Zone B" },
  { type: "info", severity: "info", msg: "Automated compliance snapshot saved to audit log" },
  { type: "compliant", severity: "ok", msg: "Ahmed Hassan re-equipped and returned to Zone A safely" },
  { type: "violation", severity: "medium", msg: "Raza Javed entered Zone C without a required safety vest" },
  { type: "compliant", severity: "ok", msg: "Morning safety briefing complete — 8 personnel cleared" },
  { type: "violation", severity: "critical", msg: "No protective gloves detected near the chemical storage area" },
  { type: "info", severity: "info", msg: "Camera 2 repositioned for improved Zone B coverage" },
  { type: "violation", severity: "medium", msg: "Safety boots not detected on Track #14 in construction zone" },
];

const complianceData = [88.2, 85.6, 91.3, 87.5, 90.1, 88.7, 87.5];
const complianceDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dailyViolations = [3, 5, 2, 7, 4, 1, 2];
const violationTypes = [
  { label: "No Helmet", count: 14, color: "#1e3a5f" },
  { label: "No Goggles", count: 6, color: "#2c5aa0" },
  { label: "No Gloves", count: 4, color: "#4a7fc1" },
  { label: "No Boots", count: 3, color: "#7aaee0" },
  { label: "No Vest", count: 2, color: "#b8d4ef" },
];
const hourlyData = [
  { hour: "8 AM", count: 2 },
  { hour: "9 AM", count: 5 },
  { hour: "10 AM", count: 8 },
  { hour: "11 AM", count: 4 },
  { hour: "12 PM", count: 3 },
  { hour: "1 PM", count: 6 },
  { hour: "2 PM", count: 3 },
  { hour: "3 PM", count: 9 },
  { hour: "4 PM", count: 5 },
  { hour: "5 PM", count: 2 },
];

const formatViol = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const statusClass = (s: string) => (s === "Critical" ? "status-danger" : s === "High" ? "status-warning" : "status-info");

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUserState] = useState<SafeguardUser | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u?.loggedIn) {
      navigate({ to: "/" });
      return;
    }
    setUserState(u);
  }, [navigate]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".header-actions")) {
        setUserMenu(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const logout = () => {
    clearUser();
    navigate({ to: "/" });
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sectionLabels: Record<Section, string> = {
    overview: "Overview",
    analytics: "Analytics",
    violations: "Violations",
    reports: "Safety Reports",
    settings: "Settings",
  };

  return (
    <div className="dashboard-body" style={{ background: "#ffffff" }}>
      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`} style={{ background: "#1e3a5f", color: "#ffffff" }}>
        <div className="sidebar-logo">
          <img src={logo} alt="" />
          <span>SafeGuard AI</span>
        </div>
        <div className="sidebar-section-label">Main menu</div>
        <nav className="sidebar-nav">
          <NavItem active={section === "overview"} onClick={() => setSection("overview")} label="Overview" icon={<IcoGrid />} />
          <NavItem active={section === "analytics"} onClick={() => setSection("analytics")} label="Analytics" icon={<IcoChart />} />
          <NavItem active={section === "violations"} onClick={() => setSection("violations")} label="Violations" icon={<IcoAlert />} />
          <NavItem active={section === "reports"} onClick={() => setSection("reports")} label="Safety Reports" icon={<IcoFile />} />
          <NavItem active={section === "settings"} onClick={() => setSection("settings")} label="Settings" icon={<IcoCog />} />
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <a className="nav-item logout-item" onClick={logout} role="button">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16M4 6h16M4 18h16" />
            </svg>
          </button>
          <div style={{ flex: 1 }} />
          <div className="header-actions">
            <div
              className="header-user"
              onClick={(e) => {
                e.stopPropagation();
                setUserMenu((o) => !o);
              }}
              role="button"
            >
              <div className="header-avatar">{initials}</div>
              <span>{user.name.split(" ")[0]}</span>
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <div className={`user-dropdown${userMenu ? " active" : ""}`} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "6px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
              <a role="button" onClick={() => { setProfileOpen(true); setUserMenu(false); }}>
                <Ico>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </Ico>
                My profile
              </a>
              <hr />
              <a onClick={logout} className="danger" role="button">
                <Ico>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </Ico>
                Sign out
              </a>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {section !== "overview" && (
            <div className="page-title-bar">
              <h1 className="page-title">{sectionLabels[section]}</h1>
            </div>
          )}
          <section className={`content-section${section === "overview" ? " active" : ""}`}>
            <OverviewSection goAnalytics={() => setSection("analytics")} goReports={() => setSection("reports")} />
          </section>
          <section className={`content-section${section === "analytics" ? " active" : ""}`}>
            <AnalyticsSection />
          </section>
          <section className={`content-section${section === "violations" ? " active" : ""}`}>
            <ViolationsSection />
          </section>
          <section className={`content-section${section === "reports" ? " active" : ""}`}>
            <ReportsSection />
          </section>
          <section className={`content-section${section === "settings" ? " active" : ""}`}>
            <SettingsSection />
          </section>
        </div>
      </main>

      {/* PROFILE MODAL */}
      {profileOpen && (
        <div className="modal-overlay active" onClick={() => setProfileOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 440, width: "100%", padding: 36 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setProfileOpen(false)} aria-label="Close">
              <Ico><path d="M18 6L6 18M6 6l12 12" /></Ico>
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1e3a5f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                {initials}
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700 }}>{user.name}</h2>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>{user.role}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Email", value: user.email ?? "—" },
                { label: "Role", value: user.role },
                { label: "Status", value: "Active" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-app, #f3f4f6)", borderRadius: 6, border: "1px solid var(--border, #e5e7eb)" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function NavItem({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <a className={`nav-item${active ? " active" : ""}`} onClick={onClick} role="button">
      {icon}
      <span>{label}</span>
    </a>
  );
}

const IcoGrid = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IcoChart = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <path d="M2 20h20" />
  </svg>
);

const IcoAlert = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const IcoFile = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IcoCog = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m11 5h-6m-5 11v-6M1 12h6m11-6l-4.24 4.24m0 5.52l4.24 4.24M6.76 6.76L2.52 2.52m0 5.52L6.76 12.76" />
  </svg>
);

function OverviewSection({ goAnalytics, goReports }: { goAnalytics: () => void; goReports: () => void }) {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const keyRef = useRef(0);

  const makeEvent = (): ActivityEvent => {
    const tpl = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    return {
      ...tpl,
      key: keyRef.current++,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  useEffect(() => {
    const seed: ActivityEvent[] = [];
    for (let i = 0; i < 7; i++) seed.push(makeEvent());
    setActivity(seed);
    const t = setInterval(() => {
      if (!paused) setActivity((a) => [makeEvent(), ...a].slice(0, 30));
    }, 3800);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 24 }}>
        <div className="feed-container">
          <div className="card-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-header-title">
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <h3>Live Camera</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="feed-meta">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--danger)" }}>Recording</span>
                </span>
              </div>
              <button className="btn" style={{ whiteSpace: "nowrap", padding: "8px 16px", background: "#1e3a5f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={() => alert("Opening camera connection dialog...")}>
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M12 5v14" />
                  <path d="M19 12H5" />
                </svg>
                Connect
              </button>
            </div>
          </div>
          <div className="camera-display" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380, background: "#f3f4f6", borderRadius: "0 0 7px 7px" }}>
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 14 }}>
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#6b7280", margin: "0 0 4px" }}>No camera connected</p>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: 0 }}>Click Connect to add a camera feed</p>
            </div>
          </div>
        </div>

        <div className="activity-panel" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="card-header">
            <div className="card-header-title">
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3>Recent Activity</h3>
            </div>
            <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.72rem" }} onClick={() => setPaused((p) => !p)}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>
          <div className="activity-feed" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {activity.map((ev) => (
              <ActivityItem key={ev.key} event={ev} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const cfg: Record<ActivityEvent["severity"], { dot: string; label: string; bg: string }> = {
    critical: { dot: "#c41e3a", label: "Violation", bg: "#fef2f2" },
    high: { dot: "#2c5aa0", label: "Alert", bg: "#eff6ff" },
    medium: { dot: "#1e3a5f", label: "Warning", bg: "#f0f4f8" },
    ok: { dot: "#059669", label: "Compliant", bg: "#f0fdf4" },
    info: { dot: "#1e3a5f", label: "Info", bg: "#f0f4f8" },
  };
  const c = cfg[event.severity];
  return (
    <div className="activity-item" style={{ borderLeft: `3px solid ${c.dot}`, background: c.bg }}>
      <span className="activity-dot" style={{ background: c.dot }} />
      <div className="activity-body">
        <span className="activity-label" style={{ color: c.dot }}>{c.label}</span>
        <p className="activity-msg">{event.msg}</p>
      </div>
      <span className="activity-time">{event.time}</span>
    </div>
  );
}

function AnalyticsSection() {
  const total = violationTypes.reduce((s, v) => s + v.count, 0);
  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 28 }}>
        Visual breakdown of safety compliance across zones, violation categories, and time trends.
      </p>
      <div className="analytics-grid-top">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Compliance Rate</h3>
              <p className="chart-subtitle">Daily average over the past 7 days</p>
            </div>
            <span className="chart-badge" style={{ background: "var(--success-soft)", color: "var(--success)" }}>87.5% avg</span>
          </div>
          <LineChart data={complianceData} labels={complianceDays} color="#1e3a5f" min={78} max={96} unit="%" />
          <div className="chart-legend-row">
            {complianceDays.map((d, i) => (
              <div key={d} className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: complianceData[i] >= 88 ? "var(--success)" : "var(--warning)" }} />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Daily Violations</h3>
              <p className="chart-subtitle">Number of incidents per day this week</p>
            </div>
            <span className="chart-badge" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>24 today</span>
          </div>
          <BarChart data={dailyViolations} labels={complianceDays} color="#1e3a5f" />
        </div>
      </div>
      <div className="analytics-grid-bottom">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Violation Breakdown</h3>
              <p className="chart-subtitle">By PPE equipment category</p>
            </div>
          </div>
          <div className="donut-row">
            <DonutChart segments={violationTypes.map((v) => ({ label: v.label, value: v.count, color: v.color }))} />
            <div className="donut-legend">
              {violationTypes.map((v) => (
                <div key={v.label} className="donut-legend-item">
                  <span className="donut-legend-dot" style={{ background: v.color }} />
                  <span className="donut-legend-label">{v.label}</span>
                  <span className="donut-legend-count">{v.count}</span>
                  <span className="donut-legend-pct">{Math.round((v.count / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Violations by Hour</h3>
              <p className="chart-subtitle">When during the day violations occur most</p>
            </div>
            <span className="chart-badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Peak: 3 PM</span>
          </div>
          <HourlyChart data={hourlyData} />
          <div className="zone-summary-cards">
            <div className="zone-summary-item">
              <span className="zone-summary-val" style={{ color: "var(--danger)" }}>3 PM</span>
              <span className="zone-summary-label">Peak hour</span>
            </div>
            <div className="zone-summary-item">
              <span className="zone-summary-val" style={{ color: "var(--primary)" }}>47</span>
              <span className="zone-summary-label">Total today</span>
            </div>
            <div className="zone-summary-item">
              <span className="zone-summary-val" style={{ color: "var(--success)" }}>8 AM</span>
              <span className="zone-summary-label">Quietest hour</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LineChart({ data, labels, color, min, max, unit = "" }: { data: number[]; labels: string[]; color: string; min: number; max: number; unit?: string }) {
  const W = 400; const H = 130;
  const pad = { t: 14, b: 28, l: 34, r: 10 };
  const cW = W - pad.l - pad.r; const cH = H - pad.t - pad.b;
  const range = max - min;
  const pts = data.map((d, i) => ({ x: pad.l + (i / (data.length - 1)) * cW, y: pad.t + (1 - (d - min) / range) * cH }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${H - pad.b} L ${pad.l} ${H - pad.b} Z`;
  const yTicks = [min, Math.round((min + max) / 2), max];
  const gid = color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id={`lg${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((v) => {
        const gy = pad.t + (1 - (v - min) / range) * cH;
        return (
          <g key={v}>
            <line x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 3" />
            <text x={pad.l - 4} y={gy + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">{v}{unit}</text>
          </g>
        );
      })}
      <path d={area} fill={`url(#lg${gid})`} />
      <path d={path} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />)}
      {labels.map((l, i) => <text key={l} x={pts[i].x} y={H - 5} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{l}</text>)}
    </svg>
  );
}

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const mx = Math.max(...data);
  const W = 400; const H = 130;
  const pad = { t: 10, b: 28, l: 16, r: 12 };
  const cW = W - pad.l - pad.r; const cH = H - pad.t - pad.b;
  const bW = cW / data.length; const gap = bW * 0.28;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const bH = (d / mx) * cH; const bX = pad.l + i * bW + gap / 2; const bY = pad.t + cH - bH;
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={bX} y={bY} width={bW - gap} height={bH} rx="4" fill={isLast ? color : `${color}55`} />
            <text x={bX + (bW - gap) / 2} y={bY - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill={isLast ? color : "var(--text-muted)"}>{d}</text>
            <text x={bX + (bW - gap) / 2} y={H - 5} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function HourlyChart({ data }: { data: { hour: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="hourly-chart">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const isPeak = d.count === max;
        return (
          <div key={d.hour} className="hourly-row">
            <span className="hourly-label">{d.hour}</span>
            <div className="hourly-track">
              <div className="hourly-fill" style={{ width: `${pct}%`, background: isPeak ? "linear-gradient(90deg, #1e3a5f, #c41e3a)" : "linear-gradient(90deg, #1e3a5f, #4a7fc1)" }} />
            </div>
            <span className="hourly-count" style={{ color: isPeak ? "#c41e3a" : "var(--text-muted)" }}>{d.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const sz = 150; const cx = 75; const cy = 75; const R = 56; const ir = 36;
  let angle = -90;
  const arcs = segments.map((seg) => {
    const frac = seg.value / total; const sA = angle; const eA = angle + frac * 360; angle = eA;
    const sR = (sA * Math.PI) / 180; const eR = (eA * Math.PI) / 180;
    const x1 = cx + R * Math.cos(sR); const y1 = cy + R * Math.sin(sR);
    const x2 = cx + R * Math.cos(eR); const y2 = cy + R * Math.sin(eR);
    const xi1 = cx + ir * Math.cos(sR); const yi1 = cy + ir * Math.sin(sR);
    const xi2 = cx + ir * Math.cos(eR); const yi2 = cy + ir * Math.sin(eR);
    const lg = frac > 0.5 ? 1 : 0;
    return { d: `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${ir} ${ir} 0 ${lg} 0 ${xi1} ${yi1}Z`, color: seg.color };
  });
  return (
    <svg viewBox={`0 0 ${sz} ${sz}`} style={{ width: 150, height: 150, flexShrink: 0 }}>
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-primary)">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">violations</text>
    </svg>
  );
}

function ViolationsSection() {
  const [search, setSearch] = useState("");
  const [ppe, setPpe] = useState("all");
  const [active, setActive] = useState<Violation | null>(null);

  const filtered = dummyViolations.filter((v) => {
    if (ppe !== "all" && v.violation !== ppe) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!v.name.toLowerCase().includes(s) && !String(v.trackId).includes(s)) return false;
    }
    return true;
  });

  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 20 }}>All recorded PPE non-compliance events with filtering and export.</p>
      <div className="violations-summary-row">
        <div className="vsummary-pill vsummary-critical"><span className="vsummary-num">14</span><span>Critical</span></div>
        <div className="vsummary-pill vsummary-high"><span className="vsummary-num">6</span><span>High</span></div>
        <div className="vsummary-pill vsummary-medium"><span className="vsummary-num">4</span><span>Medium</span></div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-outline" onClick={() => alert("Exported violations_audit.csv")}>
          <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Ico>
          Export CSV
        </button>
      </div>
      <div className="card db-card">
        <div className="db-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Search personnel</label>
              <input type="text" placeholder="Name or Track ID" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>PPE category</label>
              <select value={ppe} onChange={(e) => setPpe(e.target.value)}>
                <option value="all">All categories</option>
                <option value="no_helmet">No helmet</option>
                <option value="no_goggle">No goggles</option>
                <option value="no_gloves">No gloves</option>
                <option value="no_boots">No boots</option>
                <option value="no_vest">No vest</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date range</label>
              <div className="date-range"><input type="date" /><input type="date" /></div>
            </div>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Audit ID</th><th>Personnel</th><th>Track</th><th>Violation</th><th>Timestamp</th><th>Confidence</th><th>Severity</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.id}</strong></td>
                  <td>{v.name}</td>
                  <td><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>#{v.trackId}</span></td>
                  <td>
                    <span className="violation-pill" style={{ background: v.status === "Critical" ? "var(--danger-soft)" : v.status === "High" ? "var(--warning-soft)" : "var(--primary-soft)", color: v.status === "Critical" ? "var(--danger)" : v.status === "High" ? "var(--warning)" : "var(--primary)" }}>
                      {formatViol(v.violation)}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{v.timestamp}</td>
                  <td><strong>{v.confidence}</strong></td>
                  <td><span className={`status ${statusClass(v.status)}`}>{v.status}</span></td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => setActive(v)} title="View snapshot">
                      <Ico><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Ico>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {filtered.length} of {dummyViolations.length} records</span>
          <div className="pagination">
            <button className="btn btn-outline" disabled>Previous</button>
            <button className="btn btn-outline">Next</button>
          </div>
        </div>
      </div>
      {active && (
        <div className="modal-overlay active" onClick={() => setActive(null)}>
          <div className="modal-content" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActive(null)} aria-label="Close"><Ico><path d="M18 6L6 18M6 6l12 12" /></Ico></button>
            <img src={heroImg} alt="" />
            <div className="modal-caption">{active.id} · {active.name} · Track #{active.trackId} · {formatViol(active.violation)} · Confidence {active.confidence}</div>
          </div>
        </div>
      )}
    </>
  );
}

function ReportsSection() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const generate = () => { setOpen(true); setLoading(true); setTimeout(() => setLoading(false), 1600); };

  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 28 }}>Generate detailed compliance audit reports for supervisors and safety stakeholders.</p>
      <div className="reports-layout">
        <div className="report-left">
          <div className="report-meta-card">
            <div className="rmc-header">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <h2>Compliance Audit Report</h2>
            </div>
            <p className="rmc-desc">A full analysis of PPE compliance across all monitored zones, including violation patterns, high-risk individuals, and actionable recommendations.</p>
            <div className="rmc-stats">
              <div className="rmc-stat"><span className="rmc-stat-val">24</span><span className="rmc-stat-lbl">Violations</span></div>
              <div className="rmc-stat"><span className="rmc-stat-val">4</span><span className="rmc-stat-lbl">Personnel flagged</span></div>
              <div className="rmc-stat"><span className="rmc-stat-val">87.5%</span><span className="rmc-stat-lbl">Compliance</span></div>
              <div className="rmc-stat"><span className="rmc-stat-val">13 days</span><span className="rmc-stat-lbl">Period</span></div>
            </div>
            <div className="rmc-period">
              <Ico><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Ico>
              <span>Period: <strong>May 1 – May 13, 2026</strong></span>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={generate}>
              <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Ico>
              Generate compliance audit
            </button>
          </div>
        </div>
        <div className="report-right">
          <div className="report-history-card">
            <h3 className="report-history-title">Previous Reports</h3>
            {[
              { date: "May 12, 2026", rate: "89.2%", status: "Good" },
              { date: "May 11, 2026", rate: "85.7%", status: "Fair" },
              { date: "May 10, 2026", rate: "91.4%", status: "Excellent" },
              { date: "May 9, 2026", rate: "84.1%", status: "Fair" },
            ].map((r) => (
              <div key={r.date} className="report-history-item">
                <div className="rhi-left">
                  <span className="rhi-date">{r.date}</span>
                  <span className={`rhi-status rhi-${r.status.toLowerCase()}`}>{r.status}</span>
                </div>
                <div className="rhi-right">
                  <span className="rhi-rate">{r.rate}</span>
                  <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => alert(`Downloading ${r.date} report`)}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {open && (
        <div className="modal-overlay active" onClick={() => setOpen(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close"><Ico><path d="M18 6L6 18M6 6l12 12" /></Ico></button>
            {loading ? (
              <div className="loading-state">
                <div className="spinner-lg" />
                <p><strong>Analyzing compliance data…</strong></p>
                <p style={{ marginTop: 6, fontSize: "0.8rem", color: "var(--text-muted)" }}>Processing 24 events across 4 personnel</p>
              </div>
            ) : (
              <ReportPDF />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ReportPDF() {
  const dateStr = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
  return (
    <div className="report-pdf">
      <div className="report-pdf-header">
        <div>
          <h1>PPE Compliance Audit</h1>
          <p>Generated {dateStr} · NED University Safety Monitoring</p>
        </div>
        <div className="report-pdf-badge">Audit Report</div>
      </div>
      <div className="report-section">
        <h2>Executive Summary</h2>
        <p>This report covers PPE compliance from <strong>May 1–13, 2026</strong>. Automated monitoring recorded <strong>24 violations</strong> across <strong>4 personnel</strong> in two active zones. Site-wide compliance averaged <strong>87.5%</strong>, with helmet non-compliance as the leading category.</p>
      </div>
      <div className="report-section">
        <h2>Violation Breakdown</h2>
        <table className="report-table">
          <thead><tr><th>Category</th><th>Count</th><th>Share</th><th>Severity</th></tr></thead>
          <tbody>
            <tr><td>No Helmet</td><td>14</td><td>58%</td><td><span className="status status-danger">Critical</span></td></tr>
            <tr><td>No Goggles</td><td>6</td><td>25%</td><td><span className="status status-warning">High</span></td></tr>
            <tr><td>No Gloves</td><td>4</td><td>17%</td><td><span className="status status-info">Medium</span></td></tr>
          </tbody>
        </table>
      </div>
      <div className="report-section">
        <h2>High-Risk Personnel</h2>
        <p><strong>Track #1 (Fatima Khan)</strong> accounts for <strong>14 violations (58%)</strong> of all incidents. Pattern shows consistent helmet non-compliance during morning shifts in Zone A. Immediate supervisory review and PPE re-certification are recommended per Safety Protocol Rev 4.0.</p>
      </div>
      <div className="report-section">
        <h2>Recommendations</h2>
        <ul>
          <li>Add a PPE equipment checkpoint at the Zone A entrance before every shift.</li>
          <li>Schedule a helmet safety workshop for the morning team.</li>
          <li>Enable audio-visual alerts for high-confidence violations (&gt;85%).</li>
          <li>Send weekly compliance summaries to all site supervisors.</li>
          <li>Update the Safety Matrix based on this monitoring cycle's findings.</li>
        </ul>
      </div>
      <div className="report-actions">
        <button className="btn btn-primary" onClick={() => alert("PDF download initiated")}>
          <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Ico>
          Download PDF
        </button>
        <button className="btn btn-outline" onClick={() => alert("Report sent to stakeholders")}>
          <Ico><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Ico>
          Email to stakeholders
        </button>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [conf, setConf] = useState(45);
  const [iou, setIou] = useState(50);
  const [votes, setVotes] = useState(8);
  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 28 }}>Adjust detection sensitivity and monitoring parameters for the camera system.</p>
      <div className="card settings-card">
        <div className="settings-grid">
          <div className="form-group">
            <label>Confidence threshold</label>
            <input type="range" min={0} max={100} value={conf} onChange={(e) => setConf(Number(e.target.value))} />
            <div className="range-display"><span>Current: <strong>{conf}%</strong></span><span>Recommended: 40–60%</span></div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>Higher values reduce false alarms but may miss borderline violations.</p>
          </div>
          <div className="form-group">
            <label>Tracking overlap (IoU)</label>
            <input type="range" min={0} max={100} value={iou} onChange={(e) => setIou(Number(e.target.value))} />
            <div className="range-display"><span>Current: <strong>{(iou / 100).toFixed(2)}</strong></span><span>Recommended: 0.45–0.55</span></div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>Controls how closely tracked people must overlap between frames.</p>
          </div>
          <div className="form-group">
            <label>Vote-buffer consensus (frames)</label>
            <input type="range" min={1} max={30} value={votes} onChange={(e) => setVotes(Number(e.target.value))} />
            <div className="range-display"><span>Current: <strong>{votes} / 15 frames</strong></span><span>Recommended: 6–10</span></div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>How many consecutive frames must agree before a violation is confirmed.</p>
          </div>
        </div>
        <hr className="settings-divider" />
        <button className="btn btn-primary" onClick={() => alert("Configuration saved successfully")}>
          <Ico><path d="M20 6L9 17l-5-5" /></Ico>
          Save configuration
        </button>
      </div>
    </>
  );
}

export default DashboardPage;

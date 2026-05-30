import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import logo from "@/assets/logo.png";
import heroImg from "@/assets/login-hero.png";
import { clearUser, getUser, type SafeguardUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | SafeGuard AI" }] }),
  component: DashboardPage,
});

type Section = "hub" | "database" | "settings";

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

const logTemplates = [
  { level: "info", msg: "YOLOv11: inference cycle complete [42ms]. 3 personnel detected." },
  { level: "info", msg: "Tracker: Track #25 matched via IoU (0.88). ID maintained." },
  { level: "warn", msg: "PPE alert: potential NO_HELMET detected [Track #25]. Vote buffer 8/15." },
  { level: "success", msg: "Audit: Track #36 confirmed compliant (helmet, vest, goggles)." },
  { level: "error", msg: "Violation: Track #25 — NO_HELMET confirmed. Entry appended." },
  { level: "info", msg: "Gemini AI: scheduled data ingestion for compliance report." },
  { level: "info", msg: "Heartbeat: CAM 01 [Zone A] — status operational." },
  { level: "success", msg: "Audit: Track #41 confirmed compliant (helmet, vest, gloves, boots)." },
  { level: "warn", msg: "PPE alert: potential NO_GLOVES detected [Track #18]. Buffer 5/15." },
] as const;

interface LogEntry { time: string; level: string; msg: string; key: number }

function formatViol(v: string) {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(s: string) {
  if (s === "Critical") return "status-danger";
  if (s === "High") return "status-warning";
  return "status-info";
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUserState] = useState<SafeguardUser | null>(null);
  const [section, setSection] = useState<Section>("hub");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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
      const t = e.target as HTMLElement;
      if (!t.closest(".header-actions")) {
        setUserMenu(false);
        setNotifOpen(false);
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
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="dashboard-body">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="" />
          <span>SafeGuard AI</span>
        </div>

        <div className="sidebar-section-label">Workspace</div>

        <nav className="sidebar-nav">
          <NavItem active={section === "hub"} onClick={() => setSection("hub")} label="Monitoring Hub" icon={
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          } />
          <NavItem active={section === "database"} onClick={() => setSection("database")} label="Violation Records" icon={
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14a9 3 0 0 0 18 0V5" />
              <path d="M3 12a9 3 0 0 0 18 0" />
            </svg>
          } />
          <NavItem active={section === "settings"} onClick={() => setSection("settings")} label="Configuration" icon={
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          } />
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <a className="nav-item logout-item" onClick={logout}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </a>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16M4 6h16M4 18h16" />
            </svg>
          </button>

          <div className="header-search">
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input type="text" placeholder="Search violations, personnel, or events…" />
          </div>

          <div className="header-actions">
            <div className="system-status">
              <span className="status-dot" />
              System operational
            </div>

            <button
              className="header-btn"
              onClick={(e) => { e.stopPropagation(); setNotifOpen((o) => !o); setUserMenu(false); }}
              aria-label="Notifications"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notif-badge">3</span>
            </button>

            <div className="header-user" onClick={(e) => { e.stopPropagation(); setUserMenu((o) => !o); setNotifOpen(false); }}>
              <div className="header-avatar">{initials}</div>
              <span>{user.name.split(" ")[0]}</span>
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            <div className={`user-dropdown${userMenu ? " active" : ""}`}>
              <a><Icon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>Operator profile</a>
              <a><Icon><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24" /></Icon>Workstation settings</a>
              <hr />
              <a onClick={logout} className="danger">
                <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>
                Sign out
              </a>
            </div>

            <div className={`notifications-panel${notifOpen ? " active" : ""}`}>
              <div className="notif-header">
                <h3>Notifications</h3>
                <button>Mark all read</button>
              </div>
              <div className="notif-list">
                <NotifItem unread variant="danger" title="Critical: No helmet detected" body="Track #25 (Fatima Khan) flagged in Zone A." time="2 minutes ago" />
                <NotifItem unread variant="warning" title="Compliance threshold drop" body="Zone B compliance fell below 85%." time="14 minutes ago" />
                <NotifItem variant="info" title="Daily report ready" body="Compliance audit for May 12 is available." time="1 hour ago" />
              </div>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <section className={`content-section${section === "hub" ? " active" : ""}`}>
            <HubSection />
          </section>
          <section className={`content-section${section === "database" ? " active" : ""}`}>
            <DatabaseSection />
          </section>
          <section className={`content-section${section === "settings" ? " active" : ""}`}>
            <SettingsSection />
          </section>
        </div>
      </main>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function NavItem({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <a className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </a>
  );
}

function NotifItem({ unread, variant, title, body, time }: { unread?: boolean; variant: "danger" | "warning" | "info"; title: string; body: string; time: string }) {
  const styles =
    variant === "warning" ? { background: "var(--warning-soft)", color: "var(--warning)" } :
    variant === "info" ? { background: "var(--info-soft)", color: "var(--info)" } : undefined;
  return (
    <div className={`notif-item${unread ? " unread" : ""}`}>
      <div className="notif-icon" style={styles}>
        <Icon><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></Icon>
      </div>
      <div className="notif-content">
        <strong>{title}</strong>
        <p>{body}</p>
        <span className="notif-time">{time}</span>
      </div>
    </div>
  );
}

/* ============ HUB ============ */
function HubSection() {
  const [time, setTime] = useState("");
  const [frame, setFrame] = useState(1281);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const keyRef = useRef(0);

  useEffect(() => {
    const fmt = () => {
      const n = new Date();
      const pad = (x: number) => String(x).padStart(2, "0");
      setTime(`${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())} ${n.toTimeString().split(" ")[0]}`);
    };
    fmt();
    const t = setInterval(fmt, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => f + Math.floor(Math.random() * 3) + 1), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const seed: LogEntry[] = [];
    for (let i = 0; i < 5; i++) {
      const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      seed.unshift({ ...tpl, time: new Date().toTimeString().split(" ")[0], key: keyRef.current++ });
    }
    setLogs(seed);
    const t = setInterval(() => {
      if (paused) return;
      const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setLogs((l) => [{ ...tpl, time: new Date().toTimeString().split(" ")[0], key: keyRef.current++ }, ...l].slice(0, 60));
    }, 2200);
    return () => clearInterval(t);
  }, [paused]);

  const generateReport = () => {
    setReportOpen(true);
    setReportLoading(true);
    setTimeout(() => setReportLoading(false), 1500);
  };

  return (
    <>
      <div className="hub-header">
        <div>
          <h1>Monitoring Command Center</h1>
          <p className="section-subtitle">Real-time PPE compliance streaming and AI-driven oversight</p>
        </div>
        <div className="hub-actions">
          <div className="live-indicator"><span className="live-dot" />Live stream</div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard color="success" value="87.5%" label="Compliance rate" delta="2.1%" deltaDir="up" icon={<Icon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Icon>} />
        <StatCard color="danger" value="24" label="Total violations" delta="12%" deltaDir="down" icon={<Icon><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></Icon>} />
        <StatCard color="info" value="8" label="Active personnel" delta="+2" deltaDir="up" icon={<Icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>} />
        <StatCard color="primary" value="2 / 2" label="Cameras online" delta="All operational" deltaDir="up" muted icon={<Icon><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></Icon>} />
      </div>

      <div className="hub-grid">
        <div className="feed-container">
          <div className="card-header">
            <div className="card-header-title">
              <Icon><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></Icon>
              <h3>CAM 01 — Zone A Entrance</h3>
            </div>
            <div className="feed-meta">
              <span>FPS 24</span>
              <span>Frame <strong>{frame.toLocaleString()}</strong></span>
            </div>
          </div>
          <div className="camera-display">
            <div className="camera-overlay-ui">
              <span className="cam-label">PRIMARY FEED</span>
              <span className="cam-timestamp">{time}</span>
            </div>
            <div className="camera-frame">
              <div className="detection-box green" style={{ top: "22%", left: "14%", width: "22%", height: "58%" }}>
                <span className="det-label">Person 01 · Compliant</span>
              </div>
              <div className="detection-box red" style={{ top: "18%", left: "56%", width: "24%", height: "62%" }}>
                <span className="det-label">Person 02 · No Helmet</span>
              </div>
              <div className="cam-scoreboard">
                <div className="sb-title">Active Violations</div>
                <div className="sb-row"><span>Track #02 — No Helmet</span> <span className="sb-count">1</span></div>
                <div className="sb-row"><span>Track #05 — No Gloves</span> <span className="sb-count">2</span></div>
                <div className="sb-row"><span>Track #07 — No Vest</span> <span className="sb-count">1</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-panels">
          <div className="report-panel">
            <div className="card-header">
              <div className="card-header-title">
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <h3>Report Generator</h3>
              </div>
              <span className="status status-info">Gemini AI</span>
            </div>
            <div className="report-body">
              <p className="report-intro">Generate a comprehensive PPE compliance audit using AI-driven analysis of today's monitoring data.</p>
              <div className="report-summary-card">
                <Icon><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Icon>
                <div className="report-summary-card-text">
                  <strong>Today's snapshot:</strong> 24 violations detected across 4 personnel. No helmet incidents represent the dominant pattern (58%).
                </div>
              </div>
              <div className="report-quick-stats">
                <div className="qs-item"><div className="qs-label">Period</div><div className="qs-value">May 1 – 13</div></div>
                <div className="qs-item"><div className="qs-label">Events analyzed</div><div className="qs-value">24</div></div>
              </div>
            </div>
            <div className="report-footer">
              <button className="btn btn-primary" onClick={generateReport}>
                <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Icon>
                Generate compliance audit
              </button>
            </div>
          </div>

          <div className="logs-panel">
            <div className="card-header">
              <div className="card-header-title">
                <Icon><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></Icon>
                <h3>Event Stream</h3>
              </div>
              <div className="log-actions">
                <button className="btn-ghost" onClick={() => setPaused((p) => !p)} title={paused ? "Resume" : "Pause"}>
                  {paused ? (
                    <Icon><polygon points="5 3 19 12 5 21 5 3" /></Icon>
                  ) : (
                    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  )}
                </button>
                <button className="btn-ghost" onClick={() => setLogs([])} title="Clear">
                  <Icon><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>
                </button>
              </div>
            </div>
            <div className="log-stream">
              {logs.map((l) => (
                <div className="log-entry" key={l.key}>
                  <span className="log-time">{l.time}</span>
                  <span className={`log-level ${l.level}`}>{l.level}</span>
                  <span className="log-msg">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reportOpen && (
        <div className="modal-overlay active" onClick={() => setReportOpen(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setReportOpen(false)} aria-label="Close">
              <Icon><path d="M18 6L6 18M6 6l12 12" /></Icon>
            </button>
            {reportLoading ? (
              <div className="loading-state">
                <div className="spinner-lg" />
                <p><strong>Gemini AI is analyzing your violation data…</strong></p>
                <p style={{ marginTop: 6, fontSize: "0.8rem" }}>Aggregating 24 events across 4 personnel</p>
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

function StatCard({ color, value, label, delta, deltaDir, muted, icon }: { color: "success" | "danger" | "info" | "primary"; value: string; label: string; delta: string; deltaDir: "up" | "down"; muted?: boolean; icon: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `var(--${color}-soft)`, color: `var(--${color})` }}>
        {icon}
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        <span className={`stat-delta ${deltaDir}`} style={muted ? { color: "var(--text-muted)" } : undefined}>
          {!muted && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              {deltaDir === "up" ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
          )}
          {delta}
        </span>
      </div>
    </div>
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
        <div className="report-pdf-badge">Gemini AI</div>
      </div>
      <div className="report-section">
        <h2>Executive summary</h2>
        <p>This report documents personal protective equipment (PPE) compliance metrics captured between May 1, 2026 and May 13, 2026. Automated computer vision monitoring detected <strong>24 violation events</strong> across <strong>4 identified personnel</strong> spanning two active monitoring zones. Overall compliance averaged <strong>87.5%</strong>, with the dominant violation category being helmet non-compliance.</p>
      </div>
      <div className="report-section">
        <h2>Violation distribution</h2>
        <table className="report-table">
          <thead><tr><th>Category</th><th>Count</th><th>Share</th><th>Criticality</th></tr></thead>
          <tbody>
            <tr><td>No Helmet</td><td>14</td><td>58%</td><td><span className="status status-danger">Critical</span></td></tr>
            <tr><td>No Goggles</td><td>6</td><td>25%</td><td><span className="status status-warning">High</span></td></tr>
            <tr><td>No Gloves</td><td>4</td><td>17%</td><td><span className="status status-info">Medium</span></td></tr>
          </tbody>
        </table>
      </div>
      <div className="report-section">
        <h2>High-risk personnel</h2>
        <p>Personnel <strong>Track #1 (Fatima Khan)</strong> has been flagged for <strong>14 events</strong>, accounting for 58% of total violations. The pattern indicates sustained non-compliance with helmet protocols during morning shifts in Zone A. Per safety protocol Rev 4.0, immediate supervisory intervention and mandatory PPE re-certification are required.</p>
      </div>
      <div className="report-section">
        <h2>Recommendations</h2>
        <ul>
          <li>Implement shift-start PPE verification checkpoints at the Zone A north entrance.</li>
          <li>Enable automated audio-visual triggers for detections exceeding 90% confidence.</li>
          <li>Schedule 15-minute toolbox talks focused on helmet safety for the morning shift cohort.</li>
          <li>Distribute weekly summary reports to site managers covering repeat offenders.</li>
          <li>Update the Safety Matrix to incorporate results from this monitoring cycle.</li>
        </ul>
      </div>
      <div className="report-section">
        <h2>Confidence & methodology</h2>
        <p>Detections were performed using YOLOv11 with a confidence threshold of 45% and IoU tracking threshold of 0.50. Vote-buffer consensus (8 of 15 frames) was applied to suppress transient false positives. Analysis confidence: <strong>92.1%</strong>.</p>
      </div>
      <div className="report-actions">
        <button className="btn btn-primary" onClick={() => alert("PDF download initiated")}>
          <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>
          Download as PDF
        </button>
        <button className="btn btn-outline" onClick={() => alert("Report sent to stakeholders")}>
          <Icon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>
          Email to stakeholders
        </button>
      </div>
    </div>
  );
}

/* ============ DATABASE ============ */
function DatabaseSection() {
  const [search, setSearch] = useState("");
  const [ppe, setPpe] = useState("all");
  const [active, setActive] = useState<Violation | null>(null);

  const filtered = useMemo(() => {
    return dummyViolations.filter((v) => {
      if (ppe !== "all" && v.violation !== ppe) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!v.name.toLowerCase().includes(s) && !String(v.trackId).includes(s)) return false;
      }
      return true;
    });
  }, [search, ppe]);

  return (
    <>
      <div className="section-header">
        <div>
          <h1>Violation Records</h1>
          <p className="section-subtitle">Historical PPE non-compliance events with full audit trail</p>
        </div>
        <button className="btn btn-outline" onClick={() => alert("Violation audit exported to violations_audit_history.csv")}>
          <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>
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
              <div className="date-range">
                <input type="date" />
                <input type="date" />
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th><th>Personnel</th><th>Track</th><th>Violation type</th>
                <th>Timestamp</th><th>Confidence</th><th>Severity</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.id}</strong></td>
                  <td>{v.name}</td>
                  <td><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>#{v.trackId}</span></td>
                  <td>{formatViol(v.violation)}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{v.timestamp}</td>
                  <td><strong>{v.confidence}</strong></td>
                  <td><span className={`status ${statusClass(v.status)}`}>{v.status}</span></td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => setActive(v)} title="View snapshot">
                      <Icon><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>
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
            <button className="modal-close" onClick={() => setActive(null)} aria-label="Close">
              <Icon><path d="M18 6L6 18M6 6l12 12" /></Icon>
            </button>
            <img src={heroImg} alt="" />
            <div className="modal-caption">
              {active.id}  •  {active.name}  •  Track #{active.trackId}  •  {active.violation.toUpperCase()}  •  Confidence {active.confidence}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============ SETTINGS ============ */
function SettingsSection() {
  const [conf, setConf] = useState(45);
  const [iou, setIou] = useState(50);
  return (
    <>
      <div className="section-header">
        <div>
          <h1>Inference Configuration</h1>
          <p className="section-subtitle">Adjust YOLOv11 detection thresholds and monitoring parameters</p>
        </div>
      </div>

      <div className="card settings-card">
        <div className="settings-grid">
          <div className="form-group">
            <label>Detection confidence threshold</label>
            <input type="range" min={0} max={100} value={conf} onChange={(e) => setConf(Number(e.target.value))} />
            <div className="range-display">
              <span>Current: <strong>{conf}%</strong></span>
              <span>Recommended: 40–60%</span>
            </div>
          </div>
          <div className="form-group">
            <label>IoU tracking threshold</label>
            <input type="range" min={0} max={100} value={iou} onChange={(e) => setIou(Number(e.target.value))} />
            <div className="range-display">
              <span>Current: <strong>{(iou / 100).toFixed(2)}</strong></span>
              <span>Recommended: 0.45–0.55</span>
            </div>
          </div>
        </div>

        <hr className="settings-divider" />

        <div className="form-group">
          <label>Active monitoring zones</label>
          <div className="zones-list">
            <label className="checkbox-label"><input type="checkbox" defaultChecked /> Zone A — Entrance</label>
            <label className="checkbox-label"><input type="checkbox" defaultChecked /> Zone B — Welding</label>
            <label className="checkbox-label"><input type="checkbox" /> Zone C — Storage</label>
            <label className="checkbox-label"><input type="checkbox" /> Zone D — Loading dock</label>
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => alert("Configuration saved")}>
          <Icon><path d="M20 6L9 17l-5-5" /></Icon>
          Save configuration
        </button>
      </div>
    </>
  );
}

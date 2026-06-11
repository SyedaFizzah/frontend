import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.png";
import test1 from "@/assets/test1.jpeg";
import test2 from "@/assets/test2.jpeg";
import test3 from "@/assets/test3.jpeg";
import test4 from "@/assets/test4.jpeg";

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

type Section = "overview" | "analytics" | "violations" | "reports" | "settings" | "authorize";

interface Violation {
  id: string;
  name: string;
  trackId: number;
  violation: string;
  timestamp: string;
  confidence: string;
  status: "Critical" | "High" | "Medium";
  pic_path?: string;
}

const dummyViolations: Violation[] = [];

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
const dailyViolations = [0, 0, 0, 0, 0, 0, 0];
const violationTypes: { label: string; count: number; color: string }[] = [];
const hourlyData: { hour: string; count: number }[] = [];

const formatViol = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const statusClass = (s: string) => (s === "Critical" ? "status-danger" : s === "High" ? "status-warning" : "status-info");

const API = "http://127.0.0.1:8000";

interface AnalyticsData {
  complianceData: number[];
  complianceDays: string[];
  avgCompliance: number;
  dailyViolations: number[];
  violationTypes: { label: string; count: number; color: string }[];
  totalViolations: number;
  hourlyData: { hour: string; count: number }[];
  todayViolations: number;
  peakHour: string;
  quietestHour: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUserState] = useState<SafeguardUser | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [violationsData, setViolationsData] = useState<Violation[]>([]);

  useEffect(() => {
    fetch(`${API}/analytics`).then(r => r.json()).then(setAnalyticsData).catch(() => { });
    fetch(`${API}/violations`).then(r => r.json()).then(setViolationsData).catch(() => { });
  }, []);

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
    authorize: "Authorize",
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
          {user.role === "Site Owner" && (
            <NavItem active={section === "authorize"} onClick={() => setSection("authorize")} label="Authorize" icon={<Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Ico>} />
          )}
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
            <AnalyticsSection data={analyticsData} />
          </section>
          <section className={`content-section${section === "violations" ? " active" : ""}`}>
            <ViolationsSection violations={violationsData} />
          </section>
          <section className={`content-section${section === "reports" ? " active" : ""}`}>
            <ReportsSection />
          </section>
          {user.role === "Site Owner" && (
            <section className={`content-section${section === "authorize" ? " active" : ""}`}>
              <AuthorizeSection />
            </section>
          )}
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
                { label: "Status", value: "Active", isStatus: true },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--bg-app, #f3f4f6)",
                    borderRadius: 6,
                    border: "1px solid var(--border, #e5e7eb)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {row.label}
                  </span>

                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color:
                        row.isStatus && row.value === "Active"
                          ? "#16a34a" // green text
                          : "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {row.isStatus && row.value === "Active" && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#22c55e",
                          display: "inline-block",
                        }}
                      />
                    )}
                    {row.value}
                  </span>
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const keyRef = useRef(0);
  const [connectOpen, setConnectOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [activeCameraUrl, setActiveCameraUrl] = useState<string | null>(null);

  const images = [test1, test2, test3, test4];

  const makeEvent = (): ActivityEvent => {
    const tpl = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    return {
      ...tpl,
      key: keyRef.current++,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  useEffect(() => {
    let active = true;
    if (activeCameraUrl) {
      // Connect to Real-time FastApi Stream Logging!
      setActivity([]);
      const sse = new EventSource("http://127.0.0.1:8000/logs");
      sse.onmessage = (e) => {
        const ev = JSON.parse(e.data);
        setActivity((prev) => [ev, ...prev].slice(0, 50));
      };
      return () => { sse.close(); active = false; };
    } else {
      // Fetch historical logs from API when unhooked.
      fetch("http://127.0.0.1:8000/history")
        .then(res => res.json())
        .then(data => {
          if (active) setActivity(data);
        })
        .catch(err => {
          console.error(err);
          // Fallback to random test seeds if API falls
          const seed: ActivityEvent[] = [];
          for (let i = 0; i < 7; i++) seed.push(makeEvent());
          if (active) setActivity(seed);
        });

      return () => { active = false; };
    }
  }, [activeCameraUrl]);

  // Image slideshow interval
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(imageInterval);
  }, []);

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
              <button className="btn" style={{ whiteSpace: "nowrap", padding: "8px 16px", background: activeCameraUrl ? "#c41e3a" : "#1e3a5f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={() => { if (activeCameraUrl) setActiveCameraUrl(null); else setConnectOpen(true); }}>
                {activeCameraUrl ? (
                  <>
                    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                    Disconnect
                  </>
                ) : (
                  <>
                    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M12 5v14" />
                      <path d="M19 12H5" />
                    </svg>
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="camera-display" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380, background: "#f3f4f6", borderRadius: "0 0 7px 7px", overflow: "hidden", position: "relative" }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .camera-image {
                position: absolute;
                width: 100%;
                height: 100%;
                object-fit: cover;
                animation: fadeIn 1s ease-in-out;
              }
            `}</style>
            {activeCameraUrl ? (
              <img src={activeCameraUrl} alt="Live YOLO Stream" className="camera-image" style={{ opacity: 1, zIndex: 1, objectFit: "contain", background: "#000" }} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: "#94a3b8" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.5 }}>
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span style={{ fontSize: "0.9rem", fontWeight: 500, textAlign: "center", lineHeight: 1.5 }}>No camera connected<br /><span style={{ fontSize: "0.78rem", fontWeight: 400, opacity: 0.75 }}>Click Connect to begin live monitoring</span></span>
              </div>
            )}
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

      {/* IP Modal */}
      {connectOpen && (
        <div className="modal-overlay active" onClick={() => setConnectOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 440, width: "100%", padding: 36, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConnectOpen(false)} aria-label="Close" style={{ background: "none", border: "none", position: "absolute", top: 16, right: 16, cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Connect IP Camera</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Enter the IP camera address to begin real-time analysis streaming.</p>
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <input type="text" className="form-input" placeholder="e.g. 192.168.0.100:8080" value={inputUrl} onChange={e => setInputUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && inputUrl) { setActiveCameraUrl(`http://127.0.0.1:8000/video_feed?url=${encodeURIComponent(inputUrl)}`); setConnectOpen(false); } }} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", height: 42, fontSize: "0.875rem" }} onClick={() => { if (inputUrl) { setActiveCameraUrl(`http://127.0.0.1:8000/video_feed?url=${encodeURIComponent(inputUrl)}`); setConnectOpen(false); } }}>Start Stream</button>
          </div>
        </div>
      )}
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

function AnalyticsSection({ data }: { data: AnalyticsData | null }) {
  const vTypes = data?.violationTypes ?? [];
  const total = data?.totalViolations ?? 0;
  const cData = data?.complianceData ?? [88.2, 85.6, 91.3, 87.5, 90.1, 88.7, 87.5];
  const cDays = data?.complianceDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dViol = data?.dailyViolations ?? [0, 0, 0, 0, 0, 0, 0];
  const hData = data?.hourlyData ?? [];
  const avgC = data?.avgCompliance ?? 0;
  const todayV = data?.todayViolations ?? 0;
  const peakH = data?.peakHour ?? "N/A";
  const quietH = data?.quietestHour ?? "N/A";
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
            <span className="chart-badge" style={{ background: "var(--success-soft)", color: "var(--success)" }}>{avgC}% avg</span>
          </div>
          <LineChart data={cData} labels={cDays} color="#1e3a5f" min={60} max={99} unit="%" />
          <div className="chart-legend-row">
            {cDays.map((d, i) => (
              <div key={d} className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: cData[i] >= 88 ? "var(--success)" : "var(--warning)" }} />
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
            <span className="chart-badge" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>{todayV} today</span>
          </div>
          <BarChart data={dViol} labels={cDays} color="#1e3a5f" />
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
            <DonutChart segments={vTypes.map((v) => ({ label: v.label, value: v.count, color: v.color }))} />
            <div className="donut-legend">
              {vTypes.map((v) => (
                <div key={v.label} className="donut-legend-item">
                  <span className="donut-legend-dot" style={{ background: v.color }} />
                  <span className="donut-legend-label">{v.label}</span>
                  <span className="donut-legend-count">{v.count}</span>
                  <span className="donut-legend-pct">{total > 0 ? Math.round((v.count / total) * 100) : 0}%</span>
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
            <span className="chart-badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Peak: {peakH}</span>
          </div>
          <HourlyChart data={hData} />
          <div className="zone-summary-cards">
            <div className="zone-summary-item">
              <span className="zone-summary-val" style={{ color: "var(--danger)" }}>{peakH}</span>
              <span className="zone-summary-label">Peak hour</span>
            </div>
            <div className="zone-summary-item">
              <span className="zone-summary-val" style={{ color: "var(--primary)" }}>{total}</span>
              <span className="zone-summary-label">Total violations</span>
            </div>
            <div className="zone-summary-item">
              <span className="zone-summary-val" style={{ color: "var(--success)" }}>{quietH}</span>
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

function ViolationsSection({ violations }: { violations: Violation[] }) {
  const [search, setSearch] = useState("");
  const [ppe, setPpe] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [active, setActive] = useState<Violation | null>(null);

  const filtered = violations.filter((v) => {
    if (ppe !== "all" && v.violation !== ppe) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!v.name.toLowerCase().includes(s) && !String(v.trackId).includes(s)) return false;
    }
    if (dateFrom) {
      const rowDate = v.timestamp.split(" ")[0];
      if (rowDate < dateFrom) return false;
    }
    if (dateTo) {
      const rowDate = v.timestamp.split(" ")[0];
      if (rowDate > dateTo) return false;
    }
    return true;
  });

  const criticalCount = violations.filter(v => v.status === "Critical").length;
  const highCount = violations.filter(v => v.status === "High").length;
  const mediumCount = violations.filter(v => v.status === "Medium").length;

  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 20 }}>All recorded PPE non-compliance events with filtering and export.</p>
      <div className="violations-summary-row">
        <div className="vsummary-pill vsummary-critical"><span className="vsummary-num">{criticalCount}</span><span>Critical</span></div>
        <div className="vsummary-pill vsummary-high"><span className="vsummary-num">{highCount}</span><span>High</span></div>
        <div className="vsummary-pill vsummary-medium"><span className="vsummary-num">{mediumCount}</span><span>Medium</span></div>
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
              <div className="date-range">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
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
          <span>Showing {filtered.length} of {violations.length} records</span>
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
            {active.pic_path ? (
              <img
                src={`http://127.0.0.1:8000/violation_image/${active.pic_path}`}
                alt="Violation snapshot"
                style={{ width: "100%", borderRadius: 8, objectFit: "contain", maxHeight: 420 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div style={{ height: 260, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.9rem" }}>No image captured</div>
            )}
            <div className="modal-caption">{active.id} · {active.name} · Track #{active.trackId} · {formatViol(active.violation)} · Confidence {active.confidence}</div>
          </div>
        </div>
      )}
    </>
  );
}

function ReportsSection() {
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  const generate = async () => {
    if (!dateFrom && !dateTo) { setError("Please select at least one date."); return; }
    setError("");
    setPdfFile(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/generate_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Report generation failed");
      }
      const data = await res.json();
      setPdfFile(data.filename);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!pdfFile) return;
    const a = document.createElement("a");
    a.href = `${API}/download_report/${pdfFile}`;
    a.download = pdfFile;
    a.click();
  };

  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 28 }}>Generate AI-powered compliance audit reports for supervisors and safety stakeholders.</p>
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
            <p className="rmc-desc">Powered by Gemini AI — select a date range and generate a full PDF analysis of PPE compliance, violation patterns, and safety recommendations.</p>

            {/* Date Range Pickers */}
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <div className="filter-group" style={{ flex: 1, minWidth: 140 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.85rem" }} />
              </div>
              <div className="filter-group" style={{ flex: 1, minWidth: 140 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.85rem" }} />
              </div>
            </div>

            {error && <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginTop: 10 }}>{error}</p>}

            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 20, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              onClick={generate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 8, display: "inline-block" }} />
                  Generating with Gemini AI…
                </>
              ) : (
                <>
                  <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Ico>
                  Generate compliance audit
                </>
              )}
            </button>

            {pdfFile && !loading && (
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: 12, background: "var(--success-soft)", color: "var(--success)", borderColor: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={download}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF — {pdfFile}
              </button>
            )}
          </div>
        </div>
        <div className="report-right">
          <div className="report-history-card">
            <h3 className="report-history-title">How It Works</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 4 }}>
              {[
                { step: "1", title: "Select Date Range", desc: "Choose the start and end date for the period you want to analyze." },
                { step: "2", title: "Gemini AI Analysis", desc: "Gemini reads the violation data and produces an intelligent safety audit." },
                { step: "3", title: "Download PDF", desc: "A branded PDF report is generated and ready to download instantly." },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 28, height: 28, background: "var(--primary)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>{s.step}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{s.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 14, background: "var(--primary-soft)", borderRadius: 8, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--primary)" }}>⏱ Note:</strong> Report generation may take 15–30 seconds as Gemini analyzes and formats the data.
            </div>
          </div>
        </div>
      </div>
    </>
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

function AuthorizeSection() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/authorize_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to authorize user");

      setMsg({ text: "Email has been successfully sent.", type: "success" });
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="section-subtitle" style={{ marginBottom: 28 }}>Securely add and authorize personnel to access the PPE Monitoring dashboard.</p>

      <div className="card settings-card" style={{ maxWidth: 500 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Authorize New User</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>Staff Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="worker@safeguard.com"
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: "0.9rem" }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>Assign Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: "0.9rem" }}
            />
          </div>

          {msg && (
            <div style={{
              padding: "10px 14px", borderRadius: 6, fontSize: "0.85rem", fontWeight: 500,
              background: msg.type === "success" ? "var(--success-soft)" : "var(--danger-soft)",
              color: msg.type === "success" ? "var(--success)" : "var(--danger)"
            }}>
              {msg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Authorizing..." : "Authorize Personnel"}
          </button>
        </form>
      </div>
    </>
  );
}

export default DashboardPage;

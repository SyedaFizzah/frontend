import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout, EyeIcon } from "@/components/AuthLayout";
import { API_BASE_URL } from "@/lib/api-base";
import { getUser, setUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in | SafeGuard AI" },
      { name: "description", content: "Sign in to the SafeGuard AI PPE monitoring dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginMode, setLoginMode] = useState<"staff" | "owner">("staff");

  useEffect(() => {
    const u = getUser();
    if (u?.loggedIn) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: loginMode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      setUser({ name: data.name, email, role: data.role, loggedIn: true });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Safety Regulations through AI and Digitalization inside Plant"
      heroText="Real-time detection and automated audit trails for the safety of industrial and construction environments."
    >
      <div style={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
        <button
          onClick={() => setLoginMode(m => m === "staff" ? "owner" : "staff")}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer",
            color: loginMode === "owner" ? "var(--primary)" : "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600
          }}
          title="Toggle Site Owner Login"
        >
          <span style={{ marginTop: 2 }}>{loginMode === "owner" ? "Site Owner Mode" : "Admin Portal"}</span>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: loginMode === "owner" ? "var(--primary-soft)" : "#f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: loginMode === "owner" ? "2px solid var(--primary)" : "2px solid #e2e8f0"
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </button>
      </div>

      <div className="auth-header">
        <h1>{loginMode === "owner" ? "Site Owner Portal" : "Welcome back"}</h1>
        <p>Sign in to access the PPE monitoring dashboard.</p>
      </div>

      <form onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="email">{loginMode === "owner" ? "Owner Email" : "Work email"}</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder={loginMode === "owner" ? "owner@safeguard.com" : "name@company.com"}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={show ? "text" : "password"}
              id="password"
              className="form-input"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="toggle-password" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
              <EyeIcon open={!show} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: 16, background: "var(--danger-soft)", padding: "10px 14px", borderRadius: 6, fontWeight: 500 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: "-2px", display: "inline-block" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}

        <div className="auth-helper">
          <label className="checkbox-label">
            <input type="checkbox" /> Remember me
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ background: loginMode === "owner" ? "var(--primary)" : undefined }}>
          {loading ? (
            <>
              <span className="spinner" /> Signing in…
            </>
          ) : (
            <>
              {loginMode === "owner" ? "Access Owner Dashboard" : "Sign in"}
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

    </AuthLayout>
  );
}

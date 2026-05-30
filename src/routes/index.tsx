import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout, EyeIcon } from "@/components/AuthLayout";
import { getUser, setUser, nameFromEmail } from "@/lib/auth";

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

  useEffect(() => {
    const u = getUser();
    if (u?.loggedIn) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setUser({ name: nameFromEmail(email), email, role: "Site Supervisor", loggedIn: true });
      navigate({ to: "/dashboard" });
    }, 800);
  };

  const googleLogin = () => {
    setUser({ name: "Google User", email: "user@gmail.com", role: "Site Supervisor", loggedIn: true });
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      heroBadge={
        <>
          <span className="pulse-dot" />
          Enterprise PPE Monitoring
        </>
      }
      heroTitle="Workplace safety, powered by intelligence."
      heroText="Real-time computer vision detects PPE compliance violations, generates audit trails, and delivers AI-driven safety insights for industrial environments."
      stats={[
        { value: "24/7", label: "Continuous monitoring" },
        { value: "AI-Powered", label: "Smart safety insights" },
      ]}
    >

      <div className="auth-header">
        <h1>Welcome back</h1>
        <p>Sign in to access the PPE monitoring dashboard.</p>
      </div>

      <form onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="email">Work email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="name@company.com"
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

        <div className="auth-helper">
          <label className="checkbox-label">
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" className="auth-link">Forgot password?</a>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Signing in…
            </>
          ) : (
            <>
              Sign in
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>Or continue with</span>
      </div>

      <button type="button" className="btn btn-outline btn-block" onClick={googleLogin}>
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>

        Continue with Google
      </button>

      <p className="auth-footer">
        New to SafeGuard? <Link to="/signup" className="auth-link">Sign up</Link>
      </p>

    </AuthLayout>
  );
}

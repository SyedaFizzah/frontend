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
        <svg className="icon icon-sm" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M21.6 12.227c0-.708-.063-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.737 2.986-4.296 2.986-7.351z"/>
          <path fill="#34A853" d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.955-3.391.955-2.605 0-4.81-1.76-5.596-4.123H3.064v2.59A9.997 9.997 0 0 0 12 22z"/>
          <path fill="#FBBC05" d="M6.404 13.9A6.004 6.004 0 0 1 6.09 12c0-.659.114-1.3.314-1.9V7.51H3.064A9.997 9.997 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"/>
          <path fill="#EA4335" d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.96 2.99 14.695 2 12 2A9.997 9.997 0 0 0 3.064 7.51l3.34 2.59C7.19 7.736 9.395 5.977 12 5.977z"/>
        </svg>
        Continue with Google
      </button>

      <p className="auth-footer">
        New to SafeGuard? <Link to="/signup" className="auth-link">Sign up</Link>
      </p>

    </AuthLayout>
  );
}

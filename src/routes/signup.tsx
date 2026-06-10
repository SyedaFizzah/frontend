import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout, EyeIcon } from "@/components/AuthLayout";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Request access | SafeGuard AI" },
      { name: "description", content: "Request operator access to SafeGuard AI." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u?.loggedIn) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== cpw) return alert("Passwords do not match.");
    if (pw.length < 8) return alert("Password must be at least 8 characters.");
    if (!terms) return alert("Please accept the Data Privacy Agreement.");
    setLoading(true);
    setTimeout(() => {
      alert("Account request submitted. Please sign in once approved.");
      navigate({ to: "/" });
    }, 1000);
  };

  return (
    <AuthLayout
     heroTitle="Intelligent PPE compliance monitoring."
     heroText="Real-time detection and automated audit trails for industrial and construction safety teams."
    >
      <div className="auth-header">
        <h1>Request operator access</h1>
        <p>Submit your credentials to be authorized as a safety operator.</p>
      </div>

      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full name</label>
            <input type="text" className="form-input" placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>Employee ID</label>
            <input type="text" className="form-input" placeholder="EMP-4501" required />
          </div>
        </div>

        <div className="form-group">
          <label>Work email</label>
          <input type="email" className="form-input" placeholder="name@company.com" required />
        </div>

        <div className="form-group">
          <label>Workstation role</label>
          <select className="form-input" required defaultValue="">
            <option value="" disabled>Select a role</option>
            <option>Site Supervisor</option>
            <option>Safety Officer</option>
            <option>Project Manager</option>
            <option>System Administrator</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPw ? "text" : "password"}
                className="form-input"
                placeholder="Min. 8 characters"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button type="button" className="toggle-password" onClick={() => setShowPw((s) => !s)}>
                <EyeIcon open={!showPw} />
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm</label>
            <div className="password-wrapper">
              <input
                type={showCpw ? "text" : "password"}
                className="form-input"
                placeholder="Re-enter password"
                required
                value={cpw}
                onChange={(e) => setCpw(e.target.value)}
              />
              <button type="button" className="toggle-password" onClick={() => setShowCpw((s) => !s)}>
                <EyeIcon open={!showCpw} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label className="checkbox-label" style={{ alignItems: "flex-start", gap: 10 }}>
            <input type="checkbox" style={{ marginTop: 2 }} checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span style={{ fontSize: "0.82rem" }}>
              I agree to the <a href="#" className="auth-link" style={{ color: "#1e3a5f", fontWeight: 600 }}>Data Privacy Agreement</a> and acknowledge that all monitoring logs are property of the enterprise.
            </span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ background: "#1e3a5f", borderColor: "#1e3a5f" }} disabled={loading}>
          {loading ? (
            <><span className="spinner" /> Creating account…</>
          ) : (
            <>
              Request account
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p className="auth-footer">
        Already authorized? <Link to="/" className="auth-link" style={{ color: "#1e3a5f", fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}

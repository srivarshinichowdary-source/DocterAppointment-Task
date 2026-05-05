import { useState } from "react";
import "../styles/auth.css";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Parse Spring Boot validation errors which can come back in several shapes
  const extractError = (data) => {
    if (data.error) return data.error;
    if (data.message) return data.message;
    // Spring @Valid errors return { errors: [{defaultMessage: "..."}] }
    if (Array.isArray(data.errors) && data.errors.length > 0)
      return data.errors.map((e) => e.defaultMessage || e.field).join(", ");
    // Spring default 400 shape: { fieldErrors: [...] }
    if (Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0)
      return data.fieldErrors.map((e) => e.defaultMessage).join(", ");
    return "Something went wrong. Please check your inputs.";
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const body = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          // send null (not "") so Spring's @Size(max=20) doesn't choke on empty string
          phone: form.phone.trim() || null,
        };
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        console.log("Register error body:", JSON.stringify(data, null, 2));
        if (!res.ok) throw new Error(extractError(data));
        setMode("login");
        setError("");
        setForm((f) => ({ ...f, name: "", phone: "" }));
        alert("Registered successfully! Please login.");
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email.trim(), password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(extractError(data));
        // data.token comes from JwtResponse which has a `token` field
        const meRes = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const me = await meRes.json();
        onLogin(data.token, me);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">⚕</span>
          <h1>MediBook</h1>
        </div>
        <p className="auth-tagline">Book your doctor appointments with ease. Fast, simple, and secure.</p>
        <ul className="auth-features">
          <li><span>✓</span> Browse specialist doctors</li>
          <li><span>✓</span> Pick date & time slots</li>
          <li><span>✓</span> Manage appointments</li>
          <li><span>✓</span> Cancel anytime</li>
        </ul>
      </div>

      <div className="auth-right">
        <div className="auth-card card fade-in">
          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign In</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Register</button>
          </div>

          <div className="auth-form">
            <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
            <p className="auth-sub">{mode === "login" ? "Sign in to manage your appointments." : "Join MediBook to start booking appointments."}</p>

            {error && <div className="error-msg">{error}</div>}

            {mode === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={form.name} onChange={set("name")} />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label>Phone <span style={{ fontWeight: 300, textTransform: "none" }}>(optional)</span></label>
                <input type="tel" placeholder="+91 99999 00000" value={form.phone} onChange={set("phone")} />
              </div>
            )}

            <button className="btn-primary auth-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="spinner" /> : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
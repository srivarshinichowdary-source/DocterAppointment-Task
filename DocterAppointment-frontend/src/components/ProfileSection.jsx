import { useState } from "react";
import "../styles/profile.css";

export default function ProfileSection({ user, authFetch, setUser }) {
  const [form, setForm] = useState({ name: user.name || "", phone: user.phone || "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await authFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setUser(data);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-layout">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your personal information.</p>
      </div>

      <div className="profile-body">
        <div className="profile-avatar-section card">
          <div className="profile-big-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="profile-name-role">
            <div className="profile-display-name">{user.name}</div>
            <div className="badge badge-green">{user.role}</div>
          </div>
          <div className="profile-email">{user.email}</div>
        </div>

        <div className="profile-form card">
          <h3>Edit Information</h3>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="Your full name" />
          </div>

          <div className="form-group">
            <label>Email <span className="field-note">(cannot be changed)</span></label>
            <input type="email" value={user.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 99999 00000" />
          </div>

          <button className="btn-primary save-btn" onClick={handleSave} disabled={loading}>
            {loading ? <><span className="spinner" /> Saving...</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

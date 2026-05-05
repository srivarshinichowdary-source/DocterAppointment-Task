import { useState } from "react";
import BookAppointment from "../components/BookAppointment";
import MyAppointments from "../components/MyAppointments";
import ProfileSection from "../components/ProfileSection";
import "../styles/dashboard.css";

const TABS = [
  { id: "book", label: "Book Appointment", icon: "📅" },
  { id: "appointments", label: "My Appointments", icon: "📋" },
  { id: "profile", label: "Profile", icon: "👤" },
];

export default function DashboardPage({ user, token, onLogout, setUser }) {
  const [tab, setTab] = useState("book");
  const [refreshKey, setRefreshKey] = useState(0);

  const authFetch = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });

  const onBooked = () => { setRefreshKey((k) => k + 1); setTab("appointments"); };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span>⚕</span>
          <span className="brand-name">MediBook</span>
        </div>
        <nav className="dash-nav">
          {TABS.map((t) => (
            <button key={t.id} className={`nav-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash-user">
          <span className="user-avatar">{user.name?.[0]?.toUpperCase()}</span>
          <span className="user-name">{user.name}</span>
          <button className="btn-outline logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <main className="dash-content fade-in" key={tab}>
        {tab === "book" && <BookAppointment authFetch={authFetch} onBooked={onBooked} token={token} />}
        {tab === "appointments" && <MyAppointments authFetch={authFetch} key={refreshKey} />}
        {tab === "profile" && <ProfileSection user={user} authFetch={authFetch} setUser={setUser} />}
      </main>
    </div>
  );
}

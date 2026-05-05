import { useState, useEffect } from "react";
import "../styles/appointments.css";

const STATUS_META = {
  SCHEDULED: { label: "Confirmed", cls: "badge-green" },
  CANCELLED: { label: "Cancelled", cls: "badge-red" },
  COMPLETED: { label: "Completed", cls: "badge-yellow" },
};

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function displayDoctorName(name = "") {
  return name.toLowerCase().startsWith("dr.") ? name : `Dr. ${name}`;
}

export default function MyAppointments({ authFetch }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const load = () => {
    setLoading(true);
    authFetch("/api/appointments/my")
      .then((r) => r.json())
      .then((data) => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancelling(id);
    try {
      const res = await authFetch(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      if (res.ok) {
        setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "CANCELLED" } : a));
      }
    } finally {
      setCancelling(null);
    }
  };

  const normalizeAppointment = (appointment) => ({
    ...appointment,
    date: appointment.appointmentDate ?? appointment.date,
    time: appointment.appointmentTime ?? appointment.time,
    specialty: appointment.doctorSpecialty ?? appointment.specialty,
  });

  const normalizedAppointments = appointments.map(normalizeAppointment);
  const filtered = filter === "ALL" ? normalizedAppointments : normalizedAppointments.filter((a) => a.status === filter);
  const counts = {
    ALL: normalizedAppointments.length,
    SCHEDULED: normalizedAppointments.filter((a) => a.status === "SCHEDULED").length,
    CANCELLED: normalizedAppointments.filter((a) => a.status === "CANCELLED").length,
  };

  return (
    <div className="appts-layout">
      <div className="appts-header">
        <div>
          <h2>My Appointments</h2>
          <p>View and manage all your upcoming and past appointments.</p>
        </div>
      </div>

      <div className="appts-filters">
        {["ALL", "SCHEDULED", "CANCELLED"].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : STATUS_META[f]?.label}
            <span className="filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-state">
          <span className="spinner spinner-dark" style={{ width: 24, height: 24 }} />
          <span>Loading appointments...</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-appts card">
          <div className="empty-icon">📋</div>
          <h3>No appointments found</h3>
          <p>{filter === "ALL" ? "You haven't booked any appointments yet." : `No ${STATUS_META[filter]?.label?.toLowerCase()} appointments.`}</p>
        </div>
      )}

      <div className="appts-list">
        {filtered.map((a) => {
          const meta = STATUS_META[a.status] || { label: a.status, cls: "badge-yellow" };
          const isPast = new Date(a.date + "T" + a.time) < new Date();
          return (
            <div key={a.id} className={`appt-card card fade-in ${a.status === "CANCELLED" ? "cancelled" : ""}`}>
              <div className="appt-doc-avatar">
                {a.doctorName?.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase() || "DR"}
              </div>
              <div className="appt-details">
                <div className="appt-doctor">{displayDoctorName(a.doctorName)}</div>
                <div className="appt-spec">{a.specialty}</div>
                <div className="appt-datetime">
                  <span className="appt-date-chip">📅 {formatDate(a.date)}</span>
                  <span className="appt-time-chip">🕐 {formatTime(a.time)}</span>
                </div>
              </div>
              <div className="appt-right">
                <span className={`badge ${meta.cls}`}>{meta.label}</span>
                {a.status === "SCHEDULED" && !isPast && (
                  <button
                    className="btn-danger"
                    onClick={() => handleCancel(a.id)}
                    disabled={cancelling === a.id}
                  >
                    {cancelling === a.id ? <span className="spinner" style={{ borderTopColor: "var(--danger)", borderColor: "rgba(192,57,43,0.2)", width: 14, height: 14 }} /> : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import "../styles/book.css";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const SPECIALTIES = ["All", "Cardiology", "Dermatology", "General", "Neurology", "Orthopedics", "Pediatrics", "Psychiatry"];

function displayDoctorName(name = "") {
  return name.toLowerCase().startsWith("dr.") ? name : `Dr. ${name}`;
}

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function BookAppointment({ authFetch, onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialty, setSpecialty] = useState("All");
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(toLocalDateStr(new Date()));
  const [bookedSlots, setBookedSlots] = useState([]);
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    authFetch("/api/doctors").then((r) => r.json()).then((d) => {
      setDoctors(d);
      setFiltered(d);
    });
  }, []);

  useEffect(() => {
    setFiltered(specialty === "All" ? doctors : doctors.filter((d) => d.specialty === specialty));
  }, [specialty, doctors]);

  useEffect(() => {
    if (selected && date) {
      setFetchingSlots(true);
      setTime("");
      authFetch(`/api/appointments/booked-slots?doctorId=${selected.id}&date=${date}`)
        .then((r) => r.json())
        .then((slots) => {
          setBookedSlots(slots.map((s) => s.substring(0, 5)));
          setFetchingSlots(false);
        })
        .catch(() => setFetchingSlots(false));
    }
  }, [selected, date]);

  const handleBook = async () => {
    if (!selected || !date || !time) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Field names match BookRequest DTO exactly: appointmentDate, appointmentTime
      const body = { doctorId: selected.id, appointmentDate: date, appointmentTime: time + ":00" };
      const res = await authFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || data.message
          || (Array.isArray(data.errors) && data.errors.map((e) => e.defaultMessage).join(", "))
          || JSON.stringify(data);
        throw new Error(msg);
      }
      setSuccess(`Appointment booked with ${displayDoctorName(selected.name)} on ${date} at ${time}!`);
      setTime("");
      setBookedSlots((prev) => [...prev, time]);
      setTimeout(() => { setSuccess(""); onBooked(); }, 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = toLocalDateStr(new Date());

  return (
    <div className="book-layout">
      <div className="book-section-title">
        <h2>Book an Appointment</h2>
        <p>Select a doctor, choose your date and time, and confirm your booking.</p>
      </div>

      {/* Doctor Selection */}
      <div className="book-step card">
        <div className="step-header">
          <span className="step-num">1</span>
          <div>
            <h3>Choose a Doctor</h3>
            <p className="step-sub">Browse available doctors by specialty</p>
          </div>
        </div>

        <div className="specialty-filter">
          {SPECIALTIES.map((s) => (
            <button key={s} className={`chip ${specialty === s ? "active" : ""}`} onClick={() => setSpecialty(s)}>{s}</button>
          ))}
        </div>

        <div className="doctor-grid">
          {filtered.length === 0 && <p className="empty-state">No doctors found for this specialty.</p>}
          {filtered.map((doc) => (
            <div key={doc.id} className={`doctor-card ${selected?.id === doc.id ? "selected" : ""}`} onClick={() => setSelected(doc)}>
              <div className="doc-avatar">{doc.name?.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()}</div>
              <div className="doc-info">
                <div className="doc-name">{displayDoctorName(doc.name)}</div>
                <div className="doc-spec badge badge-green">{doc.specialty}</div>
                {(doc.experienceYears || doc.experience) && <div className="doc-exp">{doc.experienceYears ?? doc.experience} yrs exp.</div>}
                {doc.fee && <div className="doc-fee">₹{doc.fee} / visit</div>}
              </div>
              {selected?.id === doc.id && <span className="doc-check">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Date & Time Selection */}
      {selected && (
        <div className="book-step card fade-in">
          <div className="step-header">
            <span className="step-num">2</span>
            <div>
              <h3>Select Date & Time</h3>
              <p className="step-sub">Booking with <strong>{displayDoctorName(selected.name)}</strong> - {selected.specialty}</p>
            </div>
          </div>

          <div className="datetime-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="slots-label">
            Available Time Slots
            {fetchingSlots && <span className="spinner spinner-dark" style={{ marginLeft: "0.5rem", width: 14, height: 14 }} />}
          </div>
          <div className="time-grid">
            {TIME_SLOTS.map((slot) => {
              const booked = bookedSlots.includes(slot);
              return (
                <button
                  key={slot}
                  className={`time-slot ${booked ? "booked" : ""} ${time === slot ? "chosen" : ""}`}
                  disabled={booked}
                  onClick={() => !booked && setTime(slot)}
                >
                  {slot}
                  {booked && <span className="booked-tag">Taken</span>}
                </button>
              );
            })}
          </div>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <button
            className="btn-primary book-btn"
            disabled={!time || loading}
            onClick={handleBook}
          >
            {loading ? <><span className="spinner" /> Confirming...</> : `Confirm Booking — ${time || "select a time"}`}
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import heroBg from "@/imports/home-cafe-fausse.jpeg";
import { createReservation, fetchAvailability } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error" | "network-error";

interface FormData {
  date: string;
  time: string;
  guests: string;
  name: string;
  email: string;
  phone: string;
}

const ALL_SLOTS = [
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
  "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
  "9:00 PM", "9:30 PM", "10:00 PM",
];

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

// Converts "2026-09-20" + "7:00 PM" → "2026-09-20T19:00:00Z"
function toISOSlot(date: string, time: string): string {
  const [timePart, meridiem] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`;
}

export default function Reservations() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [form, setForm] = useState<FormData>({
    date: "",
    time: "",
    guests: "2",
    name: "",
    email: "",
    phone: "",
  });
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!form.date) { setBookedSlots([]); return; }
    setLoadingSlots(true);
    fetchAvailability(form.date)
      .then(setBookedSlots)
      .finally(() => setLoadingSlots(false));
  }, [form.date]);

  useEffect(() => {
    if (form.time && bookedSlots.includes(form.time)) {
      setForm((prev) => ({ ...prev, time: "" }));
    }
  }, [bookedSlots]);

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.date) e.date = "Please select a date.";
    else if (form.date < getTodayString()) e.date = "Please select a future date.";
    if (!form.time) e.time = "Please select a time.";
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "A valid email is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus("loading");

    try {
      const result = await createReservation({
        time_slot: toISOSlot(form.date, form.time),
        guests: parseInt(form.guests),
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        newsletter_signup: newsletterOptIn,
      });

      if (result.status === "success") {
        setTableNumber(result.table_number ?? null);
        setReservationId(result.reservation_id ?? null);
        setConfirmedSlot(result.time_slot ?? toISOSlot(form.date, form.time));
        setSuccessMessage(result.message ?? "Your table has been booked successfully.");
        setStatus("success");
      } else {
        setErrorMessage(result.error ?? "That time slot is fully booked.");
        setStatus("error");
        if (import.meta.env.DEV) console.error("Reservation error:", result.error);
      }
    } catch (err) {
      // Form is intentionally NOT cleared on network error so the user doesn't lose their details
      setErrorMessage("Unable to reach the reservation system. Please call us at (202) 555-4567.");
      setStatus("network-error");
      if (import.meta.env.DEV) console.error("Network error:", err);
    }
  };

  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    setCalendarOpen(false);
    const dateStr = day ? day.toLocaleDateString("en-CA") : "";
    setForm((prev) => ({ ...prev, date: dateStr, time: "" }));
    setErrors((prev) => ({ ...prev, date: undefined }));
  };

  const reset = () => {
    setStatus("idle");
    setSelectedDay(undefined);
    setCalendarOpen(false);
    // Only clear date and time — name, email, phone, guests, and newsletter opt-in are preserved
    setForm((prev) => ({ ...prev, date: "", time: "" }));
    setTableNumber(null);
    setReservationId(null);
    setConfirmedSlot("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const inputClass =
    "w-full bg-transparent border px-4 py-3 text-sm outline-none focus:border-primary transition-colors";
  const labelClass = "block text-[10px] tracking-widest uppercase mb-2";

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-56 flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Café Fausse dining room"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: "rgba(8,6,4,0.72)" }} />
        <div className="relative z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            Café Fausse
          </p>
          <h1 className="font-serif text-5xl" style={{ color: "var(--foreground)" }}>
            Reservations
          </h1>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </section>

      <section className="py-20 px-6 max-w-2xl mx-auto">
        <p className="text-center text-sm font-light mb-12 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          We hold every table for 15 minutes past your reservation time.
          For parties of 8 or more, please call us directly at (202) 555-4567.
        </p>

        {/* Success */}
        {status === "success" && (
          <div
            className="border p-8 text-center mb-10"
            style={{ borderColor: "var(--primary)", background: "rgba(200,198,190,0.05)" }}
          >
            <p className="font-serif text-2xl mb-2" style={{ color: "var(--primary)" }}>
              Reservation Confirmed
            </p>
            <div className="gold-divider mx-auto my-4" />
            <p className="text-sm font-light mb-1" style={{ color: "var(--foreground)" }}>
              {successMessage}
            </p>
            <p className="text-sm font-light" style={{ color: "var(--muted-foreground)" }}>
              {confirmedSlot
                ? new Date(confirmedSlot).toLocaleString("en-US", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })
                : `${form.date} at ${form.time}`}{" "}
              · Table {tableNumber} · {form.guests}{" "}
              {parseInt(form.guests) === 1 ? "guest" : "guests"}
            </p>
            {reservationId && (
              <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                Confirmation #{reservationId}
              </p>
            )}
            <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
              A confirmation will be sent to {form.email}.
            </p>
            <button
              onClick={reset}
              className="mt-6 text-xs tracking-widest uppercase border px-5 py-2 transition-colors hover:border-primary hover:text-primary"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Make Another Reservation
            </button>
          </div>
        )}

        {/* Error */}
        {(status === "error" || status === "network-error") && (
          <div
            className="border p-6 text-center mb-10"
            style={{ borderColor: "#a03030", background: "rgba(160,48,48,0.07)" }}
          >
            <p className="font-serif text-xl mb-2" style={{ color: "#e07070" }}>
              {status === "network-error" ? "Connection Error" : "Reservation Unavailable"}
            </p>
            <p className="text-sm font-light" style={{ color: "var(--muted-foreground)" }}>
              {errorMessage}
            </p>
            <button
              onClick={reset}
              className="mt-4 text-xs tracking-widest uppercase border px-5 py-2 transition-colors hover:border-primary hover:text-primary"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Form */}
        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClass} style={{ color: "var(--primary)" }}>Date</label>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((o) => !o)}
                  className={`${inputClass} text-left flex items-center justify-between`}
                  style={{
                    borderColor: errors.date ? "#e07070" : calendarOpen ? "var(--primary)" : "var(--border)",
                    color: form.date ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <span>
                    {selectedDay
                      ? selectedDay.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })
                      : "Select a date"}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="1" y="2" width="12" height="11" rx="0" stroke="currentColor" strokeWidth="1"/>
                    <path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </button>
                {errors.date && <p className="text-xs mt-1" style={{ color: "#e07070" }}>{errors.date}</p>}

                {calendarOpen && (
                  <div
                    className="absolute z-20 top-full left-0 mt-1 p-4 border"
                    style={{ background: "var(--card)", borderColor: "var(--border)", minWidth: "100%" }}
                  >
                    <DayPicker
                      mode="single"
                      selected={selectedDay}
                      onSelect={handleDaySelect}
                      disabled={{ before: new Date() }}
                      startMonth={new Date()}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass} style={{ color: "var(--primary)" }}>
                  Time{" "}
                  {loadingSlots && (
                    <span className="normal-case font-light" style={{ color: "var(--muted-foreground)" }}>
                      (checking…)
                    </span>
                  )}
                </label>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ borderColor: errors.time ? "#e07070" : "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
                >
                  <option value="">Select a time</option>
                  {ALL_SLOTS.map((t) => {
                    const booked = bookedSlots.includes(t);
                    return (
                      <option key={t} value={t} disabled={booked}>
                        {t}{booked ? " — Fully Booked" : ""}
                      </option>
                    );
                  })}
                </select>
                {errors.time && <p className="text-xs mt-1" style={{ color: "#e07070" }}>{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--primary)" }}>Number of Guests</label>
              <select
                name="guests"
                value={form.guests}
                onChange={handleChange}
                className={inputClass}
                style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--primary)" }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Antonio Rossi"
                className={inputClass}
                style={{ borderColor: errors.name ? "#e07070" : "var(--border)", color: "var(--foreground)" }}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: "#e07070" }}>{errors.name}</p>}
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--primary)" }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={inputClass}
                style={{ borderColor: errors.email ? "#e07070" : "var(--border)", color: "var(--foreground)" }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: "#e07070" }}>{errors.email}</p>}
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--primary)" }}>
                Phone Number{" "}
                <span className="normal-case font-light" style={{ color: "var(--muted-foreground)" }}>(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="(202) 555-0000"
                className={inputClass}
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>

            {/* Newsletter opt-in */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 border transition-colors flex items-center justify-center"
                  style={{
                    borderColor: newsletterOptIn ? "var(--primary)" : "var(--border)",
                    background: newsletterOptIn ? "var(--primary)" : "transparent",
                  }}
                >
                  {newsletterOptIn && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="var(--primary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-light leading-snug" style={{ color: "var(--muted-foreground)" }}>
                Sign me up for the Café Fausse newsletter — exclusive events,
                seasonal menus, and culinary stories.
              </span>
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 text-xs tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {status === "loading" ? "Checking Availability…" : "Request Reservation"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

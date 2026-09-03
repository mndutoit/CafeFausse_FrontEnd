import { useState, useEffect } from "react";
import {
  fetchAdminReservations,
  fetchAdminNewsletter,
  type AdminReservation,
  type AdminSignup,
} from "@/lib/api";

type LoadState = "loading" | "success" | "error";

export default function Admin() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [signups, setSignups] = useState<AdminSignup[]>([]);
  const [reservationState, setReservationState] = useState<LoadState>("loading");
  const [newsletterState, setNewsletterState] = useState<LoadState>("loading");

  useEffect(() => {
    fetchAdminReservations()
      .then((data) => {
        setReservations(data);
        setReservationState("success");
      })
      .catch(() => setReservationState("error"));

    fetchAdminNewsletter()
      .then((data) => {
        setSignups(data);
        setNewsletterState("success");
      })
      .catch(() => setNewsletterState("error"));
  }, []);

  const refresh = () => {
    setReservationState("loading");
    setNewsletterState("loading");
    fetchAdminReservations()
      .then((data) => { setReservations(data); setReservationState("success"); })
      .catch(() => setReservationState("error"));
    fetchAdminNewsletter()
      .then((data) => { setSignups(data); setNewsletterState("success"); })
      .catch(() => setNewsletterState("error"));
  };

  return (
    <div className="pt-20 min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div
        className="border-b px-6 py-10"
        style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
      >
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--primary)" }}>
              Café Fausse
            </p>
            <h1 className="font-serif text-4xl" style={{ color: "var(--foreground)" }}>
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={refresh}
            className="text-xs tracking-widest uppercase border px-5 py-2.5 transition-colors hover:border-primary hover:text-primary"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

        {/* Reservations */}
        <section>
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--primary)" }}>
                Bookings
              </p>
              <h2 className="font-serif text-2xl" style={{ color: "var(--foreground)" }}>
                Reservations
                {reservationState === "success" && (
                  <span className="ml-3 text-sm font-sans font-light" style={{ color: "var(--muted-foreground)" }}>
                    {reservations.length} total
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="border" style={{ borderColor: "var(--border)" }}>
            {/* Table header */}
            <div
              className="grid grid-cols-3 px-6 py-3 text-[10px] tracking-widest uppercase border-b"
              style={{ borderColor: "var(--border)", background: "var(--secondary)", color: "var(--primary)" }}
            >
              <span>Customer Name</span>
              <span>Time Slot</span>
              <span>Table Number</span>
            </div>

            {reservationState === "loading" && (
              <div className="px-6 py-12 text-center text-sm font-light" style={{ color: "var(--muted-foreground)" }}>
                Loading reservations…
              </div>
            )}

            {reservationState === "error" && (
              <div className="px-6 py-12 text-center text-sm font-light" style={{ color: "#e07070" }}>
                Unable to load reservations. Ensure the Flask backend is running at{" "}
                <code className="text-xs">{import.meta.env.VITE_API_URL ?? "http://localhost:5000"}</code>.
              </div>
            )}

            {reservationState === "success" && reservations.length === 0 && (
              <div className="px-6 py-12 text-center text-sm font-light" style={{ color: "var(--muted-foreground)" }}>
                No reservations yet.
              </div>
            )}

            {reservationState === "success" && reservations.map((r, i) => (
              <div
                key={r.id}
                className="grid grid-cols-3 px-6 py-4 text-sm font-light border-b last:border-b-0 transition-colors hover:bg-white/[0.02]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                }}
              >
                <span>{r.customerName}</span>
                <span style={{ color: "var(--muted-foreground)" }}>{r.timeSlot}</span>
                <span>
                  <span
                    className="inline-block px-2.5 py-0.5 text-xs border"
                    style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                  >
                    Table {r.tableNumber}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Signups */}
        <section>
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--primary)" }}>
                Marketing
              </p>
              <h2 className="font-serif text-2xl" style={{ color: "var(--foreground)" }}>
                Newsletter Signups
                {newsletterState === "success" && (
                  <span className="ml-3 text-sm font-sans font-light" style={{ color: "var(--muted-foreground)" }}>
                    {signups.length} subscribers
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="border" style={{ borderColor: "var(--border)" }}>
            {/* Table header */}
            <div
              className="grid grid-cols-2 px-6 py-3 text-[10px] tracking-widest uppercase border-b"
              style={{ borderColor: "var(--border)", background: "var(--secondary)", color: "var(--primary)" }}
            >
              <span>Customer Name</span>
              <span>Email Address</span>
            </div>

            {newsletterState === "loading" && (
              <div className="px-6 py-12 text-center text-sm font-light" style={{ color: "var(--muted-foreground)" }}>
                Loading signups…
              </div>
            )}

            {newsletterState === "error" && (
              <div className="px-6 py-12 text-center text-sm font-light" style={{ color: "#e07070" }}>
                Unable to load newsletter signups. Ensure the Flask backend is running at{" "}
                <code className="text-xs">{import.meta.env.VITE_API_URL ?? "http://localhost:5000"}</code>.
              </div>
            )}

            {newsletterState === "success" && signups.length === 0 && (
              <div className="px-6 py-12 text-center text-sm font-light" style={{ color: "var(--muted-foreground)" }}>
                No newsletter signups yet.
              </div>
            )}

            {newsletterState === "success" && signups.map((s, i) => (
              <div
                key={s.id}
                className="grid grid-cols-2 px-6 py-4 text-sm font-light border-b last:border-b-0 transition-colors hover:bg-white/[0.02]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                }}
              >
                <span>{s.customerName}</span>
                <span style={{ color: "var(--muted-foreground)" }}>{s.email}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

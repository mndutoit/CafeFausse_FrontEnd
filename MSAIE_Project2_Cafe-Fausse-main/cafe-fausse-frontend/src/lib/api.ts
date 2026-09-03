const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

// ─── Reservations ────────────────────────────────────────────────────────────

export interface ReservationPayload {
  time_slot: string;   // ISO 8601 e.g. "2026-09-20T19:00:00Z"
  guests: number;
  name: string;
  email: string;
  phone?: string;
  newsletter_signup?: boolean;
}

export interface ReservationResult {
  status: "success" | "error";
  reservation_id?: number;
  customer_id?: number;
  table_number?: number;
  time_slot?: string;
  guests?: number;
  message?: string;
  error?: string;
}

export async function createReservation(
  payload: ReservationPayload
): Promise<ReservationResult> {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface NewsletterPayload {
  email: string;
  name?: string;
}

export interface NewsletterResult {
  status: "success" | "error";
  message?: string;
  customer_id?: number;
  email?: string;
  error?: string;
}

export async function subscribeNewsletter(
  payload: NewsletterPayload
): Promise<NewsletterResult> {
  const res = await fetch(`${API_BASE}/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── Availability (enhancement — not in contract) ────────────────────────────
// Flask route: GET /api/availability?date=YYYY-MM-DD
// Expects: { bookedSlots: ["5:00 PM", "7:30 PM", ...] }
export async function fetchAvailability(date: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/availability?date=${date}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.bookedSlots ?? [];
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminReservation {
  id: number;
  customerName: string;
  timeSlot: string;
  tableNumber: number;
}

export async function fetchAdminReservations(): Promise<AdminReservation[]> {
  const res = await fetch(`${API_BASE}/admin/reservations`);
  if (!res.ok) throw new Error("Failed to fetch reservations.");
  const data = await res.json();
  return data.reservations ?? [];
}

export interface AdminSignup {
  id: number;
  customerName: string;
  email: string;
}

export async function fetchAdminNewsletter(): Promise<AdminSignup[]> {
  const res = await fetch(`${API_BASE}/admin/newsletter`);
  if (!res.ok) throw new Error("Failed to fetch newsletter signups.");
  const data = await res.json();
  return data.signups ?? [];
}

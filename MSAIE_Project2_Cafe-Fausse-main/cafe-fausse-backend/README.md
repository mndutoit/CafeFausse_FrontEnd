# Café Fausse — Backend

Flask + PostgreSQL API for the Café Fausse website, built to the project
SRS (reservation system + newsletter signup). Pairs with a separate React
front-end.

## Stack

- **Flask** — API server
- **Flask-SQLAlchemy** — ORM / database models
- **PostgreSQL** — persistent storage
- **Flask-CORS** — allows the React dev server to call this API

## Project Structure

```
cafe-fausse-backend/
├── app/
│   ├── __init__.py     # App factory, CORS, db init, blueprint registration
│   ├── models.py       # Customer, Reservation tables
│   ├── routes.py       # /api/reservations, /api/newsletter endpoints
│   └── services.py     # Table availability + assignment logic
├── config.py            # Dev / Testing / Production config
├── run.py                # Local dev server entry point
├── init_db.py            # Creates tables in the database
├── requirements.txt
├── .env.example
├── api-contract.md       # Shared front-end/back-end API contract
├── ai-tooling.md          # AI tooling disclosure
└── README.md
```

## 1. Prerequisites

- Python 3.10+
- PostgreSQL 13+ installed and running

## 2. Set up PostgreSQL

Create a database and user (adjust names/password as you like):

```bash
psql postgres
```

```sql
CREATE DATABASE cafe_fausse_dev;
CREATE USER cafe_user WITH PASSWORD 'cafe_password';
GRANT ALL PRIVILEGES ON DATABASE cafe_fausse_dev TO cafe_user;
```

## 3. Set up the Python environment

```bash
cd cafe-fausse-backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and make sure `DATABASE_URL` matches the database/user you
created in step 2.

> **Front-end port note:** this project's Vite dev server defaults to
> **port 8443** (see `vite.config.ts` in the front-end repo), not the
> more common 3000/5173. Make sure `CORS_ORIGINS` in `.env` matches
> whatever port `pnpm dev` actually reports when you start the front
> end, or requests will fail with a CORS error in the browser console
> even though the backend itself is working fine.

## 5. Create the database tables

```bash
python init_db.py
```

You should see `Database tables created successfully.`

> **Note:** `init_db.py` only creates tables that don't already exist —
> it won't add new columns or constraints to a table you've already
> created. If you pull an update that changes `models.py`, either drop
> the affected table(s) in pgAdmin and re-run this, or apply the schema
> change manually via pgAdmin's Query Tool (e.g. `ALTER TABLE ...`).

> **Windows note:** if `pip install` tries to compile `psycopg2-binary`
> from source and fails with a linker error, it usually means pip
> couldn't find a prebuilt wheel for your Python version. Check
> `requirements.txt` uses `psycopg2-binary>=2.9.10` (not an exact
> `==2.9.9` pin) so pip can pull a version with a Windows/Python 3.13
> wheel.

## 6. Run the server

```bash
python run.py
```

The API is now running at `http://localhost:5000`. Health check:
`GET http://localhost:5000/api/health`.

## API Reference

All request/response shapes below follow `api-contract.md` (the shared
front-end/back-end contract) exactly for the two contract endpoints.
The rest — the two `/api/reservations` `GET`s, `/api/availability`, and
the `/api/admin/*` routes — aren't in the contract; they were added
after inspecting the front-end's own `api.ts` to match what it actually
calls. All of them follow the same `status`/`error` envelope for
consistency.

### `POST /api/reservations`

Creates a reservation (FR-6–9, FR-18). Validates the time slot, then
assigns a random available table out of `TOTAL_TABLES` (default 30).
Also enforces NFR-5 (no double/over bookings) two ways: a customer
can't book the same time slot twice, and two customers can't be
assigned the same table for the same slot.

**Request body:**
```json
{
  "time_slot": "2026-09-15T19:30:00",
  "guests": 4,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "202-555-0100",
  "newsletter_signup": false
}
```
`phone` and `newsletter_signup` are optional; everything else is required.

**Success (201):**
```json
{
  "status": "success",
  "reservation_id": 1,
  "customer_id": 1,
  "table_number": 12,
  "time_slot": "2026-09-15T19:30:00+00:00",
  "guests": 4,
  "message": "Your table has been booked successfully."
}
```

**Fully booked, or duplicate booking for this customer+slot (409):**
```json
{ "status": "error", "error": "Sorry, that time slot is fully booked. Please choose another time." }
```
```json
{ "status": "error", "error": "You already have a reservation at this time slot. Please choose a different time or cancel your existing reservation first." }
```

**Validation error (400):**
```json
{ "status": "error", "error": "Invalid email address." }
```

---

### `GET /api/reservations`

*(Not in the contract — backend-only convenience endpoint, e.g. for an
admin view.)* Lists reservations, newest-slot-last. Optional query
params: `date` (`YYYY-MM-DD`) and `email` (exact match), combinable.

```
GET /api/reservations
GET /api/reservations?date=2026-09-15
GET /api/reservations?email=jane@example.com
```

**Success (200):**
```json
{
  "status": "success",
  "count": 1,
  "reservations": [
    { "reservation_id": 1, "customer_id": 1, "time_slot": "2026-09-15T19:30:00+00:00", "table_number": 12 }
  ]
}
```

---

### `GET /api/reservations/<id>`

*(Not in the contract.)* Fetches a single reservation by ID (e.g. for a
confirmation page).

**Success (200):**
```json
{ "status": "success", "reservation": { "reservation_id": 1, "customer_id": 1, "time_slot": "2026-09-15T19:30:00+00:00", "table_number": 12 } }
```

**Not found (404):**
```json
{ "status": "error", "error": "Reservation not found." }
```

---

### `POST /api/newsletter`

Subscribes an email to the newsletter (FR-15, FR-16). If the email
already belongs to an existing customer (e.g. from a prior
reservation), that record is updated rather than duplicated.

**Request body:**
```json
{ "email": "jane@example.com", "name": "Jane Doe" }
```
`name` is optional.

**Success (200):**
```json
{
  "status": "success",
  "message": "You have been subscribed to the Café Fausse newsletter.",
  "customer_id": 1,
  "email": "jane@example.com"
}
```

**Validation error (400):**
```json
{ "status": "error", "error": "Please provide a valid email address." }
```

---

### `GET /api/availability`

*(Not in the contract — matches the front-end's `fetchAvailability`.)*
Returns which of a day's 30-minute reservation slots are fully booked
(all `TOTAL_TABLES` taken), per the SRS's posted hours (FR-2):
Mon–Sat 5:00 PM–11:00 PM, Sun 5:00 PM–9:00 PM. Lets the booking form
grey out full slots before the user submits.

```
GET /api/availability?date=2026-09-20
```

**Success (200):**
```json
{ "status": "success", "bookedSlots": ["7:00 PM", "7:30 PM"] }
```

**Missing/invalid date (400):** the front end treats any non-`200`
response as "no booked slots," so this fails silently in the UI rather
than showing an error.
```json
{ "status": "error", "error": "Query param 'date' must be in YYYY-MM-DD format." }
```

---

### `GET /api/admin/reservations`

*(Not in the contract — matches the front-end's `fetchAdminReservations`,
used by the `/admin` page. SRS 2.3: "Administrators/Managers ...
reservation oversight." No authentication — see "Next steps" below.)*
Every reservation with the customer's name resolved (not just their ID).

**Success (200):**
```json
{
  "status": "success",
  "reservations": [
    { "id": 1, "customerName": "Jane Doe", "timeSlot": "2026-09-15T19:30:00+00:00", "tableNumber": 12 }
  ]
}
```

---

### `GET /api/admin/newsletter`

*(Not in the contract — matches the front-end's `fetchAdminNewsletter`.
Same no-auth caveat as above.)* Every customer who's opted into the
newsletter.

**Success (200):**
```json
{
  "status": "success",
  "signups": [
    { "id": 1, "customerName": "Jane Doe", "email": "jane@example.com" }
  ]
}
```

---

### `GET /api/health`

Simple health check, no auth or params.
```json
{ "status": "ok", "service": "cafe-fausse-backend" }
```

## Notes on design decisions

- **Table assignment**: for a given time slot, the system looks at which
  of the 30 table numbers are already booked for that exact slot and
  picks randomly from what's left (FR-8).
- **Double/over-booking prevention (NFR-5)**: enforced at two levels.
  Two database `UNIQUE` constraints are the source of truth —
  `(time_slot, table_number)` stops two customers from getting the same
  table at the same time, and `(customer_id, time_slot)` stops one
  customer from booking two tables at the same time. On top of that,
  `create_reservation()` in `services.py` retries (up to 5 times) if a
  race condition causes a collision, rather than surfacing a raw
  database error to the user.
- **Customers table**: keyed by unique email. Booking a reservation or
  signing up for the newsletter with an email that's already on file
  updates that customer record rather than creating a duplicate.
- **Time slots**: sent as ISO 8601 strings from the front-end (e.g. what
  `new Date().toISOString()` or an `<input type="datetime-local">`
  produces). The backend rejects anything in the past.
- **Response shape**: `POST /api/reservations` and `POST /api/newsletter`
  follow `api-contract.md` exactly (`status`/`error` envelope, contract
  field names). Every other endpoint isn't part of the contract but
  uses the same envelope for consistency.
- **Availability slots**: generated on the fly (not stored) at
  30-minute intervals within the SRS's posted hours, per weekday
  (`_time_slot_options_for_date` in `services.py`). A slot counts as
  "booked" once reservations at that exact datetime reach `TOTAL_TABLES`.

## Next steps for a full deployment

- Add Alembic (Flask-Migrate) if you expect the schema to evolve —
  `init_db.py` only handles the initial create.
- **Add authentication to the `/api/admin/*` endpoints.** They currently
  have none — anyone who can reach the server can view all reservations
  and every newsletter subscriber's email. Fine for local development
  and grading, but this must be locked down (e.g. a login gate for the
  SRS's "Administrator/Manager" role) before any real deployment.
- Point `CORS_ORIGINS` and `DATABASE_URL` at your production values
  before deploying.

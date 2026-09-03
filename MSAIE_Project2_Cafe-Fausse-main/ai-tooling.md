# AI Tooling Disclosure

This document describes how AI assistance was used in building the
Café Fausse backend, for academic transparency.

---

## Tool used

**Claude** (Anthropic), accessed via the claude.ai chat interface.

## Scope of AI involvement

Claude was used as a pair-programmer/assistant for the Flask +
PostgreSQL backend (`cafe-fausse-backend/`), specifically to:

- **Scaffold the initial project structure** from the SRS: the Flask
  app factory, SQLAlchemy models (`Customer`, `Reservation`), config
  management, and the `POST /api/reservations` / `POST /api/newsletter`
  endpoints (FR-6–9, FR-15–18).
- **Design and implement double/over-booking prevention** (NFR-5): two
  database unique constraints (`(time_slot, table_number)` and
  `(customer_id, time_slot)`) plus application-level retry logic in
  `services.py` to handle race conditions between concurrent booking
  requests cleanly.
- **Align the API to `api-contract.md`**: once a separately-authored
  contract document was shared, Claude compared it against the existing
  implementation, flagged every mismatch (response envelope shape,
  field naming, status codes), and rewrote the affected endpoints to
  match it exactly.
- **Build endpoints the front end required but weren't in the SRS or
  contract**: `GET /api/availability`, `GET /api/admin/reservations`,
  and `GET /api/admin/newsletter` were added after inspecting the
  front-end's own `api.ts` file to determine the exact URLs, request
  shapes, and response shapes it expected.
- **Debug environment and integration issues**, including: a Windows
  `psycopg2-binary` build failure (missing prebuilt wheel for Python
  3.13), PostgreSQL role/login configuration in pgAdmin, a missing
  `.figma/make/site.json` front-end config file, and a CORS origin
  mismatch between the Flask backend and the Vite dev server's
  non-default port (8443).
- **Write and maintain project documentation**: `README.md` (setup
  instructions, API reference) and this file.

## Verification performed

- Every code change was compiled (`python -m py_compile`) before being
  handed off.
- Time-slot generation logic (business hours, 30-minute intervals,
  12-hour label formatting) was unit-tested in isolation with sample
  dates before being wired into the Flask route.
- Endpoint behavior was manually verified via Postman and against the
  live PostgreSQL database in pgAdmin (e.g. confirming a newsletter
  signup updates the same customer row rather than creating a
  duplicate; confirming a duplicate reservation for the same
  customer+time-slot is rejected).
- Actual error messages and stack traces (Python tracebacks, `git`
  errors, browser console/CORS errors) were used to diagnose problems
  rather than guessing, and fixes were re-verified against fresh output
  after each change.

## What was NOT AI-generated

- All commands were run by the developer on their own machine; Claude
  has no access to the developer's computer, database, or GitHub
  account and could not execute `git`, `pip`, `psql`, or any other
  command directly.
- The front-end (`cafe-fausse-frontend/`) was built independently and
  was not authored by Claude; Claude only read its `api.ts`/`routes.ts`
  files (as shared by the developer) to diagnose integration mismatches.
- The API contract (`api-contract.md`) was authored jointly by the
  front-end and back-end developers as the project's source of truth;
  Claude aligned the backend to it but did not originate its terms.
- All architectural and product decisions (e.g. reservation slot
  interval, whether to allow multiple tables per customer per slot,
  which endpoints to build) were made by the developer, with Claude
  presenting options/trade-offs where a decision was needed.

---

_This document reflects AI usage as of 2026-09-01 and should be updated
if AI assistance is used for further changes to this project._

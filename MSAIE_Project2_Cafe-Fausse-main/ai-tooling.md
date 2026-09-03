# AI Tooling Disclosure

This document describes how AI assistance was used in building the
Café Fausse backend and frontend, for academic transparency.

---

## Toosl used

**Claude** (Anthropic), accessed via the claude.ai chat interface. [Backend]
**Figma Make (Figma)**, accessed via https://www.figma.com/make/ [Frontend]

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

**Figma Make** was used in the creation of the FrontEnd. It combines a code editor, live preview, and an AI assistant into a single workflow, removing the need to set up a local development environment to get started. [Frontend]
- **Initial Project Generation**: The entire frontend codebase was generated from scratch inside Figma Make using conversational prompts. Rather than manually writing React components, configuring Vite, or setting up Tailwind CSS, the project structure, routing, design tokens, and all five pages were produced through a guided dialogue describing the requirements.
- **Image Integration**: Four restaurant photographs were uploaded directly into Figma Make. The AI analysed each image, determined an appropriate role for each one (hero image, interior shot, food photography, events photography), and incorporated them into the correct pages using proper React ES module imports — a pattern required for Vite's production build to function correctly.
- **Requirement-Driven Development**: The full Software Requirements Specification (FR-1 through FR-18) was provided as a prompt. Figma Make interpreted each functional requirement and translated it directly into working code — including the menu data, reservation form validation logic, gallery lightbox, newsletter signup, and admin dashboard.
- **Design & Theming**: The visual theme — dark walnut background, champagne silver accents, Playfair Display serif typography, and Outfit sans-serif body text — was established through conversation. Figma Make generated a complete set of CSS custom property design tokens in src/index.css that were applied consistently across all components without manual styling work.
- **Iterative Refinement**: The design was refined through follow-up prompts after reviewing the live preview. Examples include:
1. Increasing navigation contrast over the hero image
2. Changing the accent color from gold to champagne silver
3. Increasing font sizes on the Menu page for readability
These changes were applied to the correct files immediately without the developer needing to locate or edit code manually.
- **API Contract Integration**: When the backend API contract (api-contract.md) was uploaded, Figma Make read and interpreted the document and updated the frontend API layer (src/lib/api.ts) and all affected pages to match the agreed response shapes, field names, HTTP status codes, and environment variable conventions — replacing the previously simulated backend behavior.
- **Component and Feature Addition**: New features were added incrementally through conversation:
1. A calendar date picker replaced the native date input, including installation of the react-day-picker library and custom CSS theming
2. A newsletter opt-in checkbox was added to the reservation form and wired to the correct API function
3. An Admin dashboard page was created with live data tables and a discreet footer link
- **Collaboration Awareness**:Throughout development, Figma Make identified exactly which files would be affected by each change before implementing them — supporting a collaborative Git workflow with a backend partner and helping avoid merge conflicts.
- **Code Export & Documentation**: The completed project was exported as a standard Vite + React application that runs outside of Figma Make using pnpm dev. A README.md and .env.example were generated to support onboarding of collaborators and deployment to a production environment.
- **Summary**
Figma Make served as the primary development environment for the entire frontend of this project — from initial scaffolding through to production-ready code. It accelerated development by combining design decision-making, code generation, live preview, and iterative refinement into a single conversational workflow, while producing clean, maintainable code that integrates with a standard React + Vite toolchain and a Flask + PostgreSQL backend.

**ChatGPT** was used in the general troubleshooting and local integration and deployment of the backend with the frontend code for testing and demonstration purposes.

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

- All commands were run by the developers on their own machines; Claude
  has no access to the developer's computer, database, or GitHub
  account and could not execute `git`, `pip`, `psql`, or any other
  command directly.
- The front-end (`cafe-fausse-frontend/`) was built independently using Figma Make and
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

_This document reflects AI usage as of 2026-09-03 and should be updated
if AI assistance is used for further changes to this project._

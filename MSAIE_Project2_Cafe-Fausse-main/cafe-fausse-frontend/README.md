# Café Fausse — Frontend

React + TypeScript + Vite frontend for the Café Fausse fine dining restaurant website.

---

## Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero, about teaser, menu categories, newsletter signup |
| Menu | `/menu` | Full menu with categories, items, and prices |
| Reservations | `/reservations` | Reservation form with calendar date picker |
| About Us | `/about` | Restaurant history, founders, and commitments |
| Gallery | `/gallery` | Image gallery with lightbox, awards, and reviews |
| Admin | `/admin` | Reservation and newsletter signup data (linked from footer) |

---

## Prerequisites

Ensure the following are installed before proceeding:

- [Node.js](https://nodejs.org) (LTS version recommended)
- [pnpm](https://pnpm.io)

Verify your installations:

```bash
node --version
pnpm --version
```

If pnpm is not installed:

```bash
npm install -g pnpm
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Or create it manually with the following content:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Update `VITE_API_BASE_URL` to point to wherever your Flask backend is running.

### 4. Start the development server

```bash
pnpm dev
```

The application will be available at:

```
http://localhost:5173
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Flask backend API | `http://localhost:5000/api` |

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server with hot reload |
| `pnpm build` | Build the application for production |
| `pnpm preview` | Preview the production build locally |

---

## Project Structure

```
├── index.html                  # HTML shell and browser tab title
├── .env                        # Environment variables (not committed to Git)
├── .env.example                # Environment variable template
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Router provider
    ├── routes.ts               # Page routes
    ├── index.css               # Global styles, design tokens, and fonts
    ├── lib/
    │   └── api.ts              # All API calls to the Flask backend
    ├── components/
    │   └── Layout.tsx          # Shared navigation and footer
    └── pages/
        ├── Home.tsx
        ├── Menu.tsx
        ├── Reservations.tsx
        ├── About.tsx
        ├── Gallery.tsx
        └── Admin.tsx
```

---

## Backend Integration

This frontend connects to a Flask + PostgreSQL backend. The API contract is documented in:

```
src/imports/api-contract.md
```

The following endpoints are used:

| Method | Endpoint | Used By |
|---|---|---|
| `POST` | `/api/reservations` | Reservations page |
| `POST` | `/api/newsletter` | Home page newsletter signup |
| `GET` | `/api/availability?date=YYYY-MM-DD` | Reservations page time slot checker |
| `GET` | `/api/admin/reservations` | Admin page |
| `GET` | `/api/admin/newsletter` | Admin page |

### CORS

The Flask backend must have CORS enabled for the frontend origin. During development this is typically `http://localhost:5173`. The `flask-cors` package is recommended on the backend side.

---

## Production Build

To build the application for deployment:

```bash
pnpm build
```

This generates a `dist/` folder containing static HTML, CSS, and JavaScript files that can be served by any web server or hosting provider (e.g. Nginx, Apache, Netlify, Vercel).

Before building, ensure `VITE_API_BASE_URL` in your `.env` points to your production Flask API URL.

---

## Notes

- The Admin page (`/admin`) is accessible via a discreet link in the footer. Access control is handled by the backend.
- The `.env` file should not be committed to Git. Add it to `.gitignore` if not already present.
- Image assets are located in `src/imports/` and are required for the site to display correctly.

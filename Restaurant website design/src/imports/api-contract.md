```markdown
# Café Fausse API Contract

This document defines the REST API contract between the **React front end** and the **Flask back end** for the Café Fausse web application.

It is based on the Software Requirements Specification (SRS) and is the single source of truth for front–back integration.

---

## 1. General

- **Base URL (development)**  
  `http://localhost:5000/api`

- **Protocols**  
  - HTTP in development (HTTPS optional in production)

- **Content Types**
  - Requests: `Content-Type: application/json`
  - Responses: `Content-Type: application/json`

- **Authentication**
  - None (for this school project)

- **Standard Response Shapes**

  **Success:**
  ```json
  {
    "status": "success",
    "...": "other fields depending on endpoint"
  }
  ```

  **Error:**
  ```json
  {
    "status": "error",
    "error": "Human-readable error message."
  }
  ```

- **HTTP Status Codes (Conventions)**
  - `200 OK` – Successful request.
  - `201 Created` – Resource successfully created.
  - `400 Bad Request` – Invalid input data.
  - `404 Not Found` – Resource not found (if applicable).
  - `409 Conflict` – Reservation conflict / time slot fully booked.
  - `500 Internal Server Error` – Unexpected server error.

The front end should:

- Treat 2xx as success, 4xx/5xx as error.
- Read the JSON body for `status`, and show `error` or user-facing `message` as appropriate.

---

## 2. Reservations API

**SRS Mapping**

- FR-6–9: Reservation form, validation, success/error messages.  
- FR-17–18: PostgreSQL tables and Flask logic (insert customers, check availability, assign random table).  
- NFR-5: Prevent double or over bookings.

### 2.1. Create Reservation

**Endpoint**

- **Method:** `POST`  
- **URL:** `/api/reservations`

**Purpose**

Create a new reservation for a given time slot. The back end:

1. Validates the request data.
2. Finds or creates a customer record.
3. Checks availability for the requested `time_slot` across 30 tables.
4. If available:
   - Assigns a random free table (1–30).
   - Creates a reservation record.
   - Returns confirmation.
5. If not available:
   - Returns an error that the time slot is fully booked.

---

### 2.1.1. Request

**Headers**

- `Content-Type: application/json`

**Body (example)**

```json
{
  "time_slot": "2026-09-20T19:00:00Z",
  "guests": 2,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+1-555-123-4567",
  "newsletter_signup": false
}
```

**Fields**

- `time_slot` (string, required)  
  - ISO 8601 datetime string.  
  - Example: `"2026-09-20T19:00:00Z"`  
  - Interpretation (UTC vs local) must be consistent between front and back end.

- `guests` (integer, required)  
  - Number of guests; must be a positive integer (`>= 1`).

- `name` (string, required)  
  - Customer’s full name, non-empty.

- `email` (string, required)  
  - Valid email address; used to identify the customer.

- `phone` (string, optional)  
  - Optional phone number; may be omitted or `null`.

- `newsletter_signup` (boolean, optional, default `false`)  
  - If `true`, the customer created/updated by this booking is also subscribed to the newsletter (equivalent to calling `POST /api/newsletter` separately). Lets the reservation form double as a newsletter opt-in checkbox (FR-15/16).

---

### 2.1.2. Validation Rules (Back End)

If **any** of the following checks fail, the API returns `400 Bad Request`:

- `time_slot`:
  - Present and parseable as a datetime.
  - (Optional enhancement) Is in the future.

- `guests`:
  - Present and integer.
  - `guests >= 1`.

- `name`:
  - Present and non-empty string.

- `email`:
  - Present and non-empty.
  - Valid email format.

The front end should perform its own client-side validation, but the back end is the final authority.

---

### 2.1.3. Success Response

- **HTTP Status:** `201 Created`

**Body**

```json
{
  "status": "success",
  "reservation_id": 123,
  "customer_id": 45,
  "table_number": 14,
  "time_slot": "2026-09-20T19:00:00Z",
  "guests": 2,
  "message": "Your table has been booked successfully."
}
```

**Fields**

- `status`: `"success"`.
- `reservation_id` (integer): Newly created reservation ID.
- `customer_id` (integer): Customer record ID associated with this reservation.
- `table_number` (integer): Assigned table number (1–30).
- `time_slot` (string): Confirmed reservation time in ISO format.
- `guests` (integer): Number of guests.
- `message` (string): Human-readable confirmation message for direct display in the UI.

The front end should display `message`, and show `time_slot` and `table_number` in the confirmation UI.

---

### 2.1.4. Error: Time Slot Fully Booked

- **HTTP Status:** `409 Conflict`

**Body**

```json
{
  "status": "error",
  "error": "Time slot fully booked. Please select a different time."
}
```

The front end should display `error` near the reservation form and allow the user to pick a new time slot.

---

### 2.1.5. Error: Validation

- **HTTP Status:** `400 Bad Request`

**Body (examples)**

Invalid email:

```json
{
  "status": "error",
  "error": "Invalid email address."
}
```

Missing required field:

```json
{
  "status": "error",
  "error": "Field 'time_slot' is required."
}
```

The front end should display `error` clearly; it may also map messages to specific fields if desired.

---

### 2.1.6. Error: Server

- **HTTP Status:** `500 Internal Server Error`

**Body**

```json
{
  "status": "error",
  "error": "An unexpected error occurred. Please try again later."
}
```

The front end should show a generic “something went wrong” message to the user and optionally log details to the browser console for debugging (in development).

---

## 3. Newsletter API

**SRS Mapping**

- FR-15–16: Email newsletter signup form, basic validation, store emails in the backend database.

### 3.1. Subscribe to Newsletter

**Endpoint**

- **Method:** `POST`  
- **URL:** `/api/newsletter`

**Purpose**

Subscribe a user to the email newsletter. The back end:

1. Validates the email address (and optional name).
2. Creates a new customer record or updates an existing one.
3. Sets `newsletter_signup = true`.
4. Returns success or error status.

---

### 3.1.1. Request

**Headers**

- `Content-Type: application/json`

**Body (example)**

```json
{
  "email": "user@example.com",
  "name": "Optional Name"
}
```

**Fields**

- `email` (string, required)  
  - Valid email address.

- `name` (string, optional)  
  - Optional customer name.

---

### 3.1.2. Validation Rules (Back End)

If validation fails, return `400 Bad Request`.

Examples:

- Missing `email`.
- Invalid email format.

---

### 3.1.3. Success Response

- **HTTP Status:** `200 OK` (or `201 Created` if treated as resource creation)

**Body**

```json
{
  "status": "success",
  "message": "You have been subscribed to the Café Fausse newsletter.",
  "customer_id": 45,
  "email": "user@example.com"
}
```

**Fields**

- `status`: `"success"`.
- `message` (string): User-facing confirmation text.
- `customer_id` (integer): ID of the subscriber’s customer record.
- `email` (string): The subscribed email address.

The front end should display `message` after successful subscription.

---

### 3.1.4. Error: Validation

- **HTTP Status:** `400 Bad Request`

**Body (example)**

```json
{
  "status": "error",
  "error": "Please provide a valid email address."
}
```

The front end should show `error` near the newsletter form.

---

### 3.1.5. Error: Server

- **HTTP Status:** `500 Internal Server Error`

**Body**

```json
{
  "status": "error",
  "error": "Unable to subscribe at this time. Please try again later."
}
```

The front end should show a generic error message.

---

## 4. CORS / Cross-Origin Considerations

During development, the React app and Flask API will run on different ports, for example:

- Front end: `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)
- Back end: `http://localhost:5000`

The back end must enable CORS (Cross-Origin Resource Sharing) so the browser allows the front end to call the API.

**Expectations:**

- Front end sends:
  - `Content-Type: application/json`
  - JSON in the request body.

- Back end includes headers (example):

  - `Access-Control-Allow-Origin: http://localhost:5173`  
    *(or `*` in development, if acceptable)*

  - `Access-Control-Allow-Headers: Content-Type`

  - `Access-Control-Allow-Methods: POST, OPTIONS`

Using `flask-cors` or similar is recommended to simplify this configuration.

---

## 5. Front-End Integration Notes

### 5.1. API Base URL in React

In the React front end, the base URL for the API will be stored in an environment variable.

**Vite example (.env):**

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

**API client helper (example):**

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function createReservation(data) {
  const res = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function subscribeNewsletter(data) {
  const res = await fetch(`${API_BASE_URL}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

**Front-end handling pattern:**

```js
const response = await createReservation(formData);

if (response.status === 'success') {
  // show success message, table number, time, etc.
} else if (response.status === 'error') {
  // show response.error near the form
} else {
  // fallback generic error
}
```

---

## 6. Database Contract (For Reference Only)

The front end does **not** talk directly to the database, but this is included to keep the back end aligned with the SRS and reservation logic.

### 6.1. Tables

**customers**

- `id` (PK, integer, auto-increment)
- `name` (text, nullable)
- `email` (text, unique, not null)
- `phone` (text, nullable)
- `newsletter_signup` (boolean, default `false`)

**reservations**

- `id` (PK, integer, auto-increment)
- `customer_id` (integer, FK → customers.id, not null)
- `time_slot` (timestamp, not null)
- `table_number` (integer, 1–30, not null)

**Constraints / Logic:**

- Unique constraint on (`time_slot`, `table_number`) to prevent double booking of the same table at the same time.
- Reservation logic must ensure a maximum of 30 reservations per exact `time_slot` (one per table).

---

## 7. Versioning & Changes

- This document describes **API v1**.
- Any breaking API changes must be:
  1. Discussed and agreed upon by both front-end and back-end developers.
  2. Documented in this file (update date and details).
  3. Implemented only after both sides are ready.

(Optional) You may add a `version` field in responses for debugging:

```json
{
  "status": "success",
  "version": "1.0",
  "message": "..."
}
```

---

_Last updated: 2026-08-31 (added optional `newsletter_signup` field to reservation request)_  
_Front-end: Marianne Du Toit_  
_Back-end: John Noegel_
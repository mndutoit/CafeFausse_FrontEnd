"""
API endpoints for the Café Fausse backend.

  POST /api/reservations       -> create a reservation (FR-6..FR-9, FR-18)
  GET  /api/reservations       -> list reservations, with optional filters
                                    (date, email) - e.g. for an admin view
  GET  /api/reservations/<id>  -> look up a single reservation (handy for a
                                    confirmation page)
  POST /api/newsletter         -> subscribe an email to the newsletter (FR-15/16)
  GET  /api/availability       -> which of a day's slots are fully booked
                                    (front-end enhancement, not in the contract)
  GET  /api/admin/reservations -> all reservations w/ customer name, for an
                                    admin view (not in the contract)
  GET  /api/admin/newsletter   -> all newsletter subscribers, for an admin
                                    view (not in the contract)

All responses are JSON. Validation errors return 400, "slot full" returns
409, unexpected errors return 500 with a generic message (NFR-6: fail in a
user-friendly way, don't leak internals).
"""

import re
from datetime import datetime

from flask import Blueprint, request, jsonify
from app import db
from app.models import Customer, Reservation
from app.services import (
    parse_time_slot,
    create_reservation,
    get_fully_booked_slot_labels,
    ReservationError,
)

api_bp = Blueprint("api", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _get_or_create_customer(name: str, email: str, phone: str = None,
                             newsletter_signup: bool = None) -> Customer:
    """
    Look up a customer by email; create one if they're new. If they
    already exist and newsletter_signup is explicitly provided, update it
    (e.g. they opt in while booking a reservation).
    """
    customer = Customer.query.filter_by(email=email).first()

    if customer is None:
        customer = Customer(
            customer_name=name,
            email=email,
            phone_number=phone,
            newsletter_signup=bool(newsletter_signup),
        )
        db.session.add(customer)
        db.session.flush()  # get customer_id without a full commit yet
    else:
        # Keep contact details fresh and don't accidentally un-subscribe
        # someone who's already opted in.
        customer.customer_name = name or customer.customer_name
        customer.phone_number = phone or customer.phone_number
        if newsletter_signup:
            customer.newsletter_signup = True

    return customer


@api_bp.route("/reservations", methods=["POST"])
def create_reservation_route():
    """
    Create a reservation (FR-6..FR-9, FR-18).
    Matches api-contract.md section 2.1 exactly, plus one extension:
    an optional `newsletter_signup` boolean (documented in the contract's
    reservation schema) lets the booking form double as a newsletter
    opt-in checkbox.
    """
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip() or None
    guests_raw = data.get("guests")
    time_slot_raw = data.get("time_slot")
    newsletter_signup = bool(data.get("newsletter_signup", False))

    # --- Validation (FR-6, FR-7) -----------------------------------
    # The contract specifies a single "error" string per failure, so we
    # check fields in a fixed order and return on the first problem
    # found, matching the contract's example messages.
    if not name:
        return jsonify({"status": "error", "error": "Field 'name' is required."}), 400

    if not email:
        return jsonify({"status": "error", "error": "Field 'email' is required."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"status": "error", "error": "Invalid email address."}), 400

    try:
        guests = int(guests_raw)
        if guests < 1:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({
            "status": "error",
            "error": "Field 'guests' must be a positive integer.",
        }), 400

    if not time_slot_raw:
        return jsonify({
            "status": "error",
            "error": "Field 'time_slot' is required.",
        }), 400

    try:
        time_slot = parse_time_slot(time_slot_raw)
    except ReservationError as e:
        return jsonify({"status": "error", "error": e.message}), e.status_code

    # --- Persist customer + reservation -----------------------------
    try:
        customer = _get_or_create_customer(name, email, phone, newsletter_signup)
        # Commit the customer on its own first. This matters for the
        # table-assignment retry logic in create_reservation(): if a new
        # customer were only flush()-ed (not committed) and a reservation
        # collision later forced a rollback, that rollback would erase
        # the uncommitted customer row too.
        db.session.commit()

        reservation = create_reservation(customer, time_slot)
    except ReservationError as e:
        db.session.rollback()
        return jsonify({"status": "error", "error": e.message}), e.status_code
    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "error": "An unexpected error occurred. Please try again later.",
        }), 500

    # FR-9: success message + assigned table (flat shape per contract 2.1.3).
    return jsonify({
        "status": "success",
        "reservation_id": reservation.reservation_id,
        "customer_id": customer.customer_id,
        "table_number": reservation.table_number,
        "time_slot": reservation.time_slot.isoformat(),
        "guests": guests,
        "message": "Your table has been booked successfully.",
    }), 201


@api_bp.route("/reservations", methods=["GET"])
def list_reservations():
    """
    List reservations, optionally filtered by date and/or customer email.
    Not part of api-contract.md, but follows its status/error convention
    for consistency with the rest of the API.

    Query params (all optional):
      date  - YYYY-MM-DD, returns reservations whose time_slot falls on
              that calendar date
      email - exact match against the customer's email address

    Results are ordered by time_slot ascending.
    """
    query = Reservation.query.join(Customer)

    date_str = request.args.get("date")
    if date_str:
        try:
            day = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({
                "status": "error",
                "error": "Query param 'date' must be in YYYY-MM-DD format.",
            }), 400
        query = query.filter(db.func.date(Reservation.time_slot) == day)

    email = request.args.get("email")
    if email:
        query = query.filter(Customer.email == email.strip().lower())

    reservations = query.order_by(Reservation.time_slot.asc()).all()

    return jsonify({
        "status": "success",
        "count": len(reservations),
        "reservations": [r.to_dict() for r in reservations],
    }), 200


@api_bp.route("/reservations/<int:reservation_id>", methods=["GET"])
def get_reservation(reservation_id):
    """
    Look up a single reservation by ID. Not part of api-contract.md, but
    follows its status/error convention for consistency.
    """
    reservation = Reservation.query.get(reservation_id)
    if reservation is None:
        return jsonify({
            "status": "error",
            "error": "Reservation not found.",
        }), 404
    return jsonify({
        "status": "success",
        "reservation": reservation.to_dict(),
    }), 200


@api_bp.route("/newsletter", methods=["POST"])
def newsletter_signup_route():
    """
    Subscribe an email to the newsletter (FR-15, FR-16).
    Matches api-contract.md section 3.1 exactly.
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip() or None

    # FR-15: validate email format before storing.
    if not email or not EMAIL_RE.match(email):
        return jsonify({
            "status": "error",
            "error": "Please provide a valid email address.",
        }), 400

    try:
        customer = _get_or_create_customer(
            name or "Newsletter Subscriber", email, newsletter_signup=True
        )
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "error": "Unable to subscribe at this time. Please try again later.",
        }), 500

    # FR-16: confirm the email is stored for future marketing use.
    return jsonify({
        "status": "success",
        "message": "You have been subscribed to the Café Fausse newsletter.",
        "customer_id": customer.customer_id,
        "email": customer.email,
    }), 200


@api_bp.route("/availability", methods=["GET"])
def get_availability():
    """
    GET /api/availability?date=YYYY-MM-DD

    Front-end enhancement (not in api-contract.md): returns which of the
    day's 30-minute slots (per SRS FR-2 hours) are fully booked, so the
    reservation form can grey them out before the user submits.
    """
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({
            "status": "error",
            "error": "Query param 'date' is required.",
        }), 400

    try:
        day = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({
            "status": "error",
            "error": "Query param 'date' must be in YYYY-MM-DD format.",
        }), 400

    return jsonify({
        "status": "success",
        "bookedSlots": get_fully_booked_slot_labels(day),
    }), 200


@api_bp.route("/admin/reservations", methods=["GET"])
def admin_list_reservations():
    """
    GET /api/admin/reservations

    Front-end enhancement (not in api-contract.md): every reservation
    with the customer's name resolved, for an admin/staff view (SRS 2.3:
    "Administrators/Managers ... reservation oversight").
    """
    rows = (
        db.session.query(Reservation, Customer)
        .join(Customer, Reservation.customer_id == Customer.customer_id)
        .order_by(Reservation.time_slot.asc())
        .all()
    )

    reservations = [
        {
            "id": reservation.reservation_id,
            "customerName": customer.customer_name,
            "timeSlot": reservation.time_slot.isoformat(),
            "tableNumber": reservation.table_number,
        }
        for reservation, customer in rows
    ]

    return jsonify({"status": "success", "reservations": reservations}), 200


@api_bp.route("/admin/newsletter", methods=["GET"])
def admin_list_newsletter():
    """
    GET /api/admin/newsletter

    Front-end enhancement (not in api-contract.md): every customer who's
    opted into the newsletter, for an admin/staff view.
    """
    customers = (
        Customer.query.filter_by(newsletter_signup=True)
        .order_by(Customer.customer_name.asc())
        .all()
    )

    signups = [
        {
            "id": customer.customer_id,
            "customerName": customer.customer_name,
            "email": customer.email,
        }
        for customer in customers
    ]

    return jsonify({"status": "success", "signups": signups}), 200

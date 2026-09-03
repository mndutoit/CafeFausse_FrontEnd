"""
Business logic for the reservation system (SRS 3.1.3 / 3.1.7).

Kept separate from routes.py so the "how do we pick a table" logic is
easy to find, test, and change without touching request handling.
"""

import random
from datetime import date, datetime, time, timedelta, timezone

from flask import current_app
from sqlalchemy.exc import IntegrityError

from app import db
from app.models import Reservation

# SRS 3.1.1 (FR-2): Monday-Saturday 5:00 PM - 11:00 PM, Sunday 5:00 PM - 9:00 PM.
# weekday(): Monday=0 ... Sunday=6.
_BUSINESS_HOURS = {
    "weekday": (time(17, 0), time(23, 0)),  # Mon-Sat
    "sunday": (time(17, 0), time(21, 0)),
}
_SLOT_INTERVAL_MINUTES = 30


class ReservationError(Exception):
    """Raised for any reservation failure that should become a 4xx response."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def parse_time_slot(raw_value: str) -> datetime:
    """
    Parse the incoming time slot string into a datetime.

    Accepts ISO 8601 (what a JS `Date.toISOString()` / <input type="datetime-local">
    naturally produces). Raises ReservationError on anything unparseable
    or in the past (FR-7: validate the slot is valid).
    """
    if not raw_value:
        raise ReservationError("Time slot is required.")

    try:
        # Support both "...Z" and "+00:00" style offsets.
        value = raw_value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(value)
    except ValueError:
        raise ReservationError(
            "Time slot must be a valid date/time (ISO 8601 format)."
        )

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    if parsed < datetime.now(timezone.utc):
        raise ReservationError("Time slot must be in the future.")

    return parsed


def find_available_table(time_slot: datetime) -> int:
    """
    Return a randomly chosen available table number for `time_slot`,
    or raise ReservationError if the slot is fully booked (FR-8, FR-9).

    "Available" = not already assigned to another reservation at the
    exact same time_slot. Total table count comes from config so it's
    not a magic number scattered through the code.
    """
    total_tables = current_app.config["TOTAL_TABLES"]

    booked_rows = (
        db.session.query(Reservation.table_number)
        .filter(Reservation.time_slot == time_slot)
        .all()
    )
    booked_tables = {row[0] for row in booked_rows}

    available_tables = [t for t in range(1, total_tables + 1) if t not in booked_tables]

    if not available_tables:
        raise ReservationError(
            "Sorry, that time slot is fully booked. Please choose another time.",
            status_code=409,
        )

    return random.choice(available_tables)


def ensure_no_existing_reservation(customer_id: int, time_slot: datetime) -> None:
    """
    Raise ReservationError if `customer_id` already has a reservation at
    `time_slot` (NFR-5: prevent double or over bookings). One customer
    booking two tables for the same slot counts as a double booking even
    though it's two *different* tables, so this is a separate check from
    the table-availability logic in find_available_table().
    """
    existing = (
        db.session.query(Reservation.reservation_id)
        .filter(
            Reservation.customer_id == customer_id,
            Reservation.time_slot == time_slot,
        )
        .first()
    )

    if existing is not None:
        raise ReservationError(
            "You already have a reservation at this time slot. "
            "Please choose a different time or cancel your existing reservation first.",
            status_code=409,
        )


def create_reservation(customer, time_slot: datetime, max_attempts: int = 5) -> Reservation:
    """
    Assign a table and persist the reservation for `customer` at `time_slot`.

    Guards two distinct double-booking scenarios (NFR-5):
      1. Two different customers racing for the same table+slot - handled
         by the DB's UNIQUE(time_slot, table_number) constraint, with the
         retry loop below cleanly picking a different table on collision.
      2. The SAME customer booking the same slot twice (e.g. two tables
         at once, or a duplicate double-click) - handled by
         ensure_no_existing_reservation(), checked both up front and
         again inside the loop in case a second request for the same
         customer+slot snuck in between our check and our commit.

    IMPORTANT: `customer` must already be committed to the database
    (not just flushed) before calling this. If it isn't, a rollback here
    after a collision would also erase the new customer row, since
    they'd share the same open transaction.
    """
    ensure_no_existing_reservation(customer.customer_id, time_slot)

    last_error = None

    for _ in range(max_attempts):
        table_number = find_available_table(time_slot)

        reservation = Reservation(
            customer_id=customer.customer_id,
            time_slot=time_slot,
            table_number=table_number,
        )
        db.session.add(reservation)

        try:
            db.session.commit()
            return reservation
        except IntegrityError as e:
            db.session.rollback()
            last_error = e

            # A second request for this same customer+slot could have
            # slipped in and committed while we were retrying - re-check
            # before trying again rather than just assuming it was a
            # table-number collision.
            ensure_no_existing_reservation(customer.customer_id, time_slot)

    # Exhausted retries - something is very contended (or TOTAL_TABLES is
    # small relative to concurrent traffic). Fail loudly rather than loop
    # forever.
    raise ReservationError(
        "Sorry, that time slot is fully booked. Please choose another time.",
        status_code=409,
    ) from last_error


def _time_slot_options_for_date(day: date) -> list[time]:
    """
    Every 30-minute reservation slot offered on `day`, per the SRS's
    posted hours (FR-2). Sunday gets shorter hours than the rest of
    the week.
    """
    start, end = _BUSINESS_HOURS["sunday"] if day.weekday() == 6 else _BUSINESS_HOURS["weekday"]

    slots = []
    current = datetime.combine(day, start)
    end_dt = datetime.combine(day, end)
    while current <= end_dt:
        slots.append(current.time())
        current += timedelta(minutes=_SLOT_INTERVAL_MINUTES)
    return slots


def _format_slot_label(dt: datetime) -> str:
    """Render a datetime as a front-end-friendly 12-hour label, e.g. '5:00 PM'."""
    hour_12 = dt.hour % 12 or 12
    period = "AM" if dt.hour < 12 else "PM"
    return f"{hour_12}:{dt.minute:02d} {period}"


def get_fully_booked_slot_labels(day: date) -> list[str]:
    """
    Return the '5:00 PM'-style labels of every slot on `day` that has
    all TOTAL_TABLES tables already reserved. Powers GET /api/availability
    (a front-end enhancement, not part of api-contract.md) so the booking
    form can grey out slots that are already full.
    """
    total_tables = current_app.config["TOTAL_TABLES"]

    # Count existing reservations per exact time_slot on this date in one
    # query, rather than one query per candidate slot.
    rows = (
        db.session.query(
            Reservation.time_slot, db.func.count(Reservation.reservation_id)
        )
        .filter(db.func.date(Reservation.time_slot) == day)
        .group_by(Reservation.time_slot)
        .all()
    )
    counts_by_slot = {time_slot: count for time_slot, count in rows}

    booked_labels = []
    for slot_time in _time_slot_options_for_date(day):
        slot_dt = datetime.combine(day, slot_time, tzinfo=timezone.utc)
        if counts_by_slot.get(slot_dt, 0) >= total_tables:
            booked_labels.append(_format_slot_label(slot_dt))

    return booked_labels

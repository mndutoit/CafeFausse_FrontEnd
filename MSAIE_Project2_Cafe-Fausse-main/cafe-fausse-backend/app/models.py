"""
Database models for the Café Fausse backend (SRS 3.1.7 / FR-17).

Two tables:
  - Customer:     one row per unique customer (by email). Tracks whether
                   they opted into the newsletter (FR-16).
  - Reservation:  one row per booking. Linked to a Customer, storing the
                   requested time slot and the table number assigned by
                   the reservation logic (FR-8, FR-18).
"""

from datetime import datetime, timezone
from app import db


class Customer(db.Model):
    __tablename__ = "customers"

    customer_id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone_number = db.Column(db.String(30), nullable=True)
    newsletter_signup = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # One customer can have many reservations over time.
    reservations = db.relationship(
        "Reservation", backref="customer", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "newsletter_signup": self.newsletter_signup,
        }


class Reservation(db.Model):
    __tablename__ = "reservations"

    reservation_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(
        db.Integer, db.ForeignKey("customers.customer_id"), nullable=False
    )
    time_slot = db.Column(db.DateTime(timezone=True), nullable=False, index=True)
    table_number = db.Column(db.Integer, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # NFR-5: prevent double/over bookings at the database level, as a
    # backstop behind the application-level checks in services.py.
    #   - uq_table_timeslot: the same table can't be booked twice for the
    #     same slot (two different customers colliding).
    #   - uq_customer_timeslot: the same customer can't hold two
    #     reservations (i.e. two different tables) for the same slot.
    __table_args__ = (
        db.UniqueConstraint(
            "time_slot", "table_number", name="uq_table_timeslot"
        ),
        db.UniqueConstraint(
            "customer_id", "time_slot", name="uq_customer_timeslot"
        ),
    )

    def to_dict(self):
        return {
            "reservation_id": self.reservation_id,
            "customer_id": self.customer_id,
            "time_slot": self.time_slot.isoformat(),
            "table_number": self.table_number,
        }

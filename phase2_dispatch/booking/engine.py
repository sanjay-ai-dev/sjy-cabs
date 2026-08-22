import string
import random
from datetime import datetime, timezone
import asyncpg
import structlog
from typing import Optional, Tuple

from ..parsing.models import BookingConfirmation

logger = structlog.get_logger()

def generate_booking_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return 'BK-' + ''.join(random.choices(chars, k=6))

def generate_trip_code(route_id: str, dt: datetime) -> str:
    chars = string.ascii_uppercase + string.digits
    date_str = dt.strftime("%d%m")
    return f"SJY-{date_str}-{''.join(random.choices(chars, k=2))}"

async def find_or_create_passenger(pool: asyncpg.Pool, phone: str, name: Optional[str] = None, gender: Optional[str] = None) -> str:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id FROM passengers WHERE phone = $1", phone)
        if row:
            return row['id']
        else:
            new_id = await conn.fetchval(
                "INSERT INTO passengers (phone, name, gender) VALUES ($1, $2, $3) RETURNING id",
                phone, name, gender
            )
            return new_id

async def check_pass(pool: asyncpg.Pool, passenger_id: str, route_id: str) -> Optional[str]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id FROM monthly_passes 
            WHERE passenger_id = $1 AND route_id = $2 
            AND status = 'active' AND used_trips < total_trips AND end_date >= CURRENT_DATE
            """,
            passenger_id, route_id
        )
        return row['id'] if row else None

async def find_next_trip(pool: asyncpg.Pool, route_id: str, departure_after: datetime) -> Optional[str]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id FROM trips 
            WHERE route_id = $1 AND departure_time >= $2 AND status = 'scheduled'
            ORDER BY departure_time ASC LIMIT 1
            """,
            route_id, departure_after
        )
        return row['id'] if row else None

async def allocate_seats(
    pool: asyncpg.Pool,
    trip_id: str,
    passenger_phone: str,
    seats_count: int,
    is_female: bool,
    pickup_raw: str,
    drop_raw: str,
    fare: int
) -> BookingConfirmation:
    
    async with pool.acquire() as conn:
        async with conn.transaction():
            passenger_id = await find_or_create_passenger(pool, passenger_phone)
            
            # Lock the trip row
            trip = await conn.fetchrow(
                "SELECT id, trip_code, route_id, departure_time, booked_seats, total_seats, priority_seat_open, vehicle_id FROM trips WHERE id = $1 FOR UPDATE",
                trip_id
            )
            if not trip:
                raise ValueError("Trip not found")
                
            booked_seats = trip['booked_seats']
            total_seats = trip['total_seats']
            priority_seat_open = trip['priority_seat_open']
            
            # Check availability
            available_seats = total_seats - booked_seats
            if seats_count > available_seats:
                raise ValueError("Not enough seats available")
                
            is_priority = False
            if is_female and not priority_seat_open and booked_seats < total_seats:
                is_priority = True
            
            # Update trip
            await conn.execute(
                "UPDATE trips SET booked_seats = booked_seats + $1, updated_at = NOW() WHERE id = $2",
                seats_count, trip_id
            )
            
            # Monthly pass check
            pass_id = await check_pass(pool, passenger_id, trip['route_id'])
            if pass_id:
                fare = 0
                await conn.execute("UPDATE monthly_passes SET used_trips = used_trips + 1 WHERE id = $1", pass_id)
            
            # Create booking
            booking_code = generate_booking_code()
            await conn.execute(
                """
                INSERT INTO bookings (booking_code, trip_id, passenger_id, seats_count, pickup_raw, drop_raw, fare_amount, is_female_priority, is_pass_trip, pass_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """,
                booking_code, trip_id, passenger_id, seats_count, pickup_raw, drop_raw, fare, is_priority, bool(pass_id), pass_id
            )
            
            # Fetch vehicle & driver info
            vehicle = await conn.fetchrow("SELECT registration_no, driver_name, driver_phone FROM vehicles WHERE id = $1", trip['vehicle_id'])
            
            return BookingConfirmation(
                booking_code=booking_code,
                trip_code=trip['trip_code'],
                route_label=trip['route_id'],
                seats=seats_count,
                fare=fare,
                departure_time=trip['departure_time'].isoformat(),
                tracking_url=f"https://sjy.co.in/track/{booking_code}",
                vehicle_reg=vehicle['registration_no'],
                driver_name=vehicle['driver_name'] or "Unknown",
                driver_phone=vehicle['driver_phone'] or "Unknown"
            )

async def cancel_booking(pool: asyncpg.Pool, booking_code: str):
    async with pool.acquire() as conn:
        async with conn.transaction():
            booking = await conn.fetchrow("SELECT id, trip_id, seats_count, is_pass_trip, pass_id, status FROM bookings WHERE booking_code = $1 FOR UPDATE", booking_code)
            if not booking or booking['status'] != 'confirmed':
                return
                
            await conn.execute("UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1", booking['id'])
            await conn.execute("UPDATE trips SET booked_seats = booked_seats - $1 WHERE id = $2", booking['seats_count'], booking['trip_id'])
            
            if booking['is_pass_trip'] and booking['pass_id']:
                await conn.execute("UPDATE monthly_passes SET used_trips = used_trips - 1 WHERE id = $1", booking['pass_id'])

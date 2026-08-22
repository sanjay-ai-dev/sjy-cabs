import random
import string
import asyncpg
import structlog
from typing import Dict, Any, List

logger = structlog.get_logger()

def generate_parcel_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return 'PK-' + ''.join(random.choices(chars, k=6))

async def allocate_parcel_slot(pool: asyncpg.Pool, trip_id: str, parcel_data: Dict[str, Any]) -> str:
    async with pool.acquire() as conn:
        async with conn.transaction():
            trip = await conn.fetchrow(
                "SELECT id, total_parcel_slots, booked_parcel_slots FROM trips WHERE id = $1 FOR UPDATE",
                trip_id
            )
            if not trip:
                raise ValueError("Trip not found")
                
            if trip['booked_parcel_slots'] >= trip['total_parcel_slots']:
                raise ValueError("No parcel slots available")
                
            await conn.execute(
                "UPDATE trips SET booked_parcel_slots = booked_parcel_slots + 1, updated_at = NOW() WHERE id = $1",
                trip_id
            )
            
            parcel_code = generate_parcel_code()
            
            await conn.execute(
                """
                INSERT INTO parcels (
                    parcel_code, trip_id, sender_phone, sender_name,
                    receiver_phone, receiver_name, pickup_address, pickup_city,
                    drop_address, drop_city, description, weight_kg, fare_amount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                """,
                parcel_code, trip_id,
                parcel_data.get('sender_phone', ''),
                parcel_data.get('sender_name', ''),
                parcel_data.get('receiver_phone', ''),
                parcel_data.get('receiver_name', ''),
                parcel_data.get('pickup_address', ''),
                parcel_data.get('pickup_city', 'indore'),
                parcel_data.get('drop_address', ''),
                parcel_data.get('drop_city', 'indore'),
                parcel_data.get('description', ''),
                parcel_data.get('weight_kg', 1.0),
                parcel_data.get('fare_amount', 100)
            )
            
            return parcel_code

async def get_trip_parcels(pool: asyncpg.Pool, trip_id: str) -> List[Dict[str, Any]]:
    async with pool.acquire() as conn:
        records = await conn.fetch(
            "SELECT * FROM parcels WHERE trip_id = $1",
            trip_id
        )
        return [dict(r) for r in records]

async def update_parcel_status(pool: asyncpg.Pool, parcel_code: str, new_status: str):
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE parcels SET status = $1::parcel_status, updated_at = NOW() WHERE parcel_code = $2",
            new_status, parcel_code
        )

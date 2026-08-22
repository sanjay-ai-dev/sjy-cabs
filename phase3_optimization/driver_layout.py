from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import structlog
from typing import List, Dict, Any
from datetime import datetime, timezone

from .route_optimizer import optimize_trip_sequence, StopInfo
from .osrm_client import get_nearest

logger = structlog.get_logger()
router = APIRouter()

class ManifestResponse(BaseModel):
    id: str
    trip_id: str
    stop_seq: int
    stop_type: str
    entity_id: str
    entity_name: str
    location_text: str
    lat: float
    lon: float
    eta: str
    is_completed: bool

@router.get("/api/trips/{trip_id}/manifest", response_model=List[ManifestResponse])
async def get_manifest(trip_id: str, request: Request):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        records = await conn.fetch(
            "SELECT * FROM trip_manifest WHERE trip_id = $1 ORDER BY stop_seq ASC",
            trip_id
        )
        if not records:
            return []
            
        return [
            ManifestResponse(
                id=str(r['id']),
                trip_id=str(r['trip_id']),
                stop_seq=r['stop_seq'],
                stop_type=r['stop_type'],
                entity_id=str(r['entity_id']),
                entity_name=r['entity_name'] or "",
                location_text=r['location_text'] or "",
                lat=r['lat'],
                lon=r['lon'],
                eta=r['eta'].isoformat() if r['eta'] else "",
                is_completed=r['is_completed']
            )
            for r in records
        ]

@router.post("/api/trips/{trip_id}/manifest/generate")
async def generate_manifest(trip_id: str, request: Request):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        trip = await conn.fetchrow("SELECT * FROM trips WHERE id = $1", trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        # Fetch bookings
        bookings = await conn.fetch("SELECT * FROM bookings WHERE trip_id = $1 AND status = 'confirmed'", trip_id)
        parcels = await conn.fetch("SELECT * FROM parcels WHERE trip_id = $1 AND status = 'booked'", trip_id)
        
        # Need some default lat/lon if null - for now use defaults or skip
        pickups = []
        drops = []
        for b in bookings:
            p_lat = b['pickup_lat'] or 22.7196 # default indore
            p_lon = b['pickup_lon'] or 75.8577
            d_lat = b['drop_lat'] or 22.7196
            d_lon = b['drop_lon'] or 75.8577
            
            pickups.append(StopInfo(str(b['id']), "Passenger Pickup", p_lat, p_lon, b['seats_count']))
            drops.append(StopInfo(str(b['id']), "Passenger Drop", d_lat, d_lon, b['seats_count']))
            
        parcels_p = []
        parcels_d = []
        for p in parcels:
            p_lat = p['pickup_lat'] or 22.7196
            p_lon = p['pickup_lon'] or 75.8577
            d_lat = p['drop_lat'] or 22.7196
            d_lon = p['drop_lon'] or 75.8577
            
            parcels_p.append(StopInfo(str(p['id']), "Parcel Pickup", p_lat, p_lon, 0))
            parcels_d.append(StopInfo(str(p['id']), "Parcel Drop", d_lat, d_lon, 0))
            
        # Assuming depot is vehicle current location or start city hub
        depot_lat = 22.7196
        depot_lon = 75.8577
        
        manifest_stops = await optimize_trip_sequence(
            (depot_lon, depot_lat),
            pickups, drops, parcels_p, parcels_d,
            trip['departure_time']
        )
        
        # Clear existing
        await conn.execute("DELETE FROM trip_manifest WHERE trip_id = $1", trip_id)
        
        # Insert new
        for stop in manifest_stops:
            await conn.execute(
                """
                INSERT INTO trip_manifest (trip_id, stop_seq, stop_type, entity_id, entity_name, location_text, lat, lon, eta)
                VALUES ($1, $2, $3::stop_type, $4, $5, $6, $7, $8, $9)
                """,
                trip_id, stop.seq, stop.type, stop.entity_id, stop.name, f"{stop.lat},{stop.lon}", stop.lat, stop.lon, datetime.fromisoformat(stop.eta)
            )
            
    return {"status": "success"}

@router.patch("/api/trips/{trip_id}/stops/{stop_seq}/complete")
async def complete_stop(trip_id: str, stop_seq: int, request: Request):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        res = await conn.execute(
            "UPDATE trip_manifest SET is_completed = TRUE, actual_time = NOW() WHERE trip_id = $1 AND stop_seq = $2",
            trip_id, stop_seq
        )
        if res == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Stop not found")
            
    return {"status": "success"}

@router.get("/api/drivers/{driver_phone}/today")
async def get_driver_today_trips(driver_phone: str, request: Request):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        vehicle = await conn.fetchrow("SELECT id FROM vehicles WHERE driver_phone = $1", driver_phone)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found for driver")
            
        trips = await conn.fetch(
            "SELECT * FROM trips WHERE vehicle_id = $1 AND departure_time >= CURRENT_DATE AND departure_time < CURRENT_DATE + INTERVAL '1 day'",
            vehicle['id']
        )
        
        return [dict(t) for t in trips]

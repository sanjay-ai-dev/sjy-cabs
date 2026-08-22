"""
FastAPI SSE streaming endpoint for vehicle tracking.
"""
import os
import json
import asyncio
from typing import AsyncGenerator
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from phase1_ingestion.redis_geo import RedisGeo

app = FastAPI(title="SJY Mobility Tracking Stream")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sjy.co.in", "https://api.sjy.co.in", "http://localhost:3000", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

redis_geo = None

@app.on_event("startup")
async def startup_event():
    global redis_geo
    redis_geo = RedisGeo(
        host=os.environ.get("REDIS_HOST", "localhost"),
        port=int(os.environ.get("REDIS_PORT", 6379))
    )

@app.on_event("shutdown")
async def shutdown_event():
    global redis_geo
    if redis_geo:
        await redis_geo.close()

async def get_vehicle_stream(request: Request, vehicle_id: str) -> AsyncGenerator[str, None]:
    pubsub = redis_geo.redis.pubsub()
    await pubsub.subscribe('sjy:vehicle:updates')
    
    try:
        while True:
            if await request.is_disconnected():
                break
                
            try:
                # Wait for a message with a timeout to send heartbeats
                message = await asyncio.wait_for(pubsub.get_message(ignore_subscribe_messages=True), timeout=15.0)
                if message and message['type'] == 'message':
                    data = json.loads(message['data'])
                    if data.get('vehicle_id') == vehicle_id:
                        # Yield in SSE format
                        yield f"data: {json.dumps(data)}\n\n"
            except asyncio.TimeoutError:
                # Send heartbeat comment
                yield ": heartbeat\n\n"
    finally:
        await pubsub.unsubscribe('sjy:vehicle:updates')
        await pubsub.close()

@app.get("/stream/vehicle/{vehicle_id}")
async def stream_vehicle(request: Request, vehicle_id: str):
    return StreamingResponse(
        get_vehicle_stream(request, vehicle_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

async def get_fleet_stream(request: Request) -> AsyncGenerator[str, None]:
    pubsub = redis_geo.redis.pubsub()
    await pubsub.subscribe('sjy:vehicle:updates')
    
    try:
        while True:
            if await request.is_disconnected():
                break
                
            try:
                message = await asyncio.wait_for(pubsub.get_message(ignore_subscribe_messages=True), timeout=15.0)
                if message and message['type'] == 'message':
                    data = json.loads(message['data'])
                    yield f"data: {json.dumps(data)}\n\n"
            except asyncio.TimeoutError:
                yield ": heartbeat\n\n"
    finally:
        await pubsub.unsubscribe('sjy:vehicle:updates')
        await pubsub.close()

@app.get("/stream/fleet")
async def stream_fleet(request: Request):
    return StreamingResponse(
        get_fleet_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/vehicles/positions")
async def get_all_positions():
    if not redis_geo:
        raise HTTPException(status_code=500, detail="Redis not connected")
    positions = await redis_geo.get_all_vehicles()
    
    full_data = []
    for p in positions:
        meta = await redis_geo.get_vehicle_metadata(p['vehicle_id'])
        if meta:
            p.update(meta)
        full_data.append(p)
        
    return full_data

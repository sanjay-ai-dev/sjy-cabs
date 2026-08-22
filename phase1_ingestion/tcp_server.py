"""
Async TCP socket server for AIS-140 GPS trackers.
"""
import asyncio
import os
import signal
import asyncpg
import structlog
import json
from typing import Dict, Tuple, List
from phase1_ingestion.ais140_parser import parse_packet, generate_ack
from phase1_ingestion.redis_geo import RedisGeo

logger = structlog.get_logger()

active_connections: Dict[str, Tuple[asyncio.StreamReader, asyncio.StreamWriter]] = {}

batch_buffer: List[tuple] = []
batch_lock = asyncio.Lock()
BATCH_SIZE_LIMIT = 50
BATCH_TIME_LIMIT = 5.0

db_pool: asyncpg.Pool = None
redis_client: RedisGeo = None

async def init_db_pool():
    global db_pool
    db_pool = await asyncpg.create_pool(
        host=os.environ.get("DB_HOST", "localhost"),
        port=os.environ.get("DB_PORT", 5432),
        database=os.environ.get("DB_NAME", "postgres"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", "postgres"),
        min_size=1,
        max_size=10
    )
    logger.info("Database pool initialized")

async def init_redis():
    global redis_client
    redis_client = RedisGeo(
        host=os.environ.get("REDIS_HOST", "localhost"),
        port=int(os.environ.get("REDIS_PORT", 6379))
    )
    logger.info("Redis client initialized")

async def flush_batch_buffer():
    global batch_buffer
    async with batch_lock:
        if not batch_buffer:
            return
        to_insert = batch_buffer
        batch_buffer = []

    if db_pool:
        try:
            async with db_pool.acquire() as conn:
                query = """
                INSERT INTO location_logs 
                (vehicle_id, imei, geom, lat, lon, speed_kmh, heading, altitude_m, satellites, ignition, emergency, battery_volts, packet_type, recorded_at)
                VALUES ($1, $2, ST_SetSRID(ST_MakePoint($5, $4), 4326), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                """
                await conn.executemany(query, to_insert)
            logger.info("Batch insert successful", count=len(to_insert))
        except Exception as e:
            logger.error("Batch insert failed", error=str(e))

async def batch_flusher():
    while True:
        await asyncio.sleep(BATCH_TIME_LIMIT)
        await flush_batch_buffer()

async def resolve_vehicle_id(imei: str) -> str:
    if not db_pool:
        return None
    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("SELECT id FROM vehicles WHERE imei = $1", imei)
            if row:
                return str(row['id'])
    except Exception as e:
        logger.error("Error resolving vehicle id", error=str(e), imei=imei)
    return None

async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    addr = writer.get_extra_info('peername')
    logger.info("Client connected", addr=addr)
    
    current_imei = None
    buffer = b""
    
    try:
        while True:
            data = await reader.read(4096)
            if not data:
                logger.info("Client disconnected", addr=addr)
                break
                
            buffer += data
            
            while b"\r\n" in buffer:
                line, buffer = buffer.split(b"\r\n", 1)
                packet_str = line.decode('utf-8', errors='ignore')
                
                packet = parse_packet(packet_str)
                if not packet:
                    continue
                    
                if not current_imei:
                    current_imei = packet.imei
                    active_connections[current_imei] = (reader, writer)
                
                if packet.packet_type == 'LGN':
                    logger.info("Device Login", imei=packet.imei)
                    ack = generate_ack('LGN', packet.imei)
                    writer.write(ack.encode('utf-8'))
                    await writer.drain()
                
                elif packet.packet_type == 'HP':
                    logger.info("Device Heartbeat", imei=packet.imei)
                    
                elif packet.packet_type in ['PVT', 'EA', 'IN', 'IF', 'NR']:
                    vehicle_id = await resolve_vehicle_id(packet.imei)
                    
                    if vehicle_id:
                        await redis_client.update_vehicle_position(
                            vehicle_id=vehicle_id,
                            lat=packet.lat,
                            lon=packet.lon,
                            speed=packet.speed_kmh,
                            heading=packet.heading,
                            ignition=packet.ignition,
                            timestamp=packet.timestamp.isoformat()
                        )
                        
                        async with batch_lock:
                            batch_buffer.append((
                                vehicle_id,
                                packet.imei,
                                None, 
                                packet.lat,
                                packet.lon,
                                packet.speed_kmh,
                                packet.heading,
                                packet.altitude,
                                packet.satellites,
                                packet.ignition,
                                packet.emergency,
                                packet.battery_volts,
                                packet.packet_type,
                                packet.timestamp
                            ))
                            
                            if len(batch_buffer) >= BATCH_SIZE_LIMIT:
                                asyncio.create_task(flush_batch_buffer())
                        
                    if packet.packet_type == 'EA':
                        logger.warning("Emergency Alert", imei=packet.imei, lat=packet.lat, lon=packet.lon)
                        if vehicle_id:
                            alert_payload = {
                                "type": "emergency",
                                "vehicle_id": vehicle_id,
                                "imei": packet.imei,
                                "lat": packet.lat,
                                "lon": packet.lon,
                                "timestamp": packet.timestamp.isoformat()
                            }
                            await redis_client.redis.publish("sjy:alerts", json.dumps(alert_payload))
                        
                        ack = generate_ack(packet.packet_type, packet.imei)
                        writer.write(ack.encode('utf-8'))
                        await writer.drain()

    except Exception as e:
        logger.error("Client error", error=str(e), addr=addr)
    finally:
        if current_imei in active_connections:
            del active_connections[current_imei]
        writer.close()
        await writer.wait_closed()

async def serve():
    host = os.environ.get("TCP_HOST", "0.0.0.0")
    port = int(os.environ.get("TCP_PORT", 9000))
    
    server = await asyncio.start_server(handle_client, host, port)
    logger.info(f"TCP server running on {host}:{port}")
    
    async with server:
        await server.serve_forever()

async def shutdown(loop, signal=None):
    if signal:
        logger.info(f"Received exit signal {signal.name}...")
    
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    [task.cancel() for task in tasks]
    
    logger.info(f"Cancelling {len(tasks)} outstanding tasks")
    await asyncio.gather(*tasks, return_exceptions=True)
    
    await flush_batch_buffer()
    
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()
        
    loop.stop()
    
def main():
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer()
        ]
    )
    
    loop = asyncio.get_event_loop()
    
    signals = (signal.SIGHUP, signal.SIGTERM, signal.SIGINT)
    for s in signals:
        loop.add_signal_handler(
            s, lambda s=s: asyncio.create_task(shutdown(loop, signal=s))
        )
        
    try:
        loop.run_until_complete(init_db_pool())
        loop.run_until_complete(init_redis())
        
        loop.create_task(batch_flusher())
        loop.create_task(serve())
        
        loop.run_forever()
    except Exception as e:
        logger.error("Main loop error", error=str(e))
    finally:
        loop.close()
        logger.info("Shutdown complete.")

if __name__ == "__main__":
    main()

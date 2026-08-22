"""
Redis geospatial wrapper for SJY Mobility.
"""
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class RedisGeo:
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0, password: str = None):
        self.pool = redis.ConnectionPool(
            host=host, 
            port=port, 
            db=db, 
            password=password,
            decode_responses=True
        )
        self.redis = redis.Redis(connection_pool=self.pool)

    async def update_vehicle_position(self, vehicle_id: str, lat: float, lon: float, 
                                      speed: float, heading: float, ignition: bool, 
                                      timestamp: str) -> None:
        """Updates vehicle position in GEO set, HSET metadata, and PUBLISHes update."""
        try:
            # Update GEO set
            await self.redis.geoadd(
                'sjy:vehicles:live',
                (lon, lat, vehicle_id)
            )
            
            # Update metadata
            meta = {
                'lat': float(lat),
                'lon': float(lon),
                'speed': float(speed),
                'heading': float(heading),
                'ignition': 1 if ignition else 0,
                'timestamp': str(timestamp)
            }
            await self.redis.hset(f'sjy:vehicle:{vehicle_id}', mapping=meta)
            
            # Publish to channel
            payload = {'vehicle_id': vehicle_id, **meta}
            await self.redis.publish('sjy:vehicle:updates', json.dumps(payload))
            
        except Exception as e:
            logger.error(f"Redis update error for vehicle {vehicle_id}: {e}")

    async def get_vehicle_position(self, vehicle_id: str) -> Optional[Tuple[float, float]]:
        """Gets lat, lon for a vehicle."""
        try:
            res = await self.redis.geopos('sjy:vehicles:live', vehicle_id)
            if res and res[0]:
                return (res[0][1], res[0][0]) # returned as lat, lon
            return None
        except Exception as e:
            logger.error(f"Redis geopos error: {e}")
            return None

    async def get_nearby_vehicles(self, lat: float, lon: float, radius_km: float) -> List[str]:
        """Gets vehicles within radius_km."""
        try:
            res = await self.redis.geosearch(
                'sjy:vehicles:live',
                longitude=lon, latitude=lat,
                radius=radius_km,
                unit='km'
            )
            return res
        except Exception as e:
            logger.error(f"Redis geosearch error: {e}")
            return []

    async def get_all_vehicles(self) -> List[Dict[str, Any]]:
        """Gets all vehicles and their positions."""
        try:
            members = await self.redis.zrange('sjy:vehicles:live', 0, -1)
            if not members:
                return []
                
            positions = await self.redis.geopos('sjy:vehicles:live', *members)
            results = []
            for member, pos in zip(members, positions):
                if pos:
                    results.append({
                        'vehicle_id': member,
                        'lon': pos[0],
                        'lat': pos[1]
                    })
            return results
        except Exception as e:
            logger.error(f"Redis get_all_vehicles error: {e}")
            return []

    async def get_vehicle_metadata(self, vehicle_id: str) -> Dict[str, str]:
        """Gets HASH metadata for a vehicle."""
        try:
            return await self.redis.hgetall(f'sjy:vehicle:{vehicle_id}')
        except Exception as e:
            logger.error(f"Redis hgetall error: {e}")
            return {}

    async def close(self):
        """Closes Redis connection."""
        await self.redis.close()

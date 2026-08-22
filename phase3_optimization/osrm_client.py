import os
import math
from typing import List, Tuple, Dict, Any

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "http://localhost:5000")

def haversine(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def get_distance_matrix(coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
    if not coordinates:
        return {"distances": [], "durations": []}
        
    coords_str = ";".join([f"{lon},{lat}" for lon, lat in coordinates])
    url = f"{OSRM_BASE_URL}/table/v1/driving/{coords_str}?annotations=distance,duration"
    
    if HTTPX_AVAILABLE:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                if data.get("code") == "Ok":
                    return {
                        "distances": data["distances"],
                        "durations": data["durations"]
                    }
            except Exception as e:
                logger.warning(f"osrm_matrix_failed_using_haversine: {e}")
    
    # Fallback to haversine
    n = len(coordinates)
    distances = [[0.0] * n for _ in range(n)]
    durations = [[0.0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i != j:
                dist = haversine(coordinates[i][0], coordinates[i][1], coordinates[j][0], coordinates[j][1])
                distances[i][j] = dist * 1000 # meters
                durations[i][j] = (dist / 40.0) * 3600 # assume 40km/h avg speed, seconds
                
    return {"distances": distances, "durations": durations}

async def get_route(coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
    if len(coordinates) < 2:
        return {"geometry": None, "distance": 0, "duration": 0}
        
    coords_str = ";".join([f"{lon},{lat}" for lon, lat in coordinates])
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coords_str}?geometries=geojson&overview=full"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                return {
                    "geometry": route["geometry"],
                    "distance": route["distance"],
                    "duration": route["duration"]
                }
        except Exception as e:
            logger.error("osrm_route_failed", error=str(e))
            
    return {"geometry": None, "distance": 0, "duration": 0}

async def get_nearest(lat: float, lon: float) -> Tuple[float, float]:
    url = f"{OSRM_BASE_URL}/nearest/v1/driving/{lon},{lat}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            if data.get("code") == "Ok" and data.get("waypoints"):
                loc = data["waypoints"][0]["location"]
                return (loc[1], loc[0]) # return lat, lon
        except Exception as e:
            logger.error("osrm_nearest_failed", error=str(e))
    return (lat, lon)

async def get_trip_order(coordinates: List[Tuple[float, float]], fixed_start: bool = True) -> List[int]:
    if len(coordinates) < 3:
        return list(range(len(coordinates)))
        
    coords_str = ";".join([f"{lon},{lat}" for lon, lat in coordinates])
    url = f"{OSRM_BASE_URL}/trip/v1/driving/{coords_str}?source={'first' if fixed_start else 'any'}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            if data.get("code") == "Ok" and data.get("waypoints"):
                waypoints = data["waypoints"]
                sorted_waypoints = sorted(waypoints, key=lambda w: w["waypoint_index"])
                return [w["original_index"] for w in sorted_waypoints]
        except Exception as e:
            logger.error("osrm_trip_failed", error=str(e))
            
    return list(range(len(coordinates)))

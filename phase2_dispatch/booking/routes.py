from typing import Optional, Dict
try:
    from pydantic import BaseModel
except ImportError:
    from dataclasses import dataclass
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__

class RouteInfo(BaseModel):
    route_id: str
    from_city: str
    to_city: str
    fare_regular: int
    fare_pass_monthly: Optional[int] = None
    pass_normal_price: Optional[int] = None
    pass_trips: int = 50
    is_active: bool = True
    status: str = "active" # active | coming_soon

ROUTE_REGISTRY: Dict[str, RouteInfo] = {
    # Active Core Corridor (2 Ertigas, 6 Daily Trips)
    "IND-DHR": RouteInfo(route_id="IND-DHR", from_city="indore", to_city="dhar", fare_regular=250, fare_pass_monthly=9999, pass_normal_price=18000, pass_trips=50, is_active=True, status="active"),
    "DHR-IND": RouteInfo(route_id="DHR-IND", from_city="dhar", to_city="indore", fare_regular=250, fare_pass_monthly=9999, pass_normal_price=18000, pass_trips=50, is_active=True, status="active"),
    
    # Coming Soon Corridors
    "IND-UJJ": RouteInfo(route_id="IND-UJJ", from_city="indore", to_city="ujjain", fare_regular=180, fare_pass_monthly=7500, pass_normal_price=14000, pass_trips=50, is_active=False, status="coming_soon"),
    "UJJ-IND": RouteInfo(route_id="UJJ-IND", from_city="ujjain", to_city="indore", fare_regular=180, fare_pass_monthly=7500, pass_normal_price=14000, pass_trips=50, is_active=False, status="coming_soon"),
    "IND-DEW": RouteInfo(route_id="IND-DEW", from_city="indore", to_city="dewas", fare_regular=160, fare_pass_monthly=7000, pass_normal_price=12000, pass_trips=50, is_active=False, status="coming_soon"),
    "DEW-IND": RouteInfo(route_id="DEW-IND", from_city="dewas", to_city="indore", fare_regular=160, fare_pass_monthly=7000, pass_normal_price=12000, pass_trips=50, is_active=False, status="coming_soon"),
    "DHR-UJJ": RouteInfo(route_id="DHR-UJJ", from_city="dhar", to_city="ujjain", fare_regular=295, fare_pass_monthly=None, is_active=False, status="coming_soon"),
    "UJJ-DHR": RouteInfo(route_id="UJJ-DHR", from_city="ujjain", to_city="dhar", fare_regular=295, fare_pass_monthly=None, is_active=False, status="coming_soon"),
    "DHR-DEW": RouteInfo(route_id="DHR-DEW", from_city="dhar", to_city="dewas", fare_regular=255, fare_pass_monthly=None, is_active=False, status="coming_soon"),
    "DEW-DHR": RouteInfo(route_id="DEW-DHR", from_city="dewas", to_city="dhar", fare_regular=255, fare_pass_monthly=None, is_active=False, status="coming_soon"),
}

LANDMARK_TO_CITY = {
    'rajwada': 'indore',
    'sarafa': 'indore',
    'vijay nagar': 'indore',
    'palasia': 'indore',
    'mahakaleshwar': 'ujjain',
    'mahakal': 'ujjain',
    'ahilya fort': 'dhar',
    'dhar fort': 'dhar'
}

def get_route(route_id: str) -> Optional[RouteInfo]:
    return ROUTE_REGISTRY.get(route_id)

def find_route(from_city: str, to_city: str) -> Optional[RouteInfo]:
    for route in ROUTE_REGISTRY.values():
        if route.from_city.lower() == from_city.lower() and route.to_city.lower() == to_city.lower():
            return route
    return None

def get_fare(route_id: str, is_pass: bool = False) -> int:
    route = get_route(route_id)
    if not route:
        return 0
    # Monthly passes are handled differently, returning 0 per trip effectively
    if is_pass:
        return 0
    return route.fare_regular

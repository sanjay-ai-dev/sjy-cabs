import os
import instructor
from openai import AsyncOpenAI
import structlog
import re
from typing import Optional

from .models import BookingRequest, ParcelRequest, MalwaCity
from ..booking.routes import find_route

logger = structlog.get_logger()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3")

client = instructor.patch(
    AsyncOpenAI(
        base_url=OLLAMA_BASE_URL,
        api_key="ollama", # required but ignored
    ),
    mode=instructor.Mode.JSON
)

async def parse_booking(text: str) -> BookingRequest:
    """Parse booking request from WhatsApp text."""
    try:
        booking = await client.chat.completions.create(
            model=MODEL_NAME,
            response_model=BookingRequest,
            messages=[
                {
                    "role": "system",
                    "content": "Extract intercity shuttle booking details for SJY Mobility (Indore, Dhar, Ujjain, Dewas). Malwa geography: Rajwada=Indore, Mahakaleshwar=Ujjain, Ahilya Fort=Dhar. Handles Hinglish."
                },
                {"role": "user", "content": text},
            ],
            max_retries=3
        )
        
        # Post-process to resolve route ID if cities are present
        if not booking.route_id and booking.pickup_city and booking.drop_city:
            booking.route_id = resolve_route_id(booking.pickup_city.value, booking.drop_city.value)
            
        return booking
    except Exception as e:
        logger.error("llm_extraction_failed", error=str(e), text=text)
        return _fallback_parse_booking(text)

async def parse_parcel(text: str) -> ParcelRequest:
    """Parse parcel shipping request from WhatsApp text."""
    try:
        parcel = await client.chat.completions.create(
            model=MODEL_NAME,
            response_model=ParcelRequest,
            messages=[
                {
                    "role": "system",
                    "content": "Extract parcel shipping details."
                },
                {"role": "user", "content": text},
            ],
            max_retries=3
        )
        return parcel
    except Exception as e:
        logger.error("llm_parcel_extraction_failed", error=str(e), text=text)
        return ParcelRequest()

def resolve_route_id(from_city: str, to_city: str) -> Optional[str]:
    route = find_route(from_city, to_city)
    return route.route_id if route else None

def _fallback_parse_booking(text: str) -> BookingRequest:
    # Regex-based fallback
    cities = [c.value for c in MalwaCity]
    pickup = None
    drop = None
    
    text_lower = text.lower()
    for city in cities:
        if f"from {city}" in text_lower or text_lower.startswith(city):
            pickup = MalwaCity(city)
        if f"to {city}" in text_lower:
            drop = MalwaCity(city)
            
    # Try to find numbers for seats
    seats_match = re.search(r'(\d+)\s*seats?', text_lower)
    seats = int(seats_match.group(1)) if seats_match else 1
    
    route_id = resolve_route_id(pickup.value, drop.value) if pickup and drop else None
    
    return BookingRequest(
        route_id=route_id,
        seats_count=min(max(seats, 1), 6),
        pickup_city=pickup,
        drop_city=drop,
        is_booking_intent=True if pickup and drop else False
    )

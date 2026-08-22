import os
import hmac
import hashlib
import structlog
from fastapi import APIRouter, Request, Response, BackgroundTasks, HTTPException
from datetime import datetime, timezone

from ..parsing.llm_extractor import parse_booking
from ..booking.engine import allocate_seats, find_next_trip
from ..booking.routes import get_fare
from ..whatsapp_client import send_text, send_booking_confirmation

logger = structlog.get_logger()
router = APIRouter()

WHATSAPP_APP_SECRET = os.getenv("WHATSAPP_APP_SECRET", "")
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "sjy_verify_token")

def verify_signature(payload: bytes, signature: str) -> bool:
    if not WHATSAPP_APP_SECRET or not signature:
        return True # Skip if not configured
    
    expected_sig = hmac.new(
        WHATSAPP_APP_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected_sig}", signature)

@router.get("/webhook/whatsapp")
async def verify_webhook(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == VERIFY_TOKEN:
            logger.info("webhook_verified")
            return Response(content=challenge, media_type="text/plain")
        raise HTTPException(status_code=403, detail="Invalid verification token")
    raise HTTPException(status_code=400, detail="Missing parameters")

@router.post("/webhook/whatsapp")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    payload_bytes = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")
    
    if not verify_signature(payload_bytes, signature):
        logger.warning("invalid_signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    
    # Simple nested structure extraction for Meta Cloud API
    try:
        if "entry" in payload:
            for entry in payload["entry"]:
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    if "messages" in value:
                        for msg in value["messages"]:
                            process_message(msg, value.get("contacts", []), background_tasks, request.app.state.db_pool)
    except Exception as e:
        logger.error("webhook_processing_error", error=str(e))
        
    return {"status": "ok"}

def process_message(msg: dict, contacts: list, background_tasks: BackgroundTasks, db_pool):
    phone = msg.get("from")
    msg_type = msg.get("type")
    
    contact_name = "User"
    if contacts:
        contact_name = contacts[0].get("profile", {}).get("name", "User")
        
    if msg_type == "text":
        text = msg.get("text", {}).get("body", "")
        background_tasks.add_task(handle_booking_intent, text, phone, db_pool)
    elif msg_type == "location":
        # Handle shared location
        lat = msg.get("location", {}).get("latitude")
        lon = msg.get("location", {}).get("longitude")
        logger.info("location_received", phone=phone, lat=lat, lon=lon)
        # Background task for location update

async def handle_booking_intent(text: str, phone: str, db_pool):
    try:
        booking_req = await parse_booking(text)
        
        if not booking_req.is_booking_intent or not booking_req.route_id:
            await send_text(phone, "Sorry, I couldn't understand your booking details. Please specify 'From [City] to [City]'.")
            return
            
        # Find next trip
        trip_id = await find_next_trip(db_pool, booking_req.route_id, datetime.now(timezone.utc))
        if not trip_id:
            await send_text(phone, "Sorry, no scheduled trips found for this route.")
            return
            
        fare = get_fare(booking_req.route_id) * booking_req.seats_count
        
        # Allocate seats
        confirmation = await allocate_seats(
            pool=db_pool,
            trip_id=trip_id,
            passenger_phone=phone,
            seats_count=booking_req.seats_count,
            is_female=booking_req.is_female_priority,
            pickup_raw=booking_req.pickup_raw or booking_req.pickup_city.value if booking_req.pickup_city else "Unknown",
            drop_raw=booking_req.drop_raw or booking_req.drop_city.value if booking_req.drop_city else "Unknown",
            fare=fare
        )
        
        await send_booking_confirmation(phone, confirmation)
        
    except ValueError as e:
        await send_text(phone, f"Booking failed: {str(e)}")
    except Exception as e:
        logger.error("booking_intent_failed", error=str(e))
        await send_text(phone, "An error occurred while processing your booking. Please try again.")

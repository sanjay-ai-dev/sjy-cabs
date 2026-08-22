import os
import httpx
import structlog
from typing import Dict, Any

from .parsing.models import BookingConfirmation

logger = structlog.get_logger()

WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
API_URL = f"https://graph.facebook.com/v17.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

async def _send_request(payload: Dict[str, Any]):
    if not WHATSAPP_API_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        logger.warning("whatsapp_credentials_missing", payload=payload)
        return
        
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(API_URL, headers=headers, json=payload, timeout=10.0)
            response.raise_for_status()
            logger.info("whatsapp_message_sent", phone=payload.get("to"))
        except Exception as e:
            logger.error("whatsapp_message_failed", error=str(e), phone=payload.get("to"))

async def send_text(phone: str, message: str):
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message}
    }
    await _send_request(payload)

async def send_booking_confirmation(phone: str, confirmation: BookingConfirmation):
    message = f"✅ *Booking Confirmed!*\n\n" \
              f"🎟 *Code:* {confirmation.booking_code}\n" \
              f"📍 *Route:* {confirmation.route_label}\n" \
              f"💺 *Seats:* {confirmation.seats}\n" \
              f"💰 *Fare:* ₹{confirmation.fare}\n" \
              f"🕒 *Time:* {confirmation.departure_time}\n" \
              f"🚗 *Vehicle:* {confirmation.vehicle_reg}\n" \
              f"👤 *Driver:* {confirmation.driver_name} ({confirmation.driver_phone})\n\n" \
              f"📍 *Track Vehicle:* {confirmation.tracking_url}"
    await send_text(phone, message)

async def send_tracking_link(phone: str, tracking_url: str):
    message = f"📍 *Track your vehicle live here:*\n{tracking_url}"
    await send_text(phone, message)

async def send_location(phone: str, lat: float, lon: float, name: str, address: str):
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "location",
        "location": {
            "latitude": lat,
            "longitude": lon,
            "name": name,
            "address": address
        }
    }
    await _send_request(payload)

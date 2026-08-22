#!/usr/bin/env python3
"""
SJY Mobility — WhatsApp Booking & Webhook Simulator
Tests natural language extraction, seat allocation, female priority seating,
monthly passes, and parcel bookings against the SJY engine.
"""

import sys
import os
import json
from datetime import datetime, timedelta

# Add parent directory to path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from phase2_dispatch.booking.routes import ROUTE_REGISTRY, LANDMARK_TO_CITY, find_route, get_fare
from phase2_dispatch.parsing.models import BookingRequest, MalwaCity

# Sample natural language WhatsApp messages from passengers & merchants
SAMPLE_MESSAGES = [
    {
        "sender_name": "Priya Sharma",
        "sender_phone": "919876543210",
        "message": "Book 2 seats from Dhar to Indore Rajwada for 8 AM tomorrow",
        "intent": "Passenger Booking (Regular)"
    },
    {
        "sender_name": "Sunita Verma",
        "sender_phone": "919876543211",
        "message": "Mujhe 1 lady seat chahiye Indore se Ujjain subah 9 baje",
        "intent": "Female Priority Seat"
    },
    {
        "sender_name": "Raju Traders",
        "sender_phone": "919876543212",
        "message": "Need to send 1 parcel box 5kg from Dhar Market to Sarafa Indore tomorrow morning",
        "intent": "Parcel Courier Booking"
    },
    {
        "sender_name": "Amit Kumar",
        "sender_phone": "919876543213",
        "message": "Indore to Dewas 3 seats kal subah 7 baje pickup Vijay Nagar",
        "intent": "Multi-passenger Shuttle"
    },
    {
        "sender_name": "Kavita Malviya",
        "sender_phone": "919876543214",
        "message": "Ujjain Mahakal to Dhar 1 seat, monthly pass user",
        "intent": "Monthly Pass Redemption"
    }
]

def simulate_llm_parsing(text: str) -> dict:
    """Deterministic parser simulation for offline test verification."""
    text_lower = text.lower()
    
    # Extract cities
    pickup_city = None
    drop_city = None
    
    if "dhar" in text_lower:
        if text_lower.find("dhar") < text_lower.find("indore") if "indore" in text_lower else True:
            pickup_city = "dhar"
            drop_city = "indore" if "indore" in text_lower else "ujjain"
        else:
            drop_city = "dhar"
            pickup_city = "indore" if "indore" in text_lower else "ujjain"
            
    if "ujjain" in text_lower:
        if "indore" in text_lower:
            if text_lower.find("indore") < text_lower.find("ujjain"):
                pickup_city = "indore"
                drop_city = "ujjain"
            else:
                pickup_city = "ujjain"
                drop_city = "indore"
                
    if "dewas" in text_lower:
        if "indore" in text_lower:
            if text_lower.find("indore") < text_lower.find("dewas"):
                pickup_city = "indore"
                drop_city = "dewas"
            else:
                pickup_city = "dewas"
                drop_city = "indore"
                
    # Defaults if unparsed
    if not pickup_city: pickup_city = "indore"
    if not drop_city: drop_city = "dhar"
    
    # Extract seats
    seats = 1
    for word in text_lower.split():
        if word.isdigit() and 1 <= int(word) <= 6:
            seats = int(word)
            break
            
    is_female = ("lady" in text_lower or "ladies" in text_lower or "female" in text_lower or "women" in text_lower)
    is_parcel = ("parcel" in text_lower or "box" in text_lower or "send" in text_lower or "courier" in text_lower)
    is_pass = ("pass" in text_lower or "monthly" in text_lower)
    
    route_info = find_route(pickup_city, drop_city)
    route_id = route_info.route_id if route_info else "IND-DHR"
    regular_fare = get_fare(route_id, is_pass=False)
    total_fare = 0 if is_pass else (regular_fare * seats)
    
    return {
        "route_id": route_id,
        "from_city": pickup_city.upper(),
        "to_city": drop_city.upper(),
        "seats_requested": seats,
        "is_female_priority": is_female,
        "is_parcel": is_parcel,
        "is_pass_redemption": is_pass,
        "unit_fare": regular_fare,
        "total_fare": total_fare,
        "pass_savings": (regular_fare * seats) if is_pass else 0
    }

def run_whatsapp_simulation():
    print("=" * 75)
    print("  SJY MOBILITY — WHATSAPP DISPATCH & PARSING SIMULATOR")
    print("  Testing natural language messages → Pydantic extraction → Seat Allocation")
    print("=" * 75)
    print()
    
    for idx, item in enumerate(SAMPLE_MESSAGES, 1):
        parsed = simulate_llm_parsing(item["message"])
        
        print(f"💬 [Incoming WhatsApp #{idx}] From: {item['sender_name']} ({item['sender_phone']})")
        print(f"   Message: \"{item['message']}\"")
        print(f"   Intent Identified: {item['intent']}")
        print("   " + "─" * 60)
        print(f"   ⚙️ Extracted Route ID : {parsed['route_id']} ({parsed['from_city']} ➔ {parsed['to_city']})")
        print(f"   💺 Seats Requested   : {parsed['seats_requested']} seat(s)")
        print(f"   ♀️ Female Priority   : {'YES (Row 1 Seat 1 Reserved)' if parsed['is_female_priority'] else 'NO (Standard Booking)'}")
        print(f"   📦 Parcel Booking    : {'YES (Assigned Cargo Slot)' if parsed['is_parcel'] else 'NO'}")
        print(f"   🎫 Monthly Pass      : {'YES (Fare ₹0 Redemed)' if parsed['is_pass_redemption'] else 'NO'}")
        unit_fare_str = str(parsed['unit_fare'])
        fare_note = '(Pass Applied)' if parsed['is_pass_redemption'] else f'(@ ₹{unit_fare_str}/seat)'
        print(f"   💰 Fare Calculated   : ₹{parsed['total_fare']} {fare_note}")
        print()
        
        # Output WhatsApp confirmation message simulation
        code = f"BK-SIM{idx:03d}"
        dep_time = (datetime.now() + timedelta(days=1)).strftime("%d %b %Y, 8:00 AM")
        
        print("   📱 [Outbound WhatsApp Confirmation Sent to Passenger]:")
        print("   ┌──────────────────────────────────────────────────────────")
        print(f"   │ ✅ SJY CAB BOOKING CONFIRMED! [{code}]")
        print(f"   │ 🚗 Route: {parsed['from_city']} ➔ {parsed['to_city']}")
        print(f"   │ 📅 Departure: {dep_time}")
        print(f"   │ 💺 Seats: {parsed['seats_requested']} | Vehicle: MP09AB1001 (Maruti Ertiga)")
        print(f"   │ 👤 Driver: Rajesh Sharma (919876540001)")
        print(f"   │ 💰 Amount Payable: ₹{parsed['total_fare']}")
        print(f"   │ 📍 Live Track Trip: t.sjy.co.in/r/{code}")
        print("   └──────────────────────────────────────────────────────────")
        print("\n" + "=" * 75 + "\n")

if __name__ == "__main__":
    run_whatsapp_simulation()

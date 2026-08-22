#!/usr/bin/env python3
"""
SJY Mobility — AIS-140 GPS Telemetry Simulator
Simulates 15 commercial Ertigas streaming real-time AIS-140 $PVT packets
along the highway corridors of Malwa (Indore, Dhar, Ujjain, Dewas).
"""

import asyncio
import random
import sys
import time
from datetime import datetime, timezone
from typing import List, Tuple

# Route waypoint polylines (Lon, Lat) across Malwa region
ROUTES = {
    "DHR-IND": [ # Dhar to Indore via Pithampur highway
        (75.3026, 22.5971), (75.4500, 22.6200), (75.6000, 22.6500),
        (75.7500, 22.6800), (75.8360, 22.6900), (75.8577, 22.7196)
    ],
    "IND-UJJ": [ # Indore to Ujjain via Sanwer Road
        (75.8577, 22.7196), (75.8700, 22.8500), (75.8200, 22.9800),
        (75.8000, 23.0800), (75.7885, 23.1765)
    ],
    "IND-DEW": [ # Indore to Dewas via Bypass
        (75.8577, 22.7196), (75.9200, 22.7600), (75.9800, 22.8400),
        (76.0534, 22.9623)
    ],
    "UJJ-DEW": [ # Ujjain to Dewas
        (75.7885, 23.1765), (75.9000, 23.0800), (76.0534, 22.9623)
    ]
}

VEHICLES = [
    {"reg": f"MP09AB10{i:02d}", "imei": f"867322034567{i:03d}", "route": list(ROUTES.keys())[(i-1) % len(ROUTES)]}
    for i in range(1, 16)
]

def calculate_checksum(payload: str) -> str:
    """XOR checksum of characters between $ and *"""
    xor = 0
    for char in payload:
        xor ^= ord(char)
    return f"{xor:02X}"

def generate_pvt_packet(imei: str, reg: str, lon: float, lat: float, speed: float, heading: float, emergency: bool = False) -> str:
    """Generate valid AIS-140 $PVT ASCII telemetry frame."""
    now = datetime.now(timezone.utc)
    timestamp_str = now.strftime("%d%m%Y%H%M%S")
    packet_type = "EA" if emergency else "NR"
    
    # AIS-140 Format: $PVT,VendorID,Firmware,PacketType,MsgID,Fix,DateTime,Lat,LatDir,Lon,LonDir,Speed,Heading,Sats,Alt,PDOP,HDOP,GSM,Ign,Power,Panic,Batt*CS
    payload = f"PVT,ITR,1.0.4,{packet_type},1042,A,{timestamp_str},{abs(lat):.6f},N,{abs(lon):.6f},E,{speed:.1f},{heading:.1f},09,550.0,1.2,0.9,25,1,1,{'1' if emergency else '0'},4.1"
    checksum = calculate_checksum(payload)
    return f"${payload}*{checksum}\r\n"

def generate_login_packet(imei: str, reg: str, lon: float, lat: float) -> str:
    """Generate AIS-140 $LGN login frame."""
    payload = f"LGN,{reg},{imei},FIRMWAREV1.2.0,AIS140,{lat:.6f},{lon:.6f},4F"
    checksum = calculate_checksum(payload)
    return f"${payload}*{checksum}\r\n"

async def simulate_single_vehicle(host: str, port: int, vehicle: dict, delay: float = 3.0):
    """Simulate a single vehicle traveling along its route over TCP socket."""
    imei = vehicle["imei"]
    reg = vehicle["reg"]
    waypoints = ROUTES[vehicle["route"]]
    
    print(f"🚗 [Simulator] Starting Vehicle {reg} (IMEI: {imei}) on route {vehicle['route']}...")
    
    try:
        reader, writer = await asyncio.open_connection(host, port)
        
        # Send Login packet first
        start_lon, start_lat = waypoints[0]
        lgn_packet = generate_login_packet(imei, reg, start_lon, start_lat)
        writer.write(lgn_packet.encode("ascii"))
        await writer.drain()
        print(f"🔑 [{reg}] Sent Login: {lgn_packet.strip()}")
        await asyncio.sleep(1.0)
        
        # Stream telemetry along waypoints
        step = 0
        total_steps = len(waypoints) - 1
        
        while True:
            idx = step % len(waypoints)
            next_idx = (step + 1) % len(waypoints)
            lon1, lat1 = waypoints[idx]
            lon2, lat2 = waypoints[next_idx]
            
            # Interpolate 5 sub-steps between waypoints
            for sub in range(5):
                alpha = sub / 5.0
                curr_lon = lon1 + alpha * (lon2 - lon1) + random.uniform(-0.001, 0.001)
                curr_lat = lat1 + alpha * (lat2 - lat1) + random.uniform(-0.001, 0.001)
                speed = random.uniform(45.0, 75.0)
                heading = random.uniform(0.0, 360.0)
                emergency = (random.random() < 0.02) # 2% chance of emergency alert for testing
                
                packet = generate_pvt_packet(imei, reg, curr_lon, curr_lat, speed, heading, emergency)
                writer.write(packet.encode("ascii"))
                await writer.drain()
                
                status_icon = "🚨 EMERGENCY" if emergency else "📍 PVT"
                print(f"{status_icon} [{reg}] Lat: {curr_lat:.4f}, Lon: {curr_lon:.4f} | Speed: {speed:.1f} km/h | Checksum OK")
                await asyncio.sleep(delay)
                
            step += 1
            
    except ConnectionRefusedError:
        print(f"⚠️ [{reg}] Cannot connect to TCP server at {host}:{port}. Is tcp_server running?")
    except Exception as e:
        print(f"❌ [{reg}] Stream error: {e}")

async def run_simulation(host: str = "127.0.0.1", port: int = 9000, num_vehicles: int = 5):
    """Run concurrent vehicle telemetry simulation."""
    print("=" * 70)
    print("  SJY MOBILITY — AIS-140 GPS TELEMETRY SIMULATOR")
    print(f"  Streaming {num_vehicles} Ertigas to TCP socket server at {host}:{port}")
    print("=" * 70)
    
    tasks = [
        simulate_single_vehicle(host, port, VEHICLES[i], delay=random.uniform(2.0, 4.0))
        for i in range(min(num_vehicles, len(VEHICLES)))
    ]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 9000
    try:
        asyncio.run(run_simulation(host, port, num_vehicles=15))
    except KeyboardInterrupt:
        print("\n🛑 Telemetry simulation stopped by user.")

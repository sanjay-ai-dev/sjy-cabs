"""
AIS-140 protocol parser for SJY Mobility.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

@dataclass
class AIS140Packet:
    packet_type: str
    vendor_id: str
    imei: str
    vehicle_reg: str
    gps_fix: bool
    timestamp: datetime
    lat: float
    lat_dir: str
    lon: float
    lon_dir: str
    speed_kmh: float
    heading: float
    satellites: int
    altitude: float
    ignition: bool
    emergency: bool
    battery_volts: float
    raw_data: str

def calculate_checksum(packet: str) -> str:
    """Calculates XOR checksum of packet between $ and * (or raw string)."""
    try:
        start_idx = packet.index('$') + 1 if '$' in packet else 0
        end_idx = packet.rindex('*') if '*' in packet else len(packet)
        data = packet[start_idx:end_idx]
        checksum = 0
        for char in data:
            checksum ^= ord(char)
        return f"{checksum:02X}"
    except Exception:
        return "00"

def validate_checksum(packet: str) -> bool:
    """Validates if the packet checksum is correct."""
    try:
        calculated = calculate_checksum(packet)
        end_idx = packet.rindex('*')
        provided = packet[end_idx+1:end_idx+3]
        return calculated.upper() == provided.upper()
    except ValueError:
        return False

def generate_ack(packet_type: str, imei: str) -> str:
    """Generates an ACK response packet."""
    body = f"ACK,{packet_type},{imei}"
    checksum = calculate_checksum(f"${body}*")
    return f"${body}*{checksum}\r\n"

def parse_ddmm_to_dd(coord: str, dir_char: str) -> float:
    """Converts DDMM.MMMM to Decimal Degrees (DD)."""
    try:
        if '.' in coord:
            dot_idx = coord.index('.')
            deg_digits = dot_idx - 2
            if deg_digits > 0:
                degrees = float(coord[:deg_digits])
                minutes = float(coord[deg_digits:])
                val = degrees + (minutes / 60.0)
            else:
                val = float(coord)
        else:
            val = float(coord)
        if dir_char in ['S', 'W']:
            val = -val
        return val
    except ValueError:
        return 0.0

def parse_packet(raw_data: str) -> Optional[AIS140Packet]:
    """Parses a raw AIS140 packet."""
    if isinstance(raw_data, bytes):
        raw_data = raw_data.decode('ascii', errors='ignore')
    raw_data = raw_data.strip()
    if not raw_data.startswith('$') or not '*' in raw_data:
        return None
        
    if not validate_checksum(raw_data):
        logger.warning(f"Invalid checksum for packet: {raw_data}")
        return None

    try:
        body = raw_data[1:raw_data.rindex('*')]
        parts = body.split(',')
        if len(parts) < 3:
            return None

        header = parts[0]
        vendor_id = parts[1]
        imei = parts[2]
        
        packet_type = header
        vehicle_reg = ""
        gps_fix = False
        timestamp = datetime.now(timezone.utc)
        lat = 0.0
        lat_dir = 'N'
        lon = 0.0
        lon_dir = 'E'
        speed_kmh = 0.0
        heading = 0.0
        satellites = 0
        altitude = 0.0
        ignition = False
        emergency = False
        battery_volts = 0.0

        if header == 'PVT' and len(parts) >= 12:
            packet_type = parts[3] if len(parts) > 3 else 'NR'
            gps_fix = parts[5] == 'A' or parts[5] == '1' if len(parts) > 5 else False
            emergency = packet_type == 'EA'
            
            # Parse timestamp DDMMYYYYhhmmss (part 6) or separate date/time
            if len(parts) > 6:
                ts_str = parts[6]
                if len(ts_str) == 14:
                    try:
                        timestamp = datetime.strptime(ts_str, "%d%m%Y%H%M%S").replace(tzinfo=timezone.utc)
                    except ValueError:
                        pass
                elif len(parts) > 7 and len(ts_str) == 8 and len(parts[7]) == 6:
                    try:
                        timestamp = datetime.strptime(f"{ts_str}{parts[7]}", "%d%m%Y%H%M%S").replace(tzinfo=timezone.utc)
                    except ValueError:
                        pass

            # Coordinate & telemetry field parsing
            try:
                # Format where lat starts at part 7 (single timestamp)
                if len(parts) > 10 and (parts[8] in ['N', 'S'] or parts[10] in ['E', 'W']):
                    lat = parse_ddmm_to_dd(parts[7], parts[8])
                    lon = parse_ddmm_to_dd(parts[9], parts[10])
                    speed_kmh = float(parts[11]) if len(parts) > 11 and parts[11] else 0.0
                    heading = float(parts[12]) if len(parts) > 12 and parts[12] else 0.0
                    satellites = int(float(parts[13])) if len(parts) > 13 and parts[13] else 0
                    altitude = float(parts[14]) if len(parts) > 14 and parts[14] else 0.0
                    
                    if len(parts) > 18:
                        ignition = parts[18] == '1'
                    if len(parts) > 20:
                        emergency = parts[20] == '1' or packet_type == 'EA'
                    if len(parts) > 21:
                        battery_volts = float(parts[21]) if parts[21] else 0.0
                else:
                    # Format where lat starts at part 8 (split date/time)
                    lat = parse_ddmm_to_dd(parts[8], parts[9])
                    lon = parse_ddmm_to_dd(parts[10], parts[11])
                    speed_kmh = float(parts[12]) if len(parts) > 12 and parts[12] else 0.0
                    heading = float(parts[13]) if len(parts) > 13 and parts[13] else 0.0
                    satellites = int(float(parts[14])) if len(parts) > 14 and parts[14] else 0
                    altitude = float(parts[15]) if len(parts) > 15 and parts[15] else 0.0
                    ignition = parts[16] == '1' if len(parts) > 16 else False
                    emergency = parts[17] == '1' if len(parts) > 17 else False
            except Exception as e:
                logger.warning(f"Field extract warning: {e}")
                
        elif header == 'HP':
            pass
        elif header == 'LGN':
            pass
            
        return AIS140Packet(
            packet_type=packet_type,
            vendor_id=vendor_id,
            imei=imei,
            vehicle_reg=vehicle_reg,
            gps_fix=gps_fix,
            timestamp=timestamp,
            lat=lat,
            lat_dir=lat_dir,
            lon=lon,
            lon_dir=lon_dir,
            speed_kmh=speed_kmh,
            heading=heading,
            satellites=satellites,
            altitude=altitude,
            ignition=ignition,
            emergency=emergency,
            battery_volts=battery_volts,
            raw_data=raw_data
        )

    except Exception as e:
        logger.error(f"Error parsing packet: {e}")
        return None

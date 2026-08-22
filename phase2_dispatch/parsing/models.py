from enum import Enum
from typing import Optional, List

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(default=None, default_factory=None, **kwargs):
        if default_factory is not None:
            return default_factory()
        return default

class MalwaCity(str, Enum):
    indore = "indore"
    dhar = "dhar"
    ujjain = "ujjain"
    dewas = "dewas"

class BookingRequest(BaseModel):
    route_id: Optional[str] = None
    seats_count: int = Field(default=1, ge=1, le=6)
    pickup_raw: Optional[str] = None
    pickup_city: Optional[MalwaCity] = None
    drop_raw: Optional[str] = None
    drop_city: Optional[MalwaCity] = None
    departure_time: Optional[str] = None
    is_female_priority: bool = False
    has_parcel: bool = False
    parcel_description: Optional[str] = None
    parcel_weight_kg: Optional[float] = None
    is_booking_intent: bool = False
    missing_fields: List[str] = Field(default_factory=list)

class ParcelRequest(BaseModel):
    sender_name: Optional[str] = None
    sender_phone: Optional[str] = None
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    pickup_city: Optional[MalwaCity] = None
    pickup_address: Optional[str] = None
    drop_city: Optional[MalwaCity] = None
    drop_address: Optional[str] = None
    description: Optional[str] = None
    weight_kg: Optional[float] = None
    preferred_time: Optional[str] = None

class BookingConfirmation(BaseModel):
    booking_code: str
    trip_code: str
    route_label: str
    seats: int
    fare: int
    departure_time: str
    tracking_url: str
    vehicle_reg: str
    driver_name: str
    driver_phone: str

class WhatsAppMessage(BaseModel):
    sender_phone: str
    sender_name: Optional[str] = None
    message_text: Optional[str] = None
    message_type: str = "text"
    timestamp: str

-- ─────────────────────────────────────────────────────────────────────
-- SJY MOBILITY — SUPABASE POSTGRESQL + POSTGIS MIGRATION SCHEMA
-- Author: Antigravity AI Architecture Team
-- Features: PostGIS Geofencing, Realtime Telemetry, Row-Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. VEHICLES TABLE (15 Ertiga Fleet)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_no VARCHAR(20) UNIQUE NOT NULL,
    imei VARCHAR(30) UNIQUE NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'parked' CHECK (status IN ('in_transit', 'boarding', 'parked', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.routes (
    id VARCHAR(20) PRIMARY KEY,
    from_city VARCHAR(50) NOT NULL,
    to_city VARCHAR(50) NOT NULL,
    distance_km NUMERIC(5,2) NOT NULL,
    duration_mins INT NOT NULL,
    fare_regular INT NOT NULL,
    fare_pass_monthly INT,
    pass_normal_price INT,
    pass_trip_count INT DEFAULT 50,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'coming_soon')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRIPS TABLE (6 Daily Runs Across 2 Ertigas)
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_code VARCHAR(30) UNIQUE NOT NULL,
    route_id VARCHAR(20) REFERENCES public.routes(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    departure_time TIMESTAMPTZ NOT NULL,
    total_seats INT DEFAULT 6 CHECK (total_seats = 6),
    booked_seats INT DEFAULT 0 CHECK (booked_seats <= 6),
    priority_seat_open BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'in_transit', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS TABLE (Seat Reservations)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    seats_count INT NOT NULL DEFAULT 1 CHECK (seats_count BETWEEN 1 AND 6),
    pickup_raw TEXT NOT NULL,
    drop_raw TEXT NOT NULL,
    fare_amount INT NOT NULL,
    is_female_priority BOOLEAN DEFAULT FALSE,
    is_pass_trip BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PARCELS TABLE (B2B Parcel Courier - 6 Slots/Trip)
CREATE TABLE IF NOT EXISTS public.parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_code VARCHAR(20) UNIQUE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    pickup_city VARCHAR(50) NOT NULL,
    drop_city VARCHAR(50) NOT NULL,
    weight_kg NUMERIC(4,2) DEFAULT 1.0,
    fare_amount INT NOT NULL DEFAULT 200,
    status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'in_transit', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LOCATION LOGS (AIS-140 GPS Telemetry - Realtime Enabled)
CREATE TABLE IF NOT EXISTS public.location_logs (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    lat NUMERIC(9,6) NOT NULL,
    lon NUMERIC(9,6) NOT NULL,
    speed_kmh NUMERIC(5,2) DEFAULT 0,
    heading NUMERIC(5,2) DEFAULT 0,
    ignition BOOLEAN DEFAULT TRUE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Supabase Realtime CDC on location_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Trigger for Female Priority Seating (Opens Row 1 Seat 1 to all when 5 seats booked)
CREATE OR REPLACE FUNCTION check_priority_seat_opening()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booked_seats >= 5 AND OLD.booked_seats < 5 THEN
        NEW.priority_seat_open := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_priority_seat_open
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION check_priority_seat_opening();

-- RLS Security Policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public Read Trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Public Read Vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Public Read Bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public Create Bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Telemetry" ON public.location_logs FOR SELECT USING (true);

-- SEED DATA
INSERT INTO public.routes (id, from_city, to_city, distance_km, duration_mins, fare_regular, fare_pass_monthly, pass_normal_price, pass_trip_count, status) VALUES
    ('IND-DHR', 'Indore', 'Dhar', 62.0, 90, 250, 9999, 18000, 50, 'active'),
    ('DHR-IND', 'Dhar', 'Indore', 62.0, 90, 250, 9999, 18000, 50, 'active'),
    ('IND-UJJ', 'Indore', 'Ujjain', 55.0, 75, 180, 7500, 14000, 50, 'coming_soon'),
    ('UJJ-IND', 'Ujjain', 'Indore', 55.0, 75, 180, 7500, 14000, 50, 'coming_soon'),
    ('IND-DEW', 'Indore', 'Dewas', 35.0, 50, 160, 7000, 12000, 50, 'coming_soon'),
    ('DEW-IND', 'Dewas', 'Indore', 35.0, 50, 160, 7000, 12000, 50, 'coming_soon')
ON CONFLICT (id) DO UPDATE SET fare_regular = EXCLUDED.fare_regular, fare_pass_monthly = EXCLUDED.fare_pass_monthly;

INSERT INTO public.vehicles (registration_no, imei, driver_name, driver_phone, status) VALUES
    ('MP09 AB 1001', '867322034567001', 'Rajesh Sharma', '919876540001', 'in_transit'),
    ('MP09 AB 1002', '867322034567002', 'Amit Kumar', '919876540002', 'boarding')
ON CONFLICT (registration_no) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- SJY Mobility — PostgreSQL + PostGIS Schema
-- Anti-Gravity Architecture: Full Database Initialization
-- ═══════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─────────────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────

CREATE TYPE city_enum AS ENUM ('indore', 'dhar', 'ujjain', 'dewas');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'in_transit', 'completed', 'cancelled');
CREATE TYPE parcel_status AS ENUM ('booked', 'picked_up', 'in_transit', 'delivered', 'returned');
CREATE TYPE seat_zone AS ENUM ('front_priority', 'middle', 'rear');
CREATE TYPE stop_type AS ENUM ('pickup', 'drop', 'parcel_pickup', 'parcel_drop');
CREATE TYPE pass_status AS ENUM ('active', 'expired', 'suspended');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: vehicles (Fleet Registry — 15 Ertigas)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE vehicles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_no VARCHAR(15) NOT NULL UNIQUE,       -- e.g. MP09AB1234
    imei            VARCHAR(20) NOT NULL UNIQUE,        -- AIS-140 GPS tracker IMEI
    model           VARCHAR(50) NOT NULL DEFAULT 'Maruti Ertiga',
    capacity_seats  SMALLINT NOT NULL DEFAULT 6,        -- Bookable seats (1 priority + 3 mid + 2 rear)
    capacity_parcels SMALLINT NOT NULL DEFAULT 6,       -- 6 × 1×1 ft parcels
    status          vehicle_status NOT NULL DEFAULT 'active',
    driver_name     VARCHAR(100),
    driver_phone    VARCHAR(15),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_imei ON vehicles(imei);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: hubs (Geofenced City Hubs)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE hubs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city        city_enum NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,                  -- e.g. "Indore Rajwada Hub"
    center      GEOGRAPHY(POINT, 4326) NOT NULL,        -- Hub center point
    boundary    GEOGRAPHY(POLYGON, 4326) NOT NULL,      -- Geofence polygon
    radius_km   NUMERIC(5,2) NOT NULL DEFAULT 15.0,     -- Service radius
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hubs_boundary ON hubs USING GIST(boundary);
CREATE INDEX idx_hubs_center ON hubs USING GIST(center);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: routes (Fixed Intercity Routes with Pricing)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE routes (
    id              VARCHAR(10) PRIMARY KEY,             -- e.g. IND-DHR
    from_city       city_enum NOT NULL,
    to_city         city_enum NOT NULL,
    distance_km     NUMERIC(6,1) NOT NULL,
    duration_mins   INTEGER NOT NULL,                    -- Estimated duration in minutes
    fare_regular    INTEGER NOT NULL,                    -- Regular one-way fare in ₹
    fare_pass_monthly INTEGER,                           -- Monthly pass price (53 trips), NULL if not offered
    pass_trip_count INTEGER DEFAULT 53,                  -- Trips included in monthly pass
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_city, to_city)
);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: passengers (User Registry)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE passengers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(15) NOT NULL UNIQUE,         -- WhatsApp number (e.g. 919876543210)
    name            VARCHAR(100),
    gender          gender_enum,
    whatsapp_name   VARCHAR(100),                        -- Profile name from WhatsApp
    total_trips     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_passengers_phone ON passengers(phone);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: monthly_passes
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE monthly_passes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id    UUID NOT NULL REFERENCES passengers(id),
    route_id        VARCHAR(10) NOT NULL REFERENCES routes(id),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    total_trips     INTEGER NOT NULL DEFAULT 53,
    used_trips      INTEGER NOT NULL DEFAULT 0,
    amount_paid     INTEGER NOT NULL,                    -- ₹7000-₹8000
    status          pass_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pass_dates CHECK (end_date > start_date),
    CONSTRAINT chk_used_trips CHECK (used_trips <= total_trips)
);

CREATE INDEX idx_passes_passenger ON monthly_passes(passenger_id);
CREATE INDEX idx_passes_status ON monthly_passes(status, end_date);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: trips (Daily Vehicle Trips)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE trips (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_code       VARCHAR(20) NOT NULL UNIQUE,          -- e.g. SJY-0807-A3
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    route_id        VARCHAR(10) NOT NULL REFERENCES routes(id),
    departure_time  TIMESTAMPTZ NOT NULL,
    arrival_time    TIMESTAMPTZ,                          -- Actual arrival (filled on completion)
    status          trip_status NOT NULL DEFAULT 'scheduled',
    total_seats     SMALLINT NOT NULL DEFAULT 6,
    booked_seats    SMALLINT NOT NULL DEFAULT 0,
    -- Female priority seat state:
    -- priority_seat_open = FALSE means seat 1 is reserved for females only
    -- priority_seat_open = TRUE means seat 1 is open to all (other 5 seats booked)
    priority_seat_open BOOLEAN NOT NULL DEFAULT FALSE,
    total_parcel_slots SMALLINT NOT NULL DEFAULT 6,
    booked_parcel_slots SMALLINT NOT NULL DEFAULT 0,
    revenue_passengers INTEGER NOT NULL DEFAULT 0,        -- Total passenger revenue ₹
    revenue_parcels    INTEGER NOT NULL DEFAULT 0,         -- Total parcel revenue ₹
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_seats CHECK (booked_seats <= total_seats),
    CONSTRAINT chk_parcels CHECK (booked_parcel_slots <= total_parcel_slots)
);

CREATE INDEX idx_trips_vehicle ON trips(vehicle_id, departure_time DESC);
CREATE INDEX idx_trips_route_date ON trips(route_id, departure_time);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_code ON trips(trip_code);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: bookings (Passenger Seat Reservations)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code    VARCHAR(20) NOT NULL UNIQUE,          -- e.g. BK-A3F7K2
    trip_id         UUID NOT NULL REFERENCES trips(id),
    passenger_id    UUID NOT NULL REFERENCES passengers(id),
    seats_count     SMALLINT NOT NULL DEFAULT 1,
    seat_zone       seat_zone NOT NULL DEFAULT 'middle',  -- front_priority | middle | rear
    pickup_raw      VARCHAR(200),                         -- Raw text from WhatsApp
    pickup_lat      DOUBLE PRECISION,
    pickup_lon      DOUBLE PRECISION,
    pickup_geom     GEOGRAPHY(POINT, 4326),
    drop_raw        VARCHAR(200),
    drop_lat        DOUBLE PRECISION,
    drop_lon        DOUBLE PRECISION,
    drop_geom       GEOGRAPHY(POINT, 4326),
    fare_amount     INTEGER NOT NULL,                     -- Total fare in ₹
    is_pass_trip    BOOLEAN NOT NULL DEFAULT FALSE,       -- Used monthly pass
    pass_id         UUID REFERENCES monthly_passes(id),
    is_female_priority BOOLEAN NOT NULL DEFAULT FALSE,    -- Booked on priority seat
    status          booking_status NOT NULL DEFAULT 'confirmed',
    pickup_seq      SMALLINT,                             -- Optimized pickup sequence order
    drop_seq        SMALLINT,                             -- Optimized drop sequence order
    booked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_geom ON bookings USING GIST(pickup_geom);
CREATE INDEX idx_bookings_drop_geom ON bookings USING GIST(drop_geom);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: merchants (B2B Parcel Merchants)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE merchants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15) NOT NULL UNIQUE,
    business_name   VARCHAR(150),
    city            city_enum NOT NULL,
    address         TEXT,
    total_parcels   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchants_phone ON merchants(phone);
CREATE INDEX idx_merchants_city ON merchants(city);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: parcels (B2B Parcel Bookings)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE parcels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_code     VARCHAR(20) NOT NULL UNIQUE,          -- e.g. PK-X9M3
    trip_id         UUID NOT NULL REFERENCES trips(id),
    sender_id       UUID REFERENCES merchants(id),
    sender_phone    VARCHAR(15) NOT NULL,
    sender_name     VARCHAR(100),
    receiver_phone  VARCHAR(15) NOT NULL,
    receiver_name   VARCHAR(100),
    pickup_address  TEXT NOT NULL,
    pickup_city     city_enum NOT NULL,
    pickup_lat      DOUBLE PRECISION,
    pickup_lon      DOUBLE PRECISION,
    drop_address    TEXT NOT NULL,
    drop_city       city_enum NOT NULL,
    drop_lat        DOUBLE PRECISION,
    drop_lon        DOUBLE PRECISION,
    description     VARCHAR(200),                         -- e.g. "Documents", "Electronics box"
    weight_kg       NUMERIC(5,2) DEFAULT 1.0,
    fare_amount     INTEGER NOT NULL,                     -- Parcel shipping fee ₹
    status          parcel_status NOT NULL DEFAULT 'booked',
    pickup_seq      SMALLINT,                             -- Stop sequence
    drop_seq        SMALLINT,
    booked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parcels_trip ON parcels(trip_id);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_sender ON parcels(sender_phone);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: trip_manifest (Optimized Stop Sequence per Trip)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE trip_manifest (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id         UUID NOT NULL REFERENCES trips(id),
    stop_seq        SMALLINT NOT NULL,                    -- 1, 2, 3, ...
    stop_type       stop_type NOT NULL,
    entity_id       UUID NOT NULL,                        -- booking_id or parcel_id
    entity_name     VARCHAR(100),                         -- Passenger name or merchant name
    location_text   VARCHAR(200),
    lat             DOUBLE PRECISION NOT NULL,
    lon             DOUBLE PRECISION NOT NULL,
    eta             TIMESTAMPTZ,
    actual_time     TIMESTAMPTZ,                          -- When driver marked complete
    is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(trip_id, stop_seq)
);

CREATE INDEX idx_manifest_trip ON trip_manifest(trip_id, stop_seq);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: location_logs (GPS History — Time-Series)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE location_logs (
    id              BIGSERIAL PRIMARY KEY,
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    imei            VARCHAR(20) NOT NULL,
    geom            GEOGRAPHY(POINT, 4326) NOT NULL,
    lat             DOUBLE PRECISION NOT NULL,
    lon             DOUBLE PRECISION NOT NULL,
    speed_kmh       NUMERIC(6,1),
    heading         NUMERIC(5,1),
    altitude_m      NUMERIC(7,1),
    satellites      SMALLINT,
    ignition        BOOLEAN,
    emergency       BOOLEAN DEFAULT FALSE,
    gsm_signal      SMALLINT,
    main_power      BOOLEAN DEFAULT TRUE,
    battery_volts   NUMERIC(4,1),
    packet_type     VARCHAR(5),                           -- NR, EA, IN, IF, etc.
    recorded_at     TIMESTAMPTZ NOT NULL,                 -- GPS timestamp (UTC)
    ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- Server receive time
);

-- Partition-ready indexes for time-series queries
CREATE INDEX idx_loclog_vehicle_time ON location_logs(vehicle_id, recorded_at DESC);
CREATE INDEX idx_loclog_geom ON location_logs USING GIST(geom);
CREATE INDEX idx_loclog_time ON location_logs(recorded_at DESC);
CREATE INDEX idx_loclog_imei ON location_logs(imei);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: geofence_events (Hub Entry/Exit Events)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE geofence_events (
    id              BIGSERIAL PRIMARY KEY,
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    hub_id          UUID NOT NULL REFERENCES hubs(id),
    event_type      VARCHAR(10) NOT NULL,                 -- 'enter' or 'exit'
    lat             DOUBLE PRECISION NOT NULL,
    lon             DOUBLE PRECISION NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_geofence_vehicle ON geofence_events(vehicle_id, recorded_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- SEED DATA: Routes with User-Confirmed Pricing
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO routes (id, from_city, to_city, distance_km, duration_mins, fare_regular, fare_pass_monthly, pass_trip_count) VALUES
    ('IND-DHR', 'indore', 'dhar',   62.0, 90,  250, 9999, 50),
    ('DHR-IND', 'dhar',   'indore', 62.0, 90,  250, 9999, 50),
    ('IND-UJJ', 'indore', 'ujjain', 55.0, 90,  180, 7500, 50),
    ('UJJ-IND', 'ujjain', 'indore', 55.0, 90,  180, 7500, 50),
    ('IND-DEW', 'indore', 'dewas',  35.0, 60,  160, 7000, 50),
    ('DEW-IND', 'dewas',  'indore', 35.0, 60,  160, 7000, 50),
    ('DHR-UJJ', 'dhar',   'ujjain', 110.0, 150, 295, NULL, NULL),
    ('UJJ-DHR', 'ujjain', 'dhar',   110.0, 150, 295, NULL, NULL),
    ('DHR-DEW', 'dhar',   'dewas',  95.0, 120, 255, NULL, NULL),
    ('DEW-DHR', 'dewas',  'dhar',   95.0, 120, 255, NULL, NULL);

-- ─────────────────────────────────────────────────────────────────────
-- SEED DATA: Hub Geofences (Approximate Polygons)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO hubs (city, name, center, boundary, radius_km) VALUES
    ('indore', 'Indore Central Hub',
     ST_GeogFromText('POINT(75.8577 22.7196)'),
     ST_GeogFromText('POLYGON((75.78 22.65, 75.93 22.65, 75.93 22.79, 75.78 22.79, 75.78 22.65))'),
     15.0),
    ('dhar', 'Dhar City Hub',
     ST_GeogFromText('POINT(75.3026 22.5971)'),
     ST_GeogFromText('POLYGON((75.24 22.54, 75.37 22.54, 75.37 22.66, 75.24 22.66, 75.24 22.54))'),
     12.0),
    ('ujjain', 'Ujjain Mahakal Hub',
     ST_GeogFromText('POINT(75.7885 23.1765)'),
     ST_GeogFromText('POLYGON((75.72 23.12, 75.86 23.12, 75.86 23.24, 75.72 23.24, 75.72 23.12))'),
     12.0),
    ('dewas', 'Dewas Junction Hub',
     ST_GeogFromText('POINT(76.0534 22.9623)'),
     ST_GeogFromText('POLYGON((75.99 22.90, 76.12 22.90, 76.12 23.03, 75.99 23.03, 75.99 22.90))'),
     10.0);

-- ─────────────────────────────────────────────────────────────────────
-- SEED DATA: Sample Fleet (15 Vehicles)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO vehicles (registration_no, imei, driver_name, driver_phone) VALUES
    ('MP09AB1001', '867322034567001', 'Rajesh Sharma',   '919876540001'),
    ('MP09AB1002', '867322034567002', 'Vikram Singh',    '919876540002'),
    ('MP09AB1003', '867322034567003', 'Anil Patel',      '919876540003'),
    ('MP09AB1004', '867322034567004', 'Suresh Yadav',    '919876540004'),
    ('MP09AB1005', '867322034567005', 'Manoj Verma',     '919876540005'),
    ('MP09AB1006', '867322034567006', 'Deepak Joshi',    '919876540006'),
    ('MP09AB1007', '867322034567007', 'Rahul Dubey',     '919876540007'),
    ('MP09AB1008', '867322034567008', 'Amit Tiwari',     '919876540008'),
    ('MP09AB1009', '867322034567009', 'Sanjay Malviya',  '919876540009'),
    ('MP09AB1010', '867322034567010', 'Prakash Rathore',  '919876540010'),
    ('MP09AB1011', '867322034567011', 'Nitin Chouhan',   '919876540011'),
    ('MP09AB1012', '867322034567012', 'Gaurav Pandey',   '919876540012'),
    ('MP09AB1013', '867322034567013', 'Kailash Solanki', '919876540013'),
    ('MP09AB1014', '867322034567014', 'Ramesh Gurjar',   '919876540014'),
    ('MP09AB1015', '867322034567015', 'Vijay Parmar',    '919876540015');

-- ─────────────────────────────────────────────────────────────────────
-- FUNCTION: check_and_open_priority_seat()
-- Automatically opens the female-priority seat when other 5 seats fill
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_priority_seat()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booked_seats >= 5 AND NEW.priority_seat_open = FALSE THEN
        NEW.priority_seat_open := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_priority_seat
    BEFORE UPDATE ON trips
    FOR EACH ROW
    WHEN (NEW.booked_seats <> OLD.booked_seats)
    EXECUTE FUNCTION check_priority_seat();

-- ─────────────────────────────────────────────────────────────────────
-- FUNCTION: update_timestamp()
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_passengers_updated BEFORE UPDATE ON passengers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_trips_updated BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_parcels_updated BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION update_timestamp();

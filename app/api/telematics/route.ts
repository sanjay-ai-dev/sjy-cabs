import { NextRequest, NextResponse } from 'next/server';

// Unified Server Memory Store for Dual Telemetry (Driver Cab + Passenger Mobile GPS)
let unifiedTelemetryStore = {
  driverGps: {
    cabNumber: 'MP09 AB 1001',
    driverName: 'Rajesh Sharma',
    driverPhone: '+91 98260 12345',
    lat: 22.7196,
    lng: 75.8577,
    speed: 48,
    accuracy: 6,
    updatedAt: new Date().toISOString()
  },
  userGps: {
    passengerName: 'Anand Thakur',
    passengerPhone: '+91 98930 99887',
    lat: 22.74998,
    lng: 75.90476,
    accuracy: 12,
    updatedAt: new Date().toISOString()
  },
  nextPickup: {
    address: 'House 14, Anand Nagar, Dhar Bus Stand Road',
    landmark: 'Opp. Ahilya Fort Gate',
    passengerName: 'Anand Thakur',
    passengerPhone: '+91 98930 99887',
    etaMinutes: 6,
    distanceKm: 2.4
  },
  activeShuttle: {
    code: 'SHUTTLE-08AM',
    route: 'Dhar ➔ Indore',
    scheduledTime: '08:00 AM',
    seatsOccupied: 5
  },
  isPanic: false,
  lastUpdated: new Date().toISOString()
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, lat, lng, speed, accuracy, isPanic, passengerName, driverName, nextPickup } = body;

    // Update Driver Telemetry
    if (role === 'driver' && lat && lng) {
      unifiedTelemetryStore.driverGps = {
        ...unifiedTelemetryStore.driverGps,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speed: parseFloat(speed) || unifiedTelemetryStore.driverGps.speed,
        accuracy: parseFloat(accuracy) || 6,
        driverName: driverName || unifiedTelemetryStore.driverGps.driverName,
        updatedAt: new Date().toISOString()
      };
    }

    // Update Passenger Telemetry
    if (role === 'user' && lat && lng) {
      unifiedTelemetryStore.userGps = {
        ...unifiedTelemetryStore.userGps,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        accuracy: parseFloat(accuracy) || 12,
        passengerName: passengerName || unifiedTelemetryStore.userGps.passengerName,
        updatedAt: new Date().toISOString()
      };
    }

    if (nextPickup) {
      unifiedTelemetryStore.nextPickup = {
        ...unifiedTelemetryStore.nextPickup,
        ...nextPickup
      };
    }

    if (isPanic !== undefined) {
      unifiedTelemetryStore.isPanic = Boolean(isPanic);
    }

    unifiedTelemetryStore.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      status: 'success',
      message: 'Unified telematics updated',
      telemetry: unifiedTelemetryStore
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'DailyCab Unified Dual Telematics Broker',
    telemetry: unifiedTelemetryStore
  });
}

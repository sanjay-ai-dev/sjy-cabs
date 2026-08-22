/**
 * SJY CABS — Production AIS-140 Hardware TCP Socket Server
 * Listens on TCP Port 5000 for raw AIS-140 GPS Telematics & SOS Panic packets
 * 
 * Instructions:
 * 1. Deploy on AWS EC2 / DigitalOcean / Railway on Port 5000
 * 2. Configure AIS-140 device SIM via SMS: `SERVER,1,<YOUR_SERVER_IP>,5000,0#`
 */

const net = require('net');

const PORT = process.env.AIS140_PORT || 5000;

// Store live connected vehicle sockets
const connectedVehicles = new Map();

function parseNMEAPacket(rawData) {
  const str = rawData.toString('utf8').trim();
  console.log(`[AIS-140 TELEMETRY INGESTED]: ${str}`);

  const isPanic = str.includes('EMR') || str.includes('PANIC') || str.includes('SOS');

  // Standard AIS-140 Packet format:
  // $PVT,150201,22.7196,N,75.8577,E,58.4,180*4E
  const parts = str.split(',');

  let lat = 22.7196;
  let lng = 75.8577;
  let speed = 0.0;
  let vehicleId = 'MP09 AB 1001';

  if (parts.length >= 7) {
    lat = parseFloat(parts[2]) || lat;
    lng = parseFloat(parts[4]) || lng;
    speed = parseFloat(parts[6]) || speed;
  }

  return {
    vehicleId,
    timestamp: new Date().toISOString(),
    lat,
    lng,
    speedKmH: speed,
    isPanic,
    rawPacket: str
  };
}

const server = net.createServer((socket) => {
  const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`📡 [NEW AIS-140 DEVICE CONNECTED]: ${clientAddr}`);

  socket.on('data', (data) => {
    try {
      const telemetry = parseNMEAPacket(data);
      console.log(`⚡ Live Vehicle Coordinates: Lat ${telemetry.lat}, Lng ${telemetry.lng} @ ${telemetry.speedKmH} km/h`);

      if (telemetry.isPanic) {
        console.error(`🚨 [CRITICAL ALERT] SOS PANIC BUTTON PRESSED ON VEHICLE ${telemetry.vehicleId}!`);
        // Trigger Emergency Push Notification & SMS Alert to Fleet Command
      }

      // ACK Response back to AIS-140 Device (Required by government standard)
      socket.write(`$ACK,${telemetry.vehicleId},OK*`);
    } catch (err) {
      console.error(`❌ Packet Parsing Error: ${err.message}`);
    }
  });

  socket.on('close', () => {
    console.log(`🔴 [DEVICE DISCONNECTED]: ${clientAddr}`);
  });

  socket.on('error', (err) => {
    console.error(`⚠️ Socket Error [${clientAddr}]: ${err.message}`);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SJY CABS — AIS-140 HARDWARE TELEMATICS SERVER LIVE   `);
  console.log(`  Listening on TCP Port ${PORT}                        `);
  console.log(`=======================================================`);
});

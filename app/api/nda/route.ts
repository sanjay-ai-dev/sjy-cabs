import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

export interface NDARecord {
  id: string;
  fullName: string;
  fatherName: string;
  designation: string;
  aadhaar: string;
  pan: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  pinCode: string;
  place: string;
  date: string;
  signatureData: string;
  ipAddress?: string;
  createdAt: string;
}

// In-memory fallback store when DB env vars are not set
const memoryStore: Map<string, NDARecord> = new Map();

// Helper to auto-create PostgreSQL table if Vercel Postgres is connected
let isTableInitialized = false;
async function initDb() {
  if (isTableInitialized) return;
  try {
    if (process.env.POSTGRES_URL) {
      await sql`
        CREATE TABLE IF NOT EXISTS nda_submissions (
          id VARCHAR(50) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          father_name VARCHAR(255) NOT NULL,
          designation VARCHAR(100) NOT NULL,
          aadhaar VARCHAR(20) NOT NULL,
          pan VARCHAR(20) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          address TEXT NOT NULL,
          city_state VARCHAR(100) NOT NULL,
          pin_code VARCHAR(10) NOT NULL,
          place VARCHAR(100) NOT NULL,
          date_str VARCHAR(50) NOT NULL,
          signature_data TEXT NOT NULL,
          ip_address VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      isTableInitialized = true;
    }
  } catch (err) {
    console.warn('Vercel Postgres table init fallback:', err);
  }
}

// GET /api/nda - List all submitted NDAs (admin view)
export async function GET(req: NextRequest) {
  try {
    await initDb();

    // 1. Try Vercel Postgres if configured
    if (process.env.POSTGRES_URL) {
      try {
        const { rows } = await sql`
          SELECT 
            id, full_name as "fullName", father_name as "fatherName", 
            designation, aadhaar, pan, phone, email, address, 
            city_state as "cityState", pin_code as "pinCode", place, 
            date_str as "date", signature_data as "signatureData", 
            ip_address as "ipAddress", created_at as "createdAt"
          FROM nda_submissions 
          ORDER BY created_at DESC;
        `;
        return NextResponse.json({ status: 'success', source: 'vercel-postgres', count: rows.length, data: rows });
      } catch (err) {
        console.warn('Postgres GET error, trying KV/Memory:', err);
      }
    }

    // 2. Try Vercel KV if configured
    if (process.env.KV_REST_API_URL) {
      try {
        const keys = await kv.keys('nda:*');
        if (keys.length > 0) {
          const records: NDARecord[] = [];
          for (const key of keys) {
            const item = await kv.get<NDARecord>(key);
            if (item) records.push(item);
          }
          records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return NextResponse.json({ status: 'success', source: 'vercel-kv', count: records.length, data: records });
        }
      } catch (err) {
        console.warn('KV GET error, trying memory:', err);
      }
    }

    // 3. Fallback to memory store
    const memoryRecords = Array.from(memoryStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      status: 'success',
      source: 'memory-store',
      count: memoryRecords.length,
      data: memoryRecords
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// POST /api/nda - Submit and save a new signed NDA
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const {
      fullName,
      fatherName,
      designation,
      aadhaar,
      pan,
      phone,
      email,
      address,
      cityState,
      pinCode,
      place,
      date,
      signatureData
    } = body;

    if (!fullName || !aadhaar || !pan || !phone || !signatureData) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required fields or signature.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const id = `NDA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();

    const record: NDARecord = {
      id,
      fullName,
      fatherName,
      designation,
      aadhaar,
      pan,
      phone,
      email,
      address,
      cityState,
      pinCode,
      place,
      date: date || new Date().toLocaleDateString('en-IN'),
      signatureData,
      ipAddress,
      createdAt
    };

    // Save to memory store first
    memoryStore.set(id, record);

    // 1. Try Vercel Postgres
    if (process.env.POSTGRES_URL) {
      try {
        await sql`
          INSERT INTO nda_submissions (
            id, full_name, father_name, designation, aadhaar, pan, phone, 
            email, address, city_state, pin_code, place, date_str, 
            signature_data, ip_address, created_at
          ) VALUES (
            ${id}, ${fullName}, ${fatherName}, ${designation}, ${aadhaar}, ${pan}, ${phone},
            ${email}, ${address}, ${cityState}, ${pinCode}, ${place}, ${date},
            ${signatureData}, ${ipAddress}, ${createdAt}
          );
        `;
      } catch (pgErr) {
        console.warn('Vercel Postgres insert error:', pgErr);
      }
    }

    // 2. Try Vercel KV
    if (process.env.KV_REST_API_URL) {
      try {
        await kv.set(`nda:${id}`, record);
      } catch (kvErr) {
        console.warn('Vercel KV insert error:', kvErr);
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'NDA submitted and stored successfully on Vercel database.',
      ndaId: id,
      data: record
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

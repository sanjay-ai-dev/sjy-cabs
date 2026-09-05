import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';
import { NDARecord } from '../route';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ status: 'error', message: 'NDA ID is required' }, { status: 400 });
    }

    // 1. Try Vercel Postgres
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
          WHERE id = ${id}
          LIMIT 1;
        `;
        if (rows.length > 0) {
          return NextResponse.json({ status: 'success', source: 'vercel-postgres', data: rows[0] });
        }
      } catch (pgErr) {
        console.warn('Postgres GET by ID error:', pgErr);
      }
    }

    // 2. Try Vercel KV
    if (process.env.KV_REST_API_URL) {
      try {
        const item = await kv.get<NDARecord>(`nda:${id}`);
        if (item) {
          return NextResponse.json({ status: 'success', source: 'vercel-kv', data: item });
        }
      } catch (kvErr) {
        console.warn('KV GET by ID error:', kvErr);
      }
    }

    return NextResponse.json({ status: 'error', message: `NDA record '${id}' not found` }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

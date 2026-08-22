export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          registration_no: string
          imei: string
          driver_name: string | null
          driver_phone: string | null
          status: 'in_transit' | 'boarding' | 'parked' | 'maintenance'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
      }
      routes: {
        Row: {
          id: string
          from_city: string
          to_city: string
          distance_km: number
          duration_mins: number
          fare_regular: number
          fare_pass_monthly: number | null
          pass_normal_price: number | null
          pass_trip_count: number
          status: 'active' | 'coming_soon'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['routes']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['routes']['Insert']>
      }
      trips: {
        Row: {
          id: string
          trip_code: string
          route_id: string
          vehicle_id: string
          departure_time: string
          total_seats: number
          booked_seats: number
          priority_seat_open: boolean
          status: 'scheduled' | 'boarding' | 'in_transit' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          booking_code: string
          trip_id: string
          passenger_name: string
          passenger_phone: string
          seats_count: number
          pickup_raw: string
          drop_raw: string
          fare_amount: number
          is_female_priority: boolean
          is_pass_trip: boolean
          status: 'confirmed' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      parcels: {
        Row: {
          id: string
          parcel_code: string
          trip_id: string
          sender_name: string
          sender_phone: string
          receiver_name: string
          receiver_phone: string
          pickup_city: string
          drop_city: string
          weight_kg: number
          fare_amount: number
          status: 'booked' | 'in_transit' | 'delivered'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['parcels']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['parcels']['Insert']>
      }
      location_logs: {
        Row: {
          id: number
          vehicle_id: string
          lat: number
          lon: number
          speed_kmh: number
          heading: number
          ignition: boolean
          recorded_at: string
        }
        Insert: Omit<Database['public']['Tables']['location_logs']['Row'], 'id' | 'recorded_at'>
        Update: Partial<Database['public']['Tables']['location_logs']['Insert']>
      }
    }
  }
}

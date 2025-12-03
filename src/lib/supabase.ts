import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

// Types for our database
export interface Business {
  id: string
  owner_id: string
  name: string
  type: 'salon' | 'clinic' | 'gym' | 'spa' | 'restaurant' | 'service'
  phone: string
  address: string
  agent_persona: AgentPersona
  opening_hours: OpeningHours
  telegram_chat_id: string | null
  sip_address: string | null
  created_at: string
}

export interface AgentPersona {
  name: string
  language: 'hi' | 'en' | 'hi-en'
  tone: 'friendly' | 'professional' | 'casual' | 'energetic' | 'calm'
  greeting: string
  voice_id?: string
}

export interface OpeningHours {
  [day: string]: {
    open: string
    close: string
    isOpen: boolean
  }
}

export interface Service {
  id: string
  business_id: string
  name: string
  duration_minutes: number
  price: number
  description: string
  created_at: string
}

export interface Appointment {
  id: string
  business_id: string
  customer_name: string
  customer_phone: string
  service: string
  appointment_time: string
  duration_minutes: number
  status: 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
}

export interface CallLog {
  id: string
  business_id: string
  caller_phone: string
  caller_name: string | null
  call_sid: string
  duration_seconds: number
  transcript: TranscriptEntry[]
  appointment_id: string | null
  outcome: 'appointment_booked' | 'inquiry' | 'cancelled' | 'missed' | 'other'
  audio_url: string | null
  created_at: string
}

export interface TranscriptEntry {
  speaker: 'user' | 'agent'
  text: string
  timestamp: string
}

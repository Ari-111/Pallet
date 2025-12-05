-- Pallet Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('salon', 'clinic', 'gym', 'spa', 'restaurant', 'service')),
  phone VARCHAR(20),
  address TEXT,
  agent_persona JSONB DEFAULT '{"name": "Assistant", "language": "hi-en", "tone": "friendly", "greeting": "Namaste! How can I help you today?"}'::jsonb,
  opening_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
    "saturday": {"open": "10:00", "close": "16:00", "isOpen": true},
    "sunday": {"open": "10:00", "close": "14:00", "isOpen": false}
  }'::jsonb,
  telegram_chat_id VARCHAR(100),
  sip_address VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service VARCHAR(255) NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  caller_phone VARCHAR(20),
  caller_name VARCHAR(255),
  call_sid VARCHAR(100),
  duration_seconds INTEGER DEFAULT 0,
  transcript JSONB DEFAULT '[]'::jsonb,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  outcome VARCHAR(50) DEFAULT 'other' CHECK (outcome IN ('appointment_booked', 'inquiry', 'cancelled', 'missed', 'other')),
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_business_time ON appointments(business_id, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_business ON call_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);

-- Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policies for businesses
CREATE POLICY "Users can view their own businesses" ON businesses
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own businesses" ON businesses
  FOR DELETE USING (auth.uid() = owner_id);

-- Policies for services
CREATE POLICY "Users can view services for their businesses" ON services
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert services for their businesses" ON services
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update services for their businesses" ON services
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete services for their businesses" ON services
  FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Policies for appointments (allow public read for availability checks)
CREATE POLICY "Anyone can view appointments for availability" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert appointments for their businesses" ON appointments
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR true -- Allow API to insert
  );

CREATE POLICY "Users can update appointments for their businesses" ON appointments
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR true -- Allow API to update
  );

-- Policies for call_logs
CREATE POLICY "Users can view call logs for their businesses" ON call_logs
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Anyone can insert call logs" ON call_logs
  FOR INSERT WITH CHECK (true);

-- Function to check appointment availability
CREATE OR REPLACE FUNCTION check_availability(
  p_business_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  available_slot TIME,
  end_time TIME
) AS $$
DECLARE
  v_opening_hours JSONB;
  v_day_name TEXT;
  v_day_hours JSONB;
  v_open_time TIME;
  v_close_time TIME;
  v_slot TIME;
BEGIN
  -- Get business opening hours
  SELECT opening_hours INTO v_opening_hours
  FROM businesses WHERE id = p_business_id;
  
  -- Get day name (lowercase)
  v_day_name := LOWER(TO_CHAR(p_date, 'day'));
  v_day_name := TRIM(v_day_name);
  
  -- Get hours for that day
  v_day_hours := v_opening_hours -> v_day_name;
  
  -- Check if open
  IF (v_day_hours ->> 'isOpen')::boolean = false THEN
    RETURN;
  END IF;
  
  v_open_time := (v_day_hours ->> 'open')::TIME;
  v_close_time := (v_day_hours ->> 'close')::TIME;
  
  -- Generate 30-minute slots
  v_slot := v_open_time;
  WHILE v_slot + (p_duration_minutes || ' minutes')::INTERVAL <= v_close_time LOOP
    -- Check if slot is not booked
    IF NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE business_id = p_business_id
        AND DATE(appointment_time) = p_date
        AND status != 'cancelled'
        AND (
          (appointment_time::TIME, appointment_time::TIME + (duration_minutes || ' minutes')::INTERVAL)
          OVERLAPS
          (v_slot, v_slot + (p_duration_minutes || ' minutes')::INTERVAL)
        )
    ) THEN
      available_slot := v_slot;
      end_time := v_slot + (p_duration_minutes || ' minutes')::INTERVAL;
      RETURN NEXT;
    END IF;
    
    v_slot := v_slot + INTERVAL '30 minutes';
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to send Telegram notification (placeholder - actual implementation via API)
CREATE OR REPLACE FUNCTION notify_telegram()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by the Next.js webhook
  -- Just log that a new appointment was created
  RAISE NOTICE 'New appointment created: %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new appointments
DROP TRIGGER IF EXISTS on_new_appointment ON appointments;
CREATE TRIGGER on_new_appointment
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram();

-- Insert demo business for testing
INSERT INTO businesses (id, name, type, phone, address, agent_persona, sip_address)
VALUES (
  'demo-business-001'::uuid,
  'Raj Premium Salon',
  'salon',
  '+91 98765 43210',
  '123 MG Road, Bangalore',
  '{
    "name": "Priya",
    "language": "hi-en",
    "tone": "friendly",
    "greeting": "Namaste! Raj Salon me aapka swagat hai. Main Priya, aapki kya madad kar sakti hoon?"
  }'::jsonb,
  'rajsalon@pallet.ai'
) ON CONFLICT (id) DO NOTHING;

-- Insert demo services
INSERT INTO services (business_id, name, duration_minutes, price, description)
VALUES
  ('demo-business-001'::uuid, 'Haircut', 30, 300, 'Professional haircut with styling'),
  ('demo-business-001'::uuid, 'Beard Trim', 15, 150, 'Beard shaping and trimming'),
  ('demo-business-001'::uuid, 'Hair Color', 60, 800, 'Full hair coloring service'),
  ('demo-business-001'::uuid, 'Facial', 45, 500, 'Deep cleansing facial treatment'),
  ('demo-business-001'::uuid, 'Head Massage', 20, 200, 'Relaxing scalp massage'),
  ('demo-business-001'::uuid, 'Hair Spa', 60, 700, 'Premium hair treatment spa')
ON CONFLICT DO NOTHING;

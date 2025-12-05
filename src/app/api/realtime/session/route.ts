import { NextRequest, NextResponse } from 'next/server'
import { generateSystemPrompt, VOICE_AGENT_FUNCTIONS, type BusinessContext } from '@/lib/openai-realtime'

// Demo businesses for the voice agent
const DEMO_BUSINESSES: Record<string, BusinessContext> = {
  'barber': {
    id: 'demo-barber',
    name: "Raj's Premium Salon",
    type: 'salon',
    agentPersona: {
      name: 'Priya',
      language: 'hi-en',
      tone: 'friendly',
      greeting: 'Namaste! Raj Salon me aapka swagat hai. Main Priya hoon, aapki kya help kar sakti hoon?'
    },
    services: [
      { name: 'Haircut', duration: 30, price: 300, description: 'Professional haircut' },
      { name: 'Beard Trim', duration: 15, price: 150, description: 'Beard shaping' },
      { name: 'Hair Color', duration: 60, price: 800, description: 'Full coloring' },
      { name: 'Facial', duration: 45, price: 500, description: 'Deep cleansing facial' },
      { name: 'Head Massage', duration: 20, price: 200, description: 'Relaxing massage' }
    ],
    openingHours: {
      monday: { open: '09:00', close: '20:00', isOpen: true },
      tuesday: { open: '09:00', close: '20:00', isOpen: true },
      wednesday: { open: '09:00', close: '20:00', isOpen: true },
      thursday: { open: '09:00', close: '20:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '10:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '18:00', isOpen: true }
    }
  },
  'dentist': {
    id: 'demo-dentist',
    name: 'Smile Dental Clinic',
    type: 'clinic',
    agentPersona: {
      name: 'Dr. Sharma',
      language: 'en',
      tone: 'professional',
      greeting: 'Hello! Thank you for calling Smile Dental Clinic. I am Dr. Sharma. How may I help you today?'
    },
    services: [
      { name: 'Checkup', duration: 30, price: 500, description: 'Dental examination' },
      { name: 'Cleaning', duration: 45, price: 800, description: 'Professional cleaning' },
      { name: 'Filling', duration: 60, price: 1500, description: 'Cavity filling' },
      { name: 'Root Canal', duration: 90, price: 5000, description: 'Root canal treatment' },
      { name: 'Whitening', duration: 60, price: 3000, description: 'Teeth whitening' }
    ],
    openingHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: true },
      sunday: { open: '00:00', close: '00:00', isOpen: false }
    }
  },
  'gym': {
    id: 'demo-gym',
    name: 'FitZone Gym',
    type: 'gym',
    agentPersona: {
      name: 'Coach Rahul',
      language: 'hi-en',
      tone: 'energetic',
      greeting: 'Hey! FitZone Gym mein welcome! Main Coach Rahul. Ready ho fitness journey start karne ke liye?'
    },
    services: [
      { name: 'Personal Training', duration: 60, price: 1000, description: 'One-on-one training' },
      { name: 'Group Class', duration: 45, price: 300, description: 'Group fitness' },
      { name: 'Yoga', duration: 60, price: 400, description: 'Guided yoga' },
      { name: 'Assessment', duration: 30, price: 500, description: 'Body analysis' },
      { name: 'Diet Plan', duration: 45, price: 800, description: 'Nutrition planning' }
    ],
    openingHours: {
      monday: { open: '05:00', close: '22:00', isOpen: true },
      tuesday: { open: '05:00', close: '22:00', isOpen: true },
      wednesday: { open: '05:00', close: '22:00', isOpen: true },
      thursday: { open: '05:00', close: '22:00', isOpen: true },
      friday: { open: '05:00', close: '22:00', isOpen: true },
      saturday: { open: '06:00', close: '20:00', isOpen: true },
      sunday: { open: '07:00', close: '18:00', isOpen: true }
    }
  },
  'spa': {
    id: 'demo-spa',
    name: 'Serenity Wellness Spa',
    type: 'spa',
    agentPersona: {
      name: 'Maya',
      language: 'en',
      tone: 'calm',
      greeting: 'Welcome to Serenity Spa. I am Maya. How may I help you relax today?'
    },
    services: [
      { name: 'Swedish Massage', duration: 60, price: 2000, description: 'Full body relaxation' },
      { name: 'Deep Tissue', duration: 75, price: 2500, description: 'Intensive therapy' },
      { name: 'Aromatherapy', duration: 90, price: 3000, description: 'Essential oils' },
      { name: 'Hot Stone', duration: 75, price: 2800, description: 'Heated stone massage' },
      { name: 'Facial', duration: 60, price: 1500, description: 'Rejuvenating facial' }
    ],
    openingHours: {
      monday: { open: '10:00', close: '20:00', isOpen: true },
      tuesday: { open: '10:00', close: '20:00', isOpen: true },
      wednesday: { open: '10:00', close: '20:00', isOpen: true },
      thursday: { open: '10:00', close: '20:00', isOpen: true },
      friday: { open: '10:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '10:00', close: '18:00', isOpen: true }
    }
  },
  'electrician': {
    id: 'demo-electrician',
    name: 'Quick Fix Electricals',
    type: 'service',
    agentPersona: {
      name: 'Ramesh',
      language: 'hi-en',
      tone: 'helpful',
      greeting: 'Hello! Quick Fix Electricals mein aapka swagat hai. Bijli ki koi problem hai?'
    },
    services: [
      { name: 'Home Visit', duration: 60, price: 300, description: 'Inspection and repairs' },
      { name: 'Wiring', duration: 120, price: 800, description: 'Electrical wiring' },
      { name: 'Fan Installation', duration: 45, price: 400, description: 'Fan fitting' },
      { name: 'AC Service', duration: 90, price: 600, description: 'AC maintenance' },
      { name: 'Emergency', duration: 60, price: 500, description: 'Urgent repairs' }
    ],
    openingHours: {
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '08:00', close: '20:00', isOpen: true },
      saturday: { open: '09:00', close: '18:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: true }
    }
  }
}

// Select voice for persona - OpenAI Realtime voices
function selectVoice(persona: string, business: BusinessContext): string {
  const lang = business.agentPersona.language
  
  // OpenAI Realtime voices: alloy, ash, ballad, coral, echo, sage, shimmer, verse
  // Choose based on persona characteristics
  if (lang === 'hi' || lang === 'hi-en') {
    // Use warmer voices for Hindi/Hinglish
    return persona === 'gym' ? 'echo' : 'shimmer'
  }
  
  // English personas
  if (persona === 'dentist') return 'sage' // Professional
  if (persona === 'spa') return 'coral' // Calm, soothing
  if (persona === 'gym') return 'ash' // Energetic
  
  return 'shimmer' // Default warm female voice
}

export async function POST(request: NextRequest) {
  try {
    const { persona } = await request.json()
    
    const business = DEMO_BUSINESSES[persona || 'barber']
    if (!business) {
      return NextResponse.json({ error: 'Unknown persona' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Create ephemeral token for WebRTC session
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: selectVoice(persona, business)
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI session error:', error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    const sessionData = await response.json()
    
    // Generate system prompt
    const systemPrompt = generateSystemPrompt(business)

    // Return session token and configuration
    return NextResponse.json({
      client_secret: sessionData.client_secret,
      session_config: {
        modalities: ['text', 'audio'],
        instructions: systemPrompt,
        voice: selectVoice(persona, business),
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        },
        tools: VOICE_AGENT_FUNCTIONS.map(fn => ({
          type: 'function',
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters
        })),
        tool_choice: 'auto',
        temperature: 0.8,
        max_response_output_tokens: 200
      },
      business: {
        id: business.id,
        name: business.name,
        agentName: business.agentPersona.name,
        greeting: business.agentPersona.greeting
      }
    })

  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

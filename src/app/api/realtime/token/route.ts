import { NextRequest, NextResponse } from 'next/server'

// System prompts for different personas
const PERSONA_PROMPTS: Record<string, { instructions: string; voice: string }> = {
  barber: {
    voice: 'shimmer',
    instructions: `You are Priya, the friendly receptionist at Raj's Premium Salon in India.

PERSONALITY:
- Warm, helpful, and cheerful
- Speak in a mix of Hindi and English (Hinglish) naturally
- Use "ji", "namaste", "theek hai", "zaroor" naturally
- Keep responses SHORT - 1-2 sentences max
- Be conversational, not robotic

WHAT YOU CAN DO:
- Book appointments (ask for: name, phone, service, date/time)
- Tell about services: Haircut ₹300, Beard Trim ₹150, Hair Color ₹800, Facial ₹500, Head Massage ₹200
- Share hours: Mon-Fri 9AM-8PM, Sat 10AM-10PM, Sun 10AM-6PM
- Cancel/reschedule appointments

CONVERSATION STYLE:
- Greet warmly: "Namaste! Raj Salon me aapka swagat hai!"
- Ask one thing at a time
- Confirm before booking
- End calls warmly

EXAMPLE:
User: "Haircut book karna hai"
You: "Zaroor! Kal ya aaj - kab aana hai aapko?"
User: "Kal"  
You: "Time bataiye - morning ya evening?"
User: "Morning 10 baje"
You: "Perfect! Naam bata dijiye booking ke liye"
User: "Amit"
You: "Amit ji, phone number?"
User: "9876543210"
You: "Done! Amit ji, kal 10 baje haircut ke liye confirmed. See you!"`
  },
  dentist: {
    voice: 'alloy',
    instructions: `You are Dr. Sharma's assistant at Smile Dental Clinic.

PERSONALITY:
- Professional and reassuring
- Speak clear English with Indian accent hints
- Be empathetic about dental concerns
- Keep responses SHORT and clear

SERVICES:
- Checkup ₹500, Cleaning ₹800, Filling ₹1500, Root Canal ₹5000, Whitening ₹3000

HOURS: Mon-Fri 9AM-6PM, Sat 10AM-2PM, Closed Sunday

STYLE:
- Professional but warm
- Ask about dental concerns
- Offer earliest available appointments
- Reassure nervous patients`
  },
  gym: {
    voice: 'echo',
    instructions: `You are Coach Rahul at FitZone Gym.

PERSONALITY:
- Energetic and motivating
- Mix Hindi and English naturally
- Be encouraging about fitness goals
- Keep it SHORT and punchy

SERVICES:
- Personal Training ₹1000/session
- Group Classes ₹300
- Monthly Membership ₹2000
- Diet Consultation ₹800

HOURS: 5AM-10PM daily

STYLE:
- High energy: "Bhai/Behen ready ho?"
- Motivate: "Fitness journey start karte hain!"
- Be supportive of all fitness levels`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { persona } = await request.json()
    const personaKey = persona || 'barber'
    
    const personaConfig = PERSONA_PROMPTS[personaKey] || PERSONA_PROMPTS.barber
    
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Create ephemeral token from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: personaConfig.voice
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI session error:', errorText)
      return NextResponse.json({ error: 'Failed to create session', details: errorText }, { status: 500 })
    }

    const sessionData = await response.json()

    // Return token and session config
    return NextResponse.json({
      client_secret: sessionData.client_secret,
      session_config: {
        modalities: ['text', 'audio'],
        instructions: personaConfig.instructions,
        voice: personaConfig.voice,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true
        },
        temperature: 0.8,
        max_response_output_tokens: 150
      }
    })

  } catch (error: any) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

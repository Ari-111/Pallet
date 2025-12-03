import { NextRequest, NextResponse } from "next/server";

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
- End calls warmly`
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

HOURS: Mon-Fri 9AM-6PM, Sat 10AM-2PM, Closed Sunday`
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

HOURS: 5AM-10PM daily`
  }
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Get persona from request body (optional)
    let persona = "barber";
    try {
      const body = await req.json();
      persona = body.persona || "barber";
    } catch {
      // No body provided, use default
    }

    const personaConfig = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.barber;

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: personaConfig.voice
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI session error:", err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await response.json();
    
    // Return both the client_secret and session config
    return NextResponse.json({
      client_secret: data.client_secret,
      value: data.client_secret?.value || data.client_secret,
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
    });

  } catch (error: any) {
    console.error("Token generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate token" }, { status: 500 });
  }
}

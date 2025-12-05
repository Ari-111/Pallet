// OpenAI Realtime API Client for Voice Agents
import { v4 as uuidv4 } from 'uuid'

export interface RealtimeSession {
  id: string
  businessId: string
  transcript: TranscriptEntry[]
  isActive: boolean
}

export interface TranscriptEntry {
  speaker: 'user' | 'agent'
  text: string
  timestamp: string
}

export interface BusinessContext {
  id: string
  name: string
  type: string
  agentPersona: {
    name: string
    language: string
    tone: string
    greeting: string
  }
  services: Array<{
    name: string
    duration: number
    price: number
    description: string
  }>
  openingHours: Record<string, { open: string; close: string; isOpen: boolean }>
}

// Function definitions for OpenAI
export const VOICE_AGENT_FUNCTIONS = [
  {
    name: "check_availability",
    description: "Check available appointment slots for a specific date. Call this when customer asks about availability or wants to book.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The date to check availability for in YYYY-MM-DD format"
        },
        service: {
          type: "string",
          description: "Optional: The service name to check duration for"
        }
      },
      required: ["date"]
    }
  },
  {
    name: "book_appointment",
    description: "Book a new appointment after customer confirms all details. Only call after getting customer name, phone, service, and confirmed date/time.",
    parameters: {
      type: "object",
      properties: {
        customer_name: {
          type: "string",
          description: "Full name of the customer"
        },
        customer_phone: {
          type: "string",
          description: "Customer's phone number with country code"
        },
        service: {
          type: "string",
          description: "The service being booked (e.g., Haircut, Facial)"
        },
        date_time: {
          type: "string",
          description: "Appointment date and time in ISO 8601 format"
        },
        notes: {
          type: "string",
          description: "Optional notes or special requests"
        }
      },
      required: ["customer_name", "customer_phone", "service", "date_time"]
    }
  },
  {
    name: "cancel_appointment",
    description: "Cancel an existing appointment. Ask for phone number and appointment time to identify.",
    parameters: {
      type: "object",
      properties: {
        customer_phone: {
          type: "string",
          description: "Customer's phone number to look up appointment"
        },
        appointment_date_time: {
          type: "string",
          description: "The date and time of appointment to cancel"
        }
      },
      required: ["customer_phone"]
    }
  },
  {
    name: "get_business_info",
    description: "Get information about business hours, services, or location when customer asks.",
    parameters: {
      type: "object",
      properties: {
        info_type: {
          type: "string",
          enum: ["hours", "services", "location", "prices"],
          description: "What information the customer is asking about"
        }
      },
      required: ["info_type"]
    }
  }
]

// Generate system prompt for the voice agent
export function generateSystemPrompt(business: BusinessContext): string {
  const servicesText = business.services
    .map(s => `- ${s.name}: ₹${s.price} (${s.duration} minutes) - ${s.description}`)
    .join('\n')

  const hoursText = Object.entries(business.openingHours)
    .map(([day, hours]) => {
      if (!hours.isOpen) return `- ${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`
      return `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours.open} - ${hours.close}`
    })
    .join('\n')

  return `You are ${business.agentPersona.name}, the virtual receptionist for ${business.name}, a ${business.type} business.

YOUR PERSONALITY:
- Warm, helpful, and ${business.agentPersona.tone}
- Speak naturally in ${business.agentPersona.language === 'hi-en' ? 'Hindi and English mix (Hinglish)' : business.agentPersona.language === 'hi' ? 'Hindi' : 'English'}
- Use Indian cultural context (Namaste, Ji, etc.)
- Be patient and understanding
- Keep responses SHORT - under 25 words
- Ask ONE question at a time

YOUR GREETING:
"${business.agentPersona.greeting}"

YOUR RESPONSIBILITIES:
1. Greet caller warmly
2. Understand their need (booking, inquiry, reschedule, cancel)
3. For bookings:
   - Ask for preferred date/time
   - Use check_availability function to verify
   - If slot unavailable, suggest alternatives
   - Collect: name, phone number, service type
   - ALWAYS confirm all details before booking
   - Use book_appointment function to finalize
4. For inquiries:
   - Use get_business_info function
   - Describe services enthusiastically
   - Mention prices when asked
5. For cancellations:
   - Ask for phone number
   - Use cancel_appointment function

SERVICES WE OFFER:
${servicesText}

BUSINESS HOURS:
${hoursText}

CONVERSATION RULES:
- Never book outside business hours
- Always confirm customer phone number
- Repeat appointment details before confirming
- If unsure, politely ask to repeat
- Stay polite even if customer is rude
- End calls with a warm goodbye

EXAMPLE CONVERSATION FLOW:
User: "Haircut book karna hai"
You: "Zaroor! Kaunse din aana chahenge?"
User: "Kal"
You: "Kal available hai. Kya time prefer karenge?"
User: "Dopahar 3 baje"
You: "3 baje slot available hai. Aapka naam please?"
User: "Amit Kumar"
You: "Amit ji, phone number bata dijiye"
User: "98765 43210"
You: "Perfect! Amit ji, kal 3 baje haircut ke liye confirm karoon?"
User: "Haan"
You: "Done! Appointment confirmed. Kal milte hain! 🙏"`
}

// Create WebSocket connection to OpenAI Realtime API
export function createRealtimeConnection(
  apiKey: string,
  model: string = 'gpt-4o-realtime-preview-2024-12-17'
): WebSocket {
  const url = `wss://api.openai.com/v1/realtime?model=${model}`
  
  const ws = new WebSocket(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  } as any)

  return ws
}

// Session configuration for OpenAI Realtime
export function getSessionConfig(business: BusinessContext) {
  return {
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions: generateSystemPrompt(business),
      voice: 'alloy', // Options: alloy, echo, shimmer
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 700
      },
      tools: VOICE_AGENT_FUNCTIONS.map(fn => ({
        type: 'function',
        ...fn
      })),
      tool_choice: 'auto',
      temperature: 0.8,
      max_response_output_tokens: 150
    }
  }
}

// Parse and handle OpenAI Realtime events
export interface RealtimeEvent {
  type: string
  event_id?: string
  [key: string]: any
}

export function parseRealtimeEvent(data: string): RealtimeEvent | null {
  try {
    return JSON.parse(data)
  } catch {
    console.error('Failed to parse realtime event:', data)
    return null
  }
}

// Create a response for function calls
export function createFunctionResponse(callId: string, result: any) {
  return {
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify(result)
    }
  }
}

// Request AI to generate response after function call
export function createResponseRequest() {
  return {
    type: 'response.create'
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { 
  generateSystemPrompt, 
  VOICE_AGENT_FUNCTIONS,
  type BusinessContext 
} from '@/lib/openai-realtime'
import {
  checkAvailability,
  bookAppointment,
  cancelAppointment,
  getBusinessInfo
} from '@/lib/database'
import { format, addDays, parse } from 'date-fns'

// Demo businesses for testing
const DEMO_BUSINESSES: Record<string, BusinessContext> = {
  'barber': {
    id: 'demo-barber',
    name: "Raj's Premium Salon",
    type: 'salon',
    agentPersona: {
      name: 'Priya',
      language: 'hi-en',
      tone: 'friendly',
      greeting: 'Namaste! Raj Salon me aapka swagat hai. Main Priya, aapki kya madad kar sakti hoon?'
    },
    services: [
      { name: 'Haircut', duration: 30, price: 300, description: 'Professional haircut with styling' },
      { name: 'Beard Trim', duration: 15, price: 150, description: 'Beard shaping and trimming' },
      { name: 'Hair Color', duration: 60, price: 800, description: 'Full hair coloring' },
      { name: 'Facial', duration: 45, price: 500, description: 'Deep cleansing facial' },
      { name: 'Head Massage', duration: 20, price: 200, description: 'Relaxing scalp massage' }
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
      greeting: 'Hello! Thank you for calling Smile Dental Clinic. This is Dr. Sharma speaking. How may I assist you today?'
    },
    services: [
      { name: 'Dental Checkup', duration: 30, price: 500, description: 'Complete dental examination' },
      { name: 'Teeth Cleaning', duration: 45, price: 800, description: 'Professional cleaning and polishing' },
      { name: 'Cavity Filling', duration: 60, price: 1500, description: 'Tooth filling treatment' },
      { name: 'Root Canal', duration: 90, price: 5000, description: 'Root canal treatment' },
      { name: 'Teeth Whitening', duration: 60, price: 3000, description: 'Professional whitening' }
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
      greeting: 'Hey! FitZone Gym mein welcome! Main Coach Rahul. Fitness journey start karne ke liye ready ho?'
    },
    services: [
      { name: 'Personal Training', duration: 60, price: 1000, description: 'One-on-one training session' },
      { name: 'Group Class', duration: 45, price: 300, description: 'Group fitness class' },
      { name: 'Yoga Session', duration: 60, price: 400, description: 'Guided yoga session' },
      { name: 'Body Assessment', duration: 30, price: 500, description: 'Complete body composition analysis' },
      { name: 'Diet Consultation', duration: 45, price: 800, description: 'Nutrition planning session' }
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
      greeting: 'Welcome to Serenity Spa. I am Maya. Allow me to help you find the perfect relaxation experience.'
    },
    services: [
      { name: 'Swedish Massage', duration: 60, price: 2000, description: 'Full body relaxation massage' },
      { name: 'Deep Tissue Massage', duration: 75, price: 2500, description: 'Intensive muscle therapy' },
      { name: 'Aromatherapy', duration: 90, price: 3000, description: 'Essential oil therapy session' },
      { name: 'Hot Stone Therapy', duration: 75, price: 2800, description: 'Heated stone massage' },
      { name: 'Facial Treatment', duration: 60, price: 1500, description: 'Rejuvenating facial' }
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
      greeting: 'Hello! Quick Fix Electricals mein aapka swagat hai. Main Ramesh. Bijli ki koi bhi problem ho, hum hain na!'
    },
    services: [
      { name: 'Home Visit', duration: 60, price: 300, description: 'Basic inspection and minor repairs' },
      { name: 'Wiring Work', duration: 120, price: 800, description: 'Electrical wiring installation' },
      { name: 'Fan Installation', duration: 45, price: 400, description: 'Ceiling or wall fan fitting' },
      { name: 'AC Service', duration: 90, price: 600, description: 'Air conditioner maintenance' },
      { name: 'Emergency Repair', duration: 60, price: 500, description: 'Urgent electrical repairs' }
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

// In-memory storage for demo appointments (since Supabase might not be running)
const demoAppointments: Map<string, any[]> = new Map()

// Generate mock availability
function getMockAvailability(date: string, business: BusinessContext): string[] {
  const dayOfWeek = format(new Date(date), 'EEEE').toLowerCase()
  const hours = business.openingHours[dayOfWeek]
  
  if (!hours || !hours.isOpen) {
    return []
  }

  const slots: string[] = []
  const openHour = parseInt(hours.open.split(':')[0])
  const closeHour = parseInt(hours.close.split(':')[0])

  // Generate slots every 30 minutes
  for (let hour = openHour; hour < closeHour; hour++) {
    // Randomly make some slots unavailable to simulate bookings
    if (Math.random() > 0.3) {
      slots.push(`${hour}:00`)
    }
    if (Math.random() > 0.3) {
      slots.push(`${hour}:30`)
    }
  }

  return slots.map(time => {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${hour12}:${m} ${ampm}`
  })
}

// Chat with the AI using OpenAI Chat API (simpler than Realtime for demo)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, persona, conversationHistory = [] } = body

    const business = DEMO_BUSINESSES[persona || 'barber']
    if (!business) {
      return NextResponse.json({ error: 'Unknown persona' }, { status: 400 })
    }

    const systemPrompt = generateSystemPrompt(business)

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.speaker === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ]

    // Call OpenAI Chat API with function calling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        functions: VOICE_AGENT_FUNCTIONS,
        function_call: 'auto',
        temperature: 0.8,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const choice = data.choices[0]

    // Check if AI wants to call a function
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name
      const functionArgs = JSON.parse(choice.message.function_call.arguments)

      let functionResult: any

      // Execute the function
      switch (functionName) {
        case 'check_availability':
          // Parse date naturally
          let dateStr = functionArgs.date
          if (!dateStr || dateStr.toLowerCase().includes('tomorrow')) {
            dateStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')
          } else if (dateStr.toLowerCase().includes('today')) {
            dateStr = format(new Date(), 'yyyy-MM-dd')
          }
          
          const slots = getMockAvailability(dateStr, business)
          functionResult = {
            slots: slots.slice(0, 6),
            message: slots.length > 0 
              ? `Available slots for ${format(new Date(dateStr), 'EEEE, MMM d')}: ${slots.slice(0, 4).join(', ')}`
              : 'Sorry, no slots available for this date'
          }
          break

        case 'book_appointment':
          // Store in demo appointments
          const appointmentId = `apt_${Date.now()}`
          const appointments = demoAppointments.get(business.id) || []
          appointments.push({
            id: appointmentId,
            ...functionArgs,
            status: 'confirmed',
            createdAt: new Date().toISOString()
          })
          demoAppointments.set(business.id, appointments)

          functionResult = {
            success: true,
            appointmentId,
            message: `Appointment confirmed for ${functionArgs.customer_name}! ${functionArgs.service} booked for ${functionArgs.date_time}`
          }
          break

        case 'cancel_appointment':
          functionResult = {
            success: true,
            message: 'Appointment cancelled successfully. Hope to see you again soon!'
          }
          break

        case 'get_business_info':
          if (functionArgs.info_type === 'services') {
            functionResult = {
              info: `We offer: ${business.services.map(s => `${s.name} (₹${s.price})`).join(', ')}`
            }
          } else if (functionArgs.info_type === 'prices') {
            functionResult = {
              info: business.services.map(s => `${s.name}: ₹${s.price}`).join(', ')
            }
          } else if (functionArgs.info_type === 'hours') {
            const todayHours = business.openingHours[format(new Date(), 'EEEE').toLowerCase()]
            functionResult = {
              info: todayHours?.isOpen 
                ? `We're open today from ${todayHours.open} to ${todayHours.close}`
                : "We're closed today"
            }
          } else {
            functionResult = { info: 'Information not available' }
          }
          break

        default:
          functionResult = { error: 'Unknown function' }
      }

      // Send function result back to get final response
      const followUpMessages = [
        ...messages,
        choice.message,
        {
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult)
        }
      ]

      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: followUpMessages,
          temperature: 0.8,
          max_tokens: 150
        })
      })

      const followUpData = await followUpResponse.json()
      const finalResponse = followUpData.choices[0].message.content

      return NextResponse.json({
        response: finalResponse,
        functionCalled: functionName,
        functionResult
      })
    }

    // No function call, return direct response
    return NextResponse.json({
      response: choice.message.content
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const persona = searchParams.get('persona')
  
  if (persona && DEMO_BUSINESSES[persona]) {
    return NextResponse.json({
      business: DEMO_BUSINESSES[persona],
      greeting: DEMO_BUSINESSES[persona].agentPersona.greeting
    })
  }

  return NextResponse.json({
    personas: Object.entries(DEMO_BUSINESSES).map(([key, value]) => ({
      id: key,
      name: value.name,
      type: value.type,
      agentName: value.agentPersona.name,
      greeting: value.agentPersona.greeting
    }))
  })
}

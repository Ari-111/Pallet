import { NextRequest, NextResponse } from 'next/server'
import { generateSystemPrompt, VOICE_AGENT_FUNCTIONS, type BusinessContext } from '@/lib/openai-realtime'
import { format, addDays } from 'date-fns'

// Demo businesses configuration
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
      greeting: 'Hello! Thank you for calling Smile Dental Clinic. I am Dr. Sharma. How may I help you today?'
    },
    services: [
      { name: 'Dental Checkup', duration: 30, price: 500, description: 'Complete dental examination' },
      { name: 'Teeth Cleaning', duration: 45, price: 800, description: 'Professional cleaning' },
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
      greeting: 'Hey! FitZone Gym mein welcome! Main Coach Rahul. Ready ho fitness journey start karne ke liye?'
    },
    services: [
      { name: 'Personal Training', duration: 60, price: 1000, description: 'One-on-one training' },
      { name: 'Group Class', duration: 45, price: 300, description: 'Group fitness class' },
      { name: 'Yoga Session', duration: 60, price: 400, description: 'Guided yoga' },
      { name: 'Body Assessment', duration: 30, price: 500, description: 'Body composition analysis' },
      { name: 'Diet Consultation', duration: 45, price: 800, description: 'Nutrition planning' }
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
      { name: 'Deep Tissue Massage', duration: 75, price: 2500, description: 'Intensive therapy' },
      { name: 'Aromatherapy', duration: 90, price: 3000, description: 'Essential oils therapy' },
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
      greeting: 'Hello! Quick Fix Electricals mein aapka swagat hai. Bijli ki koi problem hai? Batao, hum solve karenge!'
    },
    services: [
      { name: 'Home Visit', duration: 60, price: 300, description: 'Inspection and minor repairs' },
      { name: 'Wiring Work', duration: 120, price: 800, description: 'Electrical wiring' },
      { name: 'Fan Installation', duration: 45, price: 400, description: 'Fan fitting' },
      { name: 'AC Service', duration: 90, price: 600, description: 'AC maintenance' },
      { name: 'Emergency Repair', duration: 60, price: 500, description: 'Urgent repairs' }
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

// Demo appointments storage
const demoAppointments: Map<string, any[]> = new Map()

// Generate mock availability
function getMockAvailability(date: string, business: BusinessContext): string[] {
  const dayOfWeek = format(new Date(date), 'EEEE').toLowerCase()
  const hours = business.openingHours[dayOfWeek]
  
  if (!hours || !hours.isOpen) return []

  const slots: string[] = []
  const openHour = parseInt(hours.open.split(':')[0])
  const closeHour = parseInt(hours.close.split(':')[0])

  for (let hour = openHour; hour < closeHour; hour++) {
    if (Math.random() > 0.3) slots.push(`${hour}:00`)
    if (Math.random() > 0.3) slots.push(`${hour}:30`)
  }

  return slots.map(time => {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${hour12}:${m} ${ampm}`
  })
}

// Generate TTS audio using Murf Falcon API (streaming endpoint for natural voices)
async function generateTTSAudio(text: string, voiceId: string = 'en-US-natalie'): Promise<string | null> {
  const apiKey = process.env.MURF_API_KEY
  if (!apiKey) {
    console.log('MURF_API_KEY not set, skipping TTS')
    return null
  }

  try {
    // Use Murf Falcon API for more natural voices
    const response = await fetch('https://global.api.murf.ai/v1/speech/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        voiceId,
        text,
        multiNativeLocale: voiceId.startsWith('en-US') ? 'en-US' : voiceId.startsWith('en-IN') ? 'en-IN' : 'en-US',
        model: 'FALCON',
        format: 'MP3',
        sampleRate: 24000,
        channelType: 'MONO'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Murf API error:', errorText)
      return null
    }

    // Falcon API returns audio directly as stream - convert to base64 data URL
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    return `data:audio/mp3;base64,${base64Audio}`
  } catch (error) {
    console.error('Murf TTS error:', error)
    return null
  }
}

// Select voice based on persona - using Murf Falcon natural voices
function selectVoiceForPersona(persona: string, business: BusinessContext): string {
  const lang = business.agentPersona.language
  
  // Murf Falcon voices - more natural sounding
  // Female voices: en-US-natalie, en-US-julia, en-IN-arohi
  // Male voices: en-US-marcus, en-US-terrell, en-IN-rohan
  
  if (lang === 'hi' || lang === 'hi-en') {
    // Use Indian English voices for Hinglish
    return persona === 'gym' ? 'en-IN-rohan' : 'en-IN-arohi'
  }
  
  // English voices
  if (persona === 'dentist') return 'en-US-marcus' // Professional male
  if (persona === 'spa') return 'en-US-natalie' // Calm female
  if (persona === 'gym') return 'en-US-terrell' // Energetic male
  
  return 'en-US-julia' // Default friendly female
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, persona, conversationHistory = [] } = body

    const business = DEMO_BUSINESSES[persona || 'barber']
    if (!business) {
      return NextResponse.json({ error: 'Unknown persona' }, { status: 400 })
    }

    const systemPrompt = generateSystemPrompt(business)

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.speaker === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ]

    // Call OpenAI Chat API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await openaiResponse.json()
    const choice = data.choices[0]
    let aiResponse = ''

    // Handle function calls
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name
      const functionArgs = JSON.parse(choice.message.function_call.arguments)
      let functionResult: any

      switch (functionName) {
        case 'check_availability':
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
              ? `Available: ${slots.slice(0, 4).join(', ')}`
              : 'No slots available'
          }
          break

        case 'book_appointment':
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
            message: `Confirmed for ${functionArgs.customer_name}`
          }
          break

        case 'cancel_appointment':
          functionResult = { success: true, message: 'Cancelled successfully' }
          break

        case 'get_business_info':
          if (functionArgs.info_type === 'services') {
            functionResult = {
              info: business.services.map(s => `${s.name}: ₹${s.price}`).join(', ')
            }
          } else if (functionArgs.info_type === 'prices') {
            functionResult = {
              info: business.services.map(s => `${s.name}: ₹${s.price}`).join(', ')
            }
          } else if (functionArgs.info_type === 'hours') {
            const today = format(new Date(), 'EEEE').toLowerCase()
            const todayHours = business.openingHours[today]
            functionResult = {
              info: todayHours?.isOpen 
                ? `Open today: ${todayHours.open} - ${todayHours.close}`
                : "Closed today"
            }
          } else {
            functionResult = { info: 'Information not available' }
          }
          break

        default:
          functionResult = { error: 'Unknown function' }
      }

      // Get final response with function result
      const followUpMessages = [
        ...messages,
        choice.message,
        { role: 'function', name: functionName, content: JSON.stringify(functionResult) }
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
      aiResponse = followUpData.choices[0].message.content
    } else {
      aiResponse = choice.message.content
    }

    // Generate TTS audio with Murf
    const voiceId = selectVoiceForPersona(persona, business)
    const audioUrl = await generateTTSAudio(aiResponse, voiceId)

    return NextResponse.json({
      response: aiResponse,
      audioUrl
    })

  } catch (error) {
    console.error('Voice chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
  getBusinessInfo,
  getBusiness,
  getServices
} from '@/lib/database'

// Demo business contexts for testing
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const persona = searchParams.get('persona') || 'barber'
  
  const business = DEMO_BUSINESSES[persona]
  if (!business) {
    return NextResponse.json({ error: 'Unknown persona' }, { status: 404 })
  }

  return NextResponse.json({
    business,
    systemPrompt: generateSystemPrompt(business),
    functions: VOICE_AGENT_FUNCTIONS
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, persona, functionName, functionArgs, businessId } = body

    // Get business context
    let business: BusinessContext
    if (businessId) {
      const dbBusiness = await getBusiness(businessId)
      const services = await getServices(businessId)
      if (dbBusiness) {
        business = {
          id: dbBusiness.id,
          name: dbBusiness.name,
          type: dbBusiness.type,
          agentPersona: dbBusiness.agent_persona,
          services: services.map(s => ({
            name: s.name,
            duration: s.duration_minutes,
            price: s.price,
            description: s.description
          })),
          openingHours: dbBusiness.opening_hours
        }
      } else {
        business = DEMO_BUSINESSES['barber']
      }
    } else {
      business = DEMO_BUSINESSES[persona || 'barber']
    }

    if (action === 'get_config') {
      return NextResponse.json({
        business,
        systemPrompt: generateSystemPrompt(business),
        functions: VOICE_AGENT_FUNCTIONS
      })
    }

    if (action === 'execute_function') {
      const result = await handleFunctionCall(
        business.id,
        functionName,
        functionArgs
      )
      return NextResponse.json({ result })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Realtime session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle function calls from OpenAI
async function handleFunctionCall(
  businessId: string,
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  switch (functionName) {
    case 'check_availability':
      return await checkAvailability(
        businessId,
        args.date,
        args.service
      )

    case 'book_appointment':
      return await bookAppointment(
        businessId,
        args.customer_name,
        args.customer_phone,
        args.service,
        args.date_time,
        args.notes
      )

    case 'cancel_appointment':
      return await cancelAppointment(
        businessId,
        args.customer_phone,
        args.appointment_date_time
      )

    case 'get_business_info':
      return {
        info: await getBusinessInfo(businessId, args.info_type)
      }

    default:
      return { error: 'Unknown function' }
  }
}

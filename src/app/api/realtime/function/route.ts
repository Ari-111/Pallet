import { NextRequest, NextResponse } from 'next/server'
import { format, addDays } from 'date-fns'

// Demo appointments storage
const demoAppointments = new Map<string, any[]>()

// Mock availability generator
function getMockAvailability(date: string): string[] {
  const slots: string[] = []
  const baseHours = [9, 10, 11, 14, 15, 16, 17, 18]
  
  for (const hour of baseHours) {
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

export async function POST(request: NextRequest) {
  try {
    const { persona, functionName, functionArgs } = await request.json()
    
    let result: any

    switch (functionName) {
      case 'check_availability': {
        let dateStr = functionArgs.date
        if (!dateStr || dateStr.toLowerCase().includes('tomorrow')) {
          dateStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')
        } else if (dateStr.toLowerCase().includes('today')) {
          dateStr = format(new Date(), 'yyyy-MM-dd')
        }
        
        const slots = getMockAvailability(dateStr)
        result = {
          date: dateStr,
          available_slots: slots.slice(0, 6),
          message: slots.length > 0 
            ? `Available slots: ${slots.slice(0, 4).join(', ')}`
            : 'No slots available on this date'
        }
        break
      }

      case 'book_appointment': {
        const appointmentId = `apt_${Date.now()}`
        const appointments = demoAppointments.get(persona) || []
        
        appointments.push({
          id: appointmentId,
          ...functionArgs,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        })
        
        demoAppointments.set(persona, appointments)
        
        result = {
          success: true,
          appointment_id: appointmentId,
          message: `Appointment confirmed for ${functionArgs.customer_name}`,
          details: {
            service: functionArgs.service,
            date_time: functionArgs.date_time,
            customer: functionArgs.customer_name
          }
        }
        break
      }

      case 'cancel_appointment': {
        result = {
          success: true,
          message: 'Appointment cancelled successfully'
        }
        break
      }

      case 'get_business_info': {
        const infoType = functionArgs.info_type
        
        if (infoType === 'services' || infoType === 'prices') {
          result = {
            info: 'Our services include Haircut (₹300), Beard Trim (₹150), Hair Color (₹800), Facial (₹500), and Head Massage (₹200).'
          }
        } else if (infoType === 'hours') {
          result = {
            info: 'We are open Monday to Friday 9 AM to 8 PM, Saturday 10 AM to 10 PM, and Sunday 10 AM to 6 PM.'
          }
        } else if (infoType === 'location') {
          result = {
            info: 'We are located at 123 MG Road, Bangalore. Near Metro Station.'
          }
        } else {
          result = { info: 'Information not available' }
        }
        break
      }

      default:
        result = { error: 'Unknown function' }
    }

    return NextResponse.json({ result })

  } catch (error) {
    console.error('Function execution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

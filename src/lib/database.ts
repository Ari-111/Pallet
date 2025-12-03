// Database operations for appointments and business logic
import { supabaseAdmin, type Business, type Service, type Appointment, type CallLog } from './supabase'
import { format, parseISO, addMinutes, isWithinInterval, parse } from 'date-fns'

// Get business by ID
export async function getBusiness(businessId: string): Promise<Business | null> {
  const { data, error } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (error) {
    console.error('Error fetching business:', error)
    return null
  }
  return data
}

// Get business by SIP address
export async function getBusinessBySipAddress(sipAddress: string): Promise<Business | null> {
  const { data, error } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('sip_address', sipAddress)
    .single()

  if (error) {
    console.error('Error fetching business by SIP:', error)
    return null
  }
  return data
}

// Get services for a business
export async function getServices(businessId: string): Promise<Service[]> {
  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }
  return data || []
}

// Check availability for a date
export async function checkAvailability(
  businessId: string,
  date: string,
  serviceName?: string
): Promise<{ slots: string[]; message: string }> {
  try {
    // Get business hours
    const business = await getBusiness(businessId)
    if (!business) {
      return { slots: [], message: 'Business not found' }
    }

    const dayOfWeek = format(parseISO(date), 'EEEE').toLowerCase()
    const dayHours = business.opening_hours[dayOfWeek]

    if (!dayHours || !dayHours.isOpen) {
      return { slots: [], message: `Sorry, we are closed on ${dayOfWeek}` }
    }

    // Get service duration
    let duration = 30 // default
    if (serviceName) {
      const services = await getServices(businessId)
      const service = services.find(s => 
        s.name.toLowerCase() === serviceName.toLowerCase()
      )
      if (service) {
        duration = service.duration_minutes
      }
    }

    // Get existing appointments for that day
    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`

    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('appointment_time, duration_minutes')
      .eq('business_id', businessId)
      .gte('appointment_time', startOfDay)
      .lte('appointment_time', endOfDay)
      .neq('status', 'cancelled')

    // Generate available slots
    const slots: string[] = []
    const openTime = parse(dayHours.open, 'HH:mm', parseISO(date))
    const closeTime = parse(dayHours.close, 'HH:mm', parseISO(date))

    let currentSlot = openTime
    while (addMinutes(currentSlot, duration) <= closeTime) {
      const slotEnd = addMinutes(currentSlot, duration)
      
      // Check if slot overlaps with any existing appointment
      const isBooked = appointments?.some(apt => {
        const aptStart = parseISO(apt.appointment_time)
        const aptEnd = addMinutes(aptStart, apt.duration_minutes)
        
        return (
          isWithinInterval(currentSlot, { start: aptStart, end: aptEnd }) ||
          isWithinInterval(slotEnd, { start: aptStart, end: aptEnd }) ||
          isWithinInterval(aptStart, { start: currentSlot, end: slotEnd })
        )
      })

      if (!isBooked) {
        slots.push(format(currentSlot, 'h:mm a'))
      }

      currentSlot = addMinutes(currentSlot, 30) // 30 min intervals
    }

    if (slots.length === 0) {
      return { slots: [], message: 'Sorry, no slots available for this date' }
    }

    return {
      slots,
      message: `Available slots: ${slots.slice(0, 5).join(', ')}${slots.length > 5 ? ' and more' : ''}`
    }
  } catch (error) {
    console.error('Error checking availability:', error)
    return { slots: [], message: 'Error checking availability' }
  }
}

// Book an appointment
export async function bookAppointment(
  businessId: string,
  customerName: string,
  customerPhone: string,
  service: string,
  dateTime: string,
  notes?: string
): Promise<{ success: boolean; appointmentId?: string; message: string }> {
  try {
    // Get service duration
    const services = await getServices(businessId)
    const serviceInfo = services.find(s => 
      s.name.toLowerCase() === service.toLowerCase()
    )
    const duration = serviceInfo?.duration_minutes || 30

    // Check if slot is still available
    const date = dateTime.split('T')[0]
    const availability = await checkAvailability(businessId, date, service)
    
    const requestedTime = format(parseISO(dateTime), 'h:mm a')
    if (!availability.slots.includes(requestedTime)) {
      return {
        success: false,
        message: `Sorry, ${requestedTime} is no longer available. Available slots: ${availability.slots.slice(0, 3).join(', ')}`
      }
    }

    // Insert appointment
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        business_id: businessId,
        customer_name: customerName,
        customer_phone: customerPhone,
        service: service,
        appointment_time: dateTime,
        duration_minutes: duration,
        status: 'confirmed',
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error booking appointment:', error)
      return { success: false, message: 'Failed to book appointment. Please try again.' }
    }

    // Send Telegram notification
    const business = await getBusiness(businessId)
    if (business?.telegram_chat_id) {
      await sendTelegramNotification(business.telegram_chat_id, {
        type: 'new_booking',
        customerName,
        customerPhone,
        service,
        dateTime,
        duration,
        notes
      })
    }

    return {
      success: true,
      appointmentId: data.id,
      message: `Appointment confirmed for ${customerName} on ${format(parseISO(dateTime), 'EEEE, MMMM d')} at ${format(parseISO(dateTime), 'h:mm a')} for ${service}`
    }
  } catch (error) {
    console.error('Error booking appointment:', error)
    return { success: false, message: 'An error occurred. Please try again.' }
  }
}

// Cancel an appointment
export async function cancelAppointment(
  businessId: string,
  customerPhone: string,
  appointmentDateTime?: string
): Promise<{ success: boolean; message: string }> {
  try {
    let query = supabaseAdmin
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('business_id', businessId)
      .eq('customer_phone', customerPhone)
      .eq('status', 'confirmed')

    if (appointmentDateTime) {
      query = query.eq('appointment_time', appointmentDateTime)
    }

    const { data, error } = await query.select()

    if (error || !data || data.length === 0) {
      return { success: false, message: 'No matching appointment found' }
    }

    return {
      success: true,
      message: `Appointment cancelled successfully. We hope to see you again soon!`
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return { success: false, message: 'Failed to cancel appointment' }
  }
}

// Get business info
export async function getBusinessInfo(
  businessId: string,
  infoType: 'hours' | 'services' | 'location' | 'prices'
): Promise<string> {
  const business = await getBusiness(businessId)
  if (!business) return 'Business information not available'

  switch (infoType) {
    case 'hours':
      const hours = Object.entries(business.opening_hours)
        .map(([day, h]) => {
          if (!h.isOpen) return `${day}: Closed`
          return `${day}: ${h.open} - ${h.close}`
        })
        .join(', ')
      return `Our business hours are: ${hours}`

    case 'services':
      const services = await getServices(businessId)
      const serviceList = services.map(s => s.name).join(', ')
      return `We offer: ${serviceList}`

    case 'prices':
      const servicesWithPrices = await getServices(businessId)
      const priceList = servicesWithPrices
        .map(s => `${s.name}: ₹${s.price}`)
        .join(', ')
      return `Our prices: ${priceList}`

    case 'location':
      return `We are located at: ${business.address}`

    default:
      return 'Information not available'
  }
}

// Log a call
export async function logCall(
  businessId: string,
  callerPhone: string,
  callerName: string | null,
  callSid: string,
  durationSeconds: number,
  transcript: Array<{ speaker: string; text: string; timestamp: string }>,
  outcome: string,
  appointmentId?: string,
  audioUrl?: string
): Promise<void> {
  try {
    await supabaseAdmin.from('call_logs').insert({
      business_id: businessId,
      caller_phone: callerPhone,
      caller_name: callerName,
      call_sid: callSid,
      duration_seconds: durationSeconds,
      transcript: transcript,
      outcome: outcome,
      appointment_id: appointmentId || null,
      audio_url: audioUrl || null
    })
  } catch (error) {
    console.error('Error logging call:', error)
  }
}

// Send Telegram notification
export async function sendTelegramNotification(
  chatId: string,
  data: {
    type: 'new_booking' | 'cancellation' | 'reminder'
    customerName: string
    customerPhone: string
    service: string
    dateTime: string
    duration?: number
    notes?: string
  }
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.log('Telegram bot token not configured')
    return false
  }

  let message = ''
  const formattedDate = format(parseISO(data.dateTime), 'EEEE, MMMM d')
  const formattedTime = format(parseISO(data.dateTime), 'h:mm a')

  switch (data.type) {
    case 'new_booking':
      message = `🔔 *New Appointment Booked!*

👤 Customer: ${data.customerName}
📞 Phone: ${data.customerPhone}
✂️ Service: ${data.service}
🕐 Time: ${formattedDate} at ${formattedTime}
⏱️ Duration: ${data.duration || 30} minutes
${data.notes ? `\n💬 Notes: ${data.notes}` : ''}

📱 Reply with /confirm or /cancel to manage`
      break

    case 'cancellation':
      message = `❌ *Appointment Cancelled*

👤 Customer: ${data.customerName}
📞 Phone: ${data.customerPhone}
🕐 Was scheduled for: ${formattedDate} at ${formattedTime}`
      break

    case 'reminder':
      message = `⏰ *Appointment Reminder*

👤 Customer: ${data.customerName}
✂️ Service: ${data.service}
🕐 Time: ${formattedTime} (in 1 hour)`
      break
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    )

    return response.ok
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return false
  }
}

// Get today's appointments for a business
export async function getTodaysAppointments(businessId: string): Promise<Appointment[]> {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*')
    .eq('business_id', businessId)
    .gte('appointment_time', `${today}T00:00:00`)
    .lte('appointment_time', `${today}T23:59:59`)
    .neq('status', 'cancelled')
    .order('appointment_time')

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
  return data || []
}

// Get recent call logs
export async function getRecentCalls(businessId: string, limit: number = 10): Promise<CallLog[]> {
  const { data, error } = await supabaseAdmin
    .from('call_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching call logs:', error)
    return []
  }
  return data || []
}

// Mock data for the entire application

export const mockBusinessData = {
  id: "biz_001",
  name: "Raj's Premium Salon",
  type: "salon",
  phone: "+91 98765 43210",
  email: "raj@example.com",
  address: "123 MG Road, Bangalore",
  owner: {
    name: "Raj Kumar",
    email: "raj@example.com"
  },
  agentPersona: {
    name: "Priya",
    language: "hi-en",
    tone: "friendly",
    greeting: "Namaste! Raj Salon me aapka swagat hai. Main Priya, aapki kya madad kar sakti hoon?"
  },
  openingHours: {
    monday: { open: "09:00", close: "20:00", isOpen: true },
    tuesday: { open: "09:00", close: "20:00", isOpen: true },
    wednesday: { open: "09:00", close: "20:00", isOpen: true },
    thursday: { open: "09:00", close: "20:00", isOpen: true },
    friday: { open: "09:00", close: "21:00", isOpen: true },
    saturday: { open: "10:00", close: "22:00", isOpen: true },
    sunday: { open: "10:00", close: "18:00", isOpen: true }
  },
  telegramConnected: true,
  telegramChatId: "123456789"
}

export const mockServices = [
  { id: "srv_001", name: "Haircut", duration: 30, price: 300, description: "Professional haircut with styling" },
  { id: "srv_002", name: "Beard Trim", duration: 15, price: 150, description: "Beard shaping and trimming" },
  { id: "srv_003", name: "Hair Color", duration: 60, price: 800, description: "Full hair coloring service" },
  { id: "srv_004", name: "Facial", duration: 45, price: 500, description: "Deep cleansing facial treatment" },
  { id: "srv_005", name: "Head Massage", duration: 20, price: 200, description: "Relaxing scalp massage" },
  { id: "srv_006", name: "Hair Spa", duration: 60, price: 700, description: "Premium hair treatment spa" }
]

export const mockAppointments = [
  {
    id: "apt_001",
    customerName: "Amit Sharma",
    customerPhone: "+91 99887 76655",
    service: "Haircut",
    appointmentTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    status: "confirmed",
    notes: "Regular customer, prefers short trim"
  },
  {
    id: "apt_002",
    customerName: "Priya Patel",
    customerPhone: "+91 88776 65544",
    service: "Hair Color",
    appointmentTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    status: "confirmed",
    notes: "Wants burgundy highlights"
  },
  {
    id: "apt_003",
    customerName: "Rahul Verma",
    customerPhone: "+91 77665 54433",
    service: "Beard Trim",
    appointmentTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    duration: 15,
    status: "confirmed",
    notes: ""
  },
  {
    id: "apt_004",
    customerName: "Sneha Gupta",
    customerPhone: "+91 66554 43322",
    service: "Facial",
    appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    status: "confirmed",
    notes: "Sensitive skin, use mild products"
  },
  {
    id: "apt_005",
    customerName: "Vikram Singh",
    customerPhone: "+91 55443 32211",
    service: "Hair Spa",
    appointmentTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    status: "confirmed",
    notes: ""
  }
]

export const mockCallLogs = [
  {
    id: "call_001",
    callerPhone: "+91 99887 76655",
    callerName: "Amit Sharma",
    duration: 145,
    outcome: "appointment_booked",
    appointmentId: "apt_001",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    transcript: [
      { speaker: "agent", text: "Namaste! Raj Salon me aapka swagat hai. Main Priya, aapki kya madad kar sakti hoon?", timestamp: "00:00" },
      { speaker: "user", text: "Haan, mujhe haircut karwana hai kal ke liye", timestamp: "00:05" },
      { speaker: "agent", text: "Zaroor! Kal ke liye appointment le lete hain. Kaunsa time aapke liye convenient rahega?", timestamp: "00:10" },
      { speaker: "user", text: "Dopahar 2 baje ho sakta hai?", timestamp: "00:18" },
      { speaker: "agent", text: "Ji, 2 baje slot available hai. Aapka naam please?", timestamp: "00:22" },
      { speaker: "user", text: "Amit Sharma", timestamp: "00:28" },
      { speaker: "agent", text: "Amit ji, aapka appointment confirm ho gaya hai kal 2 baje ke liye haircut. Dhanyawad!", timestamp: "00:32" }
    ]
  },
  {
    id: "call_002",
    callerPhone: "+91 88776 65544",
    callerName: "Priya Patel",
    duration: 210,
    outcome: "appointment_booked",
    appointmentId: "apt_002",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    transcript: [
      { speaker: "agent", text: "Namaste! Raj Salon me aapka swagat hai. Main Priya hoon, aapki kya seva kar sakti hoon?", timestamp: "00:00" },
      { speaker: "user", text: "Hi, I want to book for hair coloring", timestamp: "00:04" },
      { speaker: "agent", text: "Sure! We have excellent hair coloring services. When would you like to come?", timestamp: "00:08" },
      { speaker: "user", text: "Tomorrow evening around 5?", timestamp: "00:14" },
      { speaker: "agent", text: "Perfect! 5 PM slot is available. May I have your name please?", timestamp: "00:18" },
      { speaker: "user", text: "Priya Patel", timestamp: "00:22" },
      { speaker: "agent", text: "Thank you Priya ji! Your appointment is confirmed for tomorrow at 5 PM for hair coloring. See you soon!", timestamp: "00:26" }
    ]
  },
  {
    id: "call_003",
    callerPhone: "+91 11223 34455",
    callerName: "Unknown",
    duration: 45,
    outcome: "inquiry",
    appointmentId: null,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    transcript: [
      { speaker: "agent", text: "Namaste! Raj Salon me aapka swagat hai.", timestamp: "00:00" },
      { speaker: "user", text: "What are your timings on Sunday?", timestamp: "00:04" },
      { speaker: "agent", text: "We are open on Sundays from 10 AM to 6 PM. Would you like to book an appointment?", timestamp: "00:08" },
      { speaker: "user", text: "No, I'll come directly. Thanks!", timestamp: "00:15" },
      { speaker: "agent", text: "You're welcome! See you soon.", timestamp: "00:18" }
    ]
  },
  {
    id: "call_004",
    callerPhone: "+91 44556 67788",
    callerName: "Ravi Kumar",
    duration: 180,
    outcome: "cancelled",
    appointmentId: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    transcript: [
      { speaker: "agent", text: "Namaste! Raj Salon me aapka swagat hai.", timestamp: "00:00" },
      { speaker: "user", text: "Maine kal ke liye appointment liya tha, mujhe cancel karna hai", timestamp: "00:05" },
      { speaker: "agent", text: "Theek hai. Aapka phone number bata dijiye please", timestamp: "00:10" },
      { speaker: "user", text: "44556 67788", timestamp: "00:15" },
      { speaker: "agent", text: "Ji, aapka kal 3 baje ka appointment cancel kar diya gaya hai. Phir kabhi zaroor aaiyega!", timestamp: "00:20" }
    ]
  },
  {
    id: "call_005",
    callerPhone: "+91 77665 54433",
    callerName: "Rahul Verma",
    duration: 95,
    outcome: "appointment_booked",
    appointmentId: "apt_003",
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    transcript: [
      { speaker: "agent", text: "Namaste! Raj Salon.", timestamp: "00:00" },
      { speaker: "user", text: "Beard trim ke liye appointment chahiye", timestamp: "00:03" },
      { speaker: "agent", text: "Sure! Kab aana chahenge?", timestamp: "00:07" },
      { speaker: "user", text: "Aaj shaam 6 baje?", timestamp: "00:10" },
      { speaker: "agent", text: "6 baje available hai. Naam?", timestamp: "00:13" },
      { speaker: "user", text: "Rahul Verma", timestamp: "00:16" },
      { speaker: "agent", text: "Done! Aaj 6 baje milte hain Rahul ji.", timestamp: "00:19" }
    ]
  }
]

export const mockMetrics = {
  callsToday: 12,
  bookingsToday: 8,
  conversionRate: 67,
  totalCalls: 234,
  totalBookings: 156,
  avgCallDuration: 125
}

export const mockAgentPersonas = [
  {
    id: "persona_barber",
    name: "Raj - Barber Shop",
    type: "barber",
    icon: "✂️",
    description: "Friendly neighborhood barber persona",
    language: "hi-en",
    greeting: "Namaste! Welcome to Raj Barber Shop. How can I help you today?",
    tone: "casual"
  },
  {
    id: "persona_dentist",
    name: "Dr. Priya - Dental Clinic",
    type: "dentist",
    icon: "🦷",
    description: "Professional dental clinic receptionist",
    language: "en",
    greeting: "Hello! Thank you for calling Smile Dental Clinic. How may I assist you?",
    tone: "professional"
  },
  {
    id: "persona_gym",
    name: "Fitness First",
    type: "gym",
    icon: "💪",
    description: "Energetic fitness trainer assistant",
    language: "en",
    greeting: "Hey there! Welcome to Fitness First! Ready to start your fitness journey?",
    tone: "energetic"
  },
  {
    id: "persona_spa",
    name: "Serenity Spa",
    type: "spa",
    icon: "🧘",
    description: "Calm and soothing spa receptionist",
    language: "en",
    greeting: "Welcome to Serenity Spa. Let me help you find the perfect relaxation experience.",
    tone: "calm"
  },
  {
    id: "persona_electrician",
    name: "Quick Fix Electric",
    type: "electrician",
    icon: "⚡",
    description: "Reliable home service assistant",
    language: "hi-en",
    greeting: "Hello! Quick Fix Electric service. Bijli ki koi bhi problem ho, hum hain na!",
    tone: "helpful"
  }
]

export const mockWeeklyStats = [
  { day: "Mon", calls: 15, bookings: 10 },
  { day: "Tue", calls: 22, bookings: 16 },
  { day: "Wed", calls: 18, bookings: 12 },
  { day: "Thu", calls: 25, bookings: 19 },
  { day: "Fri", calls: 30, bookings: 24 },
  { day: "Sat", calls: 35, bookings: 28 },
  { day: "Sun", calls: 20, bookings: 15 }
]

export const mockConversationDemo = [
  { speaker: "agent", text: "Namaste! Raj Salon me aapka swagat hai. Main Priya, aapki kya madad kar sakti hoon?", delay: 0 },
  { speaker: "user", text: "Hi, I want to book an appointment for haircut", delay: 2000 },
  { speaker: "agent", text: "Sure! When would you like to come? We have slots available today and tomorrow.", delay: 4000 },
  { speaker: "user", text: "Tomorrow at 3 PM please", delay: 6000 },
  { speaker: "agent", text: "Perfect! 3 PM tomorrow is available. May I have your name and phone number?", delay: 8000 },
  { speaker: "user", text: "My name is Vikram, number is 98765 43210", delay: 10000 },
  { speaker: "agent", text: "Thank you Vikram ji! Your appointment is confirmed for tomorrow at 3 PM for a haircut. See you soon! 🙏", delay: 12000 }
]

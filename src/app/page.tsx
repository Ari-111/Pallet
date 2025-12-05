"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Phone, 
  Calendar, 
  MessageSquare, 
  Bot, 
  ArrowRight, 
  Check, 
  Mic, 
  Sparkles,
  Building2,
  Clock,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Phone,
    title: "Real-time Voice Calling",
    description: "Handle customer calls 24/7 with natural AI conversations in Hindi and English"
  },
  {
    icon: Bot,
    title: "AI Receptionist",
    description: "Smart agent that understands context, answers queries, and books appointments"
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description: "Seamless appointment scheduling with automatic availability checks"
  },
  {
    icon: MessageSquare,
    title: "Telegram Notifications",
    description: "Get instant alerts on your phone for every new booking"
  }
]

const businessTypes = [
  { icon: "✂️", name: "Salons" },
  { icon: "🦷", name: "Clinics" },
  { icon: "💪", name: "Gyms" },
  { icon: "🧘", name: "Spas" },
  { icon: "⚡", name: "Services" },
  { icon: "🍕", name: "Restaurants" }
]

const stats = [
  { value: "10K+", label: "Calls Handled" },
  { value: "95%", label: "Booking Rate" },
  { value: "24/7", label: "Availability" },
  { value: "2min", label: "Avg Call Time" }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <img src="/logo.png" alt="Pallet Logo" className="w-10 h-10 rounded-xl" />
              <span className="text-2xl font-bold gradient-text">Pallet</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/try-agent">
                <Button variant="gradient">Try Demo</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Voice Agents for Indian Businesses
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Never miss a customer call{" "}
                <span className="gradient-text">again</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Build AI voice agents that speak Hindi & English, book appointments, 
                and send you instant notifications. Perfect for salons, clinics, and service businesses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/try-agent">
                  <Button size="xl" variant="gradient" className="gap-2">
                    <Mic className="w-5 h-5" />
                    Try Voice Agent Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/setup">
                  <Button size="xl" variant="outline" className="gap-2">
                    <Building2 className="w-5 h-5" />
                    Configure Your Business
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  No credit card required
                </div>
              </div>
            </motion.div>

            {/* Phone Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl" />
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="h-full flex flex-col">
                    {/* Phone Status Bar */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-8 text-center">
                      <p className="text-sm opacity-80">Incoming Call</p>
                      <p className="text-2xl font-semibold mt-2">Raj Salon AI</p>
                      <div className="flex justify-center items-center gap-1 mt-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <div
                            key={i}
                            className="waveform-bar w-1 bg-white/80 rounded-full"
                            style={{ height: "4px" }}
                          />
                        ))}
                      </div>
                      <p className="text-sm mt-3 opacity-80">02:34</p>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-violet-100 text-violet-900 rounded-2xl rounded-tl-sm p-3 max-w-[80%]"
                      >
                        <p className="text-sm">Namaste! Raj Salon me aapka swagat hai 🙏</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white border rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto"
                      >
                        <p className="text-sm">Haircut book karna hai kal ke liye</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 }}
                        className="bg-violet-100 text-violet-900 rounded-2xl rounded-tl-sm p-3 max-w-[80%]"
                      >
                        <p className="text-sm">Zaroor! Kal 3 baje available hai. Naam please?</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 }}
                        className="bg-white border rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto"
                      >
                        <p className="text-sm">Amit Kumar</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.7 }}
                        className="bg-emerald-100 text-emerald-900 rounded-2xl rounded-tl-sm p-3 max-w-[80%]"
                      >
                        <p className="text-sm">✅ Amit ji, appointment confirmed for tomorrow 3 PM!</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Booking Confirmed</p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Telegram Alert Sent</p>
                  <p className="text-xs text-muted-foreground">To business owner</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to automate{" "}
              <span className="gradient-text">customer calls</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pallet handles your incoming calls, books appointments, and keeps you updated in real-time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Perfect for all service businesses</h2>
            <p className="text-xl text-muted-foreground">
              From salons to clinics, restaurants to repair services
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {businessTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gray-50 hover:bg-violet-50 transition-colors cursor-pointer"
              >
                <span className="text-3xl">{type.icon}</span>
                <span className="font-medium text-lg">{type.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Get started in 3 simple steps</h2>
            <p className="text-xl text-muted-foreground">
              Set up your AI receptionist in under 5 minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Configure Business", desc: "Add your services, timings, and agent personality", icon: Building2 },
              { step: "2", title: "Connect Telegram", desc: "Link your Telegram to receive instant booking alerts", icon: MessageSquare },
              { step: "3", title: "Go Live!", desc: "Your AI agent is ready to handle customer calls", icon: Phone }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center text-sm font-bold text-violet-600">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-violet-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi02MEgtMTB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to automate your business?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join hundreds of Indian businesses using Pallet to never miss a customer call
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/try-agent">
                  <Button size="xl" className="bg-white text-violet-600 hover:bg-gray-100 gap-2">
                    <Mic className="w-5 h-5" />
                    Try Voice Agent Now
                  </Button>
                </Link>
                <Link href="/setup">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                    Configure Business
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Pallet Logo" className="w-10 h-10 rounded-xl" />
              <span className="text-2xl font-bold gradient-text">Pallet</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure & Private
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                24/7 Support
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Pallet. Made with ❤️ for Indian businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

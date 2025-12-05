"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Building2, 
  Package, 
  Clock, 
  Bot, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  MapPin,
  Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const steps = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Services", icon: Package },
  { id: 3, title: "Hours", icon: Clock },
  { id: 4, title: "Agent", icon: Bot },
  { id: 5, title: "Telegram", icon: MessageSquare }
]

const businessTypes = [
  { value: "salon", label: "Salon / Barbershop", icon: "✂️" },
  { value: "clinic", label: "Clinic / Doctor", icon: "🏥" },
  { value: "gym", label: "Gym / Fitness", icon: "💪" },
  { value: "spa", label: "Spa / Wellness", icon: "🧘" },
  { value: "restaurant", label: "Restaurant / Cafe", icon: "🍕" },
  { value: "repair", label: "Repair / Services", icon: "🔧" },
  { value: "other", label: "Other", icon: "📦" }
]

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const toneOptions = [
  { value: "friendly", label: "Friendly & Warm" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Fun" },
  { value: "formal", label: "Formal" }
]

const languageOptions = [
  { value: "hi-en", label: "Hindi + English (Hinglish)" },
  { value: "hi", label: "Hindi Only" },
  { value: "en", label: "English Only" }
]

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    type: "",
    phone: "",
    address: ""
  })
  const [services, setServices] = useState([
    { id: 1, name: "", duration: 30, price: 0 }
  ])
  const [hours, setHours] = useState<Record<string, { open: string; close: string; isOpen: boolean }>>(
    weekdays.reduce((acc, day) => ({
      ...acc,
      [day.toLowerCase()]: { open: "09:00", close: "18:00", isOpen: true }
    }), {} as Record<string, { open: string; close: string; isOpen: boolean }>)
  )
  const [agentPersona, setAgentPersona] = useState({
    name: "Priya",
    language: "hi-en",
    tone: "friendly",
    greeting: "Namaste! Main aapki kya madad kar sakti hoon?"
  })
  const [telegramToken, setTelegramToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/dashboard"
    }, 2000)
  }

  const addService = () => {
    setServices([...services, { id: Date.now(), name: "", duration: 30, price: 0 }])
  }

  const removeService = (id: number) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const updateService = (id: number, field: string, value: string | number) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const toggleDay = (day: string) => {
    const dayKey = day.toLowerCase()
    if (hours[dayKey]) {
      setHours({
        ...hours,
        [dayKey]: { ...hours[dayKey], isOpen: !hours[dayKey].isOpen }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Pallet Logo" className="w-10 h-10 rounded-xl" />
            <span className="text-2xl font-bold gradient-text">Pallet</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Set up your voice agent</h1>
          <p className="text-muted-foreground">Configure your business in just a few steps</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.id * 0.1 }}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-violet-600"
                    : step.id < currentStep
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${
                    step.id === currentStep
                      ? "bg-violet-100"
                      : step.id < currentStep
                      ? "bg-emerald-100"
                      : "bg-muted"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </motion.div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Business Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">Tell us about your business</h2>
                    <p className="text-muted-foreground text-sm">This helps personalize your AI agent</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="e.g., Raj's Premium Salon"
                        value={businessInfo.name}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Business Type</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {businessTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setBusinessInfo({ ...businessInfo, type: type.value })}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${
                              businessInfo.type === type.value
                                ? "border-violet-600 bg-violet-50"
                                : "border-transparent bg-muted hover:bg-muted/80"
                            }`}
                          >
                            <span className="text-2xl">{type.icon}</span>
                            <p className="text-sm font-medium mt-1">{type.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Business Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+91 98765 43210"
                          className="pl-10"
                          value={businessInfo.phone}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="e.g., 123 MG Road, Bangalore"
                          className="pl-10"
                          value={businessInfo.address}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Services */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">Add your services</h2>
                    <p className="text-muted-foreground text-sm">What services do you offer to customers?</p>
                  </div>

                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-muted/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Service {index + 1}
                          </span>
                          {services.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(service.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Service name (e.g., Haircut)"
                          value={service.name}
                          onChange={(e) => updateService(service.id, "name", e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Duration (min)</Label>
                            <Select
                              value={service.duration.toString()}
                              onValueChange={(v) => updateService(service.id, "duration", parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[15, 30, 45, 60, 90, 120].map((d) => (
                                  <SelectItem key={d} value={d.toString()}>
                                    {d} minutes
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Price (₹)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={service.price || ""}
                              onChange={(e) => updateService(service.id, "price", parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={addService}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Service
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Business Hours */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">Set your business hours</h2>
                    <p className="text-muted-foreground text-sm">When can customers book appointments?</p>
                  </div>

                  <div className="space-y-3">
                    {weekdays.map((day) => {
                      const dayKey = day.toLowerCase() as keyof typeof hours
                      const dayHours = hours[dayKey]
                      return (
                        <div
                          key={day}
                          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                            dayHours.isOpen ? "bg-muted/50" : "bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={dayHours.isOpen}
                              onCheckedChange={() => toggleDay(dayKey)}
                            />
                            <span className={`font-medium ${!dayHours.isOpen && "text-muted-foreground"}`}>
                              {day}
                            </span>
                          </div>
                          {dayHours.isOpen ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={dayHours.open}
                                onChange={(e) =>
                                  setHours({
                                    ...hours,
                                    [dayKey]: { ...dayHours, open: e.target.value }
                                  })
                                }
                                className="w-28 h-9"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={dayHours.close}
                                onChange={(e) =>
                                  setHours({
                                    ...hours,
                                    [dayKey]: { ...dayHours, close: e.target.value }
                                  })
                                }
                                className="w-28 h-9"
                              />
                            </div>
                          ) : (
                            <Badge variant="secondary">Closed</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Agent Persona */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">Design your AI agent</h2>
                    <p className="text-muted-foreground text-sm">Give your agent a personality</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name</Label>
                      <Input
                        id="agentName"
                        placeholder="e.g., Priya, Raj, etc."
                        value={agentPersona.name}
                        onChange={(e) => setAgentPersona({ ...agentPersona, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Language Preference</Label>
                      <Select
                        value={agentPersona.language}
                        onValueChange={(v) => setAgentPersona({ ...agentPersona, language: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Speaking Tone</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {toneOptions.map((tone) => (
                          <button
                            key={tone.value}
                            onClick={() => setAgentPersona({ ...agentPersona, tone: tone.value })}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                              agentPersona.tone === tone.value
                                ? "border-violet-600 bg-violet-50"
                                : "border-transparent bg-muted hover:bg-muted/80"
                            }`}
                          >
                            <span className="text-sm font-medium">{tone.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="greeting">Greeting Message</Label>
                      <Textarea
                        id="greeting"
                        placeholder="The first thing your agent says..."
                        value={agentPersona.greeting}
                        onChange={(e) => setAgentPersona({ ...agentPersona, greeting: e.target.value })}
                        rows={3}
                      />
                    </div>

                    {/* Live Preview */}
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
                      <p className="text-xs text-violet-600 font-medium mb-2">Live Preview</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {agentPersona.name.charAt(0)}
                        </div>
                        <div className="flex-1 bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                          <p className="text-sm">{agentPersona.greeting}</p>
                          <p className="text-xs text-muted-foreground mt-1">— {agentPersona.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Telegram */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-1">Connect Telegram</h2>
                    <p className="text-muted-foreground text-sm">Get instant notifications for bookings</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <h3 className="font-semibold text-blue-900 mb-3">How to set up</h3>
                      <ol className="space-y-3 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                          <span>Open Telegram and search for <strong>@BotFather</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                          <span>Send <code className="bg-blue-100 px-1 rounded">/newbot</code> and follow the prompts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                          <span>Copy the bot token provided by BotFather</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                          <span>Paste it below and click Continue</span>
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegramToken">Bot Token</Label>
                      <div className="relative">
                        <Input
                          id="telegramToken"
                          placeholder="123456789:ABCdefGHI..."
                          value={telegramToken}
                          onChange={(e) => setTelegramToken(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(telegramToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Open Telegram BotFather
                      </a>
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      You can skip this step and configure later in Settings
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < steps.length ? (
                <Button variant="gradient" onClick={handleNext} className="gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already configured?{" "}
          <Link href="/dashboard" className="text-violet-600 hover:underline">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}

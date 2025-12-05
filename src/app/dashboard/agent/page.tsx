"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings2,
  Volume2,
  Edit3,
  Save,
  Play,
  Sparkles,
  Zap,
  Users,
  Clock,
  MessageSquare,
  ChevronRight,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAgentPersonas, mockServices, mockBusinessData } from "@/lib/mock-data"

const demoPersonas = [
  {
    id: "barber",
    name: "Classic Barbershop",
    avatar: "✂️",
    description: "Friendly neighborhood barbershop assistant",
    greeting: "Hey there! Welcome to Classic Cuts. Looking to book a fresh fade?",
    voice: "confident",
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "dentist",
    name: "Smile Dental Clinic",
    avatar: "🦷",
    description: "Professional dental clinic receptionist",
    greeting: "Good day! Thank you for calling Smile Dental. How may I help you today?",
    voice: "professional",
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: "fitness",
    name: "FitLife Gym",
    avatar: "💪",
    description: "Energetic fitness center coordinator",
    greeting: "Hey! Welcome to FitLife! Ready to crush some goals? What can I do for you?",
    voice: "energetic",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "therapist",
    name: "Wellness Therapy",
    avatar: "🧘",
    description: "Calm and soothing therapy assistant",
    greeting: "Hello, thank you for reaching out to Wellness Therapy. How are you feeling today?",
    voice: "calm",
    color: "from-purple-500 to-pink-600"
  },
  {
    id: "electrician",
    name: "Spark Electric Co",
    avatar: "⚡",
    description: "Efficient electrical services dispatcher",
    greeting: "Thanks for calling Spark Electric! Got a power issue? Let's get it sorted!",
    voice: "efficient",
    color: "from-yellow-500 to-red-600"
  }
]

const mockConversation = [
  { speaker: "agent", text: "Hey there! Welcome to Classic Cuts. Looking to book a fresh fade?" },
  { speaker: "user", text: "Yeah, I need a haircut for tomorrow if possible." },
  { speaker: "agent", text: "Sure thing! I have a few slots open tomorrow. How does 2 PM or 4 PM work for you?" },
  { speaker: "user", text: "2 PM works great!" },
  { speaker: "agent", text: "Perfect! I've got you booked for 2 PM tomorrow. Can I get your name and phone number?" },
  { speaker: "user", text: "It's John, and my number is 9876543210" },
  { speaker: "agent", text: "All set, John! You're booked for tomorrow at 2 PM. See you then! 🔥" }
]

export default function AgentStudioPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showTryModal, setShowTryModal] = useState(false)
  const [selectedDemoPersona, setSelectedDemoPersona] = useState<typeof demoPersonas[0] | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [conversationIndex, setConversationIndex] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState<typeof mockConversation>([])

  // Agent settings state
  const [agentName, setAgentName] = useState("Priya")
  const [agentGreeting, setAgentGreeting] = useState("Hi! Thanks for calling Style Studio. How can I help you today?")
  const [agentPersonality, setAgentPersonality] = useState("friendly")

  const startDemoCall = () => {
    if (!selectedDemoPersona) return
    setIsCallActive(true)
    setDisplayedMessages([])
    setConversationIndex(0)

    // Simulate conversation
    const interval = setInterval(() => {
      setConversationIndex((prev) => {
        if (prev >= mockConversation.length) {
          clearInterval(interval)
          return prev
        }
        setDisplayedMessages((msgs) => [...msgs, mockConversation[prev]])
        return prev + 1
      })
    }, 2000)
  }

  const endDemoCall = () => {
    setIsCallActive(false)
    setDisplayedMessages([])
    setConversationIndex(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agent Studio</h1>
          <p className="text-muted-foreground">Configure and train your AI voice agent</p>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          onClick={() => setShowTryModal(true)}
        >
          <Sparkles className="w-4 h-4" />
          Try Voice Agent Now
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-sm text-muted-foreground">Agent Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">124</p>
                <p className="text-sm text-muted-foreground">Calls Handled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1:42</p>
                <p className="text-sm text-muted-foreground">Avg Call Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agent Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Agent Profile</CardTitle>
                <CardDescription>Customize your AI agent&apos;s personality</CardDescription>
              </div>
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input 
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Textarea 
                  value={agentGreeting}
                  onChange={(e) => setAgentGreeting(e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Voice Style</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Friendly", "Professional", "Casual", "Energetic"].map((voice) => (
                      <Badge 
                        key={voice}
                        variant={agentPersonality === voice.toLowerCase() ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => isEditing && setAgentPersonality(voice.toLowerCase())}
                      >
                        {voice}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">English</Badge>
                    <Badge variant="outline">Hindi</Badge>
                    <Badge variant="outline">Regional</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Agent Capabilities</Label>
                <div className="space-y-3">
                  {[
                    { label: "Book Appointments", enabled: true },
                    { label: "Answer FAQs", enabled: true },
                    { label: "Handle Cancellations", enabled: true },
                    { label: "Collect Customer Info", enabled: false },
                    { label: "Upsell Services", enabled: false }
                  ].map((capability, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{capability.label}</span>
                      <Switch defaultChecked={capability.enabled} disabled={!isEditing} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Services your agent can book</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/50 border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.duration} min • ₹{service.price}
                        </p>
                      </div>
                      <Switch defaultChecked disabled={!isEditing} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>How your agent will sound</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-violet-900">{agentName}</p>
                    <p className="text-sm text-violet-700 mt-1">{agentGreeting}</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2">
                <Play className="w-4 h-4" />
                Play Sample
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Status</CardTitle>
              <CardDescription>Agent learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Business Knowledge</span>
                  <span className="text-muted-foreground">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service Details</span>
                  <span className="text-muted-foreground">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>FAQ Responses</span>
                  <span className="text-muted-foreground">76%</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
              <Button variant="outline" className="w-full mt-4">
                Add Training Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Try Voice Agent Modal */}
      <Dialog open={showTryModal} onOpenChange={setShowTryModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Try Voice Agent
            </DialogTitle>
            <DialogDescription>
              Select a demo business to experience the AI agent in action
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!selectedDemoPersona ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 gap-4 py-4"
              >
                {demoPersonas.map((persona, index) => (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedDemoPersona(persona)}
                    className="p-4 rounded-xl border cursor-pointer hover:border-violet-300 hover:bg-violet-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center text-2xl`}>
                        {persona.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-violet-700 transition-colors">
                          {persona.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {persona.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedDemoPersona(null)
                      endDemoCall()
                    }}
                  >
                    ← Back to personas
                  </Button>
                  <Badge className={`bg-gradient-to-r ${selectedDemoPersona.color} text-white border-0`}>
                    {selectedDemoPersona.name}
                  </Badge>
                </div>

                {/* Call Interface */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                  {/* Call Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${selectedDemoPersona.color} flex items-center justify-center text-3xl mb-3`}>
                      {selectedDemoPersona.avatar}
                    </div>
                    <p className="text-lg font-medium">{selectedDemoPersona.name}</p>
                    <p className="text-sm text-slate-400">
                      {isCallActive ? "In Call..." : "Ready to connect"}
                    </p>
                  </div>

                  {/* Conversation Display */}
                  <div className="bg-slate-800/50 rounded-xl p-4 h-64 overflow-y-auto mb-6 space-y-3">
                    {!isCallActive && displayedMessages.length === 0 && (
                      <div className="h-full flex items-center justify-center text-slate-400 text-center">
                        <div>
                          <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Click the call button to start</p>
                        </div>
                      </div>
                    )}
                    {displayedMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${msg.speaker === "user" ? "justify-end" : ""}`}
                      >
                        {msg.speaker === "agent" && (
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedDemoPersona.color} flex items-center justify-center flex-shrink-0`}>
                            <Bot className="w-3 h-3" />
                          </div>
                        )}
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                          msg.speaker === "agent" 
                            ? "bg-slate-700" 
                            : "bg-violet-600"
                        }`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                    {isCallActive && conversationIndex >= mockConversation.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-4"
                      >
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          ✓ Appointment Booked Successfully
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Call Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600"
                      onClick={() => setIsMuted(!isMuted)}
                      disabled={!isCallActive}
                    >
                      {isMuted ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>

                    {!isCallActive ? (
                      <Button
                        size="icon"
                        className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600"
                        onClick={startDemoCall}
                      >
                        <Phone className="w-6 h-6" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                        onClick={endDemoCall}
                      >
                        <PhoneOff className="w-6 h-6" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600"
                      disabled={!isCallActive}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  )
}

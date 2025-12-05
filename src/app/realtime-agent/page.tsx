"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Send, 
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRealtimeAgent, type RealtimeAgentStatus } from '@/hooks/useVoiceAgent'

interface Message {
  id: string
  speaker: 'user' | 'agent'
  text: string
  timestamp: Date
  isFinal: boolean
}

interface Persona {
  id: string
  name: string
  type: string
  icon: string
  agentName: string
  greeting: string
  color: string
}

const PERSONAS: Persona[] = [
  {
    id: 'barber',
    name: "Raj's Premium Salon",
    type: 'Salon',
    icon: '✂️',
    agentName: 'Priya',
    greeting: 'Namaste! Raj Salon me aapka swagat hai. Main Priya hoon, aapki kya help kar sakti hoon?',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'dentist',
    name: 'Smile Dental Clinic',
    type: 'Clinic',
    icon: '🦷',
    agentName: 'Dr. Sharma',
    greeting: 'Hello! Thank you for calling Smile Dental Clinic. I am Dr. Sharma. How may I help you today?',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gym',
    name: 'FitZone Gym',
    type: 'Gym',
    icon: '💪',
    agentName: 'Coach Rahul',
    greeting: 'Hey! FitZone Gym mein welcome! Main Coach Rahul. Ready ho fitness journey start karne ke liye?',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'spa',
    name: 'Serenity Wellness Spa',
    type: 'Spa',
    icon: '🧘',
    agentName: 'Maya',
    greeting: 'Welcome to Serenity Spa. I am Maya. How may I help you relax today?',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'electrician',
    name: 'Quick Fix Electricals',
    type: 'Service',
    icon: '⚡',
    agentName: 'Ramesh',
    greeting: 'Hello! Quick Fix Electricals mein aapka swagat hai. Bijli ki koi problem hai?',
    color: 'from-yellow-500 to-orange-500'
  }
]

export default function RealtimeAgentPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [agentTranscript, setAgentTranscript] = useState('')
  const [userTranscript, setUserTranscript] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle transcript updates
  const handleTranscript = useCallback((text: string, speaker: 'user' | 'agent', isFinal: boolean) => {
    if (isFinal) {
      // Add final message
      setMessages(prev => {
        // Remove any existing non-final messages from this speaker
        const filtered = prev.filter(m => m.isFinal || m.speaker !== speaker)
        return [...filtered, {
          id: `msg_${Date.now()}`,
          speaker,
          text,
          timestamp: new Date(),
          isFinal: true
        }]
      })
      
      // Clear interim transcripts
      if (speaker === 'user') setUserTranscript('')
      else setAgentTranscript('')
    } else {
      // Update interim transcript
      if (speaker === 'agent') {
        setAgentTranscript(prev => prev + text)
      }
    }
  }, [])

  // Handle status changes
  const handleStatusChange = useCallback((status: RealtimeAgentStatus) => {
    console.log('Status:', status)
  }, [])

  // Handle errors
  const handleError = useCallback((error: string) => {
    console.error('Agent error:', error)
    alert(`Error: ${error}`)
  }, [])

  // Initialize the realtime agent hook
  const {
    status,
    isConnected,
    isMuted,
    currentTranscript,
    connect,
    disconnect,
    toggleMute,
    sendTextMessage,
    interrupt
  } = useRealtimeAgent({
    persona: selectedPersona?.id || 'barber',
    onTranscript: handleTranscript,
    onStatusChange: handleStatusChange,
    onError: handleError,
    onAudioLevel: setAudioLevel
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, agentTranscript, userTranscript])

  // Start call
  const startCall = async (persona: Persona) => {
    setSelectedPersona(persona)
    setMessages([])
    setAgentTranscript('')
    setUserTranscript('')
    
    // Small delay then connect
    setTimeout(() => {
      connect()
    }, 100)
  }

  // End call
  const endCall = useCallback(() => {
    disconnect()
    setSelectedPersona(null)
    setMessages([])
    setAgentTranscript('')
    setUserTranscript('')
  }, [disconnect])

  // Send text message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim() && isConnected) {
      sendTextMessage(inputText.trim())
      setInputText('')
    }
  }

  // Get status display
  const getStatusDisplay = () => {
    switch (status) {
      case 'connecting': return { text: '🔄 Connecting...', color: 'bg-yellow-500' }
      case 'connected': return { text: '✅ Connected', color: 'bg-green-500' }
      case 'listening': return { text: '🎤 Listening...', color: 'bg-emerald-500' }
      case 'processing': return { text: '🤔 Processing...', color: 'bg-amber-500' }
      case 'speaking': return { text: '🔊 Speaking...', color: 'bg-violet-500' }
      case 'error': return { text: '❌ Error', color: 'bg-red-500' }
      case 'disconnected': return { text: '📴 Disconnected', color: 'bg-gray-500' }
      default: return { text: '⏸️ Ready', color: 'bg-gray-400' }
    }
  }

  const statusInfo = getStatusDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Pallet</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Wifi className="w-3 h-3" />
              Real-Time Voice AI
            </Badge>
            <Link href="/setup">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedPersona ? (
            <motion.div
              key="persona-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Real-Time</span> Voice AI Agent
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Experience true real-time voice conversation powered by OpenAI's Realtime API with WebRTC
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Mic className="w-3 h-3" />
                    Instant Response
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Volume2 className="w-3 h-3" />
                    Natural Voice
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Wifi className="w-3 h-3" />
                    WebRTC
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PERSONAS.map((persona, index) => (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group"
                      onClick={() => startCall(persona)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${persona.color}`} />
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{persona.icon}</div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg">{persona.name}</h3>
                            <Badge variant="secondary">{persona.type}</Badge>
                            <p className="text-sm text-muted-foreground">Agent: {persona.agentName}</p>
                          </div>
                        </div>
                        <Button className={`w-full mt-4 gap-2 bg-gradient-to-r ${persona.color} hover:opacity-90 text-white`}>
                          <Phone className="w-4 h-4" />
                          Start Real-Time Call
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  🎯 This uses OpenAI's Realtime API for instant, natural conversation
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow microphone access when prompted • Works best in Chrome/Edge
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active-call"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              {/* Call Header */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPersona.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {selectedPersona.icon}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{selectedPersona.name}</h2>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className={cn(
                              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                              statusInfo.color
                            )} />
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", statusInfo.color)} />
                          </span>
                          <span className="text-sm text-muted-foreground">{statusInfo.text}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <Wifi className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-gray-400" />
                      )}
                      <Button variant="destructive" size="icon" onClick={endCall} className="rounded-full">
                        <PhoneOff className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Visualization */}
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    {/* Waveform visualization */}
                    <div className="flex items-center justify-center gap-1 h-16 mb-4">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const baseHeight = status === 'speaking' || status === 'listening' 
                          ? 8 + Math.sin(Date.now() / 100 + i) * 20 + audioLevel * 30
                          : 4
                        return (
                          <motion.div
                            key={i}
                            className={cn(
                              "w-1.5 rounded-full",
                              status === 'listening' ? "bg-emerald-500" :
                              status === 'speaking' ? "bg-violet-500" :
                              status === 'processing' ? "bg-amber-400" : "bg-gray-300"
                            )}
                            animate={{ 
                              height: status !== 'idle' && status !== 'disconnected' 
                                ? [baseHeight, baseHeight + 10, baseHeight] 
                                : 4 
                            }}
                            transition={{ 
                              duration: 0.3 + Math.random() * 0.2, 
                              repeat: status !== 'idle' && status !== 'disconnected' ? Infinity : 0,
                              delay: i * 0.02
                            }}
                          />
                        )
                      })}
                    </div>
                    
                    {/* Real-time transcription */}
                    <div className="w-full min-h-[60px] text-center">
                      {status === 'listening' && userTranscript && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-emerald-600 font-medium"
                        >
                          🎤 {userTranscript}
                        </motion.p>
                      )}
                      {status === 'speaking' && agentTranscript && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-violet-600 font-medium"
                        >
                          🤖 {agentTranscript}
                        </motion.p>
                      )}
                      {status === 'connecting' && (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                          <span className="text-muted-foreground">Connecting to AI...</span>
                        </div>
                      )}
                      {(status === 'connected' || status === 'listening') && !userTranscript && (
                        <p className="text-muted-foreground">Speak now - I'm listening...</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="mb-4">
                <CardContent className="p-4 h-[300px] overflow-y-auto">
                  <div className="space-y-4">
                    {messages.length === 0 && isConnected && (
                      <div className="text-center text-muted-foreground py-8">
                        <p>🎙️ Start speaking to begin the conversation</p>
                        <p className="text-sm mt-2">Or type a message below</p>
                      </div>
                    )}
                    
                    {messages.filter(m => m.isFinal).map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex", message.speaker === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn("flex items-start gap-2 max-w-[80%]", message.speaker === 'user' ? 'flex-row-reverse' : '')}>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={cn(
                              message.speaker === 'user' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : `bg-gradient-to-br ${selectedPersona.color} text-white text-sm`
                            )}>
                              {message.speaker === 'user' ? '👤' : selectedPersona.icon}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "rounded-2xl px-4 py-2",
                            message.speaker === 'user' 
                              ? 'bg-emerald-600 text-white rounded-tr-sm' 
                              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                          )}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Current agent response being streamed */}
                    {agentTranscript && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex items-start gap-2"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`bg-gradient-to-br ${selectedPersona.color} text-white text-sm`}>
                            {selectedPersona.icon}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2">
                          <p className="text-sm">{agentTranscript}</p>
                          <span className="inline-block w-1 h-4 bg-violet-500 animate-pulse ml-1" />
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
              </Card>

              {/* Input Area */}
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Button
                      type="button"
                      variant={isMuted ? "destructive" : "default"}
                      size="icon"
                      onClick={toggleMute}
                      className={cn(
                        "rounded-full shrink-0",
                        !isMuted && isConnected && "bg-emerald-500 hover:bg-emerald-600"
                      )}
                      disabled={!isConnected}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    
                    <Input
                      placeholder="Or type your message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1"
                      disabled={!isConnected}
                    />
                    
                    {status === 'speaking' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={interrupt}
                        className="rounded-full shrink-0"
                        title="Interrupt"
                      >
                        <VolumeX className="w-5 h-5" />
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputText.trim() || !isConnected}
                      className="rounded-full shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Book appointment tomorrow', 'What services do you offer?', 'Prices please', 'Available slots today'].map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          if (isConnected) sendTextMessage(prompt)
                        }}
                        disabled={!isConnected}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

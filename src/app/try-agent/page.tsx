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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  speaker: 'user' | 'agent'
  text: string
  audioUrl?: string
  timestamp: Date
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

type AgentState = 'idle' | 'listening' | 'processing' | 'speaking'

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

export default function TryAgentPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [transcript, setTranscript] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported')
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    return recognition
  }, [])

  // Browser TTS fallback
  const speakWithBrowserTTS = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setAgentState('idle')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-IN'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const indianVoice = voices.find(v => 
      v.lang.includes('en-IN') || v.lang.includes('hi-IN') || v.name.toLowerCase().includes('indian')
    )
    if (indianVoice) utterance.voice = indianVoice

    utterance.onend = () => {
      setAgentState('idle')
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.start() } catch (e) {}
      }
    }
    utterance.onerror = () => setAgentState('idle')
    window.speechSynthesis.speak(utterance)
  }, [isListening])

  // Speak text
  const speakText = useCallback(async (text: string, audioUrl?: string) => {
    if (!audioEnabled) {
      setAgentState('idle')
      return
    }

    setAgentState('speaking')

    if (audioUrl) {
      try {
        if (audioRef.current) audioRef.current.pause()
        audioRef.current = new Audio(audioUrl)
        audioRef.current.onended = () => {
          setAgentState('idle')
          if (isListening && recognitionRef.current) {
            try { recognitionRef.current.start() } catch (e) {}
          }
        }
        audioRef.current.onerror = () => speakWithBrowserTTS(text)
        await audioRef.current.play()
        return
      } catch (error) {
        console.error('Audio playback error:', error)
      }
    }
    speakWithBrowserTTS(text)
  }, [audioEnabled, isListening, speakWithBrowserTTS])

  // Send message to API
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !selectedPersona || agentState === 'processing') return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      speaker: 'user',
      text: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setTranscript('')
    setAgentState('processing')

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }

    try {
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          persona: selectedPersona.id,
          conversationHistory: messages.map(m => ({
            speaker: m.speaker,
            text: m.text
          }))
        })
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const agentMessage: Message = {
        id: `msg_${Date.now()}`,
        speaker: 'agent',
        text: data.response,
        audioUrl: data.audioUrl,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, agentMessage])
      await speakText(data.response, data.audioUrl)

    } catch (error: any) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        speaker: 'agent',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
      setAgentState('idle')
    }
  }, [selectedPersona, messages, agentState, speakText])

  // Start voice listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition()
    }

    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    // Clear any previous transcript
    setTranscript('')

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += text
        } else {
          interimTranscript += text
        }
      }

      // Always update transcript for real-time display
      const currentTranscript = interimTranscript || finalTranscript
      if (currentTranscript) {
        setTranscript(currentTranscript)
        console.log('🎤 Transcript:', currentTranscript, '| Final:', !!finalTranscript)
      }

      // Only send when we have final result
      if (finalTranscript && finalTranscript.trim()) {
        console.log('📤 Sending message:', finalTranscript)
        setTranscript('') // Clear after sending
        sendMessage(finalTranscript)
      }
    }

    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech recognition started')
      setAgentState('listening')
    }
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Recognition error:', event.error)
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.')
      } else if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...')
      } else if (event.error === 'network') {
        console.error('Network error with speech recognition')
      }
    }
    
    recognitionRef.current.onend = () => {
      console.log('🎤 Speech recognition ended, isListening:', isListening, 'agentState:', agentState)
      // Auto-restart if we should still be listening
      if (isListening && agentState !== 'speaking' && agentState !== 'processing') {
        setTimeout(() => {
          try { 
            recognitionRef.current?.start() 
            console.log('🎤 Restarted speech recognition')
          } catch (e) {
            console.log('Could not restart:', e)
          }
        }, 100)
      }
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      console.log('🎤 Started listening')
    } catch (error) {
      console.error('Failed to start recognition:', error)
    }
  }, [initSpeechRecognition, sendMessage, isListening, agentState])

  // Stop voice listening
  const stopListening = useCallback(() => {
    setIsListening(false)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
    setAgentState('idle')
    setTranscript('')
  }, [])

  // Start call with persona
  const startCall = async (persona: Persona) => {
    setSelectedPersona(persona)
    setIsCallActive(true)
    setMessages([])

    setTimeout(() => {
      const greetingMessage: Message = {
        id: `msg_${Date.now()}`,
        speaker: 'agent',
        text: persona.greeting,
        timestamp: new Date()
      }
      setMessages([greetingMessage])
      speakText(persona.greeting)
    }, 500)

    setTimeout(() => startListening(), 3000)
  }

  // End call
  const endCall = useCallback(() => {
    stopListening()
    window.speechSynthesis?.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsCallActive(false)
    setSelectedPersona(null)
    setMessages([])
    setInputText('')
    setTranscript('')
    setAgentState('idle')
  }, [stopListening])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false)
      startListening()
    } else {
      setIsMuted(true)
      stopListening()
    }
  }, [isMuted, startListening, stopListening])

  // Handle text input submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) sendMessage(inputText)
  }

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
      }
      window.speechSynthesis?.cancel()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

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
            <Badge variant="outline" className="gap-1 bg-violet-50 text-violet-700 border-violet-200">
              <Mic className="w-3 h-3" />
              Voice AI Demo
            </Badge>
            <Link href="/setup">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Configure Business
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isCallActive ? (
            <motion.div
              key="persona-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">
                  Try Our <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Voice AI Agent</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Choose a business persona and have a real voice conversation with our AI agent
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mic className="w-4 h-4" />
                  <span>Speak naturally in English or Hindi</span>
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
                            <p className="text-sm italic text-muted-foreground line-clamp-2">"{persona.greeting}"</p>
                          </div>
                        </div>
                        <Button className={`w-full mt-4 gap-2 bg-gradient-to-r ${persona.color} hover:opacity-90 text-white`}>
                          <Phone className="w-4 h-4" />
                          Start Voice Call
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">💡 Tips: Try booking an appointment, asking about prices, or inquiring about services</p>
                <p className="text-xs text-muted-foreground">Works best in Chrome or Edge browsers with microphone enabled</p>
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
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPersona?.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {selectedPersona?.icon}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{selectedPersona?.name}</h2>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className={cn(
                              "absolute inline-flex h-full w-full rounded-full opacity-75",
                              agentState === 'listening' ? "animate-ping bg-emerald-400" :
                              agentState === 'speaking' ? "animate-ping bg-violet-400" :
                              agentState === 'processing' ? "animate-ping bg-amber-400" : "bg-emerald-400"
                            )} />
                            <span className={cn(
                              "relative inline-flex rounded-full h-2 w-2",
                              agentState === 'listening' ? "bg-emerald-500" :
                              agentState === 'speaking' ? "bg-violet-500" :
                              agentState === 'processing' ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {agentState === 'listening' ? '🎤 Listening...' :
                             agentState === 'speaking' ? '🔊 Speaking...' :
                             agentState === 'processing' ? '🤔 Thinking...' :
                             `Connected • ${selectedPersona?.agentName}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="destructive" size="icon" onClick={endCall} className="rounded-full">
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="mb-4">
                <CardContent className="p-4 h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex", message.speaker === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn("flex items-start gap-2 max-w-[80%]", message.speaker === 'user' ? 'flex-row-reverse' : '')}>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={cn(
                              message.speaker === 'user' ? 'bg-violet-100 text-violet-700' : `bg-gradient-to-br ${selectedPersona?.color} text-white text-sm`
                            )}>
                              {message.speaker === 'user' ? 'U' : selectedPersona?.icon}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "rounded-2xl px-4 py-2",
                            message.speaker === 'user' ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                          )}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {agentState === 'processing' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`bg-gradient-to-br ${selectedPersona?.color} text-white text-sm`}>
                            {selectedPersona?.icon}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {transcript && agentState === 'listening' && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="flex justify-end"
                        key="transcript"
                      >
                        <div className="bg-violet-100 text-violet-700 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] border-2 border-violet-300">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            <p className="text-sm font-medium">{transcript}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
              </Card>

              {/* Voice Visualization */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-1 h-12">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "w-1 rounded-full",
                          agentState === 'listening' ? "bg-emerald-500" :
                          agentState === 'speaking' ? "bg-violet-500" :
                          agentState === 'processing' ? "bg-amber-400" : "bg-gray-300"
                        )}
                        animate={{ height: agentState !== 'idle' ? [8, 20 + Math.random() * 16, 8] : 8 }}
                        transition={{ duration: 0.4 + Math.random() * 0.2, repeat: agentState !== 'idle' ? Infinity : 0, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {agentState === 'listening' ? "🎤 Speak now - I'm listening..." :
                     agentState === 'speaking' ? `🔊 ${selectedPersona?.agentName} is speaking...` :
                     agentState === 'processing' ? '🤔 Processing your request...' :
                     '💬 Speak or type your message'}
                  </p>
                </CardContent>
              </Card>

              {/* Input Area */}
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Button
                      type="button"
                      variant={isMuted ? "destructive" : isListening ? "default" : "outline"}
                      size="icon"
                      onClick={toggleMute}
                      className={cn("rounded-full shrink-0", isListening && !isMuted && "bg-emerald-500 hover:bg-emerald-600")}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Input
                      placeholder="Or type your message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1"
                      disabled={agentState === 'processing'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className="rounded-full shrink-0"
                    >
                      {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputText.trim() || agentState === 'processing'}
                      className="rounded-full shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600"
                    >
                      {agentState === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Book an appointment for tomorrow', 'What services do you offer?', 'What are your prices?', 'Available slots today?'].map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => sendMessage(prompt)}
                        disabled={agentState === 'processing'}
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

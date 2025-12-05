"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
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

const PERSONAS: Persona[] = [
  {
    id: 'barber',
    name: "Raj's Premium Salon",
    type: 'Salon',
    icon: '✂️',
    agentName: 'Priya',
    greeting: 'Namaste! Raj Salon me aapka swagat hai.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'dentist',
    name: 'Smile Dental Clinic',
    type: 'Clinic',
    icon: '🦷',
    agentName: 'Dr. Sharma',
    greeting: 'Hello! Smile Dental Clinic here.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gym',
    name: 'FitZone Gym',
    type: 'Gym',
    icon: '💪',
    agentName: 'Coach Rahul',
    greeting: 'Hey! FitZone Gym mein welcome!',
    color: 'from-orange-500 to-amber-500'
  }
]

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export default function VoiceAgentPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [isMuted, setIsMuted] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserText, setCurrentUserText] = useState('')
  const [currentAgentText, setCurrentAgentText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentAgentText, currentUserText])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting...')
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
    }
    
    setConnectionState('disconnected')
    setIsAgentSpeaking(false)
    setIsUserSpeaking(false)
    setCurrentUserText('')
    setCurrentAgentText('')
  }, [])

  const connect = useCallback(async (persona: Persona) => {
    try {
      setError(null)
      setConnectionState('connecting')
      setSelectedPersona(persona)
      setMessages([])

      console.log('🎤 Requesting microphone access...')
      
      // Get microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      localStreamRef.current = stream
      console.log('✅ Microphone access granted')

      // Set up audio level monitoring
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256

      const monitorAudio = () => {
        if (!analyserRef.current) return
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(avg / 255)
        animationFrameRef.current = requestAnimationFrame(monitorAudio)
      }
      monitorAudio()

      console.log('🔑 Getting ephemeral token...')
      
      // Get ephemeral token from our API
      const tokenResponse = await fetch('/api/realtime/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: persona.id })
      })

      if (!tokenResponse.ok) {
        const err = await tokenResponse.text()
        console.error('Token response error:', err)
        throw new Error(`Token error: ${err}`)
      }

      const tokenData = await tokenResponse.json()
      const { client_secret, session_config } = tokenData
      console.log('✅ Got token response:', { 
        hasClientSecret: !!client_secret,
        hasConfig: !!session_config 
      })

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      peerConnectionRef.current = pc

      // Set up audio element for AI voice
      const audioEl = new Audio()
      audioEl.autoplay = true
      audioElementRef.current = audioEl

      // Handle incoming audio from AI
      pc.ontrack = (event) => {
        console.log('🔊 Received AI audio track')
        audioEl.srcObject = event.streams[0]
      }

      // Add local audio track
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events')
      dataChannelRef.current = dc

      dc.onopen = () => {
        console.log('📡 Data channel open, sending session config...')
        // Configure the session
        dc.send(JSON.stringify({
          type: 'session.update',
          session: session_config
        }))
      }

      dc.onmessage = (event) => {
        handleRealtimeEvent(JSON.parse(event.data))
      }

      dc.onerror = (err) => {
        console.error('Data channel error:', err)
      }

      // Create offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      console.log('📤 Sending SDP offer to OpenAI...')

      // Exchange SDP with OpenAI
      const tokenValue = client_secret?.value || client_secret
      console.log('🔑 Using token:', tokenValue?.substring?.(0, 20) + '...')
      
      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenValue}`,
            'Content-Type': 'application/sdp'
          },
          body: offer.sdp
        }
      )

      if (!sdpResponse.ok) {
        throw new Error(`SDP error: ${sdpResponse.status}`)
      }

      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      console.log('✅ WebRTC connected!')
      setConnectionState('connected')

    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect')
      setConnectionState('error')
      disconnect()
    }
  }, [disconnect])

  const handleRealtimeEvent = useCallback((event: any) => {
    console.log('📨 Event:', event.type)

    switch (event.type) {
      case 'session.created':
        console.log('✅ Session created')
        break

      case 'session.updated':
        console.log('✅ Session configured')
        break

      case 'input_audio_buffer.speech_started':
        console.log('🎤 User started speaking')
        setIsUserSpeaking(true)
        setCurrentUserText('')
        break

      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 User stopped speaking')
        setIsUserSpeaking(false)
        break

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          console.log('📝 User said:', event.transcript)
          setMessages(prev => [...prev, {
            id: `user_${Date.now()}`,
            role: 'user',
            text: event.transcript,
            timestamp: new Date()
          }])
          setCurrentUserText('')
        }
        break

      case 'response.audio_transcript.delta':
        if (event.delta) {
          setCurrentAgentText(prev => prev + event.delta)
          setIsAgentSpeaking(true)
        }
        break

      case 'response.audio_transcript.done':
        if (event.transcript) {
          console.log('🤖 Agent said:', event.transcript)
          setMessages(prev => [...prev, {
            id: `agent_${Date.now()}`,
            role: 'assistant',
            text: event.transcript,
            timestamp: new Date()
          }])
          setCurrentAgentText('')
        }
        break

      case 'response.audio.done':
        setIsAgentSpeaking(false)
        break

      case 'input_audio_buffer.committed':
        // Audio was committed for processing
        break

      case 'response.created':
      case 'response.output_item.added':
      case 'conversation.item.created':
      case 'response.content_part.added':
      case 'response.audio.delta':
        // These are normal flow events
        break

      case 'response.done':
        setIsAgentSpeaking(false)
        setCurrentAgentText('')
        break

      case 'error':
        console.error('❌ Realtime error:', event.error)
        setError(event.error?.message || 'Unknown error')
        break

      default:
        console.log('Unhandled event:', event.type)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }, [isMuted])

  const endCall = useCallback(() => {
    disconnect()
    setSelectedPersona(null)
    setMessages([])
    setError(null)
  }, [disconnect])

  // Render persona selection
  if (!selectedPersona) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Pallet Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Pallet</span>
              </div>
            </div>
            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Phone className="w-3 h-3" />
              Real-Time Voice Agent
            </Badge>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              Talk to <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">AI Voice Agent</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Real-time voice conversation with interruption support
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Powered by{" "}
              <a 
                href="https://murf.ai/falcon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-600 hover:text-violet-700 underline"
              >
                Murf Falcon
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((persona) => (
              <motion.div
                key={persona.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all overflow-hidden"
                  onClick={() => connect(persona)}
                >
                  <div className={`h-2 bg-gradient-to-r ${persona.color}`} />
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{persona.icon}</div>
                    <h3 className="font-bold text-lg">{persona.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{persona.type}</p>
                    <p className="text-sm text-muted-foreground">Agent: {persona.agentName}</p>
                    <Button className={`w-full mt-4 bg-gradient-to-r ${persona.color} text-white`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Start Call
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            🎤 Make sure to allow microphone access • Works best in Chrome
          </p>
        </main>
      </div>
    )
  }

  // Render active call
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Call Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${selectedPersona.color} flex items-center justify-center text-5xl mb-4 shadow-2xl`}
          >
            {selectedPersona.icon}
          </motion.div>
          <h2 className="text-2xl font-bold">{selectedPersona.name}</h2>
          <p className="text-gray-400">{selectedPersona.agentName}</p>
          
          {/* Connection Status */}
          <div className="mt-4">
            {connectionState === 'connecting' && (
              <Badge className="bg-yellow-600">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Connecting...
              </Badge>
            )}
            {connectionState === 'connected' && (
              <Badge className="bg-emerald-600">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                Connected
              </Badge>
            )}
            {connectionState === 'error' && (
              <Badge className="bg-red-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-200">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => connect(selectedPersona)}>
              Retry
            </Button>
          </div>
        )}

        {/* Audio Visualization */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-1 h-20">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-1.5 rounded-full",
                    isAgentSpeaking ? "bg-violet-500" :
                    isUserSpeaking ? "bg-emerald-500" :
                    connectionState === 'connected' ? "bg-gray-600" : "bg-gray-700"
                  )}
                  animate={{
                    height: (isAgentSpeaking || isUserSpeaking) 
                      ? [8, 20 + Math.random() * 40, 8]
                      : connectionState === 'connected' 
                        ? [4, 8 + audioLevel * 30, 4]
                        : 4
                  }}
                  transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    delay: i * 0.02
                  }}
                />
              ))}
            </div>
            
            {/* Status Text */}
            <p className="text-center mt-4 text-gray-300">
              {connectionState === 'connecting' && '🔄 Setting up connection...'}
              {connectionState === 'connected' && isAgentSpeaking && `🔊 ${selectedPersona.agentName} is speaking...`}
              {connectionState === 'connected' && isUserSpeaking && '🎤 Listening to you...'}
              {connectionState === 'connected' && !isAgentSpeaking && !isUserSpeaking && '🎤 Speak now - I\'m listening'}
              {connectionState === 'error' && '❌ Connection failed'}
            </p>

            {/* Live Transcription */}
            {currentAgentText && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-violet-900/30 rounded-lg"
              >
                <p className="text-violet-200 text-sm">
                  <span className="font-semibold">{selectedPersona.agentName}:</span> {currentAgentText}
                  <span className="inline-block w-1 h-4 bg-violet-400 ml-1 animate-pulse" />
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Messages History */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardContent className="p-4 h-[250px] overflow-y-auto">
            {messages.length === 0 && connectionState === 'connected' && (
              <div className="text-center text-gray-500 py-8">
                <p>🎙️ Start speaking to begin</p>
                <p className="text-sm mt-1">The agent can hear you now</p>
              </div>
            )}
            
            <div className="space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-gray-700 text-gray-100 rounded-tl-sm'
                  )}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "rounded-full w-16 h-16 border-2",
              isMuted 
                ? "bg-red-600 border-red-500 hover:bg-red-700" 
                : "bg-gray-700 border-gray-600 hover:bg-gray-600"
            )}
            onClick={toggleMute}
            disabled={connectionState !== 'connected'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-20 h-20 bg-red-600 hover:bg-red-700"
            onClick={endCall}
          >
            <PhoneOff className="w-8 h-8" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 bg-gray-700 border-gray-600 hover:bg-gray-600"
            disabled
          >
            <Volume2 className="w-6 h-6" />
          </Button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          💡 Just speak naturally - the AI will respond in real-time
        </p>
        <p className="text-center text-xs text-gray-500 mt-2">
          Powered by{" "}
          <a 
            href="https://murf.ai/falcon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Murf Falcon
          </a>
        </p>
      </div>
    </div>
  )
}

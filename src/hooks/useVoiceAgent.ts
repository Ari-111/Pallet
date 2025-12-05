"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseRealtimeAgentProps {
  persona: string
  onTranscript?: (text: string, speaker: 'user' | 'agent', isFinal: boolean) => void
  onStatusChange?: (status: RealtimeAgentStatus) => void
  onError?: (error: string) => void
  onAudioLevel?: (level: number) => void
}

export type RealtimeAgentStatus = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'listening' 
  | 'processing' 
  | 'speaking'
  | 'error'
  | 'disconnected'

export function useRealtimeAgent({
  persona,
  onTranscript,
  onStatusChange,
  onError,
  onAudioLevel
}: UseRealtimeAgentProps) {
  const [status, setStatus] = useState<RealtimeAgentStatus>('idle')
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const updateStatus = useCallback((newStatus: RealtimeAgentStatus) => {
    setStatus(newStatus)
    onStatusChange?.(newStatus)
  }, [onStatusChange])

  // Handle data channel messages from OpenAI
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      console.log('📨 Realtime event:', data.type)

      switch (data.type) {
        case 'session.created':
          console.log('✅ Session created')
          updateStatus('connected')
          break

        case 'session.updated':
          console.log('✅ Session configured')
          updateStatus('listening')
          break

        case 'input_audio_buffer.speech_started':
          console.log('🎤 Speech started')
          updateStatus('listening')
          break

        case 'input_audio_buffer.speech_stopped':
          console.log('🎤 Speech stopped')
          updateStatus('processing')
          break

        case 'conversation.item.input_audio_transcription.completed':
          if (data.transcript) {
            console.log('📝 User said:', data.transcript)
            setCurrentTranscript('')
            onTranscript?.(data.transcript, 'user', true)
          }
          break

        case 'response.audio_transcript.delta':
          if (data.delta) {
            setCurrentTranscript(prev => prev + data.delta)
            onTranscript?.(data.delta, 'agent', false)
          }
          break

        case 'response.audio_transcript.done':
          if (data.transcript) {
            console.log('🤖 Agent said:', data.transcript)
            setCurrentTranscript('')
            onTranscript?.(data.transcript, 'agent', true)
          }
          break

        case 'response.audio.started':
          updateStatus('speaking')
          break

        case 'response.audio.done':
          // Audio finished, will go back to listening
          break

        case 'response.done':
          console.log('✅ Response complete')
          updateStatus('listening')
          break

        case 'response.function_call_arguments.done':
          handleFunctionCall(data.call_id, data.name, data.arguments)
          break

        case 'error':
          console.error('❌ Realtime error:', data.error)
          onError?.(data.error?.message || 'Unknown error')
          break
      }
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  }, [onTranscript, onError, updateStatus])

  // Handle function calls from the AI
  const handleFunctionCall = useCallback(async (callId: string, name: string, argsJson: string) => {
    console.log('🔧 Function call:', name, argsJson)
    
    try {
      const args = JSON.parse(argsJson)
      
      // Call our backend to execute the function
      const response = await fetch('/api/realtime/function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, functionName: name, functionArgs: args })
      })
      
      const { result } = await response.json()
      
      // Send function result back via data channel
      if (dataChannelRef.current?.readyState === 'open') {
        dataChannelRef.current.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(result)
          }
        }))
        
        // Request AI to continue response
        dataChannelRef.current.send(JSON.stringify({
          type: 'response.create'
        }))
      }
    } catch (error) {
      console.error('Function execution error:', error)
    }
  }, [persona])

  // Connect using WebRTC (OpenAI Realtime API)
  const connect = useCallback(async () => {
    try {
      updateStatus('connecting')

      // Get ephemeral token from our backend
      const tokenResponse = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona })
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token')
      }

      const { client_secret, session_config } = await tokenResponse.json()

      // Create peer connection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Create audio element for AI voice output
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioElementRef.current = audioEl

      // Handle incoming audio track (AI voice)
      pc.ontrack = (event) => {
        console.log('🔊 Received audio track')
        audioEl.srcObject = event.streams[0]
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        }
      })
      mediaStreamRef.current = stream

      // Add microphone track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Set up audio level monitoring
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256

      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkAudioLevel = () => {
        if (analyserRef.current && status !== 'idle' && status !== 'disconnected') {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          onAudioLevel?.(average / 255)
          requestAnimationFrame(checkAudioLevel)
        }
      }
      checkAudioLevel()

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events')
      dataChannelRef.current = dc

      dc.onopen = () => {
        console.log('📡 Data channel open')
        // Send session configuration
        dc.send(JSON.stringify({
          type: 'session.update',
          session: session_config
        }))
      }

      dc.onmessage = handleDataChannelMessage

      // Create and set local offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Send offer to OpenAI and get answer
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client_secret.value}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      })

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`)
      }

      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsConnected(true)
      console.log('✅ WebRTC connected!')

    } catch (error: any) {
      console.error('Connection error:', error)
      onError?.(error.message || 'Failed to connect')
      updateStatus('error')
    }
  }, [persona, handleDataChannelMessage, onError, onAudioLevel, updateStatus, status])

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting...')
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
      audioElementRef.current = null
    }
    
    setIsConnected(false)
    setCurrentTranscript('')
    updateStatus('idle')
  }, [updateStatus])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }, [isMuted])

  // Send text message (for hybrid mode)
  const sendTextMessage = useCallback((text: string) => {
    if (dataChannelRef.current?.readyState !== 'open') return

    dataChannelRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }))

    dataChannelRef.current.send(JSON.stringify({
      type: 'response.create'
    }))

    onTranscript?.(text, 'user', true)
  }, [onTranscript])

  // Interrupt AI response
  const interrupt = useCallback(() => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({
        type: 'response.cancel'
      }))
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    status,
    isConnected,
    isMuted,
    currentTranscript,
    connect,
    disconnect,
    toggleMute,
    sendTextMessage,
    interrupt
  }
}

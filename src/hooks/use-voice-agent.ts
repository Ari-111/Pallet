// Voice Agent Hook - Handles voice input/output with OpenAI and Murf TTS
"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

export interface VoiceMessage {
  id: string
  speaker: 'user' | 'agent'
  text: string
  audioUrl?: string
  timestamp: Date
}

export interface UseVoiceAgentOptions {
  persona: string
  onMessage?: (message: VoiceMessage) => void
  onError?: (error: string) => void
  onStateChange?: (state: VoiceAgentState) => void
}

export type VoiceAgentState = 'idle' | 'listening' | 'processing' | 'speaking'

export function useVoiceAgent(options: UseVoiceAgentOptions) {
  const { persona, onMessage, onError, onStateChange } = options
  
  const [state, setState] = useState<VoiceAgentState>('idle')
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [transcript, setTranscript] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioQueueRef = useRef<HTMLAudioElement[]>([])
  const isPlayingRef = useRef(false)

  // Update state with callback
  const updateState = useCallback((newState: VoiceAgentState) => {
    setState(newState)
    onStateChange?.(newState)
  }, [onStateChange])

  // Add message to conversation
  const addMessage = useCallback((message: Omit<VoiceMessage, 'id' | 'timestamp'>) => {
    const fullMessage: VoiceMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, fullMessage])
    onMessage?.(fullMessage)
    return fullMessage
  }, [onMessage])

  // Play audio from URL or base64
  const playAudio = useCallback(async (audioData: string) => {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(audioData)
      audioQueueRef.current.push(audio)
      
      audio.onended = () => {
        const index = audioQueueRef.current.indexOf(audio)
        if (index > -1) audioQueueRef.current.splice(index, 1)
        if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false
          updateState('idle')
        }
        resolve()
      }
      
      audio.onerror = () => {
        reject(new Error('Audio playback failed'))
      }
      
      isPlayingRef.current = true
      updateState('speaking')
      audio.play().catch(reject)
    })
  }, [updateState])

  // Use browser's built-in TTS as fallback
  const speakWithBrowserTTS = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-IN'
      utterance.rate = 1.0
      utterance.pitch = 1.0

      // Find Indian voice if available
      const voices = window.speechSynthesis.getVoices()
      const indianVoice = voices.find(v => 
        v.lang.includes('IN') || v.lang.includes('en-GB') || v.name.includes('Indian')
      )
      if (indianVoice) {
        utterance.voice = indianVoice
      }

      utterance.onstart = () => updateState('speaking')
      utterance.onend = () => {
        updateState('idle')
        resolve()
      }
      utterance.onerror = () => {
        updateState('idle')
        reject(new Error('Speech failed'))
      }

      window.speechSynthesis.speak(utterance)
    })
  }, [updateState])

  // Send message to API and get response with TTS
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Add user message
    addMessage({ speaker: 'user', text: text.trim() })
    updateState('processing')

    try {
      // Call chat API
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          persona,
          conversationHistory: messages.map(m => ({
            speaker: m.speaker,
            text: m.text
          }))
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add agent response
      const agentMessage = addMessage({
        speaker: 'agent',
        text: data.response,
        audioUrl: data.audioUrl
      })

      // Play audio response
      if (data.audioUrl) {
        await playAudio(data.audioUrl)
      } else {
        // Fallback to browser TTS
        await speakWithBrowserTTS(data.response)
      }

    } catch (error: any) {
      console.error('Voice agent error:', error)
      onError?.(error.message || 'Failed to process message')
      updateState('idle')
    }
  }, [persona, messages, addMessage, updateState, playAudio, speakWithBrowserTTS, onError])

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
    recognition.lang = 'en-IN' // Support Hindi-English mix

    recognition.onstart = () => {
      updateState('listening')
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(interimTranscript || finalTranscript)

      if (finalTranscript) {
        sendMessage(finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        onError?.(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      // Restart if still connected
      if (isConnected && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          // Ignore errors when restarting
        }
      } else {
        updateState('idle')
      }
    }

    return recognition
  }, [updateState, sendMessage, isConnected, onError])

  // Start voice session
  const startListening = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Initialize audio context
      audioContextRef.current = new AudioContext()

      // Initialize speech recognition
      recognitionRef.current = initSpeechRecognition()
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      setIsConnected(true)
      updateState('listening')

    } catch (error: any) {
      console.error('Failed to start listening:', error)
      onError?.(error.message || 'Failed to access microphone')
    }
  }, [initSpeechRecognition, updateState, onError])

  // Stop voice session
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      recognitionRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop any playing audio
    window.speechSynthesis?.cancel()
    audioQueueRef.current.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    audioQueueRef.current = []

    setIsConnected(false)
    setTranscript('')
    updateState('idle')
  }, [updateState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Voices are loaded asynchronously
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
      window.speechSynthesis.getVoices()
    }
  }, [])

  return {
    state,
    isConnected,
    messages,
    transcript,
    startListening,
    stopListening,
    sendMessage,
    addMessage,
    clearMessages: () => setMessages([])
  }
}

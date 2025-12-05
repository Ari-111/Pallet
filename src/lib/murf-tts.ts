// Murf Falcon TTS API Integration
// Converts AI text responses to natural Indian-accented speech

export interface MurfVoice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female'
  accent: string
}

// Indian voices available in Murf
export const MURF_VOICES: Record<string, MurfVoice> = {
  'priya': {
    id: 'en-IN-priya',
    name: 'Priya',
    language: 'en-IN',
    gender: 'female',
    accent: 'Indian English'
  },
  'arjun': {
    id: 'en-IN-arjun', 
    name: 'Arjun',
    language: 'en-IN',
    gender: 'male',
    accent: 'Indian English'
  },
  'ananya': {
    id: 'hi-IN-ananya',
    name: 'Ananya',
    language: 'hi-IN',
    gender: 'female',
    accent: 'Hindi'
  },
  'rahul': {
    id: 'hi-IN-rahul',
    name: 'Rahul',
    language: 'hi-IN',
    gender: 'male',
    accent: 'Hindi'
  }
}

export interface MurfTTSOptions {
  text: string
  voiceId?: string
  speed?: number // 0.5 to 2.0
  pitch?: number // -20 to 20
  format?: 'mp3' | 'wav'
  sampleRate?: number
}

export interface MurfResponse {
  audioUrl?: string
  audioBuffer?: ArrayBuffer
  duration?: number
  error?: string
}

// Generate speech using Murf API
export async function generateSpeech(options: MurfTTSOptions): Promise<MurfResponse> {
  const {
    text,
    voiceId = 'en-IN-priya',
    speed = 1.0,
    pitch = 0,
    format = 'wav',
    sampleRate = 24000
  } = options

  const apiKey = process.env.MURF_API_KEY
  if (!apiKey) {
    console.error('MURF_API_KEY not configured')
    return { error: 'TTS not configured' }
  }

  try {
    // Murf Falcon API endpoint
    const response = await fetch('https://api.murf.ai/v1/speech/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        text,
        voiceId,
        style: 'Conversational',
        speed,
        pitch,
        format,
        sampleRate,
        channelType: 'MONO'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Murf API error:', error)
      return { error: 'TTS generation failed' }
    }

    const data = await response.json()
    
    return {
      audioUrl: data.audioFile,
      duration: data.audioDuration
    }
  } catch (error) {
    console.error('Murf TTS error:', error)
    return { error: 'TTS service unavailable' }
  }
}

// Stream audio from Murf (for real-time playback)
export async function streamSpeech(options: MurfTTSOptions): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.MURF_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch('https://api.murf.ai/v1/speech/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        text: options.text,
        voiceId: options.voiceId || 'en-IN-priya',
        style: 'Conversational',
        speed: options.speed || 1.0,
        format: 'wav',
        sampleRate: 24000
      })
    })

    if (!response.ok || !response.body) {
      return null
    }

    return response.body
  } catch (error) {
    console.error('Murf stream error:', error)
    return null
  }
}

// Select appropriate voice based on language/persona
export function selectVoice(language: string, gender: 'male' | 'female' = 'female'): string {
  if (language === 'hi' || language === 'hi-IN') {
    return gender === 'female' ? MURF_VOICES.ananya.id : MURF_VOICES.rahul.id
  }
  // Default to Indian English
  return gender === 'female' ? MURF_VOICES.priya.id : MURF_VOICES.arjun.id
}

// Fallback: Use Web Speech API for browsers that support it
export function useBrowserTTS(text: string, lang: string = 'en-IN'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Speech synthesis not available'))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 1.0
    utterance.pitch = 1.0
    
    // Try to find an Indian English voice
    const voices = window.speechSynthesis.getVoices()
    const indianVoice = voices.find(v => v.lang.includes('IN')) || voices[0]
    if (indianVoice) {
      utterance.voice = indianVoice
    }

    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)

    window.speechSynthesis.speak(utterance)
  })
}

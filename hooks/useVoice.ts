'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

type SRResult = { isFinal: boolean; [j: number]: { transcript: string } }
type SpeechRecognitionType = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  onresult: ((e: { resultIndex: number; results: { [i: number]: SRResult; length: number } }) => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType
    webkitSpeechRecognition: new () => SpeechRecognitionType
  }
}

const STORAGE_KEY = 'fluf-voice-uri'

export function useVoice(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking,  setIsSpeaking]  = useState(false)
  const [supported,   setSupported]   = useState(false)
  const [selectedURI, setSelectedURI] = useState<string>('')

  const recogRef     = useRef<SpeechRecognitionType | null>(null)
  const wantListening = useRef(false)   // true while user wants mic on

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(!!SR && 'speechSynthesis' in window)
    setSelectedURI(localStorage.getItem(STORAGE_KEY) ?? '')
  }, [])

  const changeVoice = useCallback((uri: string) => {
    setSelectedURI(uri)
    localStorage.setItem(STORAGE_KEY, uri)
  }, [])

  // Build and start a recognition instance
  const createAndStart = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR || !wantListening.current) return

    const rec = new SR()
    rec.lang = 'es-ES'
    rec.continuous = true       // keep going
    rec.interimResults = false  // only fire on complete phrases
    rec.maxAlternatives = 1
    recogRef.current = rec

    rec.onstart = () => setIsListening(true)

    rec.onresult = (e) => {
      let text = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript + ' '
      }
      if (text.trim()) onTranscript(text.trim())
    }

    // Browser killed the session — restart automatically if user still wants mic on
    rec.onend = () => {
      if (wantListening.current) {
        setTimeout(createAndStart, 150)
      } else {
        setIsListening(false)
      }
    }

    // 'no-speech' is normal during pauses — just restart
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'audio-capture') {
        // onend will fire after this and restart
        return
      }
      // Real error — stop
      wantListening.current = false
      setIsListening(false)
    }

    try { rec.start() } catch { /* already started */ }
  }, [onTranscript])

  const startListening = useCallback(() => {
    window.speechSynthesis.cancel()
    wantListening.current = true
    createAndStart()
  }, [createAndStart])

  const stopListening = useCallback(() => {
    wantListening.current = false
    recogRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const clean = text
      .replace(/📝\s*\*\*Nota rápida\*\*[\s\S]*/g, '')
      .replace(/[*_`#~>|]/g, '')
      .replace(/❌|✅/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()
    if (!clean) return

    const utter = new SpeechSynthesisUtterance(clean)
    utter.rate  = 0.95
    utter.pitch = 1.05

    const voices = window.speechSynthesis.getVoices()
    const saved  = localStorage.getItem(STORAGE_KEY)
    const picked = saved
      ? voices.find(v => v.voiceURI === saved)
      : voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('female'))
        ?? voices.find(v => v.lang.startsWith('es'))

    if (picked) { utter.voice = picked; utter.lang = picked.lang }
    else utter.lang = 'es-ES'

    utter.onstart = () => setIsSpeaking(true)
    utter.onend   = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utter)
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    isListening, isSpeaking, supported,
    selectedVoiceURI: selectedURI,
    changeVoice,
    startListening, stopListening, speak, stopSpeaking,
  }
}

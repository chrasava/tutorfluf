'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import ChatMessage, { Message } from '@/components/ChatMessage'
import VoiceButton from '@/components/VoiceButton'
import CommandBar from '@/components/CommandBar'
import VoicePicker from '@/components/VoicePicker'
import FennecFox, { FennecState } from '@/components/FennecFox'
import { useVoice } from '@/hooks/useVoice'
import { SessionHistory } from '@/lib/session'

// ─── 3D rotating cube (CSS preserve-3d) ───
function Cube3D({ size, color, top, left, right, bottom, duration, delay }: {
  size: number; color: string; top?: string; left?: string; right?: string; bottom?: string
  duration?: number; delay?: number
}) {
  const half = size / 2
  const faces: { cls: string; tf: string }[] = [
    { cls: 'front',  tf: `translateZ(${half}px)` },
    { cls: 'back',   tf: `rotateY(180deg) translateZ(${half}px)` },
    { cls: 'left',   tf: `rotateY(-90deg) translateZ(${half}px)` },
    { cls: 'right',  tf: `rotateY(90deg) translateZ(${half}px)` },
    { cls: 'top',    tf: `rotateX(90deg) translateZ(${half}px)` },
    { cls: 'bottom', tf: `rotateX(-90deg) translateZ(${half}px)` },
  ]
  return (
    <div
      className="cube-3d"
      style={{
        width: size, height: size,
        top, left, right, bottom,
        animationDuration: `${duration ?? 10}s`,
        animationDelay: `${delay ?? 0}s`,
        opacity: 0.18,
      }}
    >
      {faces.map(f => (
        <div
          key={f.cls}
          className="cube-face"
          style={{
            width: size, height: size,
            border: `1px solid ${color}55`,
            background: `${color}08`,
            transform: f.tf,
          }}
        />
      ))}
    </div>
  )
}

// ─── Tilt-on-hover card for Fluf hero ───
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    el.style.transform = `perspective(700px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg) scale3d(1.04,1.04,1.04)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`tilt-card ${className}`}>
      {children}
    </div>
  )
}

const WELCOME = `¡Hola! Soy **Fluf**, tu tutora de español. 🎙️

Puedes hablar conmigo sobre cualquier cosa — tu día, viajes, películas, trabajo, lo que quieras.

**¿De qué te apetece hablar hoy?**`

const FLOAT_TAGS = [
  { text: '¡Muy bien!',    pos: { top: '12%', left: '2%' },  rot: '-6deg',  color: '#93F091', bg: 'rgba(147,240,145,0.1)',  anim: 'animate-[float_5s_ease-in-out_infinite]' },
  { text: 'Subjuntivo',    pos: { top: '22%', right: '2%' }, rot: '5deg',   color: '#CC91F0', bg: 'rgba(204,145,240,0.1)',  anim: 'animate-[float_7s_ease-in-out_infinite]' },
  { text: 'Ser vs Estar',  pos: { top: '55%', left: '1%' },  rot: '3deg',   color: '#FFB500', bg: 'rgba(255,181,0,0.1)',    anim: 'animate-[float_6s_ease-in-out_infinite]' },
  { text: 'Pretérito',     pos: { top: '68%', right: '2%' }, rot: '-4deg',  color: '#FF87A6', bg: 'rgba(255,135,166,0.1)',  anim: 'animate-[float_8s_ease-in-out_infinite]' },
  { text: '¡Vamos!',       pos: { top: '38%', right: '1%' }, rot: '7deg',   color: '#FF702B', bg: 'rgba(255,112,43,0.1)',   anim: 'animate-[float_4.5s_ease-in-out_infinite]' },
  { text: 'Vocabulario',   pos: { top: '42%', left: '1%' },  rot: '-8deg',  color: '#FF87A6', bg: 'rgba(255,135,166,0.1)',  anim: 'animate-[float_5.5s_ease-in-out_infinite]' },
]

function genId() { return Math.random().toString(36).slice(2) }
type Mode = 'normal' | 'immersion' | 'free'

export default function Home() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [level, setLevel]         = useState('B1')
  const [mode, setMode]           = useState<Mode>('normal')
  const [modeLabel, setModeLabel] = useState<string | null>(null)
  const [apiMsgs, setApiMsgs]     = useState<{ role: string; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const handleTranscript = useCallback((text: string) => {
    setInput(p => p ? p + ' ' + text : text)
    inputRef.current?.focus()
  }, [])

  const { isListening, isSpeaking, supported, selectedVoiceURI, changeVoice, startListening, stopListening, speak, stopSpeaking } =
    useVoice(handleTranscript)

  const mascotState: FennecState = isListening ? 'listening' : isSpeaking ? 'speaking' : isLoading ? 'thinking' : 'idle'

  // Load session
  useEffect(() => {
    async function init() {
      try {
        const res  = await fetch('/api/session')
        const hist: SessionHistory = await res.json()
        const last = hist.sessions[hist.sessions.length - 1]
        const welcome = last
          ? `¡Hola de nuevo! La última vez hablamos sobre **${last.topics.join(', ') || 'varios temas'}**. ¿Seguimos o prefieres algo nuevo?`
          : WELCOME
        if (last) setLevel(last.level_estimate || 'B1')
        const msg: Message = { id: genId(), role: 'assistant', content: welcome }
        setMessages([msg])
        setApiMsgs([{ role: 'assistant', content: welcome }])
      } catch {
        const msg: Message = { id: genId(), role: 'assistant', content: WELCOME }
        setMessages([msg])
        setApiMsgs([{ role: 'assistant', content: WELCOME }])
      }
    }
    init()
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    stopSpeaking()

    const userMsg: Message = { id: genId(), role: 'user', content: text.trim() }
    const newApi = [...apiMsgs, { role: 'user', content: text.trim() }]
    setMessages(p => [...p, userMsg])
    setApiMsgs(newApi)
    setInput('')
    setIsLoading(true)

    const cmd = text.trim().toLowerCase()
    if (cmd.startsWith('/level ')) {
      const lvl = text.trim().split(' ')[1]?.toUpperCase()
      if (['A1','A2','B1','B2','C1','C2'].includes(lvl)) setLevel(lvl)
    }
    if (cmd === '/immersion')        { setMode('immersion'); setModeLabel('Immersion 🇪🇸') }
    else if (cmd === '/free')        { setMode('free');      setModeLabel('Free talk') }
    else if (cmd === '/normal' || cmd === '/recap') { setMode('normal'); setModeLabel(null) }

    const aid = genId()
    setMessages(p => [...p, { id: aid, role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApi, level, mode }),
      })
      if (!res.body) throw new Error('No body')
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value, { stream: true })
        const snap = full
        setMessages(p => p.map(m => m.id === aid ? { ...m, content: snap } : m))
      }
      setMessages(p => p.map(m => m.id === aid ? { ...m, content: full, streaming: false } : m))
      setApiMsgs(p => [...p, { role: 'assistant', content: full }])
      speak(full)
    } catch (err) {
      console.error(err)
      setMessages(p => p.map(m => m.id === aid
        ? { ...m, content: 'Lo siento, hubo un error. ¿Puedes intentar de nuevo?', streaming: false }
        : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, apiMsgs, level, mode, speak, stopSpeaking])

  const handleCommand = useCallback((cmd: string) => {
    setInput(cmd)
    setTimeout(() => sendMessage(cmd), 50)
  }, [sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const showHero = messages.length <= 1 && !isLoading

  const statusText =
    mascotState === 'listening' ? 'Escuchando…'
    : mascotState === 'speaking' ? 'Hablando…'
    : mascotState === 'thinking' ? 'Pensando…'
    : 'Tu tutora de español'

  const statusColor =
    mascotState === 'listening' ? '#CC91F0'
    : mascotState === 'speaking' ? '#FFB500'
    : mascotState === 'thinking' ? '#FF87A6'
    : 'rgba(255,255,255,0.38)'

  return (
    <div className="h-full flex flex-col" style={{ background: '#06040d', fontFamily: 'var(--font-inter)' }}>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="orb w-[600px] h-[600px] bg-[#CC91F0] opacity-[0.06]" style={{ top:'-15%', left:'-10%', animationDuration:'18s' }} />
        <div className="orb w-[500px] h-[500px] bg-[#FF87A6] opacity-[0.05]" style={{ top:'50%', right:'-8%', animationDuration:'14s', animationDelay:'6s' }} />
        <div className="orb w-[400px] h-[400px] bg-[#93F091] opacity-[0.04]" style={{ bottom:'-10%', left:'30%', animationDuration:'20s', animationDelay:'3s' }} />

        {/* 3D cubes */}
        <Cube3D size={44} color="#CC91F0" top="8%"  left="7%"  duration={9}  delay={0} />
        <Cube3D size={30} color="#FF87A6" top="20%" right="8%" duration={12} delay={2} />
        <Cube3D size={52} color="#93F091" top="60%" left="4%"  duration={15} delay={1} />
        <Cube3D size={36} color="#FFB500" top="70%" right="5%" duration={11} delay={4} />
        <Cube3D size={24} color="#CC91F0" top="45%" left="45%" duration={8}  delay={0} />

        {/* Floating grammar tags */}
        {FLOAT_TAGS.map((t, i) => (
          <span
            key={i}
            style={{ ...t.pos, rotate: t.rot, color: t.color, background: t.bg, border: `1px solid ${t.color}30` }}
            className={`absolute text-[11px] font-semibold px-3 py-1.5 rounded-full opacity-50 ${t.anim}`}
          >
            {t.text}
          </span>
        ))}
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-3 glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <FennecFox size={44} state={mascotState} />
          <div>
            <h1 className="font-display font-black text-xl leading-none tracking-tight gradient-text">Fluf</h1>
            <p className="text-[10px] mt-0.5 transition-colors duration-300" style={{ color: statusColor }}>
              {statusText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {supported && (
            <VoicePicker selectedVoiceURI={selectedVoiceURI} onChange={changeVoice} />
          )}
          {modeLabel && (
            <span className="text-[11px] px-2.5 py-1 rounded-full glass border-white/10 text-[#93F091] font-medium">
              {modeLabel}
            </span>
          )}
          {isLoading && (
            <div className="flex gap-1 items-center px-2">
              {[0,150,300].map(d => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#CC91F0]"
                  style={{ animation: `blink 1.2s ${d}ms step-end infinite` }} />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Command bar ── */}
      <div className="relative z-10 px-5 py-2 border-b border-white/5" style={{ background: 'rgba(6,4,13,0.5)', backdropFilter: 'blur(16px)' }}>
        <CommandBar currentLevel={level} currentMode={mode} onCommand={handleCommand} />
      </div>

      {/* ── Main area ── */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pb-4">

          {/* Hero — visible when only the welcome message exists */}
          {showHero && (
            <div className="flex flex-col items-center pt-10 pb-6 select-none">
              <TiltCard className="mb-5">
                <div
                  className="glass rounded-[28px] p-6 flex flex-col items-center gap-3 glow-purple"
                  style={{ minWidth: 200 }}
                >
                  <FennecFox size={130} state={mascotState} />
                  <div className="text-center">
                    <p className="font-display font-black text-4xl tracking-tight gradient-text">Fluf</p>
                    <p className="text-white/40 text-xs mt-1">Tu tutora de español ✨</p>
                  </div>

                  {/* Level badge inside card */}
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#CC91F0]/15 text-[#CC91F0] border border-[#CC91F0]/20 font-semibold">
                      Nivel {level}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/8">
                      Voice enabled
                    </span>
                  </div>
                </div>
              </TiltCard>

              <p className="text-white/25 text-xs text-center max-w-xs">
                Habla o escribe en español · Hover the card to see the 3D effect
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="pt-3">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      {/* ── Input bar ── */}
      <footer className="relative z-10 px-4 py-3 border-t border-white/5" style={{ background: 'rgba(6,4,13,0.7)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <VoiceButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            supported={supported}
            onStart={() => { stopSpeaking(); startListening() }}
            onStop={stopListening}
            onStopSpeaking={stopSpeaking}
            disabled={isLoading}
          />

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? 'Escuchando… 🎙️'
                : mode === 'immersion' ? '¡Escríbeme en español!'
                : 'Escribe o habla con Fluf…'
              }
              rows={1}
              disabled={isLoading || isListening}
              style={{ fontFamily: 'var(--font-inter)' }}
              className="w-full glass rounded-2xl px-4 py-2.5 text-sm text-white/90 placeholder-white/25 resize-none focus:outline-none focus:border-[#CC91F0]/40 transition-all disabled:opacity-50 max-h-36 overflow-y-auto leading-relaxed"
              onInput={e => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 144) + 'px'
              }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #CC91F0, #FF87A6)'
                : 'rgba(255,255,255,0.06)',
              boxShadow: input.trim() && !isLoading ? '0 0 20px rgba(204,145,240,0.4)' : 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 7.5h11M8.5 3l4 4.5-4 4.5"
                stroke={input.trim() && !isLoading ? '#1F1A23' : '#ffffff30'}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-[9px] text-white/15 mt-1.5">
          Enter · Shift+Enter for new line · /recap /immersion /free /vocab
        </p>
      </footer>
    </div>
  )
}

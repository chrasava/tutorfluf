'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  selectedVoiceURI: string
  onChange: (uri: string) => void
}

export default function VoicePicker({ selectedVoiceURI, onChange }: Props) {
  const [voices, setVoices]   = useState<SpeechSynthesisVoice[]>([])
  const [open, setOpen]       = useState(false)
  const [previewing, setPrev] = useState<string | null>(null)
  const [rect, setRect]       = useState<DOMRect | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function load() {
      const v = window.speechSynthesis.getVoices()
      if (v.length) setVoices(v)
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const target = e.target as Node
      // keep open if clicking inside the portal dropdown itself
      const portal = document.getElementById('voice-picker-portal')
      if (portal?.contains(target) || btnRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function toggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(o => !o)
  }

  function select(voice: SpeechSynthesisVoice) {
    onChange(voice.voiceURI)
    // preview immediately
    window.speechSynthesis.cancel()
    setPrev(voice.voiceURI)
    const u = new SpeechSynthesisUtterance('Hola, soy Fluf.')
    u.voice = voice
    u.lang  = voice.lang
    u.rate  = 0.95
    u.onend = u.onerror = () => setPrev(null)
    window.speechSynthesis.speak(u)
    setOpen(false)
  }

  const selected = voices.find(v => v.voiceURI === selectedVoiceURI)
  const spanish  = voices.filter(v => v.lang.startsWith('es'))
  const others   = voices.filter(v => !v.lang.startsWith('es'))

  const dropdownStyle: React.CSSProperties = rect ? {
    position: 'fixed',
    top: rect.bottom + 8,
    right: window.innerWidth - rect.right,
    width: 280,
    zIndex: 9999,
  } : {}

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
        style={{
          color: open ? '#CC91F0' : 'rgba(255,255,255,0.55)',
          background: open ? 'rgba(204,145,240,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(204,145,240,0.3)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 14" fill="none">
          <rect x="3" y="0" width="6" height="9" rx="3" fill="currentColor" opacity=".8"/>
          <path d="M1 7a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
          <line x1="6" y1="12" x2="6" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="4" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        {selected ? selected.name.replace(/ \(.*\)/, '').split(' ')[0] : 'Voice'} ▾
      </button>

      {open && voices.length > 0 && typeof document !== 'undefined' && createPortal(
        <div
          id="voice-picker-portal"
          style={{
            ...dropdownStyle,
            background: 'rgba(9,6,18,0.97)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 10, color: 'rgba(204,145,240,0.6)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              Voice — click to select & preview
            </p>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 300, padding: '6px 0' }}>
            {spanish.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: 'rgba(147,240,145,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px 4px', margin: 0 }}>
                  Spanish 🇪🇸
                </p>
                {spanish.map(v => (
                  <Row key={v.voiceURI} voice={v} active={v.voiceURI === selectedVoiceURI} previewing={previewing === v.voiceURI} onSelect={() => select(v)} />
                ))}
              </>
            )}
            {others.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 16px 4px', margin: 0 }}>
                  Other
                </p>
                {others.map(v => (
                  <Row key={v.voiceURI} voice={v} active={v.voiceURI === selectedVoiceURI} previewing={previewing === v.voiceURI} onSelect={() => select(v)} />
                ))}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function Row({ voice, active, previewing, onSelect }: {
  voice: SpeechSynthesisVoice
  active: boolean
  previewing: boolean
  onSelect: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        cursor: 'pointer',
        background: active ? 'rgba(204,145,240,0.12)' : hover ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: active ? '#CC91F0' : 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {voice.name}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
          {voice.lang}{voice.localService ? ' · local' : ' · online'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
        {previewing && (
          <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'inline-block', width: 3, height: 12, borderRadius: 2,
                background: '#CC91F0',
                animation: `blink 0.7s ${i * 0.2}s ease-in-out infinite alternate`,
              }} />
            ))}
          </span>
        )}
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
          background: active ? 'rgba(204,145,240,0.2)' : 'rgba(255,255,255,0.07)',
          color: active ? '#CC91F0' : 'rgba(255,255,255,0.4)',
          border: `1px solid ${active ? 'rgba(204,145,240,0.3)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          {active ? '✓' : '▶'}
        </span>
      </div>
    </div>
  )
}

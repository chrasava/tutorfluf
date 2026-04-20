'use client'

interface Props {
  isListening: boolean
  isSpeaking: boolean
  supported: boolean
  onStart: () => void
  onStop: () => void
  onStopSpeaking: () => void
  disabled?: boolean
}

export default function VoiceButton({
  isListening,
  isSpeaking,
  supported,
  onStart,
  onStop,
  onStopSpeaking,
  disabled,
}: Props) {
  if (!supported) return null

  if (isSpeaking) {
    return (
      <button
        onClick={onStopSpeaking}
        className="relative flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Stop speaking"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="3" width="4" height="10" rx="1" fill="#1F1A23" />
          <rect x="9" y="3" width="4" height="10" rx="1" fill="#1F1A23" />
        </svg>
      </button>
    )
  }

  if (isListening) {
    return (
      <button
        onClick={onStop}
        className="relative flex-shrink-0 w-10 h-10 rounded-full bg-brand-red flex items-center justify-center transition-all"
        title="Stop listening"
      >
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-brand-red/40 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full bg-brand-red/20 animate-pulse-ring [animation-delay:0.4s]" />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="5" y="3" width="6" height="10" rx="3" fill="white" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={onStart}
      disabled={disabled}
      className="flex-shrink-0 w-10 h-10 rounded-full bg-white/8 border border-white/10 flex items-center justify-center transition-all hover:bg-brand-purple/20 hover:border-brand-purple/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      title="Start speaking (es-ES)"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="5" y="1" width="6" height="9" rx="3" fill="#CC91F0" />
        <path d="M3 7a5 5 0 0010 0" stroke="#CC91F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="12" x2="8" y2="15" stroke="#CC91F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5.5" y1="15" x2="10.5" y2="15" stroke="#CC91F0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  )
}

'use client'

export type FennecState = 'idle' | 'listening' | 'speaking' | 'thinking'

interface Props {
  size?: number
  state?: FennecState
  className?: string
}

export default function FennecFox({ size = 48, state = 'idle', className = '' }: Props) {
  const h = Math.round((size * 220) / 200)

  const earAnimL =
    state === 'listening'
      ? 'fennec-ear-listen-l'
      : state === 'thinking'
      ? 'fennec-ear-think'
      : 'fennec-ear-idle-l'

  const earAnimR =
    state === 'listening'
      ? 'fennec-ear-listen-r'
      : state === 'thinking'
      ? 'fennec-ear-think'
      : 'fennec-ear-idle-r'

  const bodyAnim =
    state === 'speaking'
      ? 'fennec-speak'
      : state === 'thinking'
      ? 'fennec-think'
      : 'fennec-float'

  const mouthD =
    state === 'speaking'
      ? 'M 91 172 Q 100 177 109 172'
      : state === 'thinking'
      ? 'M 94 174 Q 100 175 106 174'
      : 'M 91 172 Q 100 180 109 172'

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={h}
      className={className}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Isabella the fennec fox mascot"
    >
      <defs>
        <radialGradient id="eyeGradL" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#3d2a5a" />
          <stop offset="100%" stopColor="#17111B" />
        </radialGradient>
        <radialGradient id="eyeGradR" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#3d2a5a" />
          <stop offset="100%" stopColor="#17111B" />
        </radialGradient>
        <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FBF0DC" />
          <stop offset="100%" stopColor="#EDD8A8" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#17111B" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ── Left ear ── */}
      <g
        style={{
          transformOrigin: '63px 115px',
          animationName: earAnimL,
          animationDuration: state === 'listening' ? '0.6s' : '5s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      >
        {/* Outer ear */}
        <path
          d="M 42 120 C 26 90 15 48 46 10 C 62 52 81 86 85 114 Z"
          fill="#EDD8A8"
          stroke="#D4BC88"
          strokeWidth="0.5"
        />
        {/* Inner ear */}
        <path
          d="M 51 116 C 39 91 33 58 51 22 C 63 56 77 85 79 110 Z"
          fill="#FFB0C2"
          opacity="0.8"
        />
      </g>

      {/* ── Right ear ── */}
      <g
        style={{
          transformOrigin: '137px 115px',
          animationName: earAnimR,
          animationDuration: state === 'listening' ? '0.6s' : '5s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: state === 'listening' ? '0.1s' : '0.8s',
        }}
      >
        <path
          d="M 158 120 C 174 90 185 48 154 10 C 138 52 119 86 115 114 Z"
          fill="#EDD8A8"
          stroke="#D4BC88"
          strokeWidth="0.5"
        />
        <path
          d="M 149 116 C 161 91 167 58 149 22 C 137 56 123 85 121 110 Z"
          fill="#FFB0C2"
          opacity="0.8"
        />
      </g>

      {/* ── Body / head ── */}
      <g
        filter="url(#softShadow)"
        style={{
          transformOrigin: '100px 148px',
          animationName: bodyAnim,
          animationDuration: state === 'speaking' ? '0.5s' : state === 'thinking' ? '3s' : '6s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      >
        {/* Head */}
        <ellipse cx="100" cy="148" rx="64" ry="58" fill="url(#faceGrad)" />

        {/* Cheek tufts */}
        <ellipse cx="54" cy="160" rx="24" ry="21" fill="#FBF0DC" opacity="0.85" />
        <ellipse cx="146" cy="160" rx="24" ry="21" fill="#FBF0DC" opacity="0.85" />

        {/* Forehead highlight */}
        <ellipse cx="100" cy="108" rx="28" ry="18" fill="#FBF0DC" opacity="0.4" />

        {/* ── Eyes ── */}
        {/* Left eye */}
        <circle cx="74" cy="140" r="18" fill="url(#eyeGradL)" />
        <circle cx="67" cy="133" r="6.5" fill="white" opacity="0.92" />
        <circle cx="81" cy="147" r="3" fill="white" opacity="0.45" />

        {/* Right eye */}
        <circle cx="126" cy="140" r="18" fill="url(#eyeGradR)" />
        <circle cx="119" cy="133" r="6.5" fill="white" opacity="0.92" />
        <circle cx="133" cy="147" r="3" fill="white" opacity="0.45" />

        {/* Thinking squint — semi-transparent eyelid */}
        {state === 'thinking' && (
          <>
            <ellipse cx="74" cy="132" rx="18" ry="9" fill="#EDD8A8" opacity="0.55" />
            <ellipse cx="126" cy="132" rx="18" ry="9" fill="#EDD8A8" opacity="0.55" />
          </>
        )}

        {/* ── Nose ── */}
        <path
          d="M 93 164 Q 100 157 107 164 Q 107 170 100 171 Q 93 170 93 164 Z"
          fill="#2D2040"
        />
        <ellipse cx="98" cy="163" rx="3" ry="2" fill="white" opacity="0.3" />

        {/* ── Mouth ── */}
        <line x1="100" y1="170" x2="100" y2="173" stroke="#A0784A" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d={mouthD}
          stroke="#A0784A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Whiskers ── */}
        <g opacity="0.65" stroke="#C4A882" strokeWidth="1.1" strokeLinecap="round">
          <line x1="26" y1="159" x2="88" y2="163" />
          <line x1="24" y1="168" x2="88" y2="168" />
          <line x1="28" y1="177" x2="88" y2="172" />
          <line x1="174" y1="159" x2="112" y2="163" />
          <line x1="176" y1="168" x2="112" y2="168" />
          <line x1="172" y1="177" x2="112" y2="172" />
        </g>
      </g>

      {/* ── Listening pulse rings ── */}
      {state === 'listening' && (
        <g>
          <circle cx="100" cy="212" r="5" fill="#CC91F0">
            <animate attributeName="r" values="5;12;5" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0;0.9" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="212" r="5" fill="#CC91F0">
            <animate attributeName="r" values="5;12;5" dur="1s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0;0.9" dur="1s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* ── Speaking sound waves ── */}
      {state === 'speaking' && (
        <g stroke="#FFB500" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75">
          <path d="M 165 140 Q 172 148 165 156">
            <animate attributeName="opacity" values="0.75;0.2;0.75" dur="0.6s" repeatCount="indefinite" />
          </path>
          <path d="M 172 133 Q 182 148 172 163">
            <animate attributeName="opacity" values="0.75;0.2;0.75" dur="0.6s" begin="0.15s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {/* ── Thinking dots ── */}
      {state === 'thinking' && (
        <g fill="#CC91F0">
          <circle cx="160" cy="105" r="4">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="173" cy="95" r="5">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="185" cy="82" r="6">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  )
}

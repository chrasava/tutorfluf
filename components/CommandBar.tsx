'use client'
import { useState } from 'react'

const COMMANDS = [
  { cmd: '/recap',     label: 'Recap',     color: '#CC91F0', glow: 'rgba(204,145,240,0.35)' },
  { cmd: '/immersion', label: 'Immersion', color: '#93F091', glow: 'rgba(147,240,145,0.35)' },
  { cmd: '/free',      label: 'Free talk', color: '#FFB500', glow: 'rgba(255,181,0,0.35)'   },
  { cmd: '/vocab',     label: 'Vocab',     color: '#FF87A6', glow: 'rgba(255,135,166,0.35)' },
]
const LEVELS = ['A1','A2','B1','B2','C1','C2']

interface Props {
  currentLevel: string
  currentMode: string
  onCommand: (cmd: string) => void
}

export default function CommandBar({ currentLevel, currentMode, onCommand }: Props) {
  const [showLevels, setShowLevels] = useState(false)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {COMMANDS.map(({ cmd, label, color, glow }) => {
        const active = currentMode === cmd.slice(1)
        return (
          <button
            key={cmd}
            onClick={() => onCommand(cmd)}
            style={{
              color,
              border: `1px solid ${color}30`,
              background: active ? `${color}18` : `${color}0a`,
              boxShadow: active ? `0 0 14px ${glow}, inset 0 0 8px ${color}10` : 'none',
              transition: 'all 0.2s ease',
            }}
            className="text-[11px] px-3 py-1 rounded-full font-semibold hover:scale-105 active:scale-95"
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 14px ${glow}, inset 0 0 8px ${color}10`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = active ? `0 0 14px ${glow}` : 'none')}
          >
            {label}
          </button>
        )
      })}

      {/* Level picker */}
      <div className="relative ml-auto">
        <button
          onClick={() => setShowLevels(!showLevels)}
          style={{
            color: '#FF702B',
            border: '1px solid rgba(255,112,43,0.3)',
            background: 'rgba(255,112,43,0.1)',
            boxShadow: showLevels ? '0 0 14px rgba(255,112,43,0.3)' : 'none',
          }}
          className="text-[11px] px-3 py-1 rounded-full font-semibold hover:scale-105 transition-transform"
        >
          {currentLevel} ▾
        </button>

        {showLevels && (
          <div
            className="absolute bottom-full mb-2 right-0 rounded-2xl p-1.5 flex flex-col gap-0.5 z-30"
            style={{
              background: 'rgba(10,7,18,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {LEVELS.map(lvl => (
              <button
                key={lvl}
                onClick={() => { onCommand(`/level ${lvl}`); setShowLevels(false) }}
                style={{
                  color: lvl === currentLevel ? '#FF702B' : 'rgba(255,255,255,0.55)',
                  background: lvl === currentLevel ? 'rgba(255,112,43,0.12)' : 'transparent',
                }}
                className="text-[11px] px-5 py-1.5 rounded-xl text-left hover:bg-white/5 transition-colors font-medium"
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

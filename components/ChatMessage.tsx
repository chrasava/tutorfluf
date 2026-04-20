'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import FennecFox from './FennecFox'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

function splitNota(content: string) {
  const i = content.indexOf('📝 **Nota rápida**')
  return i === -1
    ? { main: content, nota: null }
    : { main: content.slice(0, i).trimEnd(), nota: content.slice(i) }
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-up">
        <div
          className="max-w-[74%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white/95"
          style={{
            background: 'linear-gradient(135deg, rgba(158,94,207,0.9) 0%, rgba(204,145,240,0.75) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(204,145,240,0.3)',
            boxShadow: '0 4px 24px rgba(158,94,207,0.25)',
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  const { main, nota } = splitNota(message.content)

  return (
    <div className="flex gap-3 mb-5 animate-fade-up">
      {/* Fluf avatar */}
      <div className="flex-shrink-0 mt-1">
        <div
          className="rounded-full p-0.5"
          style={{ background: 'linear-gradient(135deg, #CC91F0, #FF87A6)', boxShadow: '0 0 14px rgba(204,145,240,0.35)' }}
        >
          <div className="rounded-full overflow-hidden bg-[#06040d]">
            <FennecFox size={32} state="idle" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Main bubble */}
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${message.streaming && !nota ? 'streaming-cursor' : ''}`}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="msg-content text-white/88 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{main}</ReactMarkdown>
          </div>
        </div>

        {/* Nota rápida */}
        {nota && (
          <div className={`nota-block mt-2 ${message.streaming ? 'streaming-cursor' : ''}`}>
            <div className="msg-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{nota}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

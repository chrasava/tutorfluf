import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'
import { buildSystemPrompt } from '@/lib/isabella'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.startsWith('your-')) {
    const enc = new TextEncoder()
    return new Response(
      new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(enc.encode('⚠️ **API key missing.** Add your Groq key (`ANTHROPIC_API_KEY=gsk_...`) to `.env.local` and restart the dev server. Get a free key at [console.groq.com](https://console.groq.com)'))
          ctrl.close()
        },
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }

  const client = new Groq({ apiKey: key })
  const { messages, level = 'B1', mode = 'normal' } = await req.json()

  const systemPrompt = buildSystemPrompt(level, mode)

  const stream = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}

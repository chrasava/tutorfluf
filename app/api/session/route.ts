import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { SessionHistory } from '@/lib/session'

const SESSION_FILE = join(process.cwd(), 'session_history.json')

export async function GET() {
  if (!existsSync(SESSION_FILE)) {
    return NextResponse.json({ sessions: [] } satisfies SessionHistory)
  }
  try {
    const data = readFileSync(SESSION_FILE, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json({ sessions: [] } satisfies SessionHistory)
  }
}

export async function POST(req: NextRequest) {
  const session = await req.json()
  let history: SessionHistory = { sessions: [] }
  if (existsSync(SESSION_FILE)) {
    try {
      history = JSON.parse(readFileSync(SESSION_FILE, 'utf-8'))
    } catch {
      history = { sessions: [] }
    }
  }
  history.sessions.push(session)
  writeFileSync(SESSION_FILE, JSON.stringify(history, null, 2))
  return NextResponse.json({ ok: true })
}

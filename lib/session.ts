export interface GrammarError {
  type: string
  count: number
}

export interface SessionData {
  date: string
  topics: string[]
  errors: GrammarError[]
  vocab: string[]
  level_estimate: string
  notes: string
}

export interface SessionHistory {
  sessions: SessionData[]
}

export function emptySession(level: string): SessionData {
  return {
    date: new Date().toISOString().split('T')[0],
    topics: [],
    errors: [],
    vocab: [],
    level_estimate: level,
    notes: '',
  }
}

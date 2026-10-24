export interface KbMatch {
  planet?: string
  house?: number
  sign?: string
  dignity?: string
  nakshatra?: string
  dashaLord?: string
  yoga?: string
  transit?: string
  phase?: string
  favorable?: boolean
}

export interface KbEntry {
  id: string
  source: string
  topic: string
  match: KbMatch
  title: string
  text: string
  keywords: string[]
}

export interface KbIndex {
  terms: Record<string, number[]>
  meta: {
    entryCount: number
    termCount: number
    sources: string[]
    topics: string[]
    builtAt: string
  }
}

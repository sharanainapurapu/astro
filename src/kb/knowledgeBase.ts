import type { KbEntry, KbIndex, KbMatch } from './types'

// Resolve URLs against Vite's base so this works on GitHub Pages subpaths.
const base = import.meta.env.BASE_URL

let cache: { entries: KbEntry[]; index: KbIndex } | null = null

/** Load the knowledge corpus + index once and cache it. */
export async function loadKnowledgeBase(): Promise<{
  entries: KbEntry[]
  index: KbIndex
}> {
  if (cache) return cache
  const [entries, index] = await Promise.all([
    fetch(`${base}kb/knowledge.json`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load knowledge.json (${r.status})`)
      return r.json() as Promise<KbEntry[]>
    }),
    fetch(`${base}kb/index.json`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load index.json (${r.status})`)
      return r.json() as Promise<KbIndex>
    }),
  ])
  cache = { entries, index }
  return cache
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'is', 'for', 'with',
  'on', 'at', 'by', 'from', 'as', 'it', 'its', 'this', 'that', 'can', 'may',
  'what', 'does', 'do', 'will', 'my', 'me', 'i', 'about', 'tell', 'how',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

export interface SearchResult {
  entry: KbEntry
  score: number
}

/** Free-text search over the knowledge base using the inverted index. */
export function searchKnowledgeBase(
  query: string,
  entries: KbEntry[],
  index: KbIndex,
  limit = 8,
): SearchResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const scores = new Map<number, number>()
  for (const token of tokens) {
    // Exact term hits.
    const postings = index.terms[token]
    if (postings) {
      for (const idx of postings) {
        scores.set(idx, (scores.get(idx) ?? 0) + 1)
      }
    }
    // Prefix hits (e.g. "jupit" matches "jupiter"), weighted lower.
    for (const term of Object.keys(index.terms)) {
      if (term !== token && term.startsWith(token) && token.length >= 3) {
        for (const idx of index.terms[term]) {
          scores.set(idx, (scores.get(idx) ?? 0) + 0.4)
        }
      }
    }
  }

  return [...scores.entries()]
    .map(([idx, score]) => ({ entry: entries[idx], score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** Find entries whose structured `match` matches a given feature selector. */
export function matchEntries(
  selector: KbMatch,
  entries: KbEntry[],
): KbEntry[] {
  const keys = Object.keys(selector) as (keyof KbMatch)[]
  return entries.filter((entry) => {
    for (const key of keys) {
      if (entry.match[key] === undefined) return false
      if (entry.match[key] !== selector[key]) return false
    }
    // Require the entry's match to not demand extra constraints the selector
    // doesn't satisfy (every match key must be present in the selector).
    for (const mk of Object.keys(entry.match) as (keyof KbMatch)[]) {
      if (selector[mk] === undefined) return false
      if (selector[mk] !== entry.match[mk]) return false
    }
    return keys.length > 0
  })
}

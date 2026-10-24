// Build the static knowledge base shipped with the app.
//
// Reads every *.json file in kb-sources/, validates and normalises each entry,
// assigns a stable id, builds an inverted keyword index for free-text search,
// and writes:
//   public/kb/knowledge.json  — array of entries (the corpus)
//   public/kb/index.json      — { terms: { term: [entryIndex,...] }, meta }
//
// Run with: npm run build:kb

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const sourcesDir = join(root, 'kb-sources')
const outDir = join(root, 'public', 'kb')

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'is', 'for', 'with',
  'on', 'at', 'by', 'from', 'as', 'it', 'its', 'this', 'that', 'can', 'may',
  'but', 'be', 'are', 'was', 'through', 'into', 'out', 'who', 'which',
])

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

function validateEntry(entry, file, i) {
  const where = `${file}[${i}]`
  for (const field of ['source', 'topic', 'title', 'text']) {
    if (typeof entry[field] !== 'string' || !entry[field].trim()) {
      throw new Error(`${where}: missing or empty "${field}"`)
    }
  }
  if (entry.match && typeof entry.match !== 'object') {
    throw new Error(`${where}: "match" must be an object`)
  }
  if (entry.keywords && !Array.isArray(entry.keywords)) {
    throw new Error(`${where}: "keywords" must be an array`)
  }
}

async function main() {
  const files = (await readdir(sourcesDir)).filter((f) => f.endsWith('.json'))
  files.sort()

  const entries = []
  for (const file of files) {
    const raw = await readFile(join(sourcesDir, file), 'utf8')
    let arr
    try {
      arr = JSON.parse(raw)
    } catch (e) {
      throw new Error(`Failed to parse ${file}: ${e.message}`)
    }
    if (!Array.isArray(arr)) throw new Error(`${file}: expected a JSON array`)
    arr.forEach((entry, i) => {
      validateEntry(entry, file, i)
      entries.push({
        id: `${file.replace(/\.json$/, '')}-${i}`,
        source: entry.source,
        topic: entry.topic,
        match: entry.match ?? {},
        title: entry.title,
        text: entry.text,
        keywords: entry.keywords ?? [],
      })
    })
  }

  // Build inverted index over keywords + title + text.
  const terms = {}
  entries.forEach((entry, idx) => {
    const bag = new Set([
      ...tokenize(entry.title),
      ...tokenize(entry.text),
      ...entry.keywords.flatMap((k) => tokenize(k)),
    ])
    for (const term of bag) {
      ;(terms[term] ??= []).push(idx)
    }
  })

  await mkdir(outDir, { recursive: true })
  await writeFile(
    join(outDir, 'knowledge.json'),
    JSON.stringify(entries),
    'utf8',
  )
  await writeFile(
    join(outDir, 'index.json'),
    JSON.stringify({
      terms,
      meta: {
        entryCount: entries.length,
        termCount: Object.keys(terms).length,
        sources: [...new Set(entries.map((e) => e.source))].sort(),
        topics: [...new Set(entries.map((e) => e.topic))].sort(),
        builtAt: new Date().toISOString(),
      },
    }),
    'utf8',
  )

  console.log(
    `Knowledge base built: ${entries.length} entries, ` +
      `${Object.keys(terms).length} index terms, ` +
      `${files.length} source files.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

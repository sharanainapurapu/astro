import { useEffect, useMemo, useState } from 'react'
import { computeChart, formatLongitude, type Chart } from './astro/chart'
import { computeVimshottari, dashaAt, type DashaPeriod } from './astro/dasha'
import { transitsOverRange, detectSadeSati } from './astro/transits'
import {
  buildNatalPredictions,
  buildRangePredictions,
} from './astro/predictions'
import {
  loadKnowledgeBase,
  searchKnowledgeBase,
  type SearchResult,
} from './kb/knowledgeBase'
import type { KbEntry, KbIndex } from './kb/types'
import { BirthForm, type BirthFormValue } from './ui/BirthForm'
import { ChartDiagram } from './ui/ChartDiagram'
import { PredictionList } from './ui/PredictionList'
import { PLACES } from './ui/places'
import { localToUtc } from './ui/timezone'

type Tab = 'chart' | 'natal' | 'range' | 'ask'

export default function App() {
  const [kb, setKb] = useState<{ entries: KbEntry[]; index: KbIndex } | null>(null)
  const [kbError, setKbError] = useState<string | null>(null)
  const [chart, setChart] = useState<Chart | null>(null)
  const [periods, setPeriods] = useState<DashaPeriod[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('chart')

  useEffect(() => {
    loadKnowledgeBase()
      .then(setKb)
      .catch((e) => setKbError(String(e)))
  }, [])

  function handleSubmit(v: BirthFormValue) {
    setFormError(null)
    try {
      const [y, mo, d] = v.date.split('-').map(Number)
      const [h, mi] = v.time.split(':').map(Number)

      let lat: number
      let lon: number
      let tz: string
      if (v.useManual) {
        lat = Number(v.manualLat)
        lon = Number(v.manualLon)
        tz = v.manualTz.trim()
        if (Number.isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error('Latitude must be between -90 and 90.')
        }
        if (Number.isNaN(lon) || lon < -180 || lon > 180) {
          throw new Error('Longitude must be between -180 and 180.')
        }
        // Validate the timezone string against Intl.
        try {
          new Intl.DateTimeFormat('en-US', { timeZone: tz })
        } catch {
          throw new Error(`Unknown timezone: "${tz}". Use an IANA name like Asia/Kolkata.`)
        }
      } else {
        const place = PLACES[v.placeIndex]
        lat = place.lat
        lon = place.lon
        tz = place.tz
      }

      const utc = localToUtc(y, mo, d, h, mi, tz)
      const c = computeChart({ date: utc, latitude: lat, longitude: lon })
      setChart(c)
      setPeriods(computeVimshottari(c.moonLongitude, utc))
      setTab('chart')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e))
      setChart(null)
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>Jyotish · Vedic Astrology</h1>
        <div className="subtitle">
          Sidereal (Lahiri) birth charts, Vimshottari dasha and transits — with
          interpretations cited from the classical texts. Runs entirely in your
          browser.
        </div>
      </header>

      {kbError && (
        <div className="card">
          <p className="error">Could not load the knowledge base: {kbError}</p>
        </div>
      )}

      <BirthForm onSubmit={handleSubmit} />
      {formError && (
        <div className="card">
          <p className="error">{formError}</p>
        </div>
      )}

      {chart && kb && (
        <>
          <div className="tabs">
            <button className={tab === 'chart' ? 'active' : ''} onClick={() => setTab('chart')}>
              Chart
            </button>
            <button className={tab === 'natal' ? 'active' : ''} onClick={() => setTab('natal')}>
              Predictions
            </button>
            <button className={tab === 'range' ? 'active' : ''} onClick={() => setTab('range')}>
              Date range
            </button>
            <button className={tab === 'ask' ? 'active' : ''} onClick={() => setTab('ask')}>
              Ask
            </button>
          </div>

          {tab === 'chart' && <ChartTab chart={chart} periods={periods} />}
          {tab === 'natal' && <NatalTab chart={chart} entries={kb.entries} />}
          {tab === 'range' && (
            <RangeTab chart={chart} periods={periods} entries={kb.entries} />
          )}
          {tab === 'ask' && <AskTab entries={kb.entries} index={kb.index} />}
        </>
      )}

      <Footer kb={kb} />
    </div>
  )
}

function ChartTab({ chart, periods }: { chart: Chart; periods: DashaPeriod[] }) {
  const now = new Date()
  const active = dashaAt(periods, now)
  return (
    <div className="grid-2">
      <div className="card">
        <h2>Rashi Chart (D1)</h2>
        <ChartDiagram chart={chart} />
        <p className="muted" style={{ textAlign: 'center', marginBottom: 0 }}>
          Ascendant (Lagna): <strong>{chart.ascendantSign}</strong> ·{' '}
          {chart.ascendantNakshatra.name}
        </p>
      </div>
      <div className="card">
        <h2>Planetary Positions</h2>
        <table className="planets">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Position</th>
              <th>Nakshatra</th>
              <th>House</th>
            </tr>
          </thead>
          <tbody>
            {chart.planets.map((p) => (
              <tr key={p.planet}>
                <td>
                  {p.planet}{' '}
                  {p.retrograde && <span className="tag retro">R</span>}{' '}
                  {p.dignity !== 'neutral' && (
                    <span className={`tag ${p.dignity}`}>{p.dignity}</span>
                  )}
                </td>
                <td>{formatLongitude(p.longitude)}</td>
                <td>
                  {p.nakshatra.name} ({p.pada})
                </td>
                <td>{p.house}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ marginBottom: 0, marginTop: 14 }}>
          Current period:{' '}
          <strong>
            {active.maha?.lord ?? '—'} / {active.antar?.lord ?? '—'}
          </strong>{' '}
          (Mahadasha / Antardasha today)
        </p>
      </div>
    </div>
  )
}

function NatalTab({ chart, entries }: { chart: Chart; entries: KbEntry[] }) {
  const predictions = useMemo(
    () => buildNatalPredictions(chart, entries),
    [chart, entries],
  )
  return (
    <div className="card">
      <h2>Natal Predictions</h2>
      <p className="muted">
        Interpretations are matched to features of your chart and attributed to
        the classical work each principle comes from.
      </p>
      <PredictionList predictions={predictions} />
    </div>
  )
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function RangeTab({
  chart,
  periods,
  entries,
}: {
  chart: Chart
  periods: DashaPeriod[]
  entries: KbEntry[]
}) {
  const [start, setStart] = useState('2024-01-01')
  const [end, setEnd] = useState('2027-12-31')
  const [error, setError] = useState<string | null>(null)

  const result = useMemo(() => {
    setError(null)
    const s = new Date(`${start}T00:00:00Z`)
    const e = new Date(`${end}T00:00:00Z`)
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      setError('Please enter valid dates.')
      return null
    }
    if (e <= s) {
      setError('End date must be after start date.')
      return null
    }
    const moonSign = chart.planets.find((p) => p.planet === 'Moon')!.signIndex
    const transits = transitsOverRange(s, e, moonSign)
    const sadeSati = detectSadeSati(s, e, moonSign)
    return {
      s,
      e,
      ...buildRangePredictions(chart, periods, s, e, transits, sadeSati, entries),
    }
  }, [start, end, chart, periods, entries])

  return (
    <div className="card">
      <h2>Date-Range Forecast</h2>
      <p className="muted">
        See which dasha periods, transits (Gochara) and Sade Sati phases are
        active across a span of time, with classical interpretations.
      </p>
      <div className="row">
        <div style={{ flex: 1, minWidth: 160 }}>
          <label htmlFor="rs">From</label>
          <input id="rs" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label htmlFor="re">To</label>
          <input id="re" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div style={{ marginTop: 18 }}>
          <h3>Dasha periods in this range</h3>
          <DashaTimeline periods={periods} start={result.s} end={result.e} />

          <h3 style={{ marginTop: 24 }}>Dasha interpretations</h3>
          <PredictionList predictions={result.dashaPredictions} />

          {result.sadeSatiPredictions.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>Sade Sati</h3>
              <PredictionList predictions={result.sadeSatiPredictions} />
            </>
          )}

          <h3 style={{ marginTop: 24 }}>
            Major transits (Jupiter &amp; Saturn ingresses)
          </h3>
          {result.transits.length === 0 ? (
            <p className="muted">
              No Jupiter or Saturn sign changes fall within this range.
            </p>
          ) : (
            <div className="timeline">
              {result.transits.map((t, i) => (
                <div className="seg" key={i}>
                  <span>
                    <strong>{t.planet}</strong> enters {t.toSign}
                  </span>
                  <span className="muted">
                    {fmtDate(t.date)} · house {t.houseFromMoon} from Moon
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DashaTimeline({
  periods,
  start,
  end,
}: {
  periods: DashaPeriod[]
  start: Date
  end: Date
}) {
  const overlapping = periods.filter(
    (p) => p.end > start && p.start < end,
  )
  if (overlapping.length === 0) {
    return (
      <p className="muted">
        This range falls outside the computed 120-year dasha cycle.
      </p>
    )
  }
  const now = Date.now()
  return (
    <div className="timeline">
      {overlapping.map((p, i) => {
        const isActive = p.start.getTime() <= now && now < p.end.getTime()
        return (
          <div className={`seg${isActive ? ' active' : ''}`} key={i}>
            <span>
              <strong>{p.lord}</strong> Mahadasha
            </span>
            <span className="muted">
              {fmtDate(p.start)} → {fmtDate(p.end)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function AskTab({ entries, index }: { entries: KbEntry[]; index: KbIndex }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)

  function run() {
    setResults(searchKnowledgeBase(query, entries, index))
    setSearched(true)
  }

  return (
    <div className="card">
      <h2>Ask the Classics</h2>
      <p className="muted">
        Search the knowledge base of classical principles. Try “Jupiter in the
        9th house”, “Saturn mahadasha”, “Rohini nakshatra”, or “Gajakesari
        yoga”.
      </p>
      <div className="row">
        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            type="text"
            value={query}
            placeholder="Ask a question…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
          />
        </div>
        <button className="primary" onClick={run}>
          Search
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="muted" style={{ marginTop: 16 }}>
          No matching principles. Try different keywords.
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        {results.map((r) => (
          <div className="passage" key={r.entry.id}>
            <strong>{r.entry.title}</strong>
            <div style={{ marginTop: 6 }}>{r.entry.text}</div>
            <span className="cite">— {r.entry.source}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Footer({ kb }: { kb: { entries: KbEntry[]; index: KbIndex } | null }) {
  return (
    <div className="disclaimer">
      {kb && (
        <p>
          Knowledge base: <strong>{kb.index.meta.entryCount}</strong> principles
          from {kb.index.meta.sources.join(', ')}.
        </p>
      )}
      <p>
        <strong>How it works:</strong> planetary positions are computed with the
        Swiss-grade <a href="https://github.com/cosinekitty/astronomy">astronomy-engine</a>{' '}
        library and converted to the sidereal zodiac using the Lahiri ayanamsa.
        Interpretations are paraphrased principles from public-domain classical
        texts, attributed to their source, and matched to your chart. No data
        leaves your device.
      </p>
      <p>
        For cultural, educational and entertainment purposes. Astrological
        predictions are not scientific fact and should not be used for medical,
        legal, financial or other important decisions.
      </p>
    </div>
  )
}

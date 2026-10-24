import type { Chart } from './chart'
import type { DashaPeriod } from './dasha'
import { dashaAt } from './dasha'
import type { TransitChange, SadeSatiPhase } from './transits'
import { matchEntries } from '../kb/knowledgeBase'
import type { KbEntry } from '../kb/types'
import { EXALTATION_SIGN, SIGN_LORDS, type PlanetName } from './constants'

export interface Prediction {
  heading: string
  /** Chart feature in plain words (e.g. "Sun in the 10th house"). */
  feature: string
  entries: KbEntry[]
}

export interface DetectedYoga {
  yoga: string
  name: string
  description: string
}

const KENDRAS = new Set([1, 4, 7, 10])

/** Detect the yogas the knowledge base knows about. */
export function detectYogas(chart: Chart): DetectedYoga[] {
  const yogas: DetectedYoga[] = []
  const by = (p: PlanetName) => chart.planets.find((x) => x.planet === p)!
  const moon = by('Moon')
  const jup = by('Jupiter')
  const sun = by('Sun')
  const merc = by('Mercury')
  const mars = by('Mars')

  // Gajakesari: Jupiter in a kendra from the Moon.
  const jupHouseFromMoon = ((jup.signIndex - moon.signIndex + 12) % 12) + 1
  if (KENDRAS.has(jupHouseFromMoon)) {
    yogas.push({
      yoga: 'Gajakesari',
      name: 'Gajakesari Yoga',
      description: 'Jupiter sits in a kendra (angle) from the Moon.',
    })
  }

  // Budha-Aditya: Sun and Mercury in the same sign.
  if (sun.signIndex === merc.signIndex) {
    yogas.push({
      yoga: 'BudhaAditya',
      name: 'Budha-Aditya Yoga',
      description: 'The Sun and Mercury share the same sign.',
    })
  }

  // Chandra-Mangala: Moon and Mars conjunct (same sign).
  if (moon.signIndex === mars.signIndex) {
    yogas.push({
      yoga: 'Chandra-Mangala',
      name: 'Chandra-Mangala Yoga',
      description: 'The Moon and Mars are conjunct in the same sign.',
    })
  }

  // Pancha Mahapurusha: Mars/Mercury/Jupiter/Venus/Saturn in a kendra (from
  // the ascendant) while in own sign or exaltation.
  for (const p of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as PlanetName[]) {
    const pos = by(p)
    const inKendra = KENDRAS.has(pos.house)
    const ownSign = SIGN_LORDS[pos.signIndex] === p
    const exalted = EXALTATION_SIGN[p] === pos.signIndex
    if (inKendra && (ownSign || exalted)) {
      yogas.push({
        yoga: 'PanchaMahapurusha',
        name: `Pancha Mahapurusha Yoga (${p})`,
        description: `${p} is in a kendra in ${exalted ? 'exaltation' : 'its own sign'}.`,
      })
      break // one entry in the KB covers the principle
    }
  }

  return yogas
}

/** Build the natal predictions for a chart from the knowledge base. */
export function buildNatalPredictions(
  chart: Chart,
  entries: KbEntry[],
): Prediction[] {
  const out: Prediction[] = []
  const ordinal = (n: number) =>
    `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'}`

  // Planet-in-house predictions.
  for (const p of chart.planets) {
    const matched = matchEntries({ planet: p.planet, house: p.house }, entries)
    if (matched.length) {
      out.push({
        heading: `${p.planet} in House ${p.house}`,
        feature: `${p.planet} occupies the ${ordinal(p.house)} house in ${p.sign}.`,
        entries: matched,
      })
    }
  }

  // Dignity predictions (exalted / debilitated).
  for (const p of chart.planets) {
    if (p.dignity === 'exalted' || p.dignity === 'debilitated') {
      const matched = matchEntries({ planet: p.planet, dignity: p.dignity }, entries)
      if (matched.length) {
        out.push({
          heading: `${p.planet} is ${p.dignity}`,
          feature: `${p.planet} is ${p.dignity} in ${p.sign}.`,
          entries: matched,
        })
      }
    }
  }

  // Moon nakshatra (the janma nakshatra) prediction.
  const moon = chart.planets.find((x) => x.planet === 'Moon')!
  const nakMatched = matchEntries({ nakshatra: moon.nakshatra.name }, entries)
  if (nakMatched.length) {
    out.push({
      heading: `Birth Star: ${moon.nakshatra.name}`,
      feature: `The Moon is in ${moon.nakshatra.name} nakshatra (pada ${moon.pada}).`,
      entries: nakMatched,
    })
  }

  // Yogas.
  for (const yoga of detectYogas(chart)) {
    const matched = matchEntries({ yoga: yoga.yoga }, entries)
    if (matched.length) {
      out.push({
        heading: yoga.name,
        feature: yoga.description,
        entries: matched,
      })
    }
  }

  return out
}

/** Build predictions for a date range: active dasha + transits. */
export function buildRangePredictions(
  _chart: Chart,
  periods: DashaPeriod[],
  rangeStart: Date,
  rangeEnd: Date,
  transits: TransitChange[],
  sadeSati: SadeSatiPhase[],
  entries: KbEntry[],
): {
  dashaAtStart: ReturnType<typeof dashaAt>
  dashaAtEnd: ReturnType<typeof dashaAt>
  dashaPredictions: Prediction[]
  sadeSatiPredictions: Prediction[]
  transits: TransitChange[]
} {
  const dashaAtStart = dashaAt(periods, rangeStart)
  const dashaAtEnd = dashaAt(periods, rangeEnd)

  const dashaPredictions: Prediction[] = []
  const seenLords = new Set<string>()
  for (const d of [dashaAtStart.maha, dashaAtEnd.maha]) {
    if (d && !seenLords.has(d.lord)) {
      seenLords.add(d.lord)
      const matched = matchEntries({ dashaLord: d.lord }, entries)
      if (matched.length) {
        dashaPredictions.push({
          heading: `${d.lord} Mahadasha`,
          feature: `The ${d.lord} major period is active during part or all of this range.`,
          entries: matched,
        })
      }
    }
  }

  const sadeSatiPredictions: Prediction[] = []
  const seenPhase = new Set<string>()
  for (const phase of sadeSati) {
    if (seenPhase.has(phase.phase)) continue
    seenPhase.add(phase.phase)
    const matched = matchEntries(
      { transit: 'SadeSati', phase: phase.phase },
      entries,
    )
    if (matched.length) {
      sadeSatiPredictions.push({
        heading: `Sade Sati — ${phase.phase} phase`,
        feature: `Saturn is in the ${phase.phase} phase of Sade Sati during this range.`,
        entries: matched,
      })
    }
  }

  return {
    dashaAtStart,
    dashaAtEnd,
    dashaPredictions,
    sadeSatiPredictions,
    transits,
  }
}

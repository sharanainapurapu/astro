import {
  Body,
  Ecliptic,
  GeoVector,
  EclipticGeoMoon,
  type AstroTime,
} from 'astronomy-engine'
import { SIGNS, type PlanetName } from './constants'
import {
  astroTimeFromDate,
  norm360,
  tropicalToSidereal,
} from './ayanamsa'

function siderealLongitude(body: Body, time: AstroTime): number {
  if (body === Body.Moon) {
    const m = EclipticGeoMoon(time)
    return tropicalToSidereal(norm360(m.lon), time)
  }
  const vec = GeoVector(body, time, true)
  const ecl = Ecliptic(vec)
  return tropicalToSidereal(norm360(ecl.elon), time)
}

export interface TransitSnapshot {
  date: Date
  /** Sidereal sign index (0-11) of each tracked planet. */
  signs: Record<string, number>
}

export interface TransitChange {
  planet: PlanetName
  date: Date
  fromSign: string
  toSign: string
  /** House relative to the natal Moon (Gochara is Moon-referenced). */
  houseFromMoon: number
}

/**
 * Sample slow planets across a date range and report sign-ingress events.
 * Gochara (transit) predictions are traditionally read from the Moon sign, so
 * we also compute the house each transit falls in relative to the natal Moon.
 */
export function transitsOverRange(
  start: Date,
  end: Date,
  natalMoonSignIndex: number,
): TransitChange[] {
  const changes: TransitChange[] = []
  const stepDays = 2 // fine enough for Jupiter/Saturn ingresses

  const tracked: { planet: PlanetName; body: Body }[] = [
    { planet: 'Jupiter', body: Body.Jupiter },
    { planet: 'Saturn', body: Body.Saturn },
  ]

  for (const { planet, body } of tracked) {
    let prevSign = -1
    let prevDate = new Date(start.getTime())
    for (
      let t = start.getTime();
      t <= end.getTime();
      t += stepDays * 86400000
    ) {
      const when = new Date(t)
      const sign = Math.floor(siderealLongitude(body, astroTimeFromDate(when)) / 30)
      if (prevSign === -1) {
        prevSign = sign
        prevDate = when
        continue
      }
      if (sign !== prevSign) {
        // Refine the ingress to ~1 day by bisection.
        const refined = refineIngress(body, prevDate, when, prevSign)
        changes.push({
          planet,
          date: refined,
          fromSign: SIGNS[prevSign],
          toSign: SIGNS[sign],
          houseFromMoon: ((sign - natalMoonSignIndex + 12) % 12) + 1,
        })
        prevSign = sign
      }
      prevDate = when
    }
  }

  changes.sort((a, b) => a.date.getTime() - b.date.getTime())
  return changes
}

function refineIngress(body: Body, lo: Date, hi: Date, fromSign: number): Date {
  let a = lo.getTime()
  let b = hi.getTime()
  for (let i = 0; i < 20; i++) {
    const mid = (a + b) / 2
    const sign = Math.floor(
      siderealLongitude(body, astroTimeFromDate(new Date(mid))) / 30,
    )
    if (sign === fromSign) a = mid
    else b = mid
  }
  return new Date(b)
}

export interface SadeSatiPhase {
  phase: 'rising' | 'peak' | 'setting'
  start: Date
  end: Date
}

/**
 * Sade Sati: the ~7.5-year period when Saturn transits the 12th, 1st, and 2nd
 * signs from the natal Moon sign. Detect the phases within a date range (we
 * scan a generous window so a phase straddling the range is still reported).
 */
export function detectSadeSati(
  rangeStart: Date,
  rangeEnd: Date,
  natalMoonSignIndex: number,
): SadeSatiPhase[] {
  const phases: SadeSatiPhase[] = []
  const stepDays = 3

  // The three Sade Sati signs relative to the Moon.
  const twelfth = (natalMoonSignIndex + 11) % 12
  const first = natalMoonSignIndex
  const second = (natalMoonSignIndex + 1) % 12
  const phaseOf = (sign: number): SadeSatiPhase['phase'] | null =>
    sign === twelfth ? 'rising' : sign === first ? 'peak' : sign === second ? 'setting' : null

  // Scan a window padded by ~3 years on each side to capture partial phases.
  const scanStart = new Date(rangeStart.getTime() - 3 * 365.25 * 86400000)
  const scanEnd = new Date(rangeEnd.getTime() + 3 * 365.25 * 86400000)

  let current: SadeSatiPhase | null = null
  for (let t = scanStart.getTime(); t <= scanEnd.getTime(); t += stepDays * 86400000) {
    const when = new Date(t)
    const satSign = Math.floor(
      siderealLongitude(Body.Saturn, astroTimeFromDate(when)) / 30,
    )
    const phase = phaseOf(satSign)
    if (phase) {
      if (!current || current.phase !== phase) {
        if (current) phases.push(current)
        current = { phase, start: when, end: when }
      } else {
        current.end = when
      }
    } else if (current) {
      phases.push(current)
      current = null
    }
  }
  if (current) phases.push(current)

  // Keep only phases that overlap the requested range.
  return phases.filter(
    (p) => p.end.getTime() >= rangeStart.getTime() && p.start.getTime() <= rangeEnd.getTime(),
  )
}

import {
  DASHA_ORDER,
  DASHA_YEARS,
  NAKSHATRA_SPAN,
  type PlanetName,
} from './constants'

// A Vedic sidereal year used for dasha math. Classical Vimshottari uses a
// 360-day "savana"-like convention in many texts, but the modern standard
// (and what Panchangas publish) is the solar sidereal year in days.
const DAYS_PER_YEAR = 365.2425

export interface DashaPeriod {
  lord: PlanetName
  start: Date
  end: Date
  /** Nested sub-periods (antardasha) when expanded. */
  sub?: DashaPeriod[]
}

/** Offset in ms for N Vimshottari years. */
function yearsToMs(years: number): number {
  return years * DAYS_PER_YEAR * 24 * 60 * 60 * 1000
}

/**
 * Compute the Vimshottari maha-dasha sequence from the natal Moon longitude.
 * Returns the full 120-year cycle of maha-dashas, each with antardashas,
 * starting from the balance of the dasha active at birth.
 */
export function computeVimshottari(
  moonLongitude: number,
  birth: Date,
): DashaPeriod[] {
  // Which nakshatra the Moon occupies, and how far through it.
  const nakIndex = Math.floor(moonLongitude / NAKSHATRA_SPAN) % 27
  const into = moonLongitude - nakIndex * NAKSHATRA_SPAN
  const fractionElapsed = into / NAKSHATRA_SPAN

  // The dasha lord at birth is the lord of the Moon's nakshatra.
  const startLordIndex = nakIndex % 9
  const startLord = DASHA_ORDER[startLordIndex]

  // Balance of the first dasha (portion remaining at birth).
  const firstDashaTotalYears = DASHA_YEARS[startLord]
  const firstDashaElapsedYears = firstDashaTotalYears * fractionElapsed
  const firstDashaRemainingYears = firstDashaTotalYears - firstDashaElapsedYears

  const periods: DashaPeriod[] = []
  let cursor = new Date(birth.getTime())

  // First (partial) maha-dasha.
  {
    const end = new Date(cursor.getTime() + yearsToMs(firstDashaRemainingYears))
    periods.push({
      lord: startLord,
      start: new Date(cursor.getTime()),
      end,
      sub: computeAntardashas(
        startLord,
        cursor,
        end,
        // Antardasha that is already partly elapsed at birth.
        firstDashaElapsedYears,
      ),
    })
    cursor = end
  }

  // Remaining full maha-dashas for one full cycle.
  for (let step = 1; step < 9; step++) {
    const lord = DASHA_ORDER[(startLordIndex + step) % 9]
    const years = DASHA_YEARS[lord]
    const end = new Date(cursor.getTime() + yearsToMs(years))
    periods.push({
      lord,
      start: new Date(cursor.getTime()),
      end,
      sub: computeAntardashas(lord, cursor, end, 0),
    })
    cursor = end
  }

  return periods
}

/**
 * Antardasha (sub-period) breakdown within a maha-dasha. The order starts from
 * the maha lord itself, then proceeds in Vimshottari order. Each sub-period's
 * length is proportional: (mahaYears * subYears / 120).
 *
 * @param elapsedYearsAtStart years of the maha already elapsed before `start`
 *        (only non-zero for the birth-partial maha-dasha).
 */
function computeAntardashas(
  mahaLord: PlanetName,
  mahaStart: Date,
  mahaEnd: Date,
  elapsedYearsAtStart: number,
): DashaPeriod[] {
  const mahaYears = DASHA_YEARS[mahaLord]
  const startIndex = DASHA_ORDER.indexOf(mahaLord)
  const subs: DashaPeriod[] = []

  // Build the ideal (birth-referenced) timeline, then clip to [mahaStart, mahaEnd].
  const mahaStartMsIdeal = mahaStart.getTime() - yearsToMs(elapsedYearsAtStart)
  let cursorMs = mahaStartMsIdeal

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIndex + i) % 9]
    const subYears = (mahaYears * DASHA_YEARS[lord]) / 120
    const subEndMs = cursorMs + yearsToMs(subYears)

    // Clip to the visible maha window (handles the partial first maha).
    const visStart = Math.max(cursorMs, mahaStart.getTime())
    const visEnd = Math.min(subEndMs, mahaEnd.getTime())
    if (visEnd > visStart) {
      subs.push({
        lord,
        start: new Date(visStart),
        end: new Date(visEnd),
      })
    }
    cursorMs = subEndMs
  }

  return subs
}

/** Find the maha and antar dasha active at a given instant. */
export function dashaAt(
  periods: DashaPeriod[],
  when: Date,
): { maha?: DashaPeriod; antar?: DashaPeriod } {
  const t = when.getTime()
  const maha = periods.find((p) => t >= p.start.getTime() && t < p.end.getTime())
  const antar = maha?.sub?.find(
    (s) => t >= s.start.getTime() && t < s.end.getTime(),
  )
  return { maha, antar }
}

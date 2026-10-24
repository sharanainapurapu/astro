import {
  Body,
  Ecliptic,
  GeoVector,
  EclipticGeoMoon,
  Observer,
  SiderealTime,
  type AstroTime,
} from 'astronomy-engine'
import {
  NAKSHATRAS,
  NAKSHATRA_SPAN,
  SIGNS,
  SIGNS_SANSKRIT,
  SIGN_LORDS,
  EXALTATION_SIGN,
  DEBILITATION_SIGN,
  type PlanetName,
  type Nakshatra,
} from './constants'
import { astroTimeFromDate, norm360, tropicalToSidereal } from './ayanamsa'

export interface BirthInput {
  /** Absolute instant of birth (already converted to UTC). */
  date: Date
  /** Geographic latitude in degrees, north positive. */
  latitude: number
  /** Geographic longitude in degrees, east positive. */
  longitude: number
}

export type Dignity =
  | 'exalted' | 'debilitated' | 'own-sign' | 'neutral'

export interface PlanetPosition {
  planet: PlanetName
  /** Sidereal ecliptic longitude [0,360). */
  longitude: number
  /** 0-indexed sign (0 = Aries). */
  signIndex: number
  sign: string
  signSanskrit: string
  /** Degrees within the sign [0,30). */
  degreeInSign: number
  nakshatra: Nakshatra
  /** Pada 1..4 within the nakshatra. */
  pada: number
  retrograde: boolean
  dignity: Dignity
  /** House number 1..12 (whole-sign from ascendant). */
  house: number
}

export interface Chart {
  input: BirthInput
  time: AstroTime
  /** Sidereal longitude of the ascendant (Lagna). */
  ascendant: number
  ascendantSignIndex: number
  ascendantSign: string
  ascendantNakshatra: Nakshatra
  planets: PlanetPosition[]
  /** Sidereal longitude of the Moon, cached for dasha calc. */
  moonLongitude: number
}

// Map our planet names to astronomy-engine bodies (nodes handled separately).
const BODY_MAP: Partial<Record<PlanetName, Body>> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mars: Body.Mars,
  Mercury: Body.Mercury,
  Jupiter: Body.Jupiter,
  Venus: Body.Venus,
  Saturn: Body.Saturn,
}

/** Tropical geocentric ecliptic longitude of a body, in degrees. */
function tropicalLongitude(body: Body, time: AstroTime): number {
  if (body === Body.Moon) {
    const m = EclipticGeoMoon(time)
    return norm360(m.lon)
  }
  const vec = GeoVector(body, time, true)
  const ecl = Ecliptic(vec)
  return norm360(ecl.elon)
}

/**
 * Mean longitude of the ascending lunar node (Rahu), tropical, in degrees.
 * Standard polynomial (Meeus). Ketu is exactly opposite.
 */
function meanRahuTropical(time: AstroTime): number {
  const T = time.tt / 36525
  // Mean longitude of the ascending node of the Moon's mean orbit.
  const omega =
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000
  return norm360(omega)
}

/** Determine retrograde by sampling longitude slightly before and after. */
function isRetrograde(body: Body, time: AstroTime): boolean {
  const dt = 0.5 // days
  const before = tropicalLongitude(body, time.AddDays(-dt))
  const after = tropicalLongitude(body, time.AddDays(dt))
  // Handle wrap-around at 0/360.
  let delta = after - before
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta < 0
}

function dignityOf(planet: PlanetName, signIndex: number): Dignity {
  if (EXALTATION_SIGN[planet] === signIndex) return 'exalted'
  if (DEBILITATION_SIGN[planet] === signIndex) return 'debilitated'
  if (SIGN_LORDS[signIndex] === planet) return 'own-sign'
  return 'neutral'
}

function nakshatraFor(longitude: number): { nakshatra: Nakshatra; pada: number } {
  const idx = Math.floor(longitude / NAKSHATRA_SPAN) % 27
  const within = longitude - idx * NAKSHATRA_SPAN
  const pada = Math.floor(within / (NAKSHATRA_SPAN / 4)) + 1
  return { nakshatra: NAKSHATRAS[idx], pada }
}

/**
 * Compute the sidereal ascendant (Lagna).
 * Uses Local Apparent Sidereal Time to get the RAMC, then the standard
 * ascendant formula with the true obliquity, then converts tropical→sidereal.
 */
function computeAscendant(time: AstroTime, lat: number, lon: number): number {
  // Greenwich Apparent Sidereal Time in hours → degrees.
  const gastHours = SiderealTime(time)
  const lstDeg = norm360(gastHours * 15 + lon)
  const ramc = lstDeg * (Math.PI / 180)

  // Obliquity of the ecliptic (mean, adequate for the ascendant).
  const T = time.tt / 36525
  const eps =
    (23.4392911 - 0.0130041667 * T - 1.63889e-7 * T * T + 5.03611e-7 * T * T * T) *
    (Math.PI / 180)

  const phi = lat * (Math.PI / 180)

  // Standard ascendant formula.
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
  )
  const ascTropical = norm360(asc * (180 / Math.PI))
  return tropicalToSidereal(ascTropical, time)
}

export function computeChart(input: BirthInput): Chart {
  const time = astroTimeFromDate(input.date)
  Observer // referenced to keep import meaningful across engine versions
  const observer = new Observer(input.latitude, input.longitude, 0)
  void observer

  const ascendant = computeAscendant(time, input.latitude, input.longitude)
  const ascSignIndex = Math.floor(ascendant / 30)

  const planets: PlanetPosition[] = []
  let moonLongitude = 0

  for (const planet of Object.keys(BODY_MAP) as PlanetName[]) {
    const body = BODY_MAP[planet]!
    const tropical = tropicalLongitude(body, time)
    const sidereal = tropicalToSidereal(tropical, time)
    planets.push(buildPlanet(planet, sidereal, isRetrograde(body, time), ascSignIndex))
    if (planet === 'Moon') moonLongitude = sidereal
  }

  // Nodes: Rahu (mean) and Ketu opposite. Nodes are always retrograde.
  const rahuTropical = meanRahuTropical(time)
  const rahuSidereal = tropicalToSidereal(rahuTropical, time)
  const ketuSidereal = norm360(rahuSidereal + 180)
  planets.push(buildPlanet('Rahu', rahuSidereal, true, ascSignIndex))
  planets.push(buildPlanet('Ketu', ketuSidereal, true, ascSignIndex))

  const ascNak = nakshatraFor(ascendant).nakshatra

  return {
    input,
    time,
    ascendant,
    ascendantSignIndex: ascSignIndex,
    ascendantSign: SIGNS[ascSignIndex],
    ascendantNakshatra: ascNak,
    planets,
    moonLongitude,
  }
}

function buildPlanet(
  planet: PlanetName,
  sidereal: number,
  retrograde: boolean,
  ascSignIndex: number,
): PlanetPosition {
  const signIndex = Math.floor(sidereal / 30)
  const degreeInSign = sidereal - signIndex * 30
  const { nakshatra, pada } = nakshatraFor(sidereal)
  // Whole-sign houses: house 1 is the ascendant's sign.
  const house = ((signIndex - ascSignIndex + 12) % 12) + 1
  return {
    planet,
    longitude: sidereal,
    signIndex,
    sign: SIGNS[signIndex],
    signSanskrit: SIGNS_SANSKRIT[signIndex],
    degreeInSign,
    nakshatra,
    pada,
    retrograde,
    dignity: dignityOf(planet, signIndex),
    house,
  }
}

/** Format a longitude as "12°34' Sign". */
export function formatLongitude(longitude: number): string {
  const signIndex = Math.floor(longitude / 30)
  const deg = longitude - signIndex * 30
  const d = Math.floor(deg)
  const m = Math.floor((deg - d) * 60)
  return `${d}°${String(m).padStart(2, '0')}' ${SIGNS[signIndex]}`
}

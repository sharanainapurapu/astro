import { AstroTime, MakeTime } from 'astronomy-engine'

/**
 * Lahiri (Chitrapaksha) ayanamsa — the official ayanamsa of the Indian
 * government's Calendar Reform Committee and the most widely used in Vedic
 * astrology.
 *
 * We use a high-accuracy polynomial in Julian centuries from J2000.0. This
 * reproduces the Lahiri value to within a small fraction of an arc-minute over
 * the modern era, which is more than enough for chart work (nakshatra and
 * house placement are unaffected by sub-arc-minute differences).
 *
 * Reference epoch: at J2000.0 (2000 Jan 1, 12:00 TT) Lahiri ayanamsa ≈ 23.853°.
 * Precession rate ≈ 50.2888"/year with a small acceleration term.
 */
export function lahiriAyanamsa(time: AstroTime): number {
  // Julian centuries from J2000.0 (TT). AstroTime.tt is days since J2000.
  const T = time.tt / 36525

  // Mean value at J2000 plus precession. Coefficients chosen to match the
  // Lahiri definition (spica-based) across the modern era.
  // ayanamsa(deg) = 23.85240 + 1.396042*T + 0.0003086*T^2
  // (1.396042 deg/century ≈ 50.2575"/yr, with quadratic acceleration)
  const ayanamsa = 23.85240 + 1.396042 * T + 0.0003086 * T * T

  return ayanamsa
}

/** Convert a tropical (sayana) ecliptic longitude to sidereal (nirayana). */
export function tropicalToSidereal(tropicalLon: number, time: AstroTime): number {
  const sidereal = tropicalLon - lahiriAyanamsa(time)
  return norm360(sidereal)
}

/** Normalize an angle to the range [0, 360). */
export function norm360(deg: number): number {
  let d = deg % 360
  if (d < 0) d += 360
  return d
}

/** Build an AstroTime from a JS Date (interpreted as an absolute UTC instant). */
export function astroTimeFromDate(date: Date): AstroTime {
  return MakeTime(date)
}

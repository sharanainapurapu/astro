// Core Vedic (Jyotish) constants: signs, nakshatras, planets.

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const
export type Sign = (typeof SIGNS)[number]

// Sanskrit names of the signs (Rashi).
export const SIGNS_SANSKRIT = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
] as const

// The nine grahas used in Vedic astrology. Rahu & Ketu are the lunar nodes
// (mean node is used here, matching most classical Panchanga practice).
export type PlanetName =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'

export const PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
]

export const PLANET_SANSKRIT: Record<PlanetName, string> = {
  Sun: 'Surya',
  Moon: 'Chandra',
  Mars: 'Mangala',
  Mercury: 'Budha',
  Jupiter: 'Guru',
  Venus: 'Shukra',
  Saturn: 'Shani',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
}

// The 27 nakshatras with their ruling dasha lord (for Vimshottari).
export interface Nakshatra {
  index: number // 0..26
  name: string
  lord: PlanetName
}

// Vimshottari lord cycle, repeating every 9 nakshatras.
const DASHA_CYCLE: PlanetName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
]

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
]

export const NAKSHATRAS: Nakshatra[] = NAKSHATRA_NAMES.map((name, i) => ({
  index: i,
  name,
  lord: DASHA_CYCLE[i % 9],
}))

// Each nakshatra spans 13°20' = 13.3333... degrees.
export const NAKSHATRA_SPAN = 360 / 27

// Vimshottari maha-dasha durations in years. Total = 120 years.
export const DASHA_YEARS: Record<PlanetName, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
}

// Order in which dasha periods proceed.
export const DASHA_ORDER: PlanetName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
]

// Sign (0-indexed) ruled by each planet's domicile, used for dignity checks.
// Classical rulerships (Rahu/Ketu co-rule by common convention).
export const SIGN_LORDS: PlanetName[] = [
  'Mars',    // Aries
  'Venus',   // Taurus
  'Mercury', // Gemini
  'Moon',    // Cancer
  'Sun',     // Leo
  'Mercury', // Virgo
  'Venus',   // Libra
  'Mars',    // Scorpio
  'Jupiter', // Sagittarius
  'Saturn',  // Capricorn
  'Saturn',  // Aquarius
  'Jupiter', // Pisces
]

// Exaltation sign (0-indexed) for each planet; null where not defined.
export const EXALTATION_SIGN: Partial<Record<PlanetName, number>> = {
  Sun: 0,      // Aries
  Moon: 1,     // Taurus
  Mars: 9,     // Capricorn
  Mercury: 5,  // Virgo
  Jupiter: 3,  // Cancer
  Venus: 11,   // Pisces
  Saturn: 6,   // Libra
}

// Debilitation is exactly opposite the exaltation sign.
export const DEBILITATION_SIGN: Partial<Record<PlanetName, number>> = Object.fromEntries(
  Object.entries(EXALTATION_SIGN).map(([p, s]) => [p, (s + 6) % 12]),
) as Partial<Record<PlanetName, number>>

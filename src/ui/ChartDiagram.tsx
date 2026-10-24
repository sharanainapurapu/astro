import type { Chart } from '../astro/chart'

// North Indian style chart: a fixed diamond grid where house positions are
// constant and the ascendant sign number is written into house 1. Planets are
// placed into their house boxes.

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
}

// Centre coordinates for each house's label cluster in a 300x300 viewBox.
// Standard North Indian layout (house 1 at top-centre).
const HOUSE_POS: Record<number, { x: number; y: number }> = {
  1: { x: 150, y: 70 },
  2: { x: 75, y: 40 },
  3: { x: 40, y: 75 },
  4: { x: 80, y: 150 },
  5: { x: 40, y: 225 },
  6: { x: 75, y: 260 },
  7: { x: 150, y: 230 },
  8: { x: 225, y: 260 },
  9: { x: 260, y: 225 },
  10: { x: 220, y: 150 },
  11: { x: 260, y: 75 },
  12: { x: 225, y: 40 },
}

// Where to write the sign number for each house.
const SIGN_POS: Record<number, { x: number; y: number }> = {
  1: { x: 150, y: 95 },
  2: { x: 95, y: 55 },
  3: { x: 55, y: 95 },
  4: { x: 105, y: 150 },
  5: { x: 55, y: 205 },
  6: { x: 95, y: 245 },
  7: { x: 150, y: 205 },
  8: { x: 205, y: 245 },
  9: { x: 245, y: 205 },
  10: { x: 195, y: 150 },
  11: { x: 245, y: 95 },
  12: { x: 205, y: 55 },
}

export function ChartDiagram({ chart }: { chart: Chart }) {
  // Group planets by house.
  const byHouse = new Map<number, string[]>()
  for (const p of chart.planets) {
    const arr = byHouse.get(p.house) ?? []
    arr.push(PLANET_ABBR[p.planet] + (p.retrograde ? '\u1D63' : ''))
    byHouse.set(p.house, arr)
  }

  // Sign number occupying each house (1=Aries..12=Pisces), whole-sign.
  const signInHouse = (house: number) =>
    ((chart.ascendantSignIndex + (house - 1)) % 12) + 1

  return (
    <svg className="chart-svg" viewBox="0 0 300 300" role="img"
      aria-label="North Indian style birth chart">
      {/* Outer square */}
      <rect x="2" y="2" width="296" height="296" fill="none"
        stroke="#33356b" strokeWidth="2" />
      {/* Diagonals */}
      <line x1="2" y1="2" x2="298" y2="298" stroke="#33356b" strokeWidth="1.5" />
      <line x1="298" y1="2" x2="2" y2="298" stroke="#33356b" strokeWidth="1.5" />
      {/* Inner diamond */}
      <polygon points="150,2 298,150 150,298 2,150" fill="none"
        stroke="#33356b" strokeWidth="1.5" />

      {[...Array(12)].map((_, i) => {
        const house = i + 1
        const sp = SIGN_POS[house]
        return (
          <text key={`s${house}`} x={sp.x} y={sp.y} fill="#8a6cff"
            fontSize="11" textAnchor="middle" fontWeight="700">
            {signInHouse(house)}
          </text>
        )
      })}

      {[...Array(12)].map((_, i) => {
        const house = i + 1
        const hp = HOUSE_POS[house]
        const planets = byHouse.get(house) ?? []
        return (
          <text key={`p${house}`} x={hp.x} y={hp.y} fill="#f5b942"
            fontSize="12" textAnchor="middle" fontWeight="700">
            {planets.map((txt, j) => (
              <tspan key={j} x={hp.x} dy={j === 0 ? 0 : 14}>
                {txt}
              </tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}

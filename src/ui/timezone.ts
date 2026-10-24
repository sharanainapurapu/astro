// Convert a wall-clock local time in an IANA timezone to an absolute UTC Date.
//
// The browser has no direct "make a Date from (localFields, tz)" API, so we
// use Intl to find the zone's UTC offset at a candidate instant and invert it.
// Two passes handle the rare DST-boundary case where the offset at the first
// guess differs from the offset at the corrected instant.

/** Offset in minutes that the given tz is ahead of UTC at instant `date`. */
function tzOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, number> = {}
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = Number(p.value)
  }
  // The local wall time the tz shows for this instant, as if it were UTC.
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour === 24 ? 0 : map.hour,
    map.minute,
    map.second,
  )
  return (asUTC - date.getTime()) / 60000
}

/**
 * Build a UTC Date from local wall-clock fields interpreted in `timeZone`.
 * @param y full year, mo 1-12, d 1-31, h 0-23, mi 0-59
 */
export function localToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  timeZone: string,
): Date {
  // First guess: treat the fields as if they were UTC.
  const guessMs = Date.UTC(y, mo - 1, d, h, mi, 0)
  let offset = tzOffsetMinutes(new Date(guessMs), timeZone)
  let utcMs = guessMs - offset * 60000

  // Second pass to settle DST transitions.
  const offset2 = tzOffsetMinutes(new Date(utcMs), timeZone)
  if (offset2 !== offset) {
    offset = offset2
    utcMs = guessMs - offset * 60000
  }
  return new Date(utcMs)
}

/** Human-readable UTC offset like "+05:30" at a given instant. */
export function formatOffset(date: Date, timeZone: string): string {
  const off = tzOffsetMinutes(date, timeZone)
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `${sign}${hh}:${mm}`
}

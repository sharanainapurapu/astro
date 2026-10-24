import { useState } from 'react'
import { PLACES } from './places'

export interface BirthFormValue {
  date: string // yyyy-mm-dd
  time: string // hh:mm
  placeIndex: number
  manualLat: string
  manualLon: string
  manualTz: string
  useManual: boolean
}

const DEFAULT: BirthFormValue = {
  date: '1990-01-01',
  time: '12:00',
  placeIndex: 0,
  manualLat: '',
  manualLon: '',
  manualTz: 'Asia/Kolkata',
  useManual: false,
}

export function BirthForm({
  onSubmit,
}: {
  onSubmit: (v: BirthFormValue) => void
}) {
  const [v, setV] = useState<BirthFormValue>(DEFAULT)
  const set = <K extends keyof BirthFormValue>(k: K, val: BirthFormValue[K]) =>
    setV((prev) => ({ ...prev, [k]: val }))

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(v)
      }}
    >
      <h2>🪔 Birth Details</h2>
      <div className="form-grid">
        <div>
          <label htmlFor="bdate">Date of birth</label>
          <input
            id="bdate"
            type="date"
            value={v.date}
            min="1800-01-01"
            max="2200-12-31"
            onChange={(e) => set('date', e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="btime">Time of birth (24h, local)</label>
          <input
            id="btime"
            type="time"
            value={v.time}
            onChange={(e) => set('time', e.target.value)}
            required
          />
        </div>
        {!v.useManual && (
          <div>
            <label htmlFor="bplace">Place of birth</label>
            <select
              id="bplace"
              value={v.placeIndex}
              onChange={(e) => set('placeIndex', Number(e.target.value))}
            >
              {PLACES.map((p, i) => (
                <option key={i} value={i}>
                  {p.name}, {p.country}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="kbd-hint">
        <label style={{ textTransform: 'none', display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={v.useManual}
            onChange={(e) => set('useManual', e.target.checked)}
          />
          Enter latitude / longitude manually
        </label>
      </div>

      {v.useManual && (
        <div className="form-grid" style={{ marginTop: 12 }}>
          <div>
            <label htmlFor="lat">Latitude (°, N positive)</label>
            <input
              id="lat"
              type="number"
              step="0.0001"
              placeholder="e.g. 28.6139"
              value={v.manualLat}
              onChange={(e) => set('manualLat', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lon">Longitude (°, E positive)</label>
            <input
              id="lon"
              type="number"
              step="0.0001"
              placeholder="e.g. 77.2090"
              value={v.manualLon}
              onChange={(e) => set('manualLon', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="tz">Timezone (IANA)</label>
            <input
              id="tz"
              type="text"
              placeholder="e.g. Asia/Kolkata"
              value={v.manualTz}
              onChange={(e) => set('manualTz', e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 18 }}>
        <button className="primary" type="submit">
          Calculate chart ✨
        </button>
      </div>
    </form>
  )
}

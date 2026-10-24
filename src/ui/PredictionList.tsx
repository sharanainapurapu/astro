import type { Prediction } from '../astro/predictions'

export function PredictionList({ predictions }: { predictions: Prediction[] }) {
  if (predictions.length === 0) {
    return <p className="muted">No matching principles found for this selection.</p>
  }
  return (
    <div>
      {predictions.map((p, i) => (
        <div className="prediction" key={i}>
          <strong>{p.heading}</strong>
          <div className="feature">{p.feature}</div>
          {p.entries.map((e) => (
            <div className="passage" key={e.id}>
              <div>{e.text}</div>
              <span className="cite">— {e.source}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

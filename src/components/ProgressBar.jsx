/**
 * ProgressBar — 像素風進度條（分段式）
 *
 * Props:
 *   current - 目前進度（1-based）
 *   total   - 總數
 *   label   - 是否顯示 label（預設 true）
 */
export default function ProgressBar({ current, total, label = true }) {
  const segments = Array.from({ length: total }, (_, i) => i < current)

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-bar-label">
          STAGE {current}/{total}
        </div>
      )}
      <div className="progress-bar-track">
        {segments.map((filled, i) => (
          <div
            key={i}
            className={`progress-bar-segment ${filled ? 'filled' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

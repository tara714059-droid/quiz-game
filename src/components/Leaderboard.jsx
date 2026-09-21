/**
 * Leaderboard — 排行榜元件
 * 從 GAS 取得資料並以像素風格顯示
 *
 * Props:
 *   limit      - 顯示筆數（預設 10）
 *   currentId  - 目前玩家 ID（若在排行榜中，該列高亮）
 */
import { useState, useEffect } from 'react'
import { fetchLeaderboard } from '../services/api.js'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ limit = 10, currentId = '' }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null)
    setError('')
    fetchLeaderboard(limit)
      .then(rows => setData(rows))
      .catch(err => setError(err.message))
  }, [limit])

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-empty" style={{ color: 'var(--red)' }}>
          ⚠ {error}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">LOADING RANKS...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-empty">NO RECORDS YET</div>
      </div>
    )
  }

  return (
    <div className="leaderboard-container">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>#</th>
            <th>PLAYER</th>
            <th style={{ textAlign: 'right' }}>BEST</th>
            <th style={{ textAlign: 'right' }}>PLAYS</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const rankNum = i + 1
            const isMe = currentId && String(row.id) === String(currentId)

            return (
              <tr
                key={row.id}
                style={isMe ? { background: 'rgba(255,230,0,0.08)' } : {}}
              >
                <td className={`lb-rank lb-rank-${rankNum}`} style={{ textAlign: 'center' }}>
                  {rankNum <= 3
                    ? <span className="lb-medal">{MEDALS[rankNum - 1]}</span>
                    : rankNum
                  }
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="lb-id" style={isMe ? { color: 'var(--yellow)' } : {}}>
                      {isMe ? `▶ ${row.id}` : row.id}
                    </span>
                    {row.passedIn !== null && (
                      <span className="lb-pass-tag">CLR</span>
                    )}
                  </div>
                </td>
                <td className="lb-score">{row.highScore}</td>
                <td className="lb-attempts">{row.attempts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

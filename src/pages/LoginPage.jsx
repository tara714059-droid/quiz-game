/**
 * LoginPage — 首頁
 * 玩家輸入 ID 後開始遊戲，並可查看排行榜
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelButton from '../components/PixelButton.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import { playStart, playTransition } from '../utils/soundEffects.js'
import { QUESTION_COUNT, PASS_THRESHOLD } from '../services/api.js'

// 星空背景元件
function Starfield() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() < 0.3 ? 3 : 2,
    dur: `${(Math.random() * 2 + 1.5).toFixed(1)}s`,
    delay: `${(Math.random() * 2).toFixed(1)}s`,
  }))

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            '--dur': s.dur,
            '--delay': s.delay,
          }}
        />
      ))}
    </div>
  )
}

export default function LoginPage() {
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [starting, setStarting] = useState(false)
  const navigate = useNavigate()

  // 入場動畫結束後播放背景音
  useEffect(() => {
    // noop — 可在此加入 BGM
  }, [])

  const handleStart = () => {
    const trimmedId = id.trim()
    if (!trimmedId) {
      setError('⚠ 請輸入你的 ID！')
      return
    }
    if (trimmedId.length < 2) {
      setError('⚠ ID 至少需要 2 個字元')
      return
    }
    setStarting(true)
    playStart()
    setTimeout(() => {
      playTransition()
      navigate('/game', { state: { id: trimmedId } })
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleStart()
  }

  return (
    <div className="login-page">
      <Starfield />

      <div className="login-container fade-in">
        {/* 主標題 */}
        <div className="game-title">
          <span className="game-title-ja">高雄知識王</span>
          <span className="game-title-en">KAOHSIUNG QUIZ KING</span>
        </div>

        {/* 資訊標籤 */}
        <div style={{
          display: 'flex',
          gap: 12,
          fontSize: 8,
          color: 'var(--muted)',
          letterSpacing: 1,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span>📋 {QUESTION_COUNT} QUESTIONS</span>
          <span>🎯 PASS: {PASS_THRESHOLD}/{QUESTION_COUNT}</span>
        </div>

        {/* 登入卡片 */}
        <div className="login-card slide-in-up">
          <div className="login-card-title">─── INSERT PLAYER ID ───</div>

          <div>
            <label className="pixel-label" htmlFor="player-id">YOUR ID</label>
            <input
              id="player-id"
              className="pixel-input"
              type="text"
              value={id}
              onChange={e => { setId(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="ENTER_ID"
              maxLength={20}
              autoComplete="off"
              autoFocus
            />
            {error && <div className="pixel-error">{error}</div>}
          </div>

          <div className="login-btn-row">
            <PixelButton
              color="primary"
              size="lg"
              onClick={handleStart}
              disabled={starting}
            >
              {starting ? '▶▶▶' : '▶ START'}
            </PixelButton>
            <PixelButton
              color="ghost"
              onClick={() => setShowLeaderboard(true)}
            >
              🏆 RANK
            </PixelButton>
          </div>
        </div>

        <div className="login-version">
          v1.0.0 · PRESS START TO PLAY
        </div>
      </div>

      {/* 排行榜 Modal */}
      {showLeaderboard && (
        <div
          className="modal-overlay"
          onClick={() => setShowLeaderboard(false)}
        >
          <div
            className="modal-box slide-in-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <span>🏆 LEADERBOARD</span>
              <PixelButton
                size="sm"
                color="danger"
                onClick={() => setShowLeaderboard(false)}
              >
                ✕ CLOSE
              </PixelButton>
            </div>
            <div className="modal-body">
              <Leaderboard limit={10} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ResultPage — 成績結果頁
 *
 * 從 navigate state 接收：
 *   score, totalQuestions, passThreshold, passed, details, id, questions
 *
 * 功能：
 * - 顯示分數 + 通關/失敗 banner
 * - 每題作答明細（答對/答錯 + 正確答案）
 * - 排行榜（含本人高亮）
 * - 再玩一次 / 返回首頁
 */
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PixelButton from '../components/PixelButton.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import Confetti from '../components/Confetti.jsx'
import { playVictory, playGameOver, playCorrect, playWrong } from '../utils/soundEffects.js'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const [showDetails, setShowDetails] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const {
    score = 0,
    totalQuestions = 0,
    passThreshold = 0,
    passed = false,
    details = [],
    id = '',
    questions = [],
  } = state || {}

  // 若無資料，導回首頁
  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true })
      return
    }

    // 播放結果音效
    if (passed) {
      playVictory()
    } else {
      playGameOver()
    }
  }, [state, passed, navigate])

  // 詳細明細展開時，逐一播放聲音
  useEffect(() => {
    if (!showDetails || details.length === 0) return
    let timeout
    details.forEach((d, i) => {
      timeout = setTimeout(() => {
        if (d.isCorrect) playCorrect()
        else playWrong()
      }, i * 180)
    })
    return () => clearTimeout(timeout)
  }, [showDetails, details])

  if (!state) return null

  // 建立題目 map 以顯示題目文字
  const questionMap = {}
  if (Array.isArray(questions)) {
    questions.forEach(q => { questionMap[String(q.id)] = q })
  }

  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

  return (
    <>
      <Confetti active={passed} />

      <div className="result-page">

        {/* ── Banner ── */}
        <div className={`result-banner ${passed ? 'passed' : 'failed'} w-full slide-in-up`}>
          <div className="result-banner-title">
            {passed ? '★ STAGE CLEAR! ★' : '✖ GAME OVER ✖'}
          </div>
          <div className="result-banner-sub">
            {passed
              ? `CONGRATS! YOU PASSED WITH ${score}/${totalQuestions}`
              : `NEED ${passThreshold} TO PASS. TRY AGAIN!`
            }
          </div>
        </div>

        {/* ── 分數 ── */}
        <div className="score-box slide-in-up" style={{ '--delay': '0.1s' }}>
          <div className="score-label">YOUR SCORE</div>
          <div className="score-value">{score}</div>
          <div className="score-denom">/{totalQuestions} ({pct}%)</div>
          <div style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            fontSize: 8,
            color: 'var(--muted)',
            letterSpacing: 1,
          }}>
            <span>✓ {score} correct</span>
            <span>✗ {totalQuestions - score} wrong</span>
          </div>
        </div>

        {/* ── 操作按鈕 ── */}
        <div className="result-actions">
          <PixelButton
            color="primary"
            size="lg"
            onClick={() => navigate('/game', { state: { id } })}
          >
            ↺ RETRY
          </PixelButton>
          <PixelButton
            color="ghost"
            onClick={() => navigate('/')}
          >
            ⌂ HOME
          </PixelButton>
        </div>

        {/* ── 作答明細 toggle ── */}
        <div className="w-full">
          <PixelButton
            color="info"
            className="w-full"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setShowDetails(v => !v)}
          >
            {showDetails ? '▲ HIDE DETAILS' : '▼ SHOW DETAILS'}
          </PixelButton>
        </div>

        {/* ── 作答明細列表 ── */}
        {showDetails && details.length > 0 && (
          <div className="details-section w-full slide-in-up">
            <div className="details-title">ANSWER BREAKDOWN</div>
            {details.map((d, i) => {
              const q = questionMap[String(d.id)] || questions[i]
              const isCorrect = d.isCorrect

              return (
                <div
                  key={`${d.id}-${i}`}
                  className={`detail-item ${isCorrect ? 'correct' : 'wrong'}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="detail-icon">
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="detail-body">
                    <div className="detail-q">
                      Q{i + 1}{q ? `: ${q.question}` : ''}
                    </div>
                    <div className="detail-answer-row">
                      <span className={`detail-badge ${isCorrect ? 'user' : 'wrong-ans'}`}>
                        你的作答：({d.userAnswer}) {q && q[d.userAnswer] ? q[d.userAnswer] : ''}
                      </span>
                      {!isCorrect && (
                        <span className="detail-badge correct-ans">
                          正確解答：({d.correctAnswer}) {q && q[d.correctAnswer] ? q[d.correctAnswer] : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 排行榜 toggle ── */}
        <div className="w-full">
          <PixelButton
            color="ghost"
            className="w-full"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setShowLeaderboard(v => !v)}
          >
            {showLeaderboard ? '▲ HIDE LEADERBOARD' : '🏆 LEADERBOARD'}
          </PixelButton>
        </div>

        {showLeaderboard && (
          <div className="w-full slide-in-up" style={{
            background: 'var(--panel)',
            border: '2px solid var(--yellow)',
            padding: 12,
          }}>
            <Leaderboard limit={10} currentId={id} />
          </div>
        )}

      </div>
    </>
  )
}

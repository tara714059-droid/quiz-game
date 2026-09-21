/**
 * GamePage — 主遊戲頁面
 *
 * 流程：
 * 1. 從 GAS 載入題目
 * 2. 每題顯示關主 + 題目 + ABCD 四個選項
 * 3. 玩家選擇後：關主受傷動畫、移至下一題
 * 4. 所有題答完後送出 GAS，導向結果頁
 *
 * 注意：答案正確與否在結果頁才揭曉（服務端驗證）
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BossAvatar from '../components/BossAvatar.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import PixelButton from '../components/PixelButton.jsx'
import { fetchQuestions, submitScore } from '../services/api.js'
import { playHit, playGameOver } from '../utils/soundEffects.js'
import { getBossName } from '../utils/dicebear.js'

const OPTIONS = ['A', 'B', 'C', 'D']

/** Loading 畫面 */
function LoadingScreen({ text = 'LOADING...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-title">{text}</div>
      <div className="loading-dots">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>
    </div>
  )
}

/** 錯誤畫面 */
function ErrorScreen({ message, onBack }) {
  return (
    <div className="loading-screen">
      <div style={{ fontSize: 9, color: 'var(--red)', textAlign: 'center', maxWidth: 300, lineHeight: 2 }}>
        ⚠ ERROR<br />{message}
      </div>
      <PixelButton color="danger" onClick={onBack}>← BACK</PixelButton>
    </div>
  )
}

export default function GamePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const id = location.state?.id

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])         // [{id, answer}]
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [bossShake, setBossShake] = useState(false)
  const [showHit, setShowHit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 防止重複送出
  const submittedRef = useRef(false)

  // 若無 ID，導回首頁
  useEffect(() => {
    if (!id) navigate('/', { replace: true })
  }, [id, navigate])

  // 載入題目
  useEffect(() => {
    if (!id) return
    fetchQuestions()
      .then(qs => {
        if (!qs || qs.length === 0) throw new Error('沒有取得任何題目，請確認 Google Sheets')
        setQuestions(qs)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  // Boss HP 百分比（隨關卡遞減）
  const bossHpPct = totalQuestions > 0
    ? ((totalQuestions - currentIndex) / totalQuestions) * 100
    : 100

  const handleAnswer = useCallback((option) => {
    if (isAnswered || submitting) return

    setSelectedAnswer(option)
    setIsAnswered(true)

    // 關主受傷動畫 + 音效
    setBossShake(true)
    setShowHit(true)
    playHit()

    const newAnswers = [...answers, { id: currentQuestion.id, answer: option }]
    setAnswers(newAnswers)

    setTimeout(() => {
      setBossShake(false)
      setShowHit(false)

      if (currentIndex + 1 < totalQuestions) {
        // 進入下一題
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setIsAnswered(false)
      } else {
        // 全部答完 → 送出
        if (submittedRef.current) return
        submittedRef.current = true
        setSubmitting(true)
        playGameOver()

        submitScore(id, newAnswers)
          .then(result => {
            navigate('/result', { state: { ...result, id, questions } })
          })
          .catch(err => {
            setError(err.message)
            setSubmitting(false)
            submittedRef.current = false
          })
      }
    }, 900)
  }, [isAnswered, submitting, answers, currentQuestion, currentIndex, totalQuestions, id, questions, navigate])

  // ── 渲染 ──

  if (!id) return null

  if (loading) return <LoadingScreen text="FETCHING QUESTS..." />
  if (submitting) return <LoadingScreen text="CALCULATING..." />
  if (error) return <ErrorScreen message={error} onBack={() => navigate('/')} />
  if (!currentQuestion) return <LoadingScreen />

  const bossIndex = currentIndex % 100
  const bossName = getBossName(currentIndex)

  return (
    <div className="game-page">

      {/* ── Header ── */}
      <div className="game-header">
        <div className="game-header-id">
          {id}
        </div>
        <div className="game-header-counter">
          {currentIndex + 1}<span style={{ color: 'var(--muted)' }}>/{totalQuestions}</span>
        </div>
      </div>

      {/* ── 進度條 ── */}
      <div className="progress-section">
        <ProgressBar current={currentIndex + 1} total={totalQuestions} label={false} />
      </div>

      {/* ── Boss 區塊 ── */}
      <div className="boss-section">
        <div className="boss-name-tag">{bossName}</div>

        <div style={{ position: 'relative' }}>
          <BossAvatar index={bossIndex} shake={bossShake} size={110} />
          {showHit && (
            <div className="hit-text" style={{ top: '0', right: '-20px' }}>
              HIT!
            </div>
          )}
        </div>

        {/* Boss HP Bar */}
        <div style={{ width: '100%' }}>
          <div className="boss-hp-bar-label">BOSS HP</div>
          <div className="boss-hp-track">
            <div
              className="boss-hp-fill"
              style={{ width: `${bossHpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 問題 ── */}
      <div className="question-section">
        <div className="question-number-badge">Q {currentIndex + 1}</div>
        <div className="question-text">{currentQuestion.question}</div>
      </div>

      {/* ── 選項 ── */}
      <div className="options-section">
        <div className="options-grid">
          {OPTIONS.map(opt => {
            const isSelected = selectedAnswer === opt
            return (
              <button
                key={opt}
                className={`option-btn${isSelected ? ' selected' : ''}`}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered}
                aria-label={`選項 ${opt}: ${currentQuestion[opt]}`}
              >
                <span className="option-letter">{opt}</span>
                <span style={{ flex: 1, wordBreak: 'break-all' }}>
                  {currentQuestion[opt]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

/**
 * Google Apps Script API 封裝
 * 所有與 GAS 後端的通訊都經過本模組
 */

import { MOCK_QUESTIONS, MOCK_LEADERBOARD } from './mockData.js'

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL
export const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT || '10')
export const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '6')

// 本地暫存的模擬作答記錄與排行榜
let localLeaderboard = [...MOCK_LEADERBOARD]

/**
 * 共用 fetch 函式（處理 GAS 回傳的錯誤結構）
 */
async function gasGet(params) {
  if (!GAS_URL || GAS_URL.includes('YOUR_SCRIPT_ID')) {
    throw new Error('未設定有效 GAS URL')
  }
  const url = new URL(GAS_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const data = await res.json()
  if (data.error) throw new Error(`GAS Error: ${data.error}`)
  return data
}

/**
 * 從 GAS 隨機取得題目（不含解答）
 * 若 GAS 請求失敗（例如未開放匿名存取/CORS），自動 Fallback 到測試題庫
 * @returns {Promise<Array<{id, question, A, B, C, D}>>}
 */
export async function fetchQuestions() {
  try {
    const data = await gasGet({ action: 'getQuestions', count: QUESTION_COUNT })
    return data.questions
  } catch (err) {
    console.warn('⚠️ 無法連線至 Google Apps Script，自動啟用本地測試題庫：', err.message)
    // Fisher-Yates 洗牌
    const shuffled = [...MOCK_QUESTIONS]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const selected = shuffled.slice(0, Math.min(QUESTION_COUNT, shuffled.length))
    // 不回傳答案欄
    return selected.map(({ id, question, A, B, C, D }) => ({ id, question, A, B, C, D }))
  }
}

/**
 * 送出所有答案，由 GAS 計算成績並寫入 Sheets
 * 若 GAS 斷線，則在前端計算並更新模擬排行榜
 * @param {string} id - 玩家 ID
 * @param {Array<{id: string, answer: string}>} answers - 作答陣列
 * @returns {Promise<{score, totalQuestions, passThreshold, passed, details}>}
 */
export async function submitScore(id, answers) {
  try {
    const data = await gasGet({
      action: 'submitScore',
      id: id,
      answers: JSON.stringify(answers),
    })
    return data
  } catch (err) {
    console.warn('⚠️ 無法連線至 Google Apps Script，於本地計算成績：', err.message)
    const answerMap = {}
    MOCK_QUESTIONS.forEach(q => { answerMap[q.id] = q.ans })

    let score = 0
    const details = answers.map(a => {
      const correctAnswer = answerMap[String(a.id)] || 'A'
      const isCorrect = String(a.answer).toUpperCase() === correctAnswer
      if (isCorrect) score++
      return {
        id: a.id,
        userAnswer: a.answer,
        correctAnswer,
        isCorrect
      }
    })

    const totalQuestions = answers.length
    const passed = score >= PASS_THRESHOLD

    // 更新本地 mock 排行榜
    const existingIndex = localLeaderboard.findIndex(r => r.id === id)
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19)
    if (existingIndex === -1) {
      localLeaderboard.push({
        id,
        attempts: 1,
        totalScore: score,
        highScore: score,
        firstPassScore: passed ? score : null,
        passedIn: passed ? 1 : null,
        lastPlayed: nowStr
      })
    } else {
      const row = localLeaderboard[existingIndex]
      row.attempts += 1
      row.totalScore += score
      row.highScore = Math.max(row.highScore, score)
      if (row.firstPassScore === null && passed) {
        row.firstPassScore = score
        row.passedIn = row.attempts
      }
      row.lastPlayed = nowStr
    }
    localLeaderboard.sort((a, b) => b.highScore - a.highScore || a.attempts - b.attempts)

    return {
      score,
      totalQuestions,
      passThreshold: PASS_THRESHOLD,
      passed,
      details
    }
  }
}

/**
 * 取得排行榜
 * @param {number} limit - 回傳筆數（預設 10）
 * @returns {Promise<Array<{id, attempts, totalScore, highScore, firstPassScore, passedIn, lastPlayed}>>}
 */
export async function fetchLeaderboard(limit = 10) {
  try {
    const data = await gasGet({ action: 'getLeaderboard', limit })
    return data.leaderboard
  } catch (err) {
    console.warn('⚠️ 取得 GAS 排行榜失敗，顯示本地測試排行榜')
    return localLeaderboard.slice(0, limit)
  }
}

// ============================================================
// 像素闖關王 — Google Apps Script 後端
// ============================================================
// 部署方式：
//   GAS 編輯器 → 部署 → 新增部署 → 類型：網頁應用程式
//   執行身份：我（你的 Google 帳號）
//   存取權限：所有人（包含匿名）
//
// 選用設定：可在「專案設定 > 指令碼屬性」中新增
//   PASS_THRESHOLD = 6   (覆蓋前端預設值)
// ============================================================

// 主路由
function doGet(e) {
  const params = e.parameter || {}
  const action = params.action
  let result

  try {
    switch (action) {
      case 'getQuestions':
        result = getQuestions(parseInt(params.count) || 10)
        break
      case 'submitScore':
        if (!params.id || !params.answers) {
          throw new Error('缺少必要參數: id 或 answers')
        }
        result = submitScore(
          String(params.id).trim(),
          JSON.parse(params.answers)
        )
        break
      case 'getLeaderboard':
        result = getLeaderboard(parseInt(params.limit) || 10)
        break
      default:
        result = { error: 'Unknown action: ' + action }
    }
  } catch (err) {
    result = { error: err.message || String(err) }
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
}

// ============================================================
// getQuestions：隨機取 N 題，不含解答欄
// ============================================================
function getQuestions(count) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName('題目')
  if (!sheet) throw new Error('找不到「題目」工作表，請確認工作表名稱')

  const data = sheet.getDataRange().getValues()
  if (data.length <= 1) throw new Error('題目工作表沒有任何題目（只有標題列）')

  // 跳過標題列，過濾空白列
  // 欄位順序：[題號, 題目, A, B, C, D, 解答]
  const rows = data.slice(1).filter(row => row[0] !== '' && row[0] !== null && row[0] !== undefined)

  if (rows.length === 0) throw new Error('題目工作表沒有有效資料')

  const actualCount = Math.min(count, rows.length)

  // Fisher-Yates 洗牌
  const shuffled = [...rows]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const selected = shuffled.slice(0, actualCount)

  const questions = selected.map(row => ({
    id: String(row[0]),
    question: String(row[1]),
    A: String(row[2]),
    B: String(row[3]),
    C: String(row[4]),
    D: String(row[5])
    // row[6] 是解答，刻意不回傳
  }))

  return { questions, totalInBank: rows.length }
}

// ============================================================
// submitScore：比對解答、計算分數、更新「回答」工作表
// ============================================================
function submitScore(id, answers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  // --- 1. 取得解答對照表 ---
  const qSheet = ss.getSheetByName('題目')
  if (!qSheet) throw new Error('找不到「題目」工作表')

  const qData = qSheet.getDataRange().getValues()
  const answerMap = {}
  for (let i = 1; i < qData.length; i++) {
    const row = qData[i]
    if (row[0] !== '' && row[0] !== null) {
      // key: 題號(string), value: 解答(A/B/C/D，轉大寫)
      answerMap[String(row[0])] = String(row[6]).trim().toUpperCase()
    }
  }

  // --- 2. 計算得分 ---
  let score = 0
  const details = answers.map(a => {
    const correctAnswer = answerMap[String(a.id)] || ''
    const userAnswer = String(a.answer).trim().toUpperCase()
    const isCorrect = userAnswer === correctAnswer && correctAnswer !== ''
    if (isCorrect) score++
    return {
      id: a.id,
      userAnswer: a.answer,
      correctAnswer,
      isCorrect
    }
  })

  const totalQuestions = answers.length

  // --- 3. 通關門檻 ---
  let passThreshold = 6
  try {
    const props = PropertiesService.getScriptProperties()
    const val = props.getProperty('PASS_THRESHOLD')
    if (val) passThreshold = parseInt(val)
  } catch (_) { /* 使用預設值 */ }

  const passed = score >= passThreshold

  // --- 4. 時間戳記 ---
  const tz = Session.getScriptTimeZone()
  const nowStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss')

  // --- 5. 更新「回答」工作表 ---
  // 欄位順序：[ID, 闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間]
  const ansSheet = ss.getSheetByName('回答')
  if (!ansSheet) throw new Error('找不到「回答」工作表，請確認工作表名稱')

  const ansData = ansSheet.getDataRange().getValues()

  // 尋找既有 ID
  let existingRowIndex = -1
  for (let i = 1; i < ansData.length; i++) {
    if (String(ansData[i][0]).trim() === id) {
      existingRowIndex = i
      break
    }
  }

  if (existingRowIndex === -1) {
    // 全新 ID：新增一列
    const firstPassScore = passed ? score : ''
    const passedInAttempts = passed ? 1 : ''
    ansSheet.appendRow([id, 1, score, score, firstPassScore, passedInAttempts, nowStr])
  } else {
    // 既有 ID：更新欄位
    const row = ansData[existingRowIndex]
    const sheetRowNum = existingRowIndex + 1  // Sheets 1-indexed

    const oldAttempts = parseInt(row[1]) || 0
    const oldTotal = parseInt(row[2]) || 0
    const oldHighest = parseInt(row[3]) || 0
    const oldFirstPass = row[4]
    const oldPassedIn = row[5]

    const newAttempts = oldAttempts + 1
    const newTotal = oldTotal + score
    const newHighest = Math.max(oldHighest, score)

    // 第一次通關分數：僅在首次通關時填入，之後不覆蓋
    const isEmpty = (v) => v === '' || v === null || v === undefined
    const newFirstPass = isEmpty(oldFirstPass) && passed ? score : (isEmpty(oldFirstPass) ? '' : oldFirstPass)

    // 花了幾次通關：僅在首次通關時填入
    const newPassedIn = isEmpty(oldPassedIn) && passed ? newAttempts : (isEmpty(oldPassedIn) ? '' : oldPassedIn)

    // 批次更新（減少 API 呼叫）
    ansSheet.getRange(sheetRowNum, 2, 1, 6).setValues([
      [newAttempts, newTotal, newHighest, newFirstPass, newPassedIn, nowStr]
    ])
  }

  return { score, totalQuestions, passThreshold, passed, details }
}

// ============================================================
// getLeaderboard：取前 N 名（依最高分降冪排列）
// ============================================================
function getLeaderboard(limit) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName('回答')
  if (!sheet) throw new Error('找不到「回答」工作表')

  const data = sheet.getDataRange().getValues()
  if (data.length <= 1) return { leaderboard: [] }

  const isEmpty = (v) => v === '' || v === null || v === undefined

  const records = data
    .slice(1)
    .filter(row => row[0] !== '' && row[0] !== null)
    .map(row => ({
      id: String(row[0]),
      attempts: parseInt(row[1]) || 0,
      totalScore: parseInt(row[2]) || 0,
      highScore: parseInt(row[3]) || 0,
      firstPassScore: isEmpty(row[4]) ? null : parseInt(row[4]),
      passedIn: isEmpty(row[5]) ? null : parseInt(row[5]),
      lastPlayed: row[6] ? String(row[6]) : ''
    }))

  // 主排序：最高分降冪；同分：闖關次數升冪
  records.sort((a, b) => {
    if (b.highScore !== a.highScore) return b.highScore - a.highScore
    return a.attempts - b.attempts
  })

  return { leaderboard: records.slice(0, limit) }
}

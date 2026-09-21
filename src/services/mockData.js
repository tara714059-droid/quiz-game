/**
 * 離線/測試用 Mock 資料
 * 當 GAS 未設定或連線受限時，自動切換為本地模擬模式，確保遊戲可完整流暢試玩
 */

export const MOCK_QUESTIONS = [
  { id: '1', question: '台灣的首都是哪個城市？', A: '台中', B: '高雄', C: '台南', D: '台北', ans: 'D' },
  { id: '2', question: '下列哪個程式語言主要用於網頁前端開發？', A: 'Python', B: 'JavaScript', C: 'Java', D: 'C++', ans: 'B' },
  { id: '3', question: 'HTTP 狀態碼「404」代表什麼？', A: '請求成功', B: '伺服器錯誤', C: '禁止存取', D: '找不到頁面', ans: 'D' },
  { id: '4', question: '下列哪個不是關聯式資料庫？', A: 'MySQL', B: 'SQLite', C: 'PostgreSQL', D: 'MongoDB', ans: 'D' },
  { id: '5', question: 'Git 指令中，哪個用於將遠端最新程式碼下載並合併？', A: 'git push', B: 'git clone', C: 'git pull', D: 'git fetch', ans: 'C' },
  { id: '6', question: '1 GB 等於多少 MB？', A: '512 MB', B: '2048 MB', C: '1000 MB', D: '1024 MB', ans: 'D' },
  { id: '7', question: 'CSS「display: flex」的主要用途是什麼？', A: '設定字體大小', B: '設定背景顏色', C: '控制顯示隱藏', D: '彈性盒子版面配置', ans: 'D' },
  { id: '8', question: '下列哪個是 JavaScript 的非同步處理方式？', A: 'Thread', B: 'Semaphore', C: 'Promise', D: 'Coroutine', ans: 'C' },
  { id: '9', question: 'IP 位址「127.0.0.1」代表什麼？', A: '預設閘道', B: '廣播位址', C: 'DNS 伺服器', D: '本機位址（Localhost）', ans: 'D' },
  { id: '10', question: '下列哪個 HTTP 方法通常用於「新增資源」？', A: 'GET', B: 'DELETE', C: 'POST', D: 'PUT', ans: 'C' }
];

export const MOCK_LEADERBOARD = [
  { id: 'RETRO_KING', attempts: 5, totalScore: 48, highScore: 10, firstPassScore: 8, passedIn: 2, lastPlayed: '2026-09-11 12:00:00' },
  { id: 'PIXEL_MASTER', attempts: 3, totalScore: 26, highScore: 9, firstPassScore: 9, passedIn: 1, lastPlayed: '2026-09-11 11:30:00' },
  { id: 'CODE_WARRIOR', attempts: 4, totalScore: 30, highScore: 8, firstPassScore: 7, passedIn: 3, lastPlayed: '2026-09-11 10:15:00' },
  { id: 'NEO_GAMER', attempts: 2, totalScore: 12, highScore: 6, firstPassScore: 6, passedIn: 2, lastPlayed: '2026-09-11 09:40:00' },
  { id: 'NOOB_BOY', attempts: 1, totalScore: 4, highScore: 4, firstPassScore: null, passedIn: null, lastPlayed: '2026-09-11 08:20:00' }
];

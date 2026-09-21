/**
 * 8-bit 音效工具（Web Audio API）
 * 不需要任何外部音效檔案，純粹用振盪器合成
 */

let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // 若瀏覽器自動暫停 AudioContext，嘗試恢復
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * 播放單一音符
 * @param {number} freq - 頻率 (Hz)
 * @param {number} duration - 持續時間 (秒)
 * @param {OscillatorType} type - 波形 ('square' | 'sawtooth' | 'triangle' | 'sine')
 * @param {number} gain - 音量 (0-1)
 */
function playTone(freq, duration, type = 'square', gain = 0.25) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gainNode.gain.setValueAtTime(gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch (_) {
    // 靜默失敗（如瀏覽器禁止 AudioContext）
  }
}

/** 選擇答案音效 */
export function playSelect() {
  playTone(440, 0.06, 'square', 0.2)
}

/** 答題後「出擊」音效（答案送出，結果未知） */
export function playHit() {
  playTone(330, 0.08, 'square', 0.25)
  setTimeout(() => playTone(220, 0.15, 'sawtooth', 0.2), 80)
}

/** 答對音效（結果頁顯示） */
export function playCorrect() {
  playTone(523, 0.08, 'square', 0.2)  // C5
  setTimeout(() => playTone(659, 0.08, 'square', 0.2), 90)  // E5
  setTimeout(() => playTone(784, 0.15, 'square', 0.25), 180) // G5
}

/** 答錯音效（結果頁顯示） */
export function playWrong() {
  playTone(220, 0.1, 'sawtooth', 0.25)
  setTimeout(() => playTone(165, 0.2, 'sawtooth', 0.2), 110)
}

/** 通關勝利音效 */
export function playVictory() {
  const notes = [523, 659, 784, 1047, 784, 1047]
  const delays = [0, 120, 240, 360, 480, 540]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.18, 'square', 0.28), delays[i])
  })
}

/** 失敗音效 */
export function playGameOver() {
  const notes = [392, 349, 330, 294, 247]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.22, 'sawtooth', 0.25), i * 180)
  })
}

/** 畫面切換音效 */
export function playTransition() {
  playTone(660, 0.05, 'square', 0.15)
  setTimeout(() => playTone(880, 0.08, 'square', 0.2), 60)
}

/** 開始遊戲音效 */
export function playStart() {
  const notes = [330, 392, 494, 659]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.1, 'square', 0.22), i * 80)
  })
}

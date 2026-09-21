/**
 * BossAvatar — DiceBear 像素風關主頭像
 *
 * Props:
 *   index  - 關卡索引（0-based），決定哪一位關主
 *   shake  - 是否觸發受傷震動動畫
 *   size   - 圖片尺寸 px（預設 120）
 */
import { useState, useEffect } from 'react'
import { getBossUrl } from '../utils/dicebear.js'

export default function BossAvatar({ index = 0, shake = false, size = 120 }) {
  const [isShaking, setIsShaking] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const url = getBossUrl(index)

  useEffect(() => {
    if (shake) {
      setIsShaking(true)
      setIsFlashing(true)
      // Flash 效果比 shake 短
      const flashTimer = setTimeout(() => setIsFlashing(false), 200)
      const shakeTimer = setTimeout(() => setIsShaking(false), 450)
      return () => {
        clearTimeout(flashTimer)
        clearTimeout(shakeTimer)
      }
    }
  }, [shake])

  const wrapperClass = [
    'boss-avatar-wrapper',
    isShaking ? 'shaking' : '',
    isFlashing ? 'hit-flash' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass} style={{ width: size, height: size }}>
      <img
        src={url}
        alt={`Boss ${index}`}
        className="boss-avatar-img"
        width={size}
        height={size}
        loading="eager"
        draggable={false}
      />
    </div>
  )
}

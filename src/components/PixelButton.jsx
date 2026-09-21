/**
 * PixelButton — 可重用像素風按鈕元件
 *
 * Props:
 *   children  - 按鈕內容
 *   color     - 'primary' | 'success' | 'danger' | 'info' | 'ghost'（預設 'primary'）
 *   size      - 'sm' | 'md' | 'lg'（預設 'md'）
 *   onClick   - 點擊回調
 *   disabled  - 是否禁用
 *   className - 額外 CSS class
 */
import { playSelect } from '../utils/soundEffects.js'

export default function PixelButton({
  children,
  color = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  ...rest
}) {
  const handleClick = (e) => {
    if (!disabled) {
      playSelect()
      onClick?.(e)
    }
  }

  const sizeClass = size === 'sm' ? 'pixel-btn-sm' : size === 'lg' ? 'pixel-btn-lg' : ''
  const colorClass = `pixel-btn-${color}`

  return (
    <button
      className={`pixel-btn ${colorClass} ${sizeClass} ${className}`.trim()}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * Confetti — 像素風慶祝彩紙效果（Canvas）
 * 通關時播放，使用方形像素粒子
 *
 * Props:
 *   active - 是否播放（true 開始，false 停止）
 */
import { useEffect, useRef } from 'react'

const COLORS = ['#ffe600', '#39ff14', '#ff2244', '#00cfff', '#bf5fff', '#ff8c00', '#ffffff']
const PIXEL = 8
const PARTICLE_COUNT = 70

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height * 0.4 - height * 0.1, // 從上方落下
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    gravity: 0.08,
    life: 1,
    decay: Math.random() * 0.005 + 0.003,
  }
}

export default function Confetti({ active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    // 初始化粒子
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    )

    let frameCount = 0

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frameCount++

      // 每 20 幀補充新粒子（持續效果）
      if (frameCount % 20 === 0 && particlesRef.current.length < PARTICLE_COUNT * 1.5) {
        particlesRef.current.push(
          ...Array.from({ length: 8 }, () => createParticle(canvas.width, canvas.height))
        )
      }

      particlesRef.current = particlesRef.current.filter(p => p.life > 0.1)

      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.vy += p.gravity
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.life -= p.decay

        // 出界後從頂部重置
        if (p.y > canvas.height + PIXEL) {
          p.y = -PIXEL
          p.x = Math.random() * canvas.width
          p.vy = Math.random() * 2 + 1
          p.life = 1
        }

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.translate(
          Math.round(p.x / PIXEL) * PIXEL,
          Math.round(p.y / PIXEL) * PIXEL
        )
        ctx.fillRect(-PIXEL / 2, -PIXEL / 2, PIXEL, PIXEL)
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
    />
  )
}

import { useEffect, useRef } from 'react'

const DENSITY = 9000
const MAX_LINK_DIST = 120
const SPEED = 0.3

export default function ParticleField({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width, height, particles, raf

    function isDark() {
      return document.documentElement.classList.contains('dark')
    }

    function resize() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(18, Math.min(70, Math.round((width * height) / DENSITY)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }))
    }

    function draw() {
      const dark = isDark()
      const dotColor = dark ? 'rgba(96, 165, 250, 0.55)' : 'rgba(37, 99, 235, 0.45)'
      const lineRgb = dark ? '96, 165, 250' : '37, 99, 235'

      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_LINK_DIST) {
            ctx.strokeStyle = `rgba(${lineRgb}, ${(1 - dist / MAX_LINK_DIST) * 0.35})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      ctx.fillStyle = dotColor
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function step() {
      draw()
      raf = requestAnimationFrame(step)
    }

    resize()
    if (prefersReducedMotion) {
      draw()
    } else {
      step()
    }
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-10 w-full h-full ${className}`} aria-hidden="true" />
}

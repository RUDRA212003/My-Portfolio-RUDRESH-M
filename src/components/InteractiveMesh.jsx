import { useEffect, useRef } from 'react'

export default function InteractiveMesh() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let particles = []
    const mouse = { x: null, y: null, active: false }
    
    // Configurable parameters
    const particleCountRatio = 0.05 // particles per 1000px^2 area
    const minDistance = 110 // distance below which lines are drawn between particles
    const mouseRadius = 180 // attraction radius around mouse
    const particleSpeed = 0.45 // speed of random drift

    // Handle Resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      
      const width = parent.clientWidth
      const height = parent.clientHeight
      
      // Handle high DPI displays for crisp drawing
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
      
      initParticles(width, height)
    }

    // Initialize Particles
    const initParticles = (width, height) => {
      const area = (width * height) / 1000
      let count = Math.floor(area * particleCountRatio)
      count = Math.max(25, Math.min(count, 80)) // dynamic density cap for performance

      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * particleSpeed,
          vy: (Math.random() - 0.5) * particleSpeed,
          radius: Math.random() * 1.5 + 0.8 // 0.8 to 2.3px radius
        })
      }
    }

    // Animation Loop
    const animate = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const width = parent.clientWidth
      const height = parent.clientHeight

      ctx.clearRect(0, 0, width, height)

      // Update and Draw Particles
      particles.forEach((p) => {
        // Natural drift
        p.x += p.vx
        p.y += p.vy

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Clamp to screen bounds
        p.x = Math.max(0, Math.min(p.x, width))
        p.y = Math.max(0, Math.min(p.y, height))

        // Mouse attraction physics
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouseRadius) {
            // Force strength is stronger closer to center
            const force = (mouseRadius - dist) / mouseRadius
            // Pull the particle slightly towards the mouse
            p.x += (dx / dist) * force * 1.2
            p.y += (dy / dist) * force * 1.2
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(234, 179, 8, 0.65)' // warm yellow-500 tint (increased opacity)
        ctx.fill()
      })

      // Draw Connection Lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]

        // Connect with other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < minDistance) {
            // Opacity decreases as distance approaches minDistance (increased brightness)
            const alpha = (1 - dist / minDistance) * 0.28
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(234, 179, 8, ${alpha})`
            ctx.lineWidth = 0.75 // slightly thicker lines
            ctx.stroke()
          }
        }

        // Connect with Mouse
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p1.x
          const dy = mouse.y - p1.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouseRadius) {
            const alpha = (1 - dist / mouseRadius) * 0.45 // doubled mouse connection opacity
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = `rgba(234, 179, 8, ${alpha})`
            ctx.lineWidth = 1.1 // thicker mouse connector lines
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    // Mouse Event Handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
    }

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        mouse.x = e.touches[0].clientX - rect.left
        mouse.y = e.touches[0].clientY - rect.top
        mouse.active = true
      }
    }

    const handleTouchEnd = () => {
      mouse.active = false
    }

    // Attach Event Listeners to Parent Container (to capture cursor across whole hero area)
    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true })
      parent.addEventListener('mouseleave', handleMouseLeave, { passive: true })
      parent.addEventListener('touchmove', handleTouchMove, { passive: true })
      parent.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    window.addEventListener('resize', resizeCanvas, { passive: true })
    
    // Initial Setup
    resizeCanvas()
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
        parent.removeEventListener('mouseleave', handleMouseLeave)
        parent.removeEventListener('touchmove', handleTouchMove)
        parent.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full block z-0"
    />
  )
}

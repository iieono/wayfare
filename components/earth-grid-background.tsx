"use client"

import { useEffect, useRef } from "react"

export function EarthGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation variables
    let animationId: number
    let time = 0

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Grid settings
      const gridSize = 40
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Create gradient background
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(canvas.width, canvas.height),
      )
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.05)")
      gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.03)")
      gradient.addColorStop(1, "rgba(236, 72, 153, 0.02)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        const offset = Math.sin(time * 0.001 + x * 0.01) * 5
        ctx.beginPath()
        ctx.moveTo(x + offset, 0)
        ctx.lineTo(x + offset, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        const offset = Math.cos(time * 0.001 + y * 0.01) * 5
        ctx.beginPath()
        ctx.moveTo(0, y + offset)
        ctx.lineTo(canvas.width, y + offset)
        ctx.stroke()
      }

      // Draw floating dots
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 0.0005 + i) * canvas.width) / 4 + centerX
        const y = (Math.cos(time * 0.0007 + i * 2) * canvas.height) / 4 + centerY
        const radius = Math.sin(time * 0.002 + i) * 2 + 3

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw connection lines between dots
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i < 20; i++) {
        for (let j = i + 1; j < 20; j++) {
          const x1 = (Math.sin(time * 0.0005 + i) * canvas.width) / 4 + centerX
          const y1 = (Math.cos(time * 0.0007 + i * 2) * canvas.height) / 4 + centerY
          const x2 = (Math.sin(time * 0.0005 + j) * canvas.width) / 4 + centerX
          const y2 = (Math.cos(time * 0.0007 + j * 2) * canvas.height) / 4 + centerY

          const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }
      }

      time += 16
      animationId = requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }} />
}

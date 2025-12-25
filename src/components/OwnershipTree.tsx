'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OwnershipTreeProps {
  chain: any[]
  source: string
}

/**
 * OwnershipTree visualizes the ownership chain using a canvas with
 * responsive design and dark theme support
 */
export function OwnershipTree({ chain, source }: OwnershipTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (chain.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Determine theme
    const isDark = document.documentElement.classList.contains('dark')
    const bgColor = isDark ? '#1f2937' : '#f8f9fa'
    const lineColor = isDark ? '#9ca3af' : '#6c757d'
    const nodeColorPrimary = isDark ? '#3b82f6' : '#007bff'
    const nodeColorSecondary = isDark ? '#06b6d4' : '#17a2b8'
    const textColor = isDark ? '#f3f4f6' : '#fff'

    const padding = 40
    const nodeWidth = 180
    const nodeHeight = 60
    const verticalGap = 100

    // Responsive canvas width
    const containerWidth = canvas.parentElement?.clientWidth || 800
    canvas.width = Math.max(containerWidth, nodeWidth + padding * 2)
    canvas.height = chain.length * verticalGap + padding * 2

    // Draw background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw tree structure
    const nodePositions: { x: number; y: number }[] = []

    chain.forEach((item, index) => {
      const x = padding + (canvas.width - padding * 2) / 2 - nodeWidth / 2
      const y = padding + index * verticalGap

      nodePositions.push({ x, y })

      // Draw connecting line to parent
      if (index > 0) {
        const prevX = nodePositions[index - 1].x + nodeWidth / 2
        const prevY = nodePositions[index - 1].y + nodeHeight
        const currX = x + nodeWidth / 2

        ctx.strokeStyle = lineColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(prevX, prevY + (verticalGap - nodeHeight) / 2)
        ctx.lineTo(currX, prevY + (verticalGap - nodeHeight) / 2)
        ctx.lineTo(currX, y)
        ctx.stroke()

        // Draw arrow
        const arrowSize = 8
        const angle = Math.PI / 2
        ctx.fillStyle = lineColor
        ctx.beginPath()
        ctx.moveTo(currX, y)
        ctx.lineTo(
          currX - arrowSize * Math.cos(angle - Math.PI / 6),
          y - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          currX - arrowSize * Math.cos(angle + Math.PI / 6),
          y - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fill()
      }

      // Draw node box
      const isRoot = index === 0
      ctx.fillStyle = isRoot ? nodeColorPrimary : nodeColorSecondary
      ctx.fillRect(x, y, nodeWidth, nodeHeight)

      // Draw border
      ctx.strokeStyle = textColor
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, nodeWidth, nodeHeight)

      // Draw text
      ctx.fillStyle = textColor
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const lines = wrapText(item.label, nodeWidth - 10)
      const lineHeight = 16
      const totalHeight = lines.length * lineHeight
      const startY = y + nodeHeight / 2 - totalHeight / 2

      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + nodeWidth / 2, startY + lineIndex * lineHeight + lineHeight / 2)
      })

      // Draw confidence badge
      const confidence = item.confidence
      if (confidence && confidence < 1) {
        ctx.fillStyle = isDark ? '#eab308' : '#ffc107'
        ctx.font = '11px system-ui, -apple-system, sans-serif'
        ctx.fillText(`${Math.round(confidence * 100)}% confident`, x + nodeWidth / 2, y + nodeHeight - 10)
      }
    })

    // Draw source indicator
    ctx.fillStyle = lineColor
    ctx.font = '11px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Data source: ${source}`, padding, canvas.height - 10)
  }, [chain, source])

  if (chain.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          No ownership data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ownership Structure</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto bg-muted/50 rounded-b-lg">
        <div className="inline-block min-w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            role="img"
            aria-label="Ownership chain tree visualization"
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Wrap text to fit within width
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    // Rough estimate: ~8 pixels per character at 14px font
    if (testLine.length * 8 < maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

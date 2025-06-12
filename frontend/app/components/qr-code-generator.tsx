"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface QRCodeGeneratorProps {
  value: string
  label: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ value, label, size = 180, className }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    generateQRCode()
  }, [value, size])

  const generateQRCode = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Enhanced QR code placeholder (in real implementation, use a QR library like qrcode)
    canvas.width = size
    canvas.height = size

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(1, "#16213e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    // Create a more sophisticated pattern as QR code placeholder
    ctx.fillStyle = "#ffffff"
    const moduleSize = size / 33

    // Create a pattern based on the value
    for (let i = 0; i < 33; i++) {
      for (let j = 0; j < 33; j++) {
        // Skip the finder pattern areas
        if (
          (i < 7 && j < 7) || // Top-left
          (i < 7 && j >= 33 - 7) || // Top-right
          (i >= 33 - 7 && j < 7) // Bottom-left
        ) {
          continue
        }

        // Create a deterministic pattern based on the value
        const hash = value.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0)

        if ((hash + i * j + i + j) % 3 === 0) {
          // Round the corners of each module
          const radius = moduleSize / 5
          const x = i * moduleSize
          const y = j * moduleSize

          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + moduleSize - radius, y)
          ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + radius)
          ctx.lineTo(x + moduleSize, y + moduleSize - radius)
          ctx.quadraticCurveTo(x + moduleSize, y + moduleSize, x + moduleSize - radius, y + moduleSize)
          ctx.lineTo(x + radius, y + moduleSize)
          ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - radius)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.fill()
        }
      }
    }

    // Add finder patterns with rounded corners
    const drawFinderPattern = (x: number, y: number) => {
      // Outer square
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7)

      // Middle square
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5)

      // Inner square
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3)
    }

    // Draw finder patterns
    drawFinderPattern(0, 0) // Top-left
    drawFinderPattern(size - moduleSize * 7, 0) // Top-right
    drawFinderPattern(0, size - moduleSize * 7) // Bottom-left

    // Add a logo or icon in the center (optional)
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, moduleSize * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#0ea5e9"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, moduleSize * 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw a location pin icon
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2 - moduleSize / 2, moduleSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(size / 2 - moduleSize, size / 2)
    ctx.lineTo(size / 2 + moduleSize, size / 2)
    ctx.lineTo(size / 2, size / 2 + moduleSize * 2)
    ctx.closePath()
    ctx.fill()

    setQrDataUrl(canvas.toDataURL())
  }

  const downloadQRCode = () => {
    if (!qrDataUrl) return

    setIsDownloading(true)

    setTimeout(() => {
      const link = document.createElement("a")
      link.download = `${label.replace(/\s+/g, "_").toLowerCase()}.png`
      link.href = qrDataUrl
      link.click()
      setIsDownloading(false)
    }, 500)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl backdrop-blur-md border border-white/10">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg shadow-lg"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadQRCode}
        disabled={!qrDataUrl || isDownloading}
        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-blue-300 hover:text-white"
      >
        {isDownloading ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Download QR Code
      </Button>
    </div>
  )
}

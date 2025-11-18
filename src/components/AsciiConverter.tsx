import { useState, useEffect, useRef, useCallback } from "react"

type ColoredChar = {
  char: string
  color: string
}

const charSets = {
  standard: " .:-=+*#%@",
  detailed: " .,:;i1tfLCG08@",
  blocks: " ░▒▓█",
  minimal: " .:█",
} as const

interface AsciiConverterProps {
  imageSrc: string
  resolution?: number
  inverted?: boolean
  grayscale?: boolean
  charSet?: string
  aspectRatioX?: number // Horizontal stretch factor
  aspectRatioY?: number // Vertical stretch factor
  onAsciiGenerated?: (ascii: string, coloredAscii: ColoredChar[][]) => void
  onError?: (error: string | null) => void
}

export default function AsciiConverter({
  imageSrc,
  resolution = 0.15,
  inverted = false,
  grayscale = false,
  charSet = "standard",
  aspectRatioX = 1, // Default is 1 (no stretch)
  aspectRatioY = 1, // Default is 1 (no stretch)
  onAsciiGenerated,
  onError,
}: AsciiConverterProps) {
  const [error, setError] = useState<string | null>(null)

  // Notify parent of error changes
  useEffect(() => {
    if (onError) {
      onError(error)
    }
  }, [error, onError])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const adjustColorBrightness = (r: number, g: number, b: number, factor: number): string => {
    const minBrightness = 60
    r = Math.max(Math.min(Math.round(r * factor), 255), minBrightness)
    g = Math.max(Math.min(Math.round(g * factor), 255), minBrightness)
    b = Math.max(Math.min(Math.round(b * factor), 255), minBrightness)
    return `rgb(${r}, ${g}, ${b})`
  }

  const convertToAscii = useCallback(() => {
    try {
      console.log("Starting ASCII conversion...")
      if (!canvasRef.current || !imageRef.current) {
        console.error("Canvas or image not available")
        return
      }

      const img = imageRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, img.width, img.height)

      let imageData
      try {
        imageData = ctx.getImageData(0, 0, img.width, img.height)
      } catch (e) {
        console.error("Failed to get image data:", e)
        setError("Failed to process image")
        return
      }

      const data = imageData.data
      const chars = charSets[charSet as keyof typeof charSets]

      // Apply aspect ratio adjustments to the resolution
      const width = Math.floor(img.width * resolution * aspectRatioX)
      const height = Math.floor(img.height * resolution * aspectRatioY)

      console.log("ASCII dimensions:", width, "x", height)

      // Adjust font aspect based on the aspect ratio settings
      const fontAspect = (0.5 / aspectRatioY) * aspectRatioX
      const widthStep = Math.ceil(img.width / width)
      const heightStep = Math.ceil(img.height / height / fontAspect)

      let result = ""
      const coloredResult: ColoredChar[][] = []

      for (let y = 0; y < img.height; y += heightStep) {
        const coloredRow: ColoredChar[] = []

        for (let x = 0; x < img.width; x += widthStep) {
          const pos = (y * img.width + x) * 4

          const r = data[pos] || 0
          const g = data[pos + 1] || 0
          const b = data[pos + 2] || 0

          let brightness
          if (grayscale) {
            brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
          } else {
            brightness = Math.sqrt(
              0.299 * (r / 255) * (r / 255) + 0.587 * (g / 255) * (g / 255) + 0.114 * (b / 255) * (b / 255),
            )
          }

          if (inverted) brightness = 1 - brightness

          const charIndex = Math.floor(brightness * (chars.length - 1))
          const char = chars[charIndex] || " "

          result += char

          if (!grayscale) {
            const brightnessFactor = Math.max((charIndex / (chars.length - 1)) * 1.5 + 0.5, 0.8)
            const color = adjustColorBrightness(r, g, b, brightnessFactor)
            coloredRow.push({ char, color })
          } else {
            coloredRow.push({ char, color: "white" })
          }
        }

        result += "\n"
        coloredResult.push(coloredRow)
      }

      console.log("ASCII conversion complete:", coloredResult.length, "rows")
      setError(null)

      if (onAsciiGenerated) {
        onAsciiGenerated(result, coloredResult)
      }
    } catch (err) {
      console.error("Error converting to ASCII:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    }
  }, [resolution, inverted, grayscale, charSet, aspectRatioX, aspectRatioY, onAsciiGenerated])

  const loadImage = useCallback(() => {
    console.log("Loading image:", imageSrc)
    setError(null)

    // Clear any previous image reference
    imageRef.current = null

    // First, try to verify the image exists by fetching it
    const verifyAndLoad = async () => {
      try {
        // For local files, try to fetch to verify they exist
        const response = await fetch(imageSrc, { method: "HEAD" })
        if (!response.ok && response.status !== 0) {
          // Status 0 might be CORS, which is OK for local files
          console.warn(`Image fetch returned status ${response.status}, but continuing...`)
        }
      } catch (fetchError) {
        // Fetch might fail due to CORS for local files, which is OK
        console.log("Fetch check failed (this is OK for local files):", fetchError)
      }

      // Now load the image
      const img = new Image()
      
      // Only set crossOrigin for external URLs, not local files
      if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
        img.crossOrigin = "anonymous"
      }

      img.onload = () => {
        console.log("Image loaded successfully:", img.width, "x", img.height)
        if (img.width === 0 || img.height === 0) {
          setError(`Invalid image dimensions: ${img.width}x${img.height}`)
          return
        }

        imageRef.current = img
        // Use setTimeout to ensure the image is fully loaded before conversion
        setTimeout(() => {
          convertToAscii()
        }, 0)
      }

      img.onerror = (e) => {
        const errorMsg = `Failed to load image: ${imageSrc}. Check browser console for details.`
        console.error("Image load error:", {
          error: e,
          src: imageSrc,
          type: img.src ? "src set" : "src not set",
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          currentSrc: img.currentSrc || "none"
        })
        setError(errorMsg)
      }

      // Set src after setting up handlers
      try {
        img.src = imageSrc
        console.log("Image src set to:", img.src)
      } catch (err) {
        console.error("Error setting image src:", err)
        setError(`Error setting image source: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    verifyAndLoad()
  }, [imageSrc, convertToAscii])

  useEffect(() => {
    loadImage()
  }, [loadImage])

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
      {error && <div className="text-red-400">{error}</div>}
    </div>
  )
}

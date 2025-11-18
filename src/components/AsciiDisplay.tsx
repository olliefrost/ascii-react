import { useState, useEffect, useRef, useCallback } from "react"
import AsciiConverter from "./AsciiConverter"


type ColoredChar = {
  char: string
  color: string
}

interface AsciiDisplayProps {
  imageSrc: string
  className?: string
}

export default function AsciiDisplay({ imageSrc, className = "" }: AsciiDisplayProps) {
  const [coloredAsciiArt, setColoredAsciiArt] = useState<ColoredChar[][]>([])
  const [visibleRows, setVisibleRows] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Animate rows appearing line by line using requestAnimationFrame for smoother performance
  const animateRows = useCallback((timestamp: number, totalRows: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp

    const elapsed = timestamp - startTimeRef.current
    const animationDuration = 4000 // 4 seconds total
    const progress = Math.min(elapsed / animationDuration, 1)
    const rowsToShow = Math.floor(progress * totalRows)

    setVisibleRows(rowsToShow)

    if (progress < 1) {
      animationRef.current = requestAnimationFrame((time) => animateRows(time, totalRows))
    }
  }, [])

  // Handle the ASCII art generation result
  const handleAsciiGenerated = useCallback((ascii: string, coloredAscii: ColoredChar[][]) => {
    console.log("ASCII generated:", coloredAscii.length, "rows")
    setColoredAsciiArt(coloredAscii)
    setIsLoaded(true)

    // Start the animation once we have the data
    startTimeRef.current = performance.now()
    animateRows(performance.now(), coloredAscii.length)
  }, [animateRows])

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Adjust container to match viewport
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        containerRef.current.style.height = `${viewportHeight}px`
        containerRef.current.style.width = `${viewportWidth}px`
      }
    }

    // Initial size setup
    updateSize()

    // Update on resize
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return (
    <div className={className} style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Hidden converter component that processes the image */}
      <div style={{ position: "absolute", visibility: "hidden", width: 0, height: 0, overflow: "hidden" }}>
        <AsciiConverter
          imageSrc={imageSrc}
          resolution={0.15}
          grayscale={false}
          charSet="standard"
          aspectRatioX={1.0}
          aspectRatioY={0.8}
          onAsciiGenerated={handleAsciiGenerated}
          onError={setError}
        />
      </div>

      {/* Display error if image fails to load */}
      {error && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "red",
          padding: "20px",
          textAlign: "center",
          fontSize: "18px",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderRadius: "8px",
          zIndex: 1000,
        }}>
          <strong>Error:</strong> {error}
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#ccc" }}>
            Trying to load: <code>{imageSrc}</code>
            <br />
            Make sure the image file exists in the <code>public</code> folder.
          </div>
        </div>
      )}

      {/* Visible ASCII art display */}
      <div
        ref={containerRef}
        className="font-mono leading-none select-text"
        style={{
          fontSize: "clamp(0.4rem, 1.8vw, 0.7rem)",
          lineHeight: "clamp(0.4rem, 1.8vw, 0.7rem)",
          letterSpacing: "0.01em",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          contain: "layout style paint",
        }}
      >
        {isLoaded && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {coloredAsciiArt.slice(0, visibleRows).map((row, rowIndex) => {
              // Generate unique animation parameters for each row
              // Use rowIndex to create variation but keep it subtle
              const amplitude = 2 + (rowIndex % 3) * 0.5 // Slight amplitude variation (2-3.5%)
              const duration = 20 + (rowIndex % 5) * 2 // Duration variation (20-28s)
              const delay = (rowIndex * 0.15) % 2 // Phase delay in seconds
              
              return (
                <div
                  key={rowIndex}
                  className="whitespace-nowrap opacity-0 animate-fade-in row-float"
                  style={{
                    animationFillMode: "forwards",
                    textAlign: "center",
                    // Individual row animation - only start after all rows are visible
                    animation: visibleRows < coloredAsciiArt.length 
                      ? "none" 
                      : `rowFloat${rowIndex} ${duration}s ease-in-out infinite`,
                    animationDelay: visibleRows < coloredAsciiArt.length
                      ? `${rowIndex * 30}ms`
                      : `${delay}s`,
                  }}
                >
                  {row.map((col, colIndex) => (
                    <span key={colIndex} style={{ color: col.color }}>
                      {col.char}
                    </span>
                  ))}
                  <style>{`
                    @keyframes rowFloat${rowIndex} {
                      0% { transform: translateX(-${amplitude}%); }
                      50% { transform: translateX(${amplitude}%); }
                      100% { transform: translateX(-${amplitude}%); }
                    }
                  `}</style>
                </div>
              )
            })}
          </div>
        )}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .font-mono {
              font-size: clamp(0.3rem, 2.5vw, 0.6rem) !important;
              line-height: clamp(0.3rem, 2.5vw, 0.6rem) !important;
            }
          }
          
          /* Reduce motion for accessibility */
          @media (prefers-reduced-motion: reduce) {
            .row-float {
              animation: none !important;
            }
            .animate-fade-in {
              animation: none !important;
              opacity: 1 !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

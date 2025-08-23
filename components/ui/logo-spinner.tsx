"use client"

import Image from "next/image"
import { useMemo } from "react"

export function LogoSpinner({ size = 72, label = "Loading...", dynamic = true }: { size?: number; label?: string; dynamic?: boolean }) {
  // Randomize spin duration/direction per render for a subtle dynamic effect
  const spinStyle = useMemo(() => {
    if (!dynamic) return undefined
    const duration = (0.9 + Math.random() * 1.2).toFixed(2) // 0.9s - 2.1s
    const reverse = Math.random() > 0.5
    return {
      animationDuration: `${duration}s`,
      animationDirection: reverse ? ("reverse" as const) : ("normal" as const),
    }
  }, [dynamic])

  return (
    <div className="flex flex-col items-center">
      <div className="animate-pulse">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
          alt="The New Alkebulan Logo"
          width={size}
          height={size}
          className="animate-spin drop-shadow"
          priority
          style={spinStyle}
        />
      </div>
      {label && (
        <p className="mt-3 text-muted-foreground text-sm">{label}</p>
      )}
    </div>
  )
}



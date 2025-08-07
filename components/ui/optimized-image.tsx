"use client"

import Image from "next/image"
import { useState } from "react"
import type { ImageConfig } from "@/utils/image-optimization"

interface OptimizedImageProps extends ImageConfig {
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  className = "",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
      />
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

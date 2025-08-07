export interface ImageConfig {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

export const createImageConfig = (
  requirement: { id: string; description: string; dimensions: string },
  src: string,
): ImageConfig => {
  const [width, height] = requirement.dimensions.split("x").map(Number)

  return {
    src,
    alt: requirement.description,
    width,
    height,
    quality: 85,
    placeholder: "blur",
    blurDataURL: generateBlurDataURL(width, height),
  }
}

export const generateBlurDataURL = (width: number, height: number): string => {
  // Generate a simple blur data URL for loading states
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  if (ctx) {
    // Create a simple gradient blur placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#f0f9ff")
    gradient.addColorStop(1, "#e0f2fe")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  return canvas.toDataURL()
}

export const getOptimizedImageUrl = (originalUrl: string, width?: number, height?: number, quality = 85): string => {
  // This would integrate with your image optimization service
  // For now, return the original URL
  return originalUrl
}

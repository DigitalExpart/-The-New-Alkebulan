import type { SocialPlatform, SocialMediaContent } from "@/types/content-upload"

export function detectSocialPlatform(url: string): SocialPlatform | null {
  const cleanUrl = url.toLowerCase().trim()

  if (cleanUrl.includes("instagram.com")) return "instagram"
  if (cleanUrl.includes("tiktok.com")) return "tiktok"
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) return "youtube"
  if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.com")) return "facebook"
  if (cleanUrl.includes("pinterest.com") || cleanUrl.includes("pin.it")) return "pinterest"

  return null
}

export function validateSocialUrl(url: string): boolean {
  try {
    new URL(url)
    return detectSocialPlatform(url) !== null
  } catch {
    return false
  }
}

export async function parseSocialMediaContent(url: string): Promise<SocialMediaContent | null> {
  const platform = detectSocialPlatform(url)
  if (!platform) return null

  // In a real implementation, this would make API calls to the respective platforms
  // For now, we'll return mock data based on the platform

  const mockData: Record<SocialPlatform, Partial<SocialMediaContent>> = {
    instagram: {
      title: "Instagram Post",
      description: "Beautiful content from Instagram",
      thumbnail: "/placeholder.svg?height=300&width=300",
      author: "@username",
      duration: undefined,
    },
    tiktok: {
      title: "TikTok Video",
      description: "Engaging TikTok content",
      thumbnail: "/placeholder.svg?height=400&width=300",
      author: "@tiktoker",
      duration: 30,
    },
    youtube: {
      title: "YouTube Video",
      description: "Educational YouTube content",
      thumbnail: "/placeholder.svg?height=180&width=320",
      author: "Channel Name",
      duration: 600,
    },
    facebook: {
      title: "Facebook Post",
      description: "Shared Facebook content",
      thumbnail: "/placeholder.svg?height=200&width=400",
      author: "Page Name",
      duration: undefined,
    },
    pinterest: {
      title: "Pinterest Pin",
      description: "Inspiring Pinterest content",
      thumbnail: "/placeholder.svg?height=400&width=300",
      author: "Pinterest User",
      duration: undefined,
    },
  }

  return {
    platform,
    originalUrl: url,
    publishedAt: new Date(),
    ...mockData[platform],
  } as SocialMediaContent
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

export function getPlatformIcon(platform: SocialPlatform): string {
  const icons = {
    instagram: "📷",
    tiktok: "🎵",
    youtube: "📺",
    facebook: "👥",
    pinterest: "📌",
  }
  return icons[platform] || "🔗"
}

export function getPlatformColor(platform: SocialPlatform): string {
  const colors = {
    instagram: "from-purple-500 to-pink-500",
    tiktok: "from-black to-red-500",
    youtube: "from-red-500 to-red-600",
    facebook: "from-blue-500 to-blue-600",
    pinterest: "from-red-400 to-red-500",
  }
  return colors[platform] || "from-gray-400 to-gray-500"
}

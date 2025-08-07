"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Clock, User } from "lucide-react"
import {
  detectSocialPlatform,
  parseSocialMediaContent,
  validateSocialUrl,
  formatDuration,
  getPlatformIcon,
  getPlatformColor,
} from "@/utils/social-media-parser"
import type { SocialMediaContent } from "@/types/content-upload"

interface SocialMediaImportProps {
  onContentImported: (content: SocialMediaContent) => void
}

export function SocialMediaImport({ onContentImported }: SocialMediaImportProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previewContent, setPreviewContent] = useState<SocialMediaContent | null>(null)
  const [error, setError] = useState("")

  const handleUrlSubmit = async () => {
    if (!url.trim()) return

    setError("")
    setIsLoading(true)

    try {
      if (!validateSocialUrl(url)) {
        throw new Error("Please enter a valid social media URL")
      }

      const content = await parseSocialMediaContent(url)
      if (!content) {
        throw new Error("Unable to parse content from this URL")
      }

      setPreviewContent(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import content")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = () => {
    if (previewContent) {
      onContentImported(previewContent)
      setUrl("")
      setPreviewContent(null)
    }
  }

  const platform = url ? detectSocialPlatform(url) : null

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Paste Instagram, TikTok, YouTube, Facebook, or Pinterest URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <Button onClick={handleUrlSubmit} disabled={!url.trim() || isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import"}
        </Button>
      </div>

      {platform && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getPlatformIcon(platform)}</span>
          <span>Detected: {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
        </div>
      )}

      {previewContent && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={previewContent.thumbnail || "/placeholder.svg"}
                  alt="Content preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`bg-gradient-to-r ${getPlatformColor(previewContent.platform)} text-white`}>
                    {getPlatformIcon(previewContent.platform)} {previewContent.platform}
                  </Badge>
                  {previewContent.duration && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(previewContent.duration)}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{previewContent.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{previewContent.description}</p>
                {previewContent.author && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <User className="w-3 h-3" />
                    {previewContent.author}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleImport}>
                    Import Content
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={previewContent.originalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Original
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        <p className="mb-1">Supported platforms:</p>
        <div className="flex flex-wrap gap-2">
          {["Instagram", "TikTok", "YouTube", "Facebook", "Pinterest"].map((platform) => (
            <Badge key={platform} variant="outline" className="text-xs">
              {platform}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

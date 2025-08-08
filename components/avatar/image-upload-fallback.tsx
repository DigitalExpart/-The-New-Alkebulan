"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadFallbackProps {
  currentImageUrl?: string | null
  onImageUpload: (imageUrl: string) => void
  onImageRemove: () => void
}

export function ImageUploadFallback({ currentImageUrl, onImageUpload, onImageRemove }: ImageUploadFallbackProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setIsProcessing(true)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      setPreviewUrl(base64String)
      onImageUpload(base64String)
      toast.success('Image uploaded successfully!')
      setIsProcessing(false)
    }
    reader.onerror = () => {
      toast.error('Failed to process image')
      setIsProcessing(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Label className="text-lg font-semibold">Profile Picture</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a photo or use one of our avatar presets below
            </p>
          </div>

          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl || undefined} alt="Profile preview" />
                <AvatarFallback className="text-2xl bg-gray-100">
                  <Camera className="h-8 w-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              
              {previewUrl && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={handleRemoveImage}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={triggerFileSelect}
              disabled={isProcessing}
              className="w-full"
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Supported formats: JPG, PNG, GIF (max 2MB)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
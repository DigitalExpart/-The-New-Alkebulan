"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Camera, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUpload: (imageUrl: string) => void
  onImageRemove: () => void
}

export function ImageUpload({ currentImageUrl, onImageUpload, onImageRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    if (!user || !supabase) {
      toast.error('Please sign in to upload images')
      return
    }

    setIsUploading(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      console.log('Uploading file:', fileName)
      console.log('File size:', file.size)
      console.log('File type:', file.type)

      // Upload to Supabase storage with simpler path
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true  // Allow overwriting
        })

      if (error) {
        console.error('Upload error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('Bucket not found')) {
          toast.error('Storage bucket not found. Please check your Supabase configuration.')
        } else if (error.message.includes('The resource was not found')) {
          toast.error('Storage service not available. Please check your Supabase setup.')
        } else if (error.message.includes('Invalid bucket')) {
          toast.error('Invalid storage bucket. Please verify bucket name.')
        } else {
          toast.error(`Upload failed: ${error.message}`)
        }
        return
      }

      console.log('Upload success:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path)

      console.log('Public URL:', publicUrl)

      onImageUpload(publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
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
                  disabled={isUploading}
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
              disabled={isUploading}
              className="w-full"
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
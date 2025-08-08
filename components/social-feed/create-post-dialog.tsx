"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Image, 
  Link, 
  BarChart3, 
  Globe, 
  Users, 
  Lock, 
  Upload, 
  X,
  Send,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { CreatePostData } from "@/types/social-feed"

interface CreatePostDialogProps {
  onPostCreated?: () => void
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const { user, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState<'text' | 'image' | 'link' | 'poll'>('text')
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    if (!user || !supabase) {
      toast.error('Please sign in to upload images')
      return
    }

    setIsUploadingImage(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Upload error:', error)
        toast.error(`Upload failed: ${error.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path)

      setImageUrl(publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

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

    handleImageUpload(file)
  }

  const removeImage = () => {
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!user || !supabase) {
      toast.error('Please sign in to create posts')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter some content for your post')
      return
    }

    setIsSubmitting(true)
    try {
      const postData: CreatePostData = {
        content: content.trim(),
        post_type: postType,
        privacy,
        image_url: imageUrl,
        metadata: {}
      }

      const { error } = await supabase
        .from('posts')
        .insert([{
          user_id: user.id,
          ...postData
        }])

      if (error) {
        console.error('Error creating post:', error)
        toast.error('Failed to create post: ' + error.message)
        return
      }

      toast.success('Post created successfully!')
      
      // Reset form
      setContent("")
      setPostType('text')
      setPrivacy('public')
      setImageUrl(null)
      setIsOpen(false)
      
      // Notify parent component
      onPostCreated?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
    { value: 'friends', label: 'Friends', icon: Users, description: 'Only your friends can see this post' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this post' }
  ]

  const postTypeOptions = [
    { value: 'text', label: 'Text', icon: Send, description: 'Share your thoughts' },
    { value: 'image', label: 'Image', icon: Image, description: 'Share a photo' },
    { value: 'link', label: 'Link', icon: Link, description: 'Share a link' },
    { value: 'poll', label: 'Poll', icon: BarChart3, description: 'Create a poll' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left text-muted-foreground"
        >
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          What's on your mind?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, images, or links with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <div className="flex items-center space-x-2">
                <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
                  <SelectTrigger className="w-auto h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {privacyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label>Post Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {postTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={postType === option.value ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setPostType(option.value as any)}
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to post
            </p>
          </div>

          {/* Image Upload (for image posts) */}
          {postType === 'image' && (
            <div className="space-y-2">
              <Label>Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!imageUrl ? (
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full h-20"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 mr-2" />
                          Click to upload image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Post preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Character Count */}
          <div className="text-right">
            <Badge variant={content.length > 500 ? "destructive" : "secondary"}>
              {content.length}/500
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !content.trim() || content.length > 500}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Image, 
  Video, 
  FileText, 
  Smile, 
  MapPin, 
  Globe, 
  Users, 
  Lock, 
  X,
  Upload,
  Camera,
  FileImage,
  FileVideo,
  File
} from "lucide-react"
import { toast } from "sonner"

interface CreatePostModalProps {
  children: React.ReactNode
  onPostCreated?: () => void
}

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video' | 'document'
  id: string
}

interface PostData {
  content: string
  privacy: 'public' | 'followers' | 'friends' | 'location'
  feeling?: string
  location?: string
}

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
  { value: 'followers', label: 'Followers', icon: Users, description: 'Only your followers can see this post' },
  { value: 'friends', label: 'Friends', icon: Users, description: 'Only your friends can see this post' },
  { value: 'location', label: 'Location-based', icon: MapPin, description: 'People in your area can see this post' }
]

const FEELINGS = [
  '😊 Happy', '😢 Sad', '😍 Love', '😮 Surprised', '😠 Angry', '😴 Tired',
  '🤔 Thinking', '😎 Cool', '🥳 Celebrating', '😌 Relaxed', '😤 Frustrated',
  '😋 Excited', '😇 Blessed', '🤗 Grateful', '😌 Peaceful', '🔥 Fired up'
]

export default function CreatePostModal({ children, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [postData, setPostData] = useState<PostData>({
    content: '',
    privacy: 'public',
    feeling: '',
    location: ''
  })
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const maxSize = 500 * 1024 * 1024 // 500MB
    const invalidFiles: string[] = []

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
        return
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 'document'
      
      const mediaFile: MediaFile = {
        file,
        preview: URL.createObjectURL(file),
        type: fileType,
        id: Math.random().toString(36).substr(2, 9)
      }
      
      setMediaFiles(prev => [...prev, mediaFile])
    })

    if (invalidFiles.length > 0) {
      toast.error(`Files too large (max 500MB): ${invalidFiles.join(', ')}`)
    }
  }

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const uploadMediaToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const fileName = `${user.id}/posts/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(fileName, file)

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to create a post')
      return
    }

    if (!postData.content.trim() && mediaFiles.length === 0) {
      toast.error('Please add content or media to your post')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        toast.error('Database connection not available')
        return
      }

      // Upload media files
      const mediaUrls: string[] = []
      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i]
        const url = await uploadMediaToStorage(mediaFile.file)
        mediaUrls.push(url)
        setUploadProgress(((i + 1) / mediaFiles.length) * 50)
      }

      // Create post using the helper function
      const postPayload = {
        p_content: postData.content || (mediaUrls.length > 0 ? 'Shared media' : ''),
        p_image_url: mediaUrls.length > 0 ? mediaUrls[0] : null,
        p_post_type: mediaUrls.length > 0 ? 'image' : 'text',
        p_visibility: postData.privacy,
        p_feeling: postData.feeling || null,
        p_location: postData.location || null,
        p_metadata: {
          media_urls: mediaUrls,
          uploaded_at: new Date().toISOString()
        }
      }

      setUploadProgress(75)

      const { data: postId, error: postError } = await supabase
        .rpc('create_post_with_media', postPayload)

      if (postError) {
        throw new Error(`Database insert failed: ${postError.message}`)
      }

      setUploadProgress(100)
      toast.success('Post created successfully!')
      
      // Reset form
      setPostData({
        content: '',
        privacy: 'public',
        feeling: '',
        location: ''
      })
      setMediaFiles([])
      setOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }

    } catch (error) {
      console.error('Post creation error:', error)
      toast.error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getPrivacyIcon = (privacy: string) => {
    const option = PRIVACY_OPTIONS.find(opt => opt.value === privacy)
    return option ? <option.icon className="h-4 w-4" /> : <Globe className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Box */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What's on your mind?</label>
            <Textarea
              placeholder="Share your thoughts, ideas, or experiences..."
              value={postData.content}
              onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {postData.content.length}/2000
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Add Media</label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/mov,video/avi,video/mkv,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mb-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supports images, videos, and documents (max 500MB per file)
                </p>
              </div>

              {/* Selected Files */}
              {mediaFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Selected Files ({mediaFiles.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {mediaFiles.map((mediaFile) => (
                      <div key={mediaFile.id} className="relative border rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                            {mediaFile.type === 'image' ? (
                              <img
                                src={mediaFile.preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : mediaFile.type === 'video' ? (
                              <video
                                src={mediaFile.preview}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <File className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{mediaFile.file.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {mediaFile.type === 'image' ? (
                                <Image className="h-3 w-3 mr-1" />
                              ) : mediaFile.type === 'video' ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              {mediaFile.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMediaFile(mediaFile.id)}
                            disabled={uploading}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Privacy</label>
            <Select value={postData.privacy} onValueChange={(value: any) => setPostData(prev => ({ ...prev, privacy: value }))}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getPrivacyIcon(postData.privacy)}
                    {PRIVACY_OPTIONS.find(opt => opt.value === postData.privacy)?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRIVACY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Feeling */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Feeling</label>
            <Select value={postData.feeling} onValueChange={(value) => setPostData(prev => ({ ...prev, feeling: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    {postData.feeling || 'Select a feeling'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FEELINGS.map((feeling) => (
                  <SelectItem key={feeling} value={feeling}>
                    {feeling}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Where are you?"
                value={postData.location}
                onChange={(e) => setPostData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating post...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || (!postData.content.trim() && mediaFiles.length === 0)}
              className="min-w-[100px]"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

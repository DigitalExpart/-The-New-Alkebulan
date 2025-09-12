"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video, Link, MapPin, Users, X, Upload, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Community {
  id: string
  name: string
  description: string
  category: string
}

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

interface CreatePostDialogProps {
  children: React.ReactNode
  onPostCreated?: () => void
}

export function CreatePostDialog({ children, onPostCreated }: CreatePostDialogProps) {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [location, setLocation] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  // Fetch communities from Supabase
  useEffect(() => {
    const fetchCommunities = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from('communities')
          .select('id, name, description, category')
          .eq('status', 'active')
          .order('name')

        if (error) {
          console.error('Error fetching communities:', error)
          toast.error('Failed to load communities')
          return
        }

        setCommunities(data || [])
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load communities')
      }
    }

    if (open) {
      fetchCommunities()
    }
  }, [open])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleMediaUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newMediaFiles: MediaFile[] = []
    
    for (const file of files) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 5MB.`)
        continue
      }

      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`File ${file.name} is not a valid image or video.`)
        continue
      }

      const mediaFile: MediaFile = {
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video'
      }

      newMediaFiles.push(mediaFile)
    }

    setMediaFiles(prev => [...prev, ...newMediaFiles])
    toast.success(`Added ${newMediaFiles.length} media files`)
  }

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      return newFiles
    })
  }

  const uploadMediaToStorage = async (file: File): Promise<string> => {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase client not available')

    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('post-media') // Use post-media bucket for social feed posts
      .upload(fileName, file)

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async () => {
    if (!user || !content.trim() || !selectedCommunity) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      // First, create the post
      const postData = {
        user_id: user.id,
        content: content.trim(),
        post_type: mediaFiles.length > 0 ? (mediaFiles.length === 1 ? mediaFiles[0].type : 'mixed') : 'text',
        privacy: 'public',
        metadata: {
          community_id: selectedCommunity,
          community_name: communities.find(c => c.id === selectedCommunity)?.name,
          location: location.trim() || null,
          tags: tags,
          media_count: mediaFiles.length
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert post into posts table
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (postError) {
        console.error('Error creating post:', postError)
        toast.error('Failed to create post')
        return
      }

              // Upload media files if any
        if (mediaFiles.length > 0) {
          setUploadingMedia(true)
          
          const mediaUrls: string[] = []
          
          for (const mediaFile of mediaFiles) {
            try {
              const fileUrl = await uploadMediaToStorage(mediaFile.file)
              mediaUrls.push(fileUrl)
              
              // Insert media record into media_uploads table if it exists
              try {
                const mediaData = {
                  post_id: post.id,
                  user_id: user.id,
                  file_name: mediaFile.file.name,
                  file_url: fileUrl,
                  file_type: mediaFile.type,
                  file_size: mediaFile.file.size,
                  mime_type: mediaFile.file.type
                }

                const { error: mediaError } = await supabase
                  .from('media_uploads')
                  .insert(mediaData)

                if (mediaError) {
                  console.log('Media uploads table not available, continuing without it')
                }
              } catch (error) {
                console.log('Media uploads table not available, continuing without it')
              }
            } catch (error) {
              console.error('Error uploading media:', error)
              toast.error(`Failed to upload ${mediaFile.file.name}`)
            }
          }

          // Update post with media URLs in metadata and set primary image
          if (mediaUrls.length > 0) {
            await supabase
              .from('posts')
              .update({ 
                image_url: mediaUrls[0], // Set the first image as the primary image
                post_type: 'image', // Update post type to image
                metadata: {
                  ...postData.metadata,
                  media_urls: mediaUrls
                }
              })
              .eq('id', post.id)
          }
        }

      toast.success('Post created successfully!')

    // Reset form
    setContent("")
    setSelectedCommunity("")
    setLocation("")
    setTags([])
      setMediaFiles([])
    setOpen(false)

      // Notify parent component
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create post')
    } finally {
      setLoading(false)
      setUploadingMedia(false)
    }
  }

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) {
      return profile.first_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getAvatarFallback = () => {
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>Share your thoughts, ideas, or updates with the community</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{getDisplayName()}</p>
              <p className="text-sm text-muted-foreground">Posting to community</p>
            </div>
          </div>

          {/* Community Selection */}
          <div className="space-y-2">
            <Label htmlFor="community">Community *</Label>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger>
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {community.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind? *</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="location"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label>Media (Optional)</Label>
            
            {/* Media Files Display */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((mediaFile, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {mediaFile.type === 'image' ? (
                        <img
                          src={mediaFile.preview}
                          alt={mediaFile.file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <Video className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">{mediaFile.file.name}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMedia(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Media Upload Buttons */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <span className="text-sm font-medium">Add to your post:</span>
              
              {/* Photo Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingMedia}
                />
                <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled={uploadingMedia}>
                  {uploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
              <ImageIcon className="w-4 h-4" />
                  )}
              Photo
            </Button>
              </div>

              {/* Video Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingMedia}
                />
                <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled={uploadingMedia}>
                  {uploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
              <Video className="w-4 h-4" />
                  )}
              Video
            </Button>
              </div>

              {/* Link */}
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link
            </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedCommunity || loading}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingMedia ? 'Uploading Media...' : 'Posting...'}
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

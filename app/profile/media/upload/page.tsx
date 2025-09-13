"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Image, 
  Video, 
  FileText,
  X,
  Check,
  ArrowLeft,
  Plus,
  Calendar,
  Eye,
  EyeOff,
  Users,
  MapPin
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video' | 'document'
  id: string
}

interface PostData {
  content: string
  visibility: 'public' | 'followers' | 'friends' | 'location'
  scheduled_at?: string
  location?: string
}

export default function MediaUploadPage() {
  const { user } = useAuth()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileUploadProgress, setFileUploadProgress] = useState<{[key: string]: {progress: number, uploadedMB: number, totalMB: number}}>({})
  const [postData, setPostData] = useState<PostData>({
    content: '',
    visibility: 'public',
    scheduled_at: '',
    location: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const maxSize = 500 * 1024 * 1024 // 500MB in bytes
    const invalidFiles: string[] = []

    Array.from(files).forEach(file => {
      // Check file size
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

    // Show error for files that are too large
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

  const uploadMediaToStorage = async (file: File, fileId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase not configured')

    const totalMB = file.size / (1024 * 1024)
    
    try {
      const fileName = `${user.id}/media/${Date.now()}-${file.name}`
      
      // Initialize progress tracking for this file
      setFileUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 0, uploadedMB: 0, totalMB }
      }))

      // Simulate progress updates since Supabase doesn't provide real-time progress
      const progressInterval = setInterval(() => {
        setFileUploadProgress(prev => {
          const current = prev[fileId]
          if (!current) return prev
          
          // Simulate progress (this is approximate since we can't get real progress from Supabase)
          const newProgress = Math.min(current.progress + Math.random() * 10, 95)
          const newUploadedMB = (newProgress / 100) * totalMB
          
          return {
            ...prev,
            [fileId]: { progress: newProgress, uploadedMB: newUploadedMB, totalMB }
          }
        })
      }, 200)

      const { data, error } = await supabase.storage
        .from('post-media')
        .upload(fileName, file)

      clearInterval(progressInterval)

      // Set to 100% when upload completes
      setFileUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 100, uploadedMB: totalMB, totalMB }
      }))

      if (error) {
        console.error('Storage upload error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        throw new Error(`Storage upload failed: ${error.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Media upload error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
      throw error
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to upload media')
      return
    }

    if (mediaFiles.length === 0 && !postData.content.trim()) {
      toast.error('Please add media or write some content')
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      toast.error('Database connection not available. Please check your configuration.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      console.log('Starting media upload process...')
      console.log('User:', user.id)
      console.log('Media files:', mediaFiles.length)
      console.log('Post data:', postData)

      // Upload media files
      const mediaUrls: string[] = []
      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i]
        console.log(`Uploading file ${i + 1}/${mediaFiles.length}:`, mediaFile.file.name)
        const url = await uploadMediaToStorage(mediaFile.file, mediaFile.id)
        mediaUrls.push(url)
        console.log('File uploaded successfully:', url)
        setUploadProgress(((i + 1) / mediaFiles.length) * 50) // 50% for media upload
      }

      console.log('All media files uploaded:', mediaUrls)

      // Create post
      const postPayload = {
        user_id: user.id,
        content: postData.content || 'Shared media',
        image_url: mediaUrls.length > 0 ? mediaUrls[0] : null,
        metadata: {
          media_urls: mediaUrls,
          visibility: postData.visibility,
          location: postData.location || null,
          scheduled_at: postData.scheduled_at || null
        },
        post_type: mediaUrls.length > 0 ? 'image' : 'text',
        created_at: postData.scheduled_at ? new Date(postData.scheduled_at).toISOString() : new Date().toISOString()
      }

      console.log('Post payload prepared:', postPayload)
      setUploadProgress(75)

      console.log('Inserting post into database...')
      const { error: postError } = await supabase
        .from('posts')
        .insert(postPayload)

      if (postError) {
        console.error('Database insert error:', {
          message: postError.message,
          details: postError.details,
          hint: postError.hint,
          code: postError.code,
          fullError: postError
        })
        throw new Error(`Database insert failed: ${postError.message}`)
      }

      setUploadProgress(100)
      toast.success('Media uploaded successfully!')
      
      // Reset form
      setMediaFiles([])
      setFileUploadProgress({})
      setPostData({
        content: '',
        visibility: 'public',
        scheduled_at: '',
        location: ''
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Upload error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
      toast.error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setFileUploadProgress({})
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Eye className="h-4 w-4 text-green-600" />
      case 'followers':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'friends':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'location':
        return <MapPin className="h-4 w-4 text-orange-600" />
      default:
        return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile/media">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Media Gallery
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Upload Media</h1>
              <p className="text-muted-foreground mt-1">
                Share images, videos, and documents with your network
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mb-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports images, videos, and documents (max 500MB per file)
                  </p>
                </div>

                {/* Selected Files */}
                {mediaFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">Selected Files ({mediaFiles.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mediaFiles.map((mediaFile) => (
                        <div key={mediaFile.id} className="relative border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                                  <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{mediaFile.file.name}</p>
                              <div className="flex items-center gap-2 mt-1">
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
                                <span className="text-xs text-muted-foreground">
                                  {(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                              
                              {/* Upload Progress */}
                              {uploading && fileUploadProgress[mediaFile.id] && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Uploading...</span>
                                    <span>
                                      {fileUploadProgress[mediaFile.id].uploadedMB.toFixed(1)} MB / {fileUploadProgress[mediaFile.id].totalMB.toFixed(1)} MB
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                                      style={{ width: `${fileUploadProgress[mediaFile.id].progress}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-center text-muted-foreground">
                                    {fileUploadProgress[mediaFile.id].progress.toFixed(0)}% complete
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMediaFile(mediaFile.id)}
                              disabled={uploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post Content */}
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">What's on your mind?</Label>
                  <Textarea
                    id="content"
                    value={postData.content}
                    onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your thoughts about this media..."
                    rows={4}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    value={postData.location}
                    onChange={(e) => setPostData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Where was this taken?"
                    disabled={uploading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getVisibilityIcon(postData.visibility)}
                  Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={postData.visibility}
                  onValueChange={(value) => setPostData(prev => ({ ...prev, visibility: value as any }))}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="followers">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Followers Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>Friends Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="location">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span>Location-based</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {postData.visibility === 'public' && 'Visible to everyone'}
                  {postData.visibility === 'followers' && 'Only your followers can see this'}
                  {postData.visibility === 'friends' && 'Only your friends can see this'}
                  {postData.visibility === 'location' && 'Visible to people in your area'}
                </p>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="schedule">Schedule for later (optional)</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={postData.scheduled_at}
                    onChange={(e) => setPostData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    disabled={uploading}
                  />
                  {postData.scheduled_at && (
                    <p className="text-xs text-muted-foreground">
                      Will be posted on {new Date(postData.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {uploading && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={uploadProgress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress < 50 ? 'Uploading files...' : 
                     uploadProgress < 75 ? 'Processing...' : 
                     'Creating post...'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={uploading || (mediaFiles.length === 0 && !postData.content.trim())}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Share Media
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

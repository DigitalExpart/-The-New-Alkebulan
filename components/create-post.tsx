"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  Image, 
  Video, 
  MapPin, 
  Smile, 
  X,
  Upload,
  Play,
  Camera
} from "lucide-react"
import { toast } from "sonner"

interface CreatePostProps {
  communityId: string
  onPostCreated: () => void
}

export default function CreatePost({ communityId, onPostCreated }: CreatePostProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [locationName, setLocationName] = useState("")
  const [locationCoordinates, setLocationCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [selectedFeels, setSelectedFeels] = useState<{emoji: string, description: string} | null>(null)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [showFeelsPicker, setShowFeelsPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Available feels/emojis
  const availableFeels = [
    { emoji: "😊", description: "Happy" },
    { emoji: "😍", description: "Love" },
    { emoji: "🤔", description: "Thinking" },
    { emoji: "😮", description: "Surprised" },
    { emoji: "😢", description: "Sad" },
    { emoji: "😡", description: "Angry" },
    { emoji: "🤗", description: "Hug" },
    { emoji: "🎉", description: "Celebrate" },
    { emoji: "🙏", description: "Pray" },
    { emoji: "💪", description: "Strong" }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const isValidImage = file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB
      const isValidVideo = file.type.startsWith('video/') && file.size <= 100 * 1024 * 1024 // 100MB
      
      if (!isValidImage && !isValidVideo) {
        toast.error(`${file.name} is not a valid image or video file`)
        return false
      }
      
      if (file.size > (file.type.startsWith('image/') ? 10 * 1024 * 1024 : 100 * 1024 * 1024)) {
        toast.error(`${file.name} is too large`)
        return false
      }
      
      return true
    })
    
    if (validFiles.length + mediaFiles.length > 5) {
      toast.error("Maximum 5 media files allowed per post")
      return
    }
    
    setMediaFiles(prev => [...prev, ...validFiles])
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setMediaUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleLocationSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Try to get location name from coordinates (reverse geocoding)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                setLocationName(data.display_name.split(',')[0]) // Get first part of address
              }
            })
            .catch(() => {
              setLocationName("Current Location")
            })
        },
        () => {
          toast.error("Unable to get your location")
        }
      )
    } else {
      toast.error("Geolocation is not supported by this browser")
    }
  }

  const clearLocation = () => {
    setLocationName("")
    setLocationCoordinates(null)
  }

  const selectFeels = (feels: {emoji: string, description: string}) => {
    setSelectedFeels(feels)
    setShowFeelsPicker(false)
  }

  const clearFeels = () => {
    setSelectedFeels(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("You must be logged in to create a post")
      return
    }

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      
      // Validate required fields
      if (!content.trim()) {
        toast.error("Post content cannot be empty")
        return
      }

      if (!communityId) {
        toast.error("Community ID is required")
        return
      }

      // First check if user is a member of the community
      const { data: membership, error: membershipError } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        toast.error("You must be a member of this community to post")
        return
      }

      // Upload media files first if any
      let uploadedMediaUrls: string[] = []
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          try {
            // For now, we'll use a placeholder approach
            // In production, you'd upload to Supabase Storage or another service
            const fileName = `${Date.now()}-${file.name}`
            const fileUrl = `https://via.placeholder.com/400x300/666666/FFFFFF?text=${encodeURIComponent(fileName)}`
            uploadedMediaUrls.push(fileUrl)
          } catch (error) {
            console.error('Error uploading file:', error)
            toast.error(`Failed to upload ${file.name}`)
          }
        }
      }

      // Create the post with enhanced fields
      const postData = {
        community_id: communityId,
        user_id: user.id,
        content: content.trim(),
        media_urls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : null,
        location_name: locationName || null,
        location_coordinates: locationCoordinates ? `(${locationCoordinates.lat},${locationCoordinates.lng})` : null,
        feels_emoji: selectedFeels?.emoji || null,
        feels_description: selectedFeels?.description || null,
        likes_count: 0,
        comments_count: 0
      }
      
      console.log('Attempting to insert post with data:', postData)
      
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .insert(postData)
        .select()
        .single()

      if (postError) {
        console.error('Post creation error:', postError)
        console.log('Error details:', JSON.stringify(postError, null, 2))
        console.log('Error message:', postError.message)
        console.log('Error code:', postError.code)
        console.log('Error details:', postError.details)
        throw postError
      }

      // Update community post count if needed
      await supabase
        .from('communities')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', communityId)

      toast.success("Post created successfully!")
      setContent("")
      setMediaFiles([])
      setMediaUrls([])
      setLocationName("")
      setLocationCoordinates(null)
      setSelectedFeels(null)
      onPostCreated() // Refresh the posts list
      
    } catch (error) {
      console.error('Error creating post:', error)
      console.log('Error type:', typeof error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      
      // Provide more specific error messages
      let errorMessage = "Failed to create post. Please try again."
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Post creation failed: ${error.message}`
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to create posts
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Create a Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the community..."
              rows={4}
            />
          </div>

          {/* Media Upload Section */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Media Files</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Play className="h-8 w-8" />
                          <span className="text-xs text-center">{file.name}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMediaFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Media Upload */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Media
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Location */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className={`flex items-center gap-2 ${locationName ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <MapPin className="h-4 w-4" />
              {locationName ? 'Location' : 'Add Location'}
            </Button>

            {/* Feels */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFeelsPicker(!showFeelsPicker)}
              className={`flex items-center gap-2 ${selectedFeels ? 'bg-yellow-50 border-yellow-200' : ''}`}
            >
              <Smile className="h-4 w-4" />
              {selectedFeels ? 'Feeling' : 'How are you feeling?'}
            </Button>
          </div>

          {/* Location Input */}
          {showLocationInput && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Location name (optional)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleLocationSelect}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Current
                </Button>
                {locationName && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={clearLocation}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {locationName && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {locationName}
                </Badge>
              )}
            </div>
          )}

          {/* Feels Picker */}
          {showFeelsPicker && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
              <Label>How are you feeling?</Label>
              <div className="grid grid-cols-5 gap-2">
                {availableFeels.map((feels, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectFeels(feels)}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    <span className="text-lg">{feels.emoji}</span>
                    <span className="text-xs">{feels.description}</span>
                  </Button>
                ))}
              </div>
              {selectedFeels && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <span>{selectedFeels.emoji}</span>
                    {selectedFeels.description}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={clearFeels}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Post
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

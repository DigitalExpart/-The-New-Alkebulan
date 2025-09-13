"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Send, 
  Eye, 
  Users, 
  MapPin,
  Image,
  Video,
  FileText,
  Plus,
  X
} from "lucide-react"
import { toast } from "sonner"

interface ScheduledPost {
  id: string
  content: string
  media_urls: string[]
  visibility: 'public' | 'followers' | 'friends' | 'location'
  scheduled_at: string
  status: 'scheduled' | 'published' | 'failed'
  created_at: string
}

interface PostSchedulerProps {
  onPostScheduled?: (post: ScheduledPost) => void
}

export function PostScheduler({ onPostScheduled }: PostSchedulerProps) {
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'friends' | 'location'>('public')
  const [scheduledAt, setScheduledAt] = useState("")
  const [location, setLocation] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])

  const handleSchedulePost = () => {
    if (!content.trim()) {
      toast.error('Please write some content')
      return
    }

    if (!scheduledAt) {
      toast.error('Please select a date and time')
      return
    }

    const scheduledDate = new Date(scheduledAt)
    const now = new Date()

    if (scheduledDate <= now) {
      toast.error('Scheduled time must be in the future')
      return
    }

    const newPost: ScheduledPost = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      media_urls: [], // Would be populated after media upload
      visibility,
      scheduled_at: scheduledAt,
      status: 'scheduled',
      created_at: new Date().toISOString()
    }

    setScheduledPosts(prev => [newPost, ...prev])
    onPostScheduled?.(newPost)
    
    // Reset form
    setContent("")
    setScheduledAt("")
    setLocation("")
    setMediaFiles([])
    
    toast.success('Post scheduled successfully!')
  }

  const handleCancelSchedule = (postId: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== postId))
    toast.success('Scheduled post cancelled')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600">Scheduled</Badge>
      case 'published':
        return <Badge variant="outline" className="text-green-600">Published</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Schedule New Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
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
            </div>

            <div>
              <Label htmlFor="schedule">Schedule Date & Time</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you?"
            />
          </div>

          <Button onClick={handleSchedulePost} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Post
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Posts */}
      {scheduledPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Posts ({scheduledPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm">{post.content}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getVisibilityIcon(post.visibility)}
                          <span className="capitalize">{post.visibility}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.scheduled_at).toLocaleString()}</span>
                        </div>
                        {post.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(post.status)}
                      {post.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSchedule(post.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

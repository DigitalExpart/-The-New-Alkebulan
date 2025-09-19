"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatePostDialog } from "@/components/social-feed/create-post-dialog"
import { 
  Plus, 
  Image, 
  Video, 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface UserPost {
  id: string
  content: string
  image_url?: string
  metadata?: {
    media_urls?: string[]
    location?: string
    visibility?: 'public' | 'followers' | 'friends' | 'location'
  }
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked: boolean
}

export default function UserPostsPage() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all')

  useEffect(() => {
    if (user) {
      fetchUserPosts()
    }
  }, [user])

  const fetchUserPosts = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          metadata,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          shares_count
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        toast.error('Failed to load posts')
        return
      }

      // Add is_liked field (simplified - you might want to check actual likes)
      const postsWithLikes = data?.map(post => ({
        ...post,
        is_liked: false // This would be determined by checking likes table
      })) || []

      setPosts(postsWithLikes)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    fetchUserPosts()
  }

  const getVisibilityIcon = (visibility?: string) => {
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

  const getVisibilityText = (visibility?: string) => {
    switch (visibility) {
      case 'public':
        return 'Public'
      case 'followers':
        return 'Followers'
      case 'friends':
        return 'Friends'
      case 'location':
        return 'Location-based'
      default:
        return 'Public'
    }
  }

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true
    if (activeTab === 'images') return post.image_url || post.metadata?.media_urls?.some(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    if (activeTab === 'videos') return post.metadata?.media_urls?.some(url => url.match(/\.(mp4|mov|avi|webm)$/i))
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Posts</h1>
              <p className="text-muted-foreground mt-1">
                Manage and view all your posts and media
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CreatePostDialog onPostCreated={handlePostCreated}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </CreatePostDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Images ({posts.filter(p => p.image_url || p.metadata?.media_urls?.some(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i))).length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos ({posts.filter(p => p.metadata?.media_urls?.some(url => url.match(/\.(mp4|mov|avi|webm)$/i))).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    {activeTab === 'all' 
                      ? "Start sharing your thoughts and experiences with the community."
                      : activeTab === 'images'
                      ? "Upload some images to share with your followers."
                      : "Upload some videos to share with your followers."
                    }
                  </p>
                  <CreatePostDialog onPostCreated={handlePostCreated}>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Post
                    </Button>
                  </CreatePostDialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getVisibilityIcon(post.metadata?.visibility)}
                            <span className="text-sm text-muted-foreground">
                              {getVisibilityText(post.metadata?.visibility)}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Post Content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Media */}
                      {(post.image_url || post.metadata?.media_urls) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {post.image_url && (
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                              <img
                                src={post.image_url}
                                alt="Post image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {post.metadata?.media_urls?.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                              {url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                <video
                                  src={url}
                                  className="w-full h-full object-cover"
                                  controls
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt={`Post media ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Location */}
                      {post.metadata?.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{post.metadata.location}</span>
                        </div>
                      )}

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-6 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Heart className={`h-4 w-4 ${post.is_liked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                          <span className="text-sm text-muted-foreground">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{post.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{post.shares_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

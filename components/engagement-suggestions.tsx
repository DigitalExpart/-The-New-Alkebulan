"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  Share2,
  Eye,
  MapPin,
  Calendar,
  UserPlus,
  UserMinus,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface SuggestedUser {
  id: string
  first_name: string
  last_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  mutual_connections: number
  common_interests: string[]
  engagement_score: number
  reason: 'mutual_connections' | 'location' | 'interests' | 'engagement'
}

interface TrendingPost {
  id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  author: {
    first_name: string
    last_name: string
    username: string
    avatar_url: string | null
  }
}

interface EngagementStats {
  total_likes: number
  total_comments: number
  total_shares: number
  total_views: number
  engagement_rate: number
  top_posts: TrendingPost[]
}

export function EngagementSuggestions() {
  const { user } = useAuth()
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSuggestions()
    }
  }, [user])

  const fetchSuggestions = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      // Fetch suggested users based on various criteria
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          username,
          avatar_url,
          bio,
          location,
          interests
        `)
        .neq('id', user.id)
        .limit(10)

      if (usersError) {
        console.error('Error fetching users:', usersError)
      } else {
        // Simulate engagement scoring and suggestions
        const suggestions = users?.map(user => ({
          ...user,
          mutual_connections: Math.floor(Math.random() * 20),
          common_interests: ['Technology', 'Business', 'Art'].slice(0, Math.floor(Math.random() * 3) + 1),
          engagement_score: Math.floor(Math.random() * 100),
          reason: ['mutual_connections', 'location', 'interests', 'engagement'][Math.floor(Math.random() * 4)] as any
        })) || []

        setSuggestedUsers(suggestions)
      }

      // Fetch trending posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          author:profiles!posts_user_id_fkey(
            first_name,
            last_name,
            username,
            avatar_url
          )
        `)
        .order('likes_count', { ascending: false })
        .limit(5)

      if (postsError) {
        console.error('Error fetching posts:', postsError)
      } else {
        setTrendingPosts(posts || [])
      }

      // Calculate engagement stats
      const { data: userPosts, error: userPostsError } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count')
        .eq('user_id', user.id)

      if (!userPostsError && userPosts) {
        const stats = {
          total_likes: userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0),
          total_comments: userPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0),
          total_shares: userPosts.reduce((sum, post) => sum + (post.shares_count || 0), 0),
          total_views: userPosts.length * 10, // Simulate views
          engagement_rate: userPosts.length > 0 ? 
            (userPosts.reduce((sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0), 0) / userPosts.length) : 0,
          top_posts: userPosts.slice(0, 3).map(post => ({
            id: post.id || '',
            content: 'Your post content...',
            image_url: null,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            shares_count: post.shares_count || 0,
            created_at: new Date().toISOString(),
            author: {
              first_name: 'You',
              last_name: '',
              username: 'you',
              avatar_url: null
            }
          }))
        }
        setEngagementStats(stats)
      }

    } catch (error) {
      console.error('Error fetching suggestions:', error)
      toast.error('Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUser = async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase || !user) return

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        })

      if (error) {
        console.error('Error following user:', error)
        toast.error('Failed to follow user')
        return
      }

      setSuggestedUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('User followed successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to follow user')
    }
  }

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'mutual_connections':
        return 'Mutual connections'
      case 'location':
        return 'Same location'
      case 'interests':
        return 'Common interests'
      case 'engagement':
        return 'High engagement'
      default:
        return 'Suggested for you'
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'mutual_connections':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'location':
        return <MapPin className="h-4 w-4 text-green-600" />
      case 'interests':
        return <Sparkles className="h-4 w-4 text-purple-600" />
      case 'engagement':
        return <TrendingUp className="h-4 w-4 text-orange-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Engagement Stats */}
      {engagementStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Engagement Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{engagementStats.total_likes}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{engagementStats.total_comments}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{engagementStats.total_shares}</div>
                <div className="text-sm text-muted-foreground">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{engagementStats.engagement_rate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Engagement Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
                    <AvatarFallback>
                      {`${user.first_name} ${user.last_name}`.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.first_name} {user.last_name}</h4>
                      {user.username && (
                        <Badge variant="outline" className="text-xs">@{user.username}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getReasonIcon(user.reason)}
                      <span>{getReasonText(user.reason)}</span>
                      {user.mutual_connections > 0 && (
                        <span>• {user.mutual_connections} mutual connections</span>
                      )}
                    </div>
                    
                    {user.common_interests.length > 0 && (
                      <div className="flex items-center gap-1">
                        {user.common_interests.slice(0, 2).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${user.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFollowUser(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} alt={`${post.author.first_name} ${post.author.last_name}`} />
                    <AvatarFallback>
                      {`${post.author.first_name} ${post.author.last_name}`.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author.first_name} {post.author.last_name}</span>
                      <Badge variant="outline" className="text-xs">@{post.author.username}</Badge>
                    </div>
                    
                    <p className="text-sm">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{post.comments_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        <span>{post.shares_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

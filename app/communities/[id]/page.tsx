"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, MessageCircle, Heart, Share2, Play, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import CreatePost from "@/components/create-post"

interface Community {
  id: string
  name: string
  description: string
  category: string
  location: string
  member_count: number
  tags: string[]
  created_at: string
}

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
  likes_count: number
  comments_count: number
  is_liked?: boolean
  media_urls?: string[]
  media_type?: string
  location_name?: string
  feels_emoji?: string
  feels_description?: string
}

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)

  const communityId = params.id as string

  useEffect(() => {
    console.log('useEffect triggered - communityId:', communityId, 'user:', user?.id)
    fetchCommunity()
    fetchPosts()
    checkMembership()
  }, [communityId, user])

  const fetchCommunity = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single()

      if (error) throw error
      setCommunity(data)
    } catch (error) {
      console.error('Error fetching community:', error)
      toast.error("Failed to load community")
    }
  }

  const fetchPosts = async () => {
    try {
      const supabase = getSupabaseClient()
      
      console.log('Fetching posts for community ID:', communityId)
      
      // First, let's check if there are any posts at all
      const { count: postCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)
      
      console.log('Total posts count for this community:', postCount)
      
      // First, try to fetch posts with profile data
      let postsData = null
      let postsError = null
      
      try {
        console.log('Attempting to fetch posts with profile data...')
        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            *,
            user:profiles(
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('community_id', communityId)
          .order('created_at', { ascending: false })

        if (error) {
          console.log('Posts with profiles query error:', error)
          postsError = error
        } else {
          console.log('Successfully fetched posts with profiles:', data)
          console.log('Number of posts found:', data?.length || 0)
          if (data && data.length > 0) {
            console.log('First post data:', data[0])
          }
          postsData = data
        }
      } catch (profileError) {
        console.log('Exception fetching posts with profiles:', profileError)
        postsError = profileError
      }

      // If profiles failed, try to fetch just the posts and get basic user info
      if (!postsData && postsError) {
        try {
          console.log('Attempting to fetch posts without profile data...')
          const { data, error } = await supabase
            .from('community_posts')
            .select('*')
            .eq('community_id', communityId)
            .order('created_at', { ascending: false })

          if (error) {
            console.log('Basic posts query error:', error)
            throw error
          } else {
            console.log('Successfully fetched basic posts:', data)
            
            // Try to get basic user info from auth.users table
            if (data && data.length > 0) {
              const userIds = [...new Set(data.map(post => post.user_id))]
              console.log('Fetching basic user info for user IDs:', userIds)
              
              try {
                const { data: userData, error: userError } = await supabase
                  .from('auth.users')
                  .select('id, email')
                  .in('id', userIds)
                
                if (userError) {
                  console.log('Error fetching user data from auth.users:', userError)
                } else {
                  console.log('Successfully fetched user data:', userData)
                  // Create a map of user_id to user data
                  const userMap = new Map(userData?.map(u => [u.id, u]) || [])
                  
                  // Add user data to posts
                  postsData = data.map(post => {
                    const userInfo = userMap.get(post.user_id)
                    return {
                      ...post,
                      user: {
                        first_name: 'User',
                        last_name: userInfo?.email ? userInfo.email.split('@')[0] : post.user_id.slice(0, 8),
                        avatar_url: undefined
                      }
                    }
                  })
                }
              } catch (userFetchError) {
                console.log('Exception fetching user data:', userFetchError)
                // Fallback to basic user data
                postsData = data.map(post => ({
                  ...post,
                  user: {
                    first_name: 'User',
                    last_name: post.user_id ? post.user_id.slice(0, 8) : 'Unknown',
                    avatar_url: undefined
                  }
                }))
              }
            } else {
              postsData = []
            }
          }
        } catch (basicError) {
          console.log('Exception fetching basic posts:', basicError)
          throw basicError
        }
      }

      // Ensure postsData is always defined
      if (!postsData) {
        console.log('No posts data available, setting empty array')
        postsData = []
      }

      console.log('Final postsData before setting state:', postsData)
      console.log('Posts data type:', typeof postsData)
      console.log('Posts data length:', postsData?.length || 0)
      if (postsData && postsData.length > 0) {
        console.log('Sample post structure:', {
          id: postsData[0].id,
          content: postsData[0].content,
          user: postsData[0].user,
          hasUser: !!postsData[0].user,
          userType: typeof postsData[0].user
        })
      }

      // If user is logged in, check which posts they've liked
      if (user && postsData) {
        try {
          const postIds = postsData.map(post => post.id)
          console.log('Fetching user likes for post IDs:', postIds)
          
          const { data: userLikes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds)

          const likedPostIds = new Set(userLikes?.map(like => like.post_id) || [])
          
          // Add like status to posts
          const postsWithLikes = postsData.map(post => ({
            ...post,
            is_liked: likedPostIds.has(post.id)
          }))
          
          console.log('Posts with likes data:', postsWithLikes)
          console.log('Setting posts state with likes data, count:', postsWithLikes.length)
          setPosts(postsWithLikes)
        } catch (likesError) {
          console.log('Error fetching user likes, setting posts without likes:', likesError)
          console.log('Setting posts state without likes, count:', postsData.length)
          setPosts(postsData)
        }
      } else {
        console.log('Setting posts state (no user), count:', postsData.length)
        setPosts(postsData)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      console.log('Error type:', typeof error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      toast.error("Failed to load posts")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const checkMembership = async () => {
    if (!user) return
    try {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()
      setIsMember(!!data)
    } catch (error) {
      setIsMember(false)
    }
  }

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error("Please log in to join the community")
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString()
        })

      setIsMember(true)
      toast.success("Successfully joined the community!")
    } catch (error) {
      console.error('Error joining community:', error)
      toast.error("Failed to join community")
    } finally {
      setLoading(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to like posts")
      return
    }

    try {
      const supabase = getSupabaseClient()
      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.is_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count - 1, is_liked: false }
            : p
        ))
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count + 1, is_liked: true }
            : p
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error("Failed to update like")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground mb-4">Loading community...</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setLoading(true)
              fetchCommunity()
              fetchPosts()
              checkMembership()
            }}
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Community not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Community Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-4">{community.category}</Badge>
                <CardTitle className="text-3xl mb-2">{community.name}</CardTitle>
                <p className="text-muted-foreground text-lg mb-4">{community.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
                      onClick={() => {
                        console.log('Navigating to members page:', `/communities/${community.id}/members`)
                        try {
                          router.push(`/communities/${community.id}/members`)
                        } catch (error) {
                          console.error('Navigation error:', error)
                          // Fallback to window.location if router fails
                          window.location.href = `/communities/${community.id}/members`
                        }
                      }}
                    >
                      {community.member_count} members
                    </Button>
                  </div>
                  {community.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{community.location}</span>
                    </div>
                  )}
                </div>

                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {community.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {!isMember ? (
                  <Button onClick={handleJoinCommunity} disabled={loading}>
                    Join Community
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-center py-2">Member</Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Create Post */}
        {isMember && (
          <CreatePost 
            communityId={communityId} 
            onPostCreated={() => {
              console.log('🎉 onPostCreated callback triggered - refreshing posts...')
              toast.success('Refreshing posts...')
              fetchPosts()
            }}
          />
        )}

        {/* Posts */}
        <div className="space-y-6">
          {console.log('Rendering posts section, posts count:', posts.length, 'posts:', posts)}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {isMember 
                      ? "Be the first to share something with your community!"
                      : "Join the community to see posts and start conversations!"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              // Safety check for post.user
              if (!post.user) {
                console.warn('Post missing user data:', post)
                return null // Skip rendering this post
              }
              
              return (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.user.avatar_url} />
                        <AvatarFallback>
                          {post.user.first_name[0]}{post.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">
                            {post.user.first_name} {post.user.last_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-foreground mb-4">{post.content}</p>
                        
                        {/* Media Display */}
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {post.media_urls.map((url, index) => (
                                <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                  {post.media_type === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <Play className="h-12 w-12 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground ml-2">Video</span>
                                    </div>
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
                          </div>
                        )}
                        
                        {/* Location and Feels */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                          {post.location_name && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{post.location_name}</span>
                            </div>
                          )}
                          {post.feels_emoji && (
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{post.feels_emoji}</span>
                              <span>{post.feels_description}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Post Actions */}
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${
                              post.is_liked 
                                ? 'text-red-500' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                            <span>{post.likes_count}</span>
                          </button>
                          
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments_count}</span>
                          </button>
                          
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }).filter(Boolean) // Remove any null posts
          )}
        </div>
      </div>
    </div>
  )
}

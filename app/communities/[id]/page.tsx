"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, MessageCircle, Heart, Share2, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

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
}

export default function CommunityDetailPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)
  const [isMember, setIsMember] = useState(false)

  const communityId = params.id as string

  useEffect(() => {
    fetchCommunity()
    fetchPosts()
    checkMembership()
  }, [communityId])

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
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:profiles!community_posts_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
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

  const handleCreatePost = async () => {
    if (!user || !newPost.trim()) return

    setPosting(true)
    try {
      const supabase = getSupabaseClient()
      
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

      // Create the post with proper fields
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          user_id: user.id,
          content: newPost.trim(),
          likes_count: 0,
          comments_count: 0
        })
        .select(`
          *,
          user:profiles!community_posts_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Post creation error:', error)
        throw error
      }
      
      setPosts([data, ...posts])
      setNewPost("")
      toast.success("Post created successfully!")
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error("Failed to create post. Please try again.")
    } finally {
      setPosting(false)
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
          <p className="mt-4 text-muted-foreground">Loading community...</p>
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
                    <span>{community.member_count} members</span>
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
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share something with your community..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <Button onClick={handleCreatePost} disabled={posting || !newPost.trim()}>
                      {posting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        <div className="space-y-6">
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
            posts.map((post) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

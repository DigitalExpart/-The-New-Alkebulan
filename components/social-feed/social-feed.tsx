"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

import { PostCard } from "./post-card"
import type { PostWithStats, SocialFeedFilters } from "@/types/social-feed"

interface SocialFeedProps {
  filters?: SocialFeedFilters
  className?: string
}

export function SocialFeed({ filters = {}, className = "" }: SocialFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 10

  const fetchPosts = async (isRefresh = false) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      const currentOffset = isRefresh ? 0 : offset
      
      let query = supabase
        .from('posts_with_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1)

      // Apply filters
      if (filters.post_type && filters.post_type !== 'all') {
        query = query.eq('post_type', filters.post_type)
      }

      if (filters.privacy && filters.privacy !== 'all') {
        query = query.eq('privacy', filters.privacy)
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching posts:', error)
        toast.error('Failed to load posts')
        return
      }

      // Check if user has liked each post
      const postsWithUserLikes = await Promise.all(
        data.map(async (post) => {
          if (!user) return { ...post, user_has_liked: false, user_has_shared: false }

          // Check if user has liked this post
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single()

          // Check if user has shared this post
          const { data: shareData } = await supabase
            .from('post_shares')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single()

          return {
            ...post,
            user_has_liked: !!likeData,
            user_has_shared: !!shareData
          }
        })
      )

      if (isRefresh) {
        setPosts(postsWithUserLikes)
        setOffset(limit)
      } else {
        setPosts(prev => [...prev, ...postsWithUserLikes])
        setOffset(prev => prev + limit)
      }

      setHasMore(postsWithUserLikes.length === limit)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load posts')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPosts(true)
    setRefreshing(false)
  }

  const handlePostCreated = () => {
    handleRefresh()
  }

  const handlePostUpdated = () => {
    handleRefresh()
  }

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prev => prev.filter(post => post.id !== deletedPostId))
  }

  useEffect(() => {
    fetchPosts(true)
  }, [filters])

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                {user ? "Be the first to share something with the community!" : "Sign in to see posts from the community."}
              </p>
              {!user && (
                <Button asChild>
                  <a href="/auth/signin">Sign In</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={() => handlePostDeleted(post.id)}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchPosts()}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </Button>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 
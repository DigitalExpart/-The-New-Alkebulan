"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, Share2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import CommentsModal from "@/components/community/comments-modal"

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
  community?: {
    name: string
    avatar_url?: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCommentsModal, setShowCommentsModal] = useState(false)

  const postId = params?.id as string

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId, user])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const sb = getSupabaseClient()
      if (!sb) return

      // Helper: load profiles for a set of user ids
      const loadProfilesMap = async (ids: string[]) => {
        const unique = Array.from(new Set(ids.filter(Boolean)))
        if (unique.length === 0) return {} as Record<string, { first_name?: string; last_name?: string; avatar_url?: string }>
        const { data } = await sb
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', unique)
        const map: Record<string, { first_name?: string; last_name?: string; avatar_url?: string }> = {}
        ;(data || []).forEach((p: any) => { map[p.id] = { first_name: p.first_name, last_name: p.last_name, avatar_url: p.avatar_url } })
        return map
      }

      // Helper: load communities for a set of community ids
      const loadCommunitiesMap = async (ids: string[]) => {
        const unique = Array.from(new Set(ids.filter(Boolean)))
        if (unique.length === 0) return {} as Record<string, { name?: string; avatar_url?: string }>
        const { data } = await sb
          .from('communities')
          .select('id, name, avatar_url')
          .in('id', unique)
        const map: Record<string, { name?: string; avatar_url?: string }> = {}
        ;(data || []).forEach((c: any) => { map[c.id] = { name: c.name, avatar_url: c.avatar_url } })
        return map
      }

      // Try fetching from community_posts first
      let postData: any | null = null
      let fromCommunityPosts = false

      const { data: cpData, error: cpError } = await sb
        .from('community_posts')
        .select('id, content, created_at, user_id, community_id, media_urls, media_type, location_name, feels_emoji, feels_description')
        .eq('id', postId)
        .single()
      
      if (cpData) {
        postData = cpData
        fromCommunityPosts = true
      } else {
        // Fallback to legacy posts table
        const { data: legacyData, error: legacyError } = await sb
          .from('posts')
          .select('id, content, created_at, user_id, metadata, media_urls, media_type, location_name, feels_emoji, feels_description')
          .eq('id', postId)
          .single()

        if (legacyData) {
          postData = legacyData
        } else {
          console.error("Post not found:", cpError || legacyError)
          toast.error("Post not found.")
          setLoading(false)
          return
        }
      }

      if (postData) {
        const userProfiles = await loadProfilesMap([postData.user_id])
        const communityId = fromCommunityPosts ? postData.community_id : postData.metadata?.community_id
        const communities = communityId ? await loadCommunitiesMap([communityId]) : {}

        // Resolve public URLs for media
        const resolvedMediaUrls = postData.media_urls ? await Promise.all(
          postData.media_urls.map(async (path: string) => {
            const { data } = sb.storage.from('post_media').getPublicUrl(path)
            return data.publicUrl
          })
        ) : []

        const mappedPost: Post = {
          id: postData.id,
          content: postData.content,
          created_at: postData.created_at,
          user_id: postData.user_id,
          user: {
            first_name: userProfiles[postData.user_id]?.first_name || 'User',
            last_name: userProfiles[postData.user_id]?.last_name || '',
            avatar_url: userProfiles[postData.user_id]?.avatar_url || ''
          },
          likes_count: 0, // Will fetch actual likes later
          comments_count: 0, // Will fetch actual comments later
          media_urls: resolvedMediaUrls || [],
          media_type: postData.media_type || undefined,
          location_name: postData.location_name || undefined,
          feels_emoji: postData.feels_emoji || undefined,
          feels_description: postData.feels_description || undefined,
          community: communityId ? {
            name: communities[communityId]?.name || 'Community',
            avatar_url: communities[communityId]?.avatar_url || ''
          } : undefined
        }

        // Fetch likes count and check if user liked
        const { count: likesCount } = await sb
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)
        mappedPost.likes_count = likesCount || 0

        // Fetch comments count
        const { count: commentsCount } = await sb
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)
        mappedPost.comments_count = commentsCount || 0

        if (user) {
          const { data: userLike } = await sb
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single()
          mappedPost.is_liked = !!userLike
        }

        setPost(mappedPost)
      }

    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error("Failed to load post.")
    } finally {
      setLoading(false)
    }
  }

  const handleLikePost = async () => {
    if (!user) {
      toast.error("Please log in to like posts")
      return
    }
    if (!post) return

    try {
      const sb = getSupabaseClient()
      if (post.is_liked) {
        await sb
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
        setPost({ ...post, likes_count: post.likes_count - 1, is_liked: false })
      } else {
        await sb
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          })
        setPost({ ...post, likes_count: post.likes_count + 1, is_liked: true })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error("Failed to update like status")
    }
  }

  const renderMedia = (media_urls: string[], media_type?: string) => {
    if (!media_urls || media_urls.length === 0) return null

    const isImage = (type?: string, url?: string) => type?.startsWith('image') || /\.(jpeg|jpg|png|gif|webp)$/i.test(url || '')
    const isVideo = (type?: string, url?: string) => type?.startsWith('video') || /\.(mp4|webm|ogg)$/i.test(url || '')

    return (
      <div className="mt-4 grid gap-4">
        {media_urls.map((url, index) => {
          const currentIsImage = isImage(media_type, url)
          const currentIsVideo = isVideo(media_type, url)

          return (
            <div key={index} className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg border border-muted-foreground/10">
              {currentIsImage ? (
                <img src={url} alt={`Post media ${index + 1}`} className="w-full h-auto object-contain" />
              ) : currentIsVideo ? (
                <video src={url} controls className="w-full h-auto object-contain" />
              ) : (
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-4 text-primary hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375H12a1.125 1.125 0 0 1-1.125-1.125V1.5M19.5 14.25H12m7.5 0 3 3m-3-3 3-3m-2.25-4.5H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V1.5c0-.621-.504-1.125-1.125-1.125Z" />
                  </svg>
                  Download File
                </a>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Post not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user.avatar_url} />
              <AvatarFallback>{post.user.first_name[0]}{post.user.last_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-lg">
                {post.user.first_name} {post.user.last_name}
              </div>
              <div className="text-sm text-muted-foreground">
                {post.community && (
                  <>
                    <span className="mr-1">in</span>
                    <span className="font-medium text-primary">{post.community.name}</span>
                    <span className="mx-1">•</span>
                  </>
                )}
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
            {/* Optional: Add a dropdown for post actions (edit, delete) if current user is author */}
          </CardHeader>
          <CardContent>
            {renderMedia(post.media_urls || [], post.media_type)}
            <p className="text-lg text-foreground mb-4">{post.content}</p>

            <div className="flex items-center gap-6 mt-6 text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleLikePost}
              >
                <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{post.likes_count} Likes</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setShowCommentsModal(true)}
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments_count} Comments</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </Button>
            </div>

            {/* TODO: Add comments section */}
          </CardContent>
        </Card>

        {post && (
          <CommentsModal
            open={showCommentsModal}
            onOpenChange={setShowCommentsModal}
            postId={post.id}
          />
        )}
      </div>
    </div>
  )
}

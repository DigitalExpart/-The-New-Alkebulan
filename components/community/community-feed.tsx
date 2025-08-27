"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { 
  MessageCircle, 
  Heart, 
  Globe,
  Share2,
  Activity,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

interface CommunityPost {
  id: string
  content: string
  user_id: string
  community_id: string
  created_at: string
  likes_count: number
  comments_count: number
  shares_count: number
  user: {
    full_name: string
    avatar_url: string
  }
  community: {
    name: string
    description: string
    avatar_url: string
  }
  media_urls?: string[]
  media_type?: string
}




export function CommunityFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchAllPosts()
    }
  }, [user])

  const fetchAllPosts = async () => {
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

      // 1) Fetch from community_posts
      const { data: cpData, error: cpError } = await sb
        .from('community_posts')
        .select('id, content, created_at, user_id, community_id, media_urls, media_type, likes_count, comments_count')
        .order('created_at', { ascending: false })
        .limit(100) // Limit to a reasonable number for a feed

      if (cpError) console.warn('community_posts fetch error:', cpError.message)

      const cpUserIds = (cpData || []).map((p: any) => p.user_id)
      const cpCommunityIds = (cpData || []).map((p: any) => p.community_id).filter(Boolean)
      const [cpProfiles, cpCommunities] = await Promise.all([
        loadProfilesMap(cpUserIds),
        loadCommunitiesMap(cpCommunityIds)
      ])

      const mappedCp: CommunityPost[] = (cpData || []).map((p: any) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        user_id: p.user_id,
        community_id: p.community_id,
        user: {
          full_name: `${cpProfiles[p.user_id]?.first_name || 'User'} ${cpProfiles[p.user_id]?.last_name || ''}`.trim(),
          avatar_url: cpProfiles[p.user_id]?.avatar_url || ''
        },
        community: {
          name: cpCommunities[p.community_id]?.name || 'Community',
          description: '',
          avatar_url: cpCommunities[p.community_id]?.avatar_url || '',
        },
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        shares_count: 0,
        media_urls: p.media_urls || [],
        media_type: p.media_type || undefined,
      }))

      // 2) Fetch from legacy posts table
      const { data: legacyData, error: legacyError } = await sb
        .from('posts')
        .select('id, content, created_at, user_id, metadata, media_urls, media_type, likes_count, comments_count')
        .order('created_at', { ascending: false })
        .limit(100)

      if (legacyError) console.warn('Legacy posts fetch error:', legacyError.message)

      const legacyUserIds = (legacyData || []).map((p: any) => p.user_id)
      const legacyCommunityIds = (legacyData || []).map((p: any) => p.metadata?.community_id).filter(Boolean)
      const [legacyProfiles, legacyCommunities] = await Promise.all([
        loadProfilesMap(legacyUserIds),
        loadCommunitiesMap(legacyCommunityIds)
      ])

      const mappedLegacy: CommunityPost[] = (legacyData || []).map((p: any) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        user_id: p.user_id,
        community_id: p.metadata?.community_id,
        user: {
          full_name: `${legacyProfiles[p.user_id]?.first_name || 'User'} ${legacyProfiles[p.user_id]?.last_name || ''}`.trim(),
          avatar_url: legacyProfiles[p.user_id]?.avatar_url || ''
        },
        community: p.metadata?.community_id ? {
          name: legacyCommunities[p.metadata.community_id]?.name || 'Community',
          description: '',
          avatar_url: legacyCommunities[p.metadata.community_id]?.avatar_url || '',
        } : { name: 'General', description: '', avatar_url: '' }, // Default community for posts without one
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        shares_count: 0,
        media_urls: p.media_urls || [],
        media_type: p.media_type || undefined,
      }))

      // Merge and deduplicate by ID
      const mergedPosts = [...mappedCp, ...mappedLegacy];
      const uniquePosts = Array.from(new Map(mergedPosts.map(post => [post.id, post])).values());

      // Sort by creation date (most recent first)
      const sortedPosts = uniquePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Resolve public URLs for media
      const resolvedPosts = await Promise.all(sortedPosts.map(async (p) => {
        const resolvedMediaUrls = p.media_urls ? await Promise.all(
          p.media_urls.map(async (path: string) => {
            const { data } = sb.storage.from('post_media').getPublicUrl(path)
            return data.publicUrl
          })
        ) : []
        return { ...p, media_urls: resolvedMediaUrls }
      }))

      setPosts(resolvedPosts)
    } catch (error) {
      console.error('Error fetching all posts:', error)
      toast.error("Failed to load community feed.")
    } finally {
      setLoading(false)
    }
  }

  const renderMedia = (media_urls?: string[], media_type?: string) => {
    if (!media_urls || media_urls.length === 0) return null

    const isVideo = (type?: string, url?: string) => type?.startsWith('video') || /\.(mp4|webm|ogg)$/i.test(url || '')

    return (
      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {media_urls.map((url, index) => (
          <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {isVideo(media_type, url) ? (
              <video src={url} controls className="w-full h-full object-cover" />
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
    )
  }

  const handleRefresh = async () => {
    setLoading(true)
    await fetchAllPosts()
  }

  const renderPost = (post: CommunityPost) => (
    <Card
      key={post.id}
      className="mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => router.push(`/posts/${post.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback>{post.user.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{post.user.full_name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              {post.community?.name && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    {post.community.name}
                  </Badge>
                </>
              )}
            </div>
            {renderMedia(post.media_urls, post.media_type)}
            <p className="text-foreground mb-3">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); /* handleLikePost(post.id) */ }}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Heart className="w-4 h-4" />
                {post.likes_count}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}`) }}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comments_count}
              </button>
              <button
                onClick={(e) => e.stopPropagation()} // Prevent card click propagation
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading community feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-bold">Community Feed</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      <div>
          {posts.length > 0 ? (
           posts.map((post) => (
             <div key={post.id}> {renderPost(post)} </div>
           ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts to display.</p>
              </CardContent>
            </Card>
          )}
       </div>
    </div>
  )
}

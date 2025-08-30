"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, MessageCircle, Heart, Share2, Play, Plus, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import CreatePost from "@/components/create-post"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"

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
  const [memberCount, setMemberCount] = useState(0)
  
  const communityId = (params?.id as string) || ''; // Add null check and default to empty string

  useEffect(() => {
    fetchCommunity()
    fetchPosts()
    checkMembership()
    fetchMemberCount()
  }, [communityId, user])

  // Real-time subscription to community members for live count updates
  useEffect(() => {
    if (!communityId) return

    const supabase = getSupabaseClient()
    
    const channel = supabase
      .channel(`community-members-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_members',
          filter: `community_id=eq.${communityId}`
        },
        (payload) => {
          console.log('Community members changed:', payload)
          // Refresh member count when changes occur
          fetchMemberCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

      // 1) New table: community_posts
      const { data: cpData, error: cpError } = await sb
        .from('community_posts')
        .select('id, content, created_at, user_id, community_id, media_urls, media_type, location_name, feels_emoji, feels_description, likes_count, comments_count')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(200)

      if (cpError) console.warn('community_posts fetch error:', cpError.message)

      const cpUserIds = (cpData || []).map((p: any) => p.user_id)
      const cpProfiles = await loadProfilesMap(cpUserIds)
      const mappedCp: Post[] = (cpData || []).map((p: any) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        user_id: p.user_id,
        user: {
          first_name: cpProfiles[p.user_id]?.first_name || 'User',
          last_name: cpProfiles[p.user_id]?.last_name || '',
          avatar_url: cpProfiles[p.user_id]?.avatar_url || ''
        },
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        media_urls: p.media_urls || [],
        media_type: p.media_type || undefined,
        location_name: p.location_name || undefined,
        feels_emoji: p.feels_emoji || undefined,
        feels_description: p.feels_description || undefined
      }))

      // 2) Legacy table: posts with metadata.community_id
      let mappedLegacy: Post[] = []
      try {
        const { data: legacy, error: legacyErr } = await sb
          .from('posts')
          .select('id, content, created_at, user_id, metadata, media_urls, media_type, location_name, feels_emoji, feels_description, likes_count, comments_count')
          .not('metadata->>community_id', 'is', null)
          .eq('metadata->>community_id', communityId)
          .order('created_at', { ascending: false })

        if (!legacyErr && legacy) {
          const legacyUserIds = (legacy || []).map((p: any) => p.user_id)
          const legacyProfiles = await loadProfilesMap(legacyUserIds)
          mappedLegacy = legacy.map((p: any) => ({
            id: p.id,
            content: p.content,
            created_at: p.created_at,
            user_id: p.user_id,
            user: {
              first_name: legacyProfiles[p.user_id]?.first_name || 'User',
              last_name: legacyProfiles[p.user_id]?.last_name || '',
              avatar_url: legacyProfiles[p.user_id]?.avatar_url || ''
            },
            likes_count: p.likes_count || 0,
            comments_count: p.comments_count || 0,
            media_urls: p.media_urls || [],
            media_type: p.media_type || undefined,
            location_name: p.location_name || undefined,
            feels_emoji: p.feels_emoji || undefined,
            feels_description: p.feels_description || undefined
          }))
        }
      } catch (_) {}

      // 3) Posts authored by community members anywhere (catch past posts that weren't tagged)
      let mappedAuthored: Post[] = []
      try {
        const { data: members } = await sb
          .from('community_members')
          .select('user_id')
          .eq('community_id', communityId)

        const memberIds = (members || []).map((m: any) => m.user_id)
        if (memberIds.length) {
          const { data: authored } = await sb
            .from('posts')
            .select('id, content, created_at, user_id, media_urls, media_type, location_name, feels_emoji, feels_description, likes_count, comments_count')
            .in('user_id', memberIds)
            .order('created_at', { ascending: false })

          const authoredUserIds = (authored || []).map((p: any) => p.user_id)
          const authoredProfiles = await loadProfilesMap(authoredUserIds)
          mappedAuthored = (authored || []).map((p: any) => ({
            id: p.id,
            content: p.content,
            created_at: p.created_at,
            user_id: p.user_id,
            user: {
              first_name: authoredProfiles[p.user_id]?.first_name || 'User',
              last_name: authoredProfiles[p.user_id]?.last_name || '',
              avatar_url: authoredProfiles[p.user_id]?.avatar_url || ''
            },
            likes_count: p.likes_count || 0,
            comments_count: p.comments_count || 0,
            media_urls: p.media_urls || [],
            media_type: p.media_type || undefined,
            location_name: p.location_name || undefined,
            feels_emoji: p.feels_emoji || undefined,
            feels_description: p.feels_description || undefined
          }))
        }
      } catch (_) {}

      // 4) Merge and sort (dedupe by id to avoid duplicates between sources)
      const merged = [...mappedCp, ...mappedLegacy, ...mappedAuthored]
      const uniqueById = new Map<string, Post>()
      merged.forEach(p => { if (!uniqueById.has(p.id)) uniqueById.set(p.id, p) })
      const mergedSorted = Array.from(uniqueById.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      // 5) Resolve public URLs for media
      const resolvedPosts = await Promise.all(mergedSorted.map(async (p) => {
        const resolvedMediaUrls = p.media_urls ? await Promise.all(
          p.media_urls.map(async (path: string) => {
            const { data } = sb.storage.from('post_media').getPublicUrl(path)
            return data.publicUrl
          })
        ) : []
        return { ...p, media_urls: resolvedMediaUrls }
      }))

      // 6) If logged in, mark liked posts
      if (user && resolvedPosts.length) {
        const { data: userLikes } = await sb
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', resolvedPosts.map(p => p.id))
        const liked = new Set((userLikes || []).map((l: any) => l.post_id))
        setPosts(resolvedPosts.map(p => ({ ...p, is_liked: liked.has(p.id) })))
      } else {
        setPosts(resolvedPosts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderMedia = (media_urls?: string[], media_type?: string) => {
    if (!media_urls || media_urls.length === 0) return null

    const isVideo = (type?: string, url?: string) => type?.startsWith('video') || /\.(mp4|webm|ogg)$/i.test(url || '')

    return (
      <Carousel className="w-full max-w-full relative group">
        <CarouselContent className="-ml-2 md:-ml-4">
          {media_urls.map((url, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        {media_urls.length > 3 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </Carousel>
    )
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

  const fetchMemberCount = async () => {
    try {
      const supabase = getSupabaseClient()
      const { count, error } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)

      if (error) throw error
      setMemberCount(count || 0)
    } catch (error) {
      console.error('Error fetching member count:', error)
      setMemberCount(0)
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
      // Refresh member count after joining
      await fetchMemberCount()
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

  const handleViewMembers = () => {
    router.push(`/communities/${communityId}/members`)
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
      <div className="container mx-auto px-4 py-12 max-w-6xl lg:max-w-7xl max-md:w-[96vw]">
        <div className="md:grid md:grid-cols-3 gap-8">

        {/* Community Header */}
        <div className="col-span-1">
          <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-4">{community.category}</Badge>
                <CardTitle className="text-3xl mb-2">{community.name}</CardTitle>
                <p className="text-muted-foreground text-lg mb-4">{community.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <button
                    onClick={handleViewMembers}
                    className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:underline">{memberCount} members</span>
                    <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
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

          {/* Create Post section - always visible for members */}
          {isMember && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
              <CreatePost
                communityId={communityId}
                onPostCreated={fetchPosts}
              />
            </div>
          )}
        </div>

        {/* Right column: posts feed */}
        <div className="flex flex-col col-span-2 gap-4">
          {posts.length === 0 ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 space-y-6">
  <CardContent className="pt-8 pb-10">
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 bg-green-200 dark:bg-green-800 rounded-full opacity-50 animate-pulse flex items-center justify-center">
          <MessageCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto relative z-10" />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {isMember ? "Start the Conversation!" : "Join the Community!"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
          {isMember 
            ? "Be the first to share your thoughts and inspire others in your community!"
            : "Become a member to discover posts, share ideas, and connect with like-minded people!"
          }
        </p>
      </div>
                  {!isMember && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full font-semibold transition-all duration-200 hover:shadow-lg" onClick={handleJoinCommunity}>
          <Users className="w-5 h-5 mr-2" />
          Join Community
        </Button>
      )}
    </div>
  </CardContent>
</Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/posts/${post.id}`)}
              >
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
                      {renderMedia(post.media_urls, post.media_type)}
                                             <p className="text-foreground mb-4">{post.content}</p>
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
                       <div className="flex items-center gap-6">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLikePost(post.id) }}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            post.is_liked 
                              ? 'text-red-500' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                          <span>{post.likes_count}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}`) }}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments_count}</span>
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()} // Prevent card click propagation
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
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
    </div>
  )
}

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

import { CommunityPost } from "@/types"; // Import CommunityPost from shared types
import { PostCard } from "@/components/social-feed/post-card"; // Import PostCard component
import type { PostWithStats } from "@/types/social-feed";


interface CommunityFeedProps {
  communityIds?: string[]; // Optional: if provided, filters posts by these community IDs
}

export function CommunityFeed({ communityIds = [] }: CommunityFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAllPosts()
  }, [user, communityIds]) // Add communityIds to dependency array

  const fetchAllPosts = async () => {
    try {
      setLoading(true)
      const sb = getSupabaseClient()
      if (!sb) return
      console.log("Fetching all posts with communityIds:", communityIds);

      // Helper: load profiles for a set of user ids
      const loadProfilesMap = async (ids: string[]) => {
        const unique = Array.from(new Set(ids.filter(Boolean)))
        if (unique.length === 0) return {} as Record<string, { full_name?: string; avatar_url?: string }>
        const { data } = await sb
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', unique)
        const map: Record<string, { full_name?: string; avatar_url?: string }> = {}
        ;(data || []).forEach((p: any) => { map[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url } })
        return map
      }

      // Helper: load communities for a set of community ids
      const loadCommunitiesMap = async (ids: string[]) => {
        const unique = Array.from(new Set(ids.filter(Boolean)))
        if (unique.length === 0) return {} as Record<string, { name?: string; description?: string; avatar_url?: string }>
        const { data } = await sb
          .from('communities')
          .select('id, name, description, avatar_url')
          .in('id', unique)
        const map: Record<string, { name?: string; description?: string; avatar_url?: string }> = {}
        ;(data || []).forEach((c: any) => { map[c.id] = { name: c.name, description: c.description, avatar_url: c.avatar_url } })
        return map
      }

      let query = sb.from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (communityIds.length > 0) {
        query = query.in('community_id', communityIds);
      }

      const { data: cpData, error: cpError } = await query;

      if (cpError) console.warn('community_posts fetch error:', cpError.message)
      console.log("community_posts data:", cpData);
      console.log("community_posts error:", cpError);

      // Fetch profiles for all post authors
      const authorIds = Array.from(new Set((cpData || []).map(p => p.user_id).filter(Boolean)));
      const profilesMap = await loadProfilesMap(authorIds);
      
      // Fetch communities for all posts
      const communityIdsToLoad = Array.from(new Set((cpData || []).map(p => p.community_id).filter(Boolean)));
      const communitiesMap = await loadCommunitiesMap(communityIdsToLoad);

      // Check which posts the user has liked (if user is logged in)
      let userLikedPosts = new Set<string>();
      if (user?.id && cpData && cpData.length > 0) {
        const postIds = cpData.map(p => p.id);
        const { data: likes } = await sb
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        if (likes) {
          userLikedPosts = new Set(likes.map(l => l.post_id));
        }
      }

      const mappedCp: CommunityPost[] = (cpData || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        content: p.content || '',
        image_url: p.media_urls?.[0] || null,
        post_type: p.media_type === 'text' ? 'text' : (p.media_type === 'image' ? 'image' : 'text'),
        privacy: 'public',
        metadata: p.metadata || {},
        is_pinned: p.is_pinned || false,
        is_archived: p.is_archived || false,
        created_at: p.created_at,
        updated_at: p.updated_at || p.created_at,
        author_name: profilesMap[p.user_id]?.full_name || 'User',
        author_avatar: profilesMap[p.user_id]?.avatar_url || '',
        like_count: p.likes_count || 0,
        comment_count: p.comments_count || 0,
        share_count: p.shares_count || 0,
        user_has_liked: userLikedPosts.has(p.id),
        user_has_shared: false,
        community_id: p.community_id,
        community: {
          name: communitiesMap[p.community_id]?.name || 'Community',
          description: communitiesMap[p.community_id]?.description || '',
          avatar_url: communitiesMap[p.community_id]?.avatar_url || '',
        },
        media_urls: p.media_urls || [],
        media_type: p.media_type || undefined,
      }));

      // Sort posts by created_at
      const sortedPosts = mappedCp.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(sortedPosts)
      console.log("Resolved posts for CommunityFeed:", sortedPosts);
    } catch (error) {
      console.error('Error fetching all posts:', error)
      toast.error("Failed to load community feed.")
    } finally {
      setLoading(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to like posts.");
        return;
      }

    const sb = getSupabaseClient();
    if (!sb) return;

    try {
      const { data, error } = await sb
        .from('post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error checking like status:", error);
        toast.error("Failed to check like status.");
        return;
      }

      if (data && data.length > 0) {
        const { error: unlikeError } = await sb
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (unlikeError) {
          console.error("Error unliking post:", unlikeError);
          toast.error("Failed to unlike post.");
        return;
      }
        toast.success("Post unliked!");
      } else {
        const { error: likeError } = await sb
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (likeError) {
          console.error("Error liking post:", likeError);
          toast.error("Failed to like post.");
          return;
        }
        toast.success("Post liked!");
      }
      fetchAllPosts(); // Refresh posts after like/unlike
    } catch (error) {
      console.error("Error in handleLikePost:", error);
      toast.error("Failed to like post.");
    }
  };

  const handleSharePost = async (post: CommunityPost) => {
    if (!user) {
      toast.error("Please log in to share posts.");
      return;
    }

    const sb = getSupabaseClient();
    if (!sb) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.content.substring(0, 50) + '...',
          text: post.content,
          url: `${window.location.origin}/posts/${post.id}`,
        });
        toast.success("Post shared!");
      } else {
        const postLink = `${window.location.origin}/posts/${post.id}`;
        await navigator.clipboard.writeText(postLink);
        toast.info("Post link copied to clipboard!");
      }

      const { error } = await sb
        .from('post_shares')
        .insert({ post_id: post.id, user_id: user.id });

      if (error) {
        console.error("Error logging share in DB:", error);
      }
      fetchAllPosts(); // Refresh posts after share
    } catch (error) {
      console.error("Error in handleSharePost:", error);
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Share cancelled by user.");
      } else {
        toast.error("Failed to share post.");
      }
    }
  };



  const handleRefresh = async () => {
    setLoading(true)
    await fetchAllPosts()
  }

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
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdated={fetchAllPosts}
              onPostDeleted={() => {
                setPosts(posts.filter(p => p.id !== post.id));
              }}
            />
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

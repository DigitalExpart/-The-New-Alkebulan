"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [loading, setLoading] = useState(false) // Start with false, not true
  const router = useRouter()
  
  console.log("CommunityFeed render - user:", user?.id, "authenticated:", !!user);
  
  // Quick test to see if we can access Supabase
  useEffect(() => {
    const testSupabase = async () => {
      try {
        const sb = getSupabaseClient();
        console.log("Testing Supabase connection...");
        const { data, error } = await sb.from('profiles').select('id').limit(1);
        console.log("Supabase test result:", { data, error });
      } catch (err) {
        console.error("Supabase test failed:", err);
      }
    };
    
    testSupabase();
  }, []);

  const fetchAllPosts = useCallback(async () => {
    console.log("=== fetchAllPosts START ===");
    
    // Prevent multiple simultaneous calls or unnecessary reloads
    console.log("Current loading state:", loading, "Current posts count:", posts.length);
    if (loading) {
      console.log("fetchAllPosts already running, skipping...");
      return;
    }
    
    // If we already have posts and this isn't a refresh, skip
    if (posts.length > 0 && !loading) {
      console.log("Posts already loaded, skipping fetch...");
      return;
    }
    
    console.log("Setting loading state to true...");
    setLoading(true);
    console.log("Loading state set to true");
    
    console.log("Creating timeout...");
    // Add timeout protection
    const timeoutId = setTimeout(() => {
      console.error('Fetch timeout - taking too long');
      setLoading(false);
      toast.error("Request timed out. Please refresh the page.");
    }, 15000); // Reduced to 15 seconds
    
    try {
      console.log("Getting Supabase client...");
      let sb;
      try {
        sb = getSupabaseClient()
        console.log("Supabase client received:", !!sb);
      } catch (clientError) {
        console.error("Error getting Supabase client:", clientError);
        throw new Error(`Failed to get Supabase client: ${clientError}`);
      }
      
      if (!sb) {
        console.error('No Supabase client available')
        clearTimeout(timeoutId);
        setLoading(false)
        return
      }
      console.log("Fetching all posts with communityIds:", communityIds);
      
      // Test Supabase connection first
      try {
        console.log("Testing Supabase connection...");
        const testPromise = sb
          .from('community_posts')
          .select('id')
          .limit(1);
        
        // Add individual timeout for connection test
        const testTimeout = setTimeout(() => {
          console.error('Connection test timed out after 10 seconds');
        }, 10000);
        
        const { data: testData, error: testError } = await testPromise;
        clearTimeout(testTimeout);
        console.log("Connection test result:", testData, testError);
      } catch (testError) {
        console.error("Supabase connection test failed:", testError);
        throw new Error(`Supabase connection failed: ${testError}`);
      }

      // Helper: load profiles for a set of user ids
      const loadProfilesMap = async (ids: string[]) => {
        const unique = Array.from(new Set(ids.filter(Boolean)))
        console.log("🔍 Unique user IDs to fetch:", unique);
        
        if (unique.length === 0) return {} as Record<string, { first_name?: string; last_name?: string; full_name?: string; avatar_url?: string }>
        
        try {
          console.log("🌐 Fetching profiles for user IDs:", unique);
          
          // Fetch all profiles with detailed logging
          const { data, error } = await sb
            .from('profiles')
            .select('id, user_id, first_name, last_name, avatar_url')
            .in('id', unique);
          
          console.log("📊 Raw profile fetch result:", { 
            data: data?.map(p => ({ 
              id: p.id, 
              user_id: p.user_id,
              first_name: p.first_name, 
              last_name: p.last_name
            })), 
            error 
          });
          
          if (error) {
            console.warn('❌ Error fetching profiles:', error);
            return {};
          }
          
          const map: Record<string, { first_name?: string; last_name?: string; full_name?: string; avatar_url?: string }> = {}
          ;(data || []).forEach((p: any) => { 
            const firstName = p.first_name?.trim() || '';
            const lastName = p.last_name?.trim() || '';
            
            console.log(`🧩 Processing profile for user ${p.id} / ${p.user_id}:`, {
              firstName,
              lastName
            });
            
            const value = {
              first_name: firstName, 
              last_name: lastName, 
              full_name: (firstName && lastName)
                ? `${firstName} ${lastName}`
                : (firstName || lastName || `User ${(p.id || p.user_id)?.slice(0, 8) || 'Unknown'}`),
              avatar_url: p.avatar_url || '' 
            } as { first_name?: string; last_name?: string; full_name?: string; avatar_url?: string };

            // Map by both id and user_id to be robust against schema differences
            if (p.id) map[p.id] = value;
            if (p.user_id) map[p.user_id] = value;
          })
          
          console.log("🗺️ Final Profiles Map (keys):", Object.keys(map));
          return map
        } catch (profileError) {
          console.warn('❌ Exception fetching profiles:', profileError);
          return {};
        }
      }

      // Helper: load communities for a set of community ids
      const loadCommunitiesMap = async (ids: string[]) => {
        const unique = Array.from(new Set(ids.filter(Boolean)))
        if (unique.length === 0) return {} as Record<string, { name?: string; description?: string; avatar_url?: string }>
        
        try {
          console.log("Fetching communities for community IDs:", unique);
          const { data, error } = await sb
            .from('communities')
            .select('id, name, description, avatar_url')
            .in('id', unique)
          
          if (error) {
            console.warn('Error fetching communities:', error);
            return {};
          }
          
          const map: Record<string, { name?: string; description?: string; avatar_url?: string }> = {}
          ;(data || []).forEach((c: any) => { map[c.id] = { name: c.name, description: c.description, avatar_url: c.avatar_url } })
          console.log("Communities loaded:", Object.keys(map).length);
          return map
        } catch (communityError) {
          console.warn('Exception fetching communities:', communityError);
          return {};
        }
      }

      let query = sb.from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      console.log("Query built, about to execute...");

      if (communityIds.length > 0) {
        query = query.in('community_id', communityIds);
      }

      console.log("Executing query...");
      console.log("Query object:", query);
      
      let cpData: any[] = [];
      let cpError: any = null;
      
      try {
        const result = await query;
        cpData = result.data || [];
        cpError = result.error;
        console.log("Query completed. Data:", cpData, "Error:", cpError);

        if (cpError) {
          console.error('community_posts fetch error:', cpError);
          throw new Error(`Failed to fetch posts: ${cpError.message}`);
        }
      } catch (queryError) {
        console.error('Query execution failed:', queryError);
        throw new Error(`Query execution failed: ${queryError}`);
      }
      
      console.log("community_posts data:", cpData);
      console.log("Number of posts fetched:", cpData?.length || 0);
      
      // Debug: Log the first post structure
      if (cpData && cpData.length > 0) {
        console.log("First post structure:", cpData[0]);
        console.log("Available columns:", Object.keys(cpData[0]));
        console.log("First post likes_count:", cpData[0].likes_count);
        console.log("First post comments_count:", cpData[0].comments_count);
        console.log("First post shares_count:", cpData[0].shares_count);
        console.log("First post metadata:", cpData[0].metadata);
      }

      // If no posts, return empty array
      if (!cpData || cpData.length === 0) {
        setPosts([]);
        clearTimeout(timeoutId);
        console.log("No posts found - showing empty state");
        return;
      }

      // Fetch user profiles and communities
      console.log("Fetching user profiles and communities...");
      console.log("All posts data:", cpData);
      console.log("All user_ids from posts:", (cpData || []).map(p => p.user_id));
      const authorIds = Array.from(new Set((cpData || []).map(p => p.user_id).filter(Boolean)));
      console.log("Author IDs to fetch:", authorIds);
      const profilesMap = await loadProfilesMap(authorIds);
      
      const communityIdsToLoad = Array.from(new Set((cpData || []).map(p => p.community_id).filter(Boolean)));
      console.log("Community IDs to fetch:", communityIdsToLoad);
      const communitiesMap = await loadCommunitiesMap(communityIdsToLoad);

      // Fetch user likes
      console.log("Fetching user likes...");
      let userLikedPosts = new Set<string>();
      
      if (user?.id && cpData && cpData.length > 0) {
        const postIds = cpData.map(p => p.id);
        try {
          const { data: likes } = await sb
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds);
          
          if (likes) {
            userLikedPosts = new Set(likes.map(l => l.post_id));
          }
        } catch (likesError) {
          console.warn('Error fetching user likes:', likesError);
        }
      }

      console.log("Creating mapped posts with profile and community data");
      
      // Resolve media URLs to public URLs
      const resolveMediaUrls = async (mediaUrls: string[]) => {
        if (!mediaUrls || mediaUrls.length === 0) return [];
        
        try {
          const resolvedUrls = await Promise.all(
            mediaUrls.map(async (path: string) => {
              try {
                const { data } = sb.storage.from('post_media').getPublicUrl(path);
                return data.publicUrl;
              } catch (error) {
                console.warn('Error resolving media URL:', path, error);
                return path; // Fallback to original path
              }
            })
          );
          return resolvedUrls;
        } catch (error) {
          console.warn('Error resolving media URLs:', error);
          return mediaUrls; // Fallback to original URLs
        }
      };
      
      const mappedCp: CommunityPost[] = await Promise.all((cpData || []).map(async (p: any) => {
        const profile = profilesMap[p.user_id];
        const community = communitiesMap[p.community_id];
        const resolvedMediaUrls = await resolveMediaUrls(p.media_urls);
        
        console.log(`🔬 Mapping post ${p.id}:`, {
          user_id: p.user_id,
          profile: profile,
          profile_first_name: profile?.first_name,
          profile_last_name: profile?.last_name,
          profile_full_name: profile?.full_name
        });
        
        // Most robust method to get user's name
        const authorName = 
          (profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile?.full_name) 
          || `User ${p.user_id?.slice(0, 8) || 'Unknown'}`;
        
        console.log(`👤 Author name for post ${p.id}:`, authorName);
        
        return {
          id: p.id || '',
          user_id: p.user_id || '',
          content: p.content || '',
          image_url: resolvedMediaUrls?.[0] || null,
          post_type: p.media_type === 'text' ? 'text' : (p.media_type === 'image' ? 'image' : 'text'),
          privacy: 'public',
          metadata: p.metadata || {},
          is_pinned: false, // Default value
          is_archived: false, // Default value
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || p.created_at || new Date().toISOString(),
          author_name: authorName,
          author_avatar: profile?.avatar_url || '',
          // Map database column names to interface property names, with fallbacks
          like_count: p.likes_count || p.like_count || 0,
          comment_count: p.comments_count || p.comment_count || 0,
          share_count: p.shares_count || p.share_count || 0,
          user_has_liked: userLikedPosts.has(p.id),
          user_has_shared: false,
          community_id: p.community_id || '',
          community: {
            name: community?.name || `Community ${p.community_id?.slice(0, 8) || 'Unknown'}`,
            description: community?.description || '',
            avatar_url: community?.avatar_url || '',
          },
          media_urls: resolvedMediaUrls,
          media_type: p.media_type || undefined,
        };
      }));

      // Sort posts by created_at
      const sortedPosts = mappedCp.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(sortedPosts)
      console.log("Resolved posts for CommunityFeed:", sortedPosts);
      clearTimeout(timeoutId);
      console.log("=== fetchAllPosts SUCCESS ===");
    } catch (error: any) {
      console.error('Error fetching all posts:', error)
      toast.error("Failed to load community feed: " + (error?.message || "Unknown error"))
      clearTimeout(timeoutId);
      console.log("=== fetchAllPosts ERROR ===");
    } finally {
      console.log("Setting loading state to false...");
      setLoading(false)
      console.log("Loading state set to false");
      console.log("=== fetchAllPosts FINALLY ===");
    }
  }, []) // No dependencies - make function completely stable

  useEffect(() => {
    console.log("useEffect triggered, calling fetchAllPosts...");
    // Only call once when component mounts
    fetchAllPosts()
  }, []) // Empty dependency array - only run once

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
      // Don't call fetchAllPosts here to prevent infinite loops
      // The PostCard will handle its own state updates
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
      // Don't call fetchAllPosts here to prevent infinite loops
      // The PostCard will handle its own state updates
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
              onPostUpdated={() => {
                // Only refresh if really needed, prevent infinite loops
                console.log("Post updated, refreshing feed...");
                fetchAllPosts();
              }}
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

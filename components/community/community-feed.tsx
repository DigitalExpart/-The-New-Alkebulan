"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { 
  MessageCircle, 
  Heart, 
  Globe,
  Share2,
  Activity
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
}





export function CommunityFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts'>('all')

  useEffect(() => {
    if (user) {
      fetchUserCommunities()
    }
  }, [user])

  useEffect(() => {
    if (userCommunities.length > 0) {
      fetchCommunityPosts()
    }
  }, [userCommunities])

  const fetchUserCommunities = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      if (!supabase) return

      // Get communities the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select(`
          community_id,
          joined_at,
          is_owner,
          communities (
            id,
            name,
            description,
            avatar_url,
            member_count,
            post_count
          )
        `)
        .eq('user_id', user.id)

      if (membershipError) {
        console.error('Error fetching memberships:', membershipError)
        return
      }

      const communities = memberships?.map(membership => ({
        id: membership.communities.id,
        name: membership.communities.name,
        description: membership.communities.description,
        avatar_url: membership.communities.avatar_url,
        member_count: membership.communities.member_count || 0,
        post_count: membership.communities.post_count || 0,
        is_owner: membership.is_owner || false,
        joined_at: membership.joined_at
      })) || []

      setUserCommunities(communities)
    } catch (error) {
      console.error('Error fetching user communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityPosts = async () => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      // Get posts from communities the user is a member of
      const { data: communityPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          created_at,
          metadata,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .not('metadata->>community_id', 'is', null)
        .in('metadata->>community_id', userCommunities.map(c => c.id))
        .order('created_at', { ascending: false })
        .limit(10)

      if (postsError) {
        console.error('Error fetching community posts:', postsError)
        return
      }

      const formattedPosts = communityPosts?.map(post => ({
        id: post.id,
        content: post.content,
        user_id: post.user_id,
        community_id: post.metadata?.community_id,
        created_at: post.created_at,
        likes_count: 0, // Will be updated when likes table is available
        comments_count: 0, // Will be updated when comments table is available
        shares_count: 0, // Will be updated when shares table is available
        user: {
          full_name: post.profiles?.full_name || 'Anonymous',
          avatar_url: post.profiles?.avatar_url || ''
        },
        community: {
          name: userCommunities.find(c => c.id === post.metadata?.community_id)?.name || 'Unknown Community',
          description: userCommunities.find(c => c.id === post.metadata?.community_id)?.description || '',
          avatar_url: userCommunities.find(c => c.id === post.metadata?.community_id)?.avatar_url || ''
        }
      })) || []

      setPosts(formattedPosts)
    } catch (error) {
      console.error('Error fetching community posts:', error)
    }
  }



  const renderPost = (post: CommunityPost) => (
    <Card key={post.id} className="mb-4">
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
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {post.community.name}
              </Badge>
            </div>
            <p className="text-foreground mb-3">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                {post.likes_count}
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
                {post.comments_count}
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                {post.shares_count}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )





  const handleRefresh = async () => {
    setLoading(true)
    await fetchUserCommunities()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading community feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs and Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'posts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('posts')}
          >
            Posts
          </Button>

          
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Content based on filter */}
      {activeFilter === 'all' && (
        <div className="space-y-6">
          {/* Recent Posts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
            {posts.length > 0 ? (
              posts.slice(0, 3).map(renderPost)
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent posts from your communities</p>
                </CardContent>
              </Card>
            )}
          </div>

          

          
        </div>
      )}

      {activeFilter === 'posts' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">All Posts</h3>
          {posts.length > 0 ? (
            posts.map(renderPost)
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts from your communities</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      

      
    </div>
  )
}

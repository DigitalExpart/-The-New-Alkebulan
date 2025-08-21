"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Search, 
  Plus, 
  Globe, 
  Activity,
  Loader2,
  MapPin,
  Tag,
  Clock,
  Crown,
  Share2,
  Heart
} from "lucide-react"
import { toast } from "sonner"

interface Community {
  id: string
  name: string
  description: string
  member_count: number
  category: string
  location: string | null
  is_public: boolean
  tags: string[]
  created_at: string
  created_by: string
}

interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  profile: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

interface CommunityPost {
  id: string
  content: string
  created_at: string
  user_id: string
  profile: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

interface CommunityActivity {
  id: string
  type: 'post' | 'comment' | 'like' | 'join' | 'create' | 'share'
  created_at: string
  user_id: string
  profile: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
  content?: string
  community_name?: string
  post_content?: string
  target_user_name?: string
  metadata?: any
}

export default function MyCommunityPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [discoverCommunities, setDiscoverCommunities] = useState<Community[]>([])
  const [discoverSearchResults, setDiscoverSearchResults] = useState<Community[]>([])
  const [discoverSearchLoading, setDiscoverSearchLoading] = useState(false)
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    activeCommunities: 0,
    totalPosts: 0,
    communitiesCreated: 0
  })
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([])
  const [userActivities, setUserActivities] = useState<CommunityActivity[]>([])

  // Fetch user's communities and stats on component mount
  useEffect(() => {
    if (user) {
      fetchUserCommunities()
      fetchCommunityStats()
      fetchRecentPosts()
      fetchUserActivities()
      fetchDiscoverCommunities()
      
      // Add a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 10000) // 10 seconds timeout
      
      return () => clearTimeout(timeout)
    }
  }, [user])

  const fetchUserCommunities = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Get communities where user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select(`
          community_id,
          communities (
            id,
            name,
            description,
            member_count,
            category,
            location,
            is_public,
            tags,
            created_at,
            created_by
          )
        `)
        .eq('user_id', user.id)

      if (membershipError) {
        console.error('Error fetching memberships:', membershipError)
        toast.error('Failed to load communities')
      } else {
        const userComms = memberships?.map(m => m.communities).filter(Boolean) || []
        setUserCommunities(userComms)
        setCommunities(userComms)
      }
    } catch (error) {
      console.error('Error fetching user communities:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityStats = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Get total members across all communities
      const { data: totalMembers, error: membersError } = await supabase
        .from('community_members')
        .select('community_id', { count: 'exact' })

      // Get communities created by user
      const { data: createdCommunities, error: createdError } = await supabase
        .from('communities')
        .select('id')
        .eq('created_by', user.id)

      // Get total posts across user's communities
      const { data: totalPosts, error: postsError } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact' })

      setCommunityStats({
        totalMembers: totalMembers?.length || 0,
        activeCommunities: userCommunities.length,
        totalPosts: totalPosts?.length || 0,
        communitiesCreated: createdCommunities?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentPosts = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Only fetch posts if user has communities
      if (userCommunities.length > 0) {
        const { data: posts, error } = await supabase
          .from('community_posts')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles!community_posts_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .in('community_id', userCommunities.map(c => c.id))
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Error fetching posts:', error)
          return
        }

        setRecentPosts(posts || [])
      } else {
        setRecentPosts([])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchUserActivities = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const activities: CommunityActivity[] = []

      // Fetch user's posts
      if (userCommunities.length > 0) {
        const { data: posts, error: postsError } = await supabase
          .from('community_posts')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles!community_posts_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .in('community_id', userCommunities.map(c => c.id))
          .order('created_at', { ascending: false })
          .limit(10)

        if (!postsError && posts) {
          posts.forEach(post => {
            activities.push({
              id: post.id,
              type: 'post',
              created_at: post.created_at,
              user_id: post.user_id,
              profile: post.profile,
              content: post.content,
              post_content: post.content
            })
          })
        }
      }

      // Fetch user's comments
      try {
        const { data: comments, error: commentsError } = await supabase
          .from('post_comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles!post_comments_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!commentsError && comments) {
          comments.forEach(comment => {
            activities.push({
              id: comment.id,
              type: 'comment',
              created_at: comment.created_at,
              user_id: comment.user_id,
              profile: comment.profile,
              content: comment.content
            })
          })
        }
      } catch (error) {
        console.log('Comments table not available yet')
      }

      // Fetch user's likes
      try {
        const { data: likes, error: likesError } = await supabase
          .from('post_likes')
          .select(`
            id,
            created_at,
            user_id,
            profiles!post_likes_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!likesError && likes) {
          likes.forEach(like => {
            activities.push({
              id: like.id,
              type: 'like',
              created_at: like.created_at,
              user_id: like.user_id,
              profile: like.profile,
              content: 'liked a post'
            })
          })
        }
      } catch (error) {
        console.log('Likes table not available yet')
      }

      // Fetch user's community joins
      try {
        const { data: joins, error: joinsError } = await supabase
          .from('community_members')
          .select(`
            id,
            joined_at,
            user_id,
            communities (
              name
            ),
            profiles!community_members_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(10)

        if (!joinsError && joins) {
          joins.forEach(join => {
            activities.push({
              id: join.id,
              type: 'join',
              created_at: join.joined_at,
              user_id: join.user_id,
              profile: join.profile,
              community_name: join.communities?.name,
              content: `joined ${join.communities?.name || 'a community'}`
            })
          })
        }
      } catch (error) {
        console.log('Community members table not available yet')
      }

      // Fetch communities created by user
      try {
        const { data: createdCommunities, error: createdError } = await supabase
          .from('communities')
          .select(`
            id,
            name,
            created_at,
            profiles!communities_created_by_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (!createdError && createdCommunities) {
          createdCommunities.forEach(community => {
            activities.push({
              id: community.id,
              type: 'create',
              created_at: community.created_at,
              user_id: user.id,
              profile: community.profile,
              community_name: community.name,
              content: `created community "${community.name}"`
            })
          })
        }
      } catch (error) {
        console.log('Communities table not available yet')
      }

      // Sort all activities by date and take the most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)

      setUserActivities(sortedActivities)
    } catch (error) {
      console.error('Error fetching user activities:', error)
    }
  }

  const fetchDiscoverCommunities = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Fetch all public communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (communitiesError) {
        console.error('Error fetching discover communities:', communitiesError)
        return
      }

      // Fetch member counts for each community
      if (communitiesData && communitiesData.length > 0) {
        const communityIds = communitiesData.map(c => c.id)
        const { data: memberCounts, error: memberError } = await supabase
          .from('community_members')
          .select('community_id')
          .in('community_id', communityIds)

        if (memberError) {
          console.error('Error fetching member counts:', memberError)
        } else {
          // Count members per community
          const memberCountMap = new Map()
          memberCounts?.forEach(member => {
            const count = memberCountMap.get(member.community_id) || 0
            memberCountMap.set(member.community_id, count + 1)
          })

          // Update communities with real member counts
          const communitiesWithMembers = communitiesData.map(community => ({
            ...community,
            member_count: memberCountMap.get(community.id) || 0
          }))

          setDiscoverCommunities(communitiesWithMembers)
        }
      } else {
        setDiscoverCommunities([])
      }
    } catch (error) {
      console.error('Error fetching discover communities:', error)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setCommunities(userCommunities)
      return
    }

    const filtered = userCommunities.filter(community =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setCommunities(filtered)
  }

  const handleDiscoverSearch = async () => {
    if (!searchQuery.trim()) {
      setDiscoverSearchResults([])
      return
    }

    setDiscoverSearchLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Search in discover communities
      const { data: searchResults, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Discover search error:', error)
        toast.error('Search failed')
        return
      }

      // Fetch member counts for search results
      if (searchResults && searchResults.length > 0) {
        const communityIds = searchResults.map(c => c.id)
        const { data: memberCounts, error: memberError } = await supabase
          .from('community_members')
          .select('community_id')
          .in('community_id', communityIds)

        if (memberError) {
          console.error('Error fetching member counts:', memberError)
        } else {
          // Count members per community
          const memberCountMap = new Map()
          memberCounts?.forEach(member => {
            const count = memberCountMap.get(member.community_id) || 0
            memberCountMap.set(member.community_id, count + 1)
          })

          // Update search results with real member counts
          const searchResultsWithMembers = searchResults.map(community => ({
            ...community,
            member_count: memberCountMap.get(community.id) || 0
          }))

          setDiscoverSearchResults(searchResultsWithMembers)
        }
      } else {
        setDiscoverSearchResults([])
      }
    } catch (error) {
      console.error('Discover search error:', error)
      toast.error('Search failed')
    } finally {
      setDiscoverSearchLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        toast.info('You are already a member of this community')
        return
      }

      // Add user to community
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error joining community:', error)
        toast.error('Failed to join community')
        return
      }

      toast.success('Successfully joined community!')
      
      // Refresh discover communities to update member counts
      fetchDiscoverCommunities()
      
      // If there are search results, refresh them too
      if (discoverSearchResults.length > 0) {
        handleDiscoverSearch()
      }
    } catch (error) {
      console.error('Error joining community:', error)
      toast.error('Failed to join community')
    }
  }

  const handleCreateCommunity = () => {
    router.push('/communities/create')
  }

  const handleViewCommunity = (communityId: string) => {
    router.push(`/communities/${communityId}`)
  }

  const getRoleBadge = (community: Community) => {
    if (community.created_by === user?.id) {
      return <Badge variant="default" className="bg-yellow-600">Owner</Badge>
    }
    return <Badge variant="secondary">Member</Badge>
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'join':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'create':
        return <Plus className="h-4 w-4 text-orange-500" />
      case 'share':
        return <Share2 className="h-4 w-4 text-indigo-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'post':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Posted</Badge>
      case 'comment':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Commented</Badge>
      case 'like':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Liked</Badge>
      case 'join':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Joined</Badge>
      case 'create':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Created</Badge>
      case 'share':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">Shared</Badge>
      default:
        return <Badge variant="secondary">Activity</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your communities...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your communities</h1>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">👥 Welcome to My Community</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Connect, collaborate, and grow with like-minded individuals in the diaspora community.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.totalMembers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.activeCommunities}</p>
                  <p className="text-sm text-muted-foreground">My Communities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.totalPosts.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.communitiesCreated}</p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communities">My Communities</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* My Communities */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Communities</CardTitle>
                      <CardDescription>Communities you've joined and created</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("communities")}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {userCommunities.length > 0 ? (
                      <div className="grid gap-4">
                        {userCommunities.slice(0, 3).map((community) => (
                          <div key={community.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewCommunity(community.id)}>
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <Globe className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{community.name}</h3>
                                {getRoleBadge(community)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">{community.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {community.member_count} members
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(community.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">You haven't joined any communities yet</p>
                        <Button onClick={handleCreateCommunity}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Community
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest community updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentPosts.length > 0 ? (
                      <div className="space-y-4">
                        {recentPosts.map((post) => (
                          <div key={post.id} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={post.profile?.avatar_url || ""} />
                              <AvatarFallback>
                                {post.profile?.first_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium truncate">
                                  {post.profile?.first_name} {post.profile?.last_name}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(post.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" onClick={handleCreateCommunity}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Community
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => router.push('/communities')}>
                      <Search className="mr-2 h-4 w-4" />
                      Find Communities
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setActiveTab("activity")}>
                      <Activity className="mr-2 h-4 w-4" />
                      View Activity
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Communities</h2>
                <p className="text-muted-foreground">Communities you've joined and created</p>
              </div>
              <Button onClick={handleCreateCommunity}>
                <Plus className="mr-2 h-4 w-4" />
                Create Community
              </Button>
            </div>

            {userCommunities.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCommunities.map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewCommunity(community.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Globe className="h-6 w-6 text-primary" />
                        </div>
                        {getRoleBadge(community)}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{community.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{community.member_count} members</span>
                        </div>
                        
                        {community.category && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            <span>{community.category}</span>
                          </div>
                        )}
                        
                        {community.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{community.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Created {formatDate(community.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Communities Yet</h3>
                <p className="text-muted-foreground mb-6">Start building your community network by creating or joining communities</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleCreateCommunity}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Community
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/communities')}>
                    <Search className="mr-2 h-4 w-4" />
                    Find Communities
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Discover Communities</h2>
                <p className="text-muted-foreground">Find new communities to join</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDiscoverSearch()}
                    className="pl-10 w-64"
                  />
                </div>
                <Button 
                  onClick={handleDiscoverSearch}
                  disabled={discoverSearchLoading}
                >
                  {discoverSearchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setDiscoverSearchResults([])
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {discoverSearchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discoverSearchResults.map((community) => (
                    <Card key={community.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{community.name}</CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {community.category}
                              </Badge>
                              {!community.is_public && (
                                <Badge variant="outline" className="text-xs">
                                  Private
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {community.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {community.member_count === 1 
                                ? '1 member' 
                                : `${community.member_count || 0} members`
                              }
                            </span>
                          </div>
                          {community.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{community.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {community.tags && community.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {community.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {community.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{community.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Creation Date */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/communities/${community.id}`)}
                            className="flex-1"
                          >
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinCommunity(community.id)}
                            className="flex-1"
                          >
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Default Discover View */}
            {discoverSearchResults.length === 0 && (
              <div className="space-y-6">
                {/* Featured Communities */}
                {discoverCommunities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Featured Communities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {discoverCommunities.slice(0, 6).map((community) => (
                        <Card key={community.id} className="hover:shadow-lg transition-shadow duration-200">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2">{community.name}</CardTitle>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {community.category}
                                  </Badge>
                                  {!community.is_public && (
                                    <Badge variant="outline" className="text-xs">
                                      Private
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {community.description}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {community.member_count === 1 
                                    ? '1 member' 
                                    : `${community.member_count || 0} members`
                                  }
                                </span>
                              </div>
                              {community.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{community.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {community.tags && community.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {community.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {community.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{community.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Creation Date */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => router.push(`/communities/${community.id}`)}
                                className="flex-1"
                              >
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleJoinCommunity(community.id)}
                                className="flex-1"
                              >
                                Join
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {discoverCommunities.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Discover New Communities</h3>
                    <p className="text-muted-foreground mb-6">Browse and join communities that match your interests</p>
                    <Button onClick={() => router.push('/communities')}>
                      <Globe className="mr-2 h-4 w-4" />
                      Browse All Communities
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Community Activity</h2>
              <p className="text-muted-foreground">Your recent community interactions and engagement</p>
            </div>

            {userActivities.length > 0 ? (
              <div className="space-y-4">
                {userActivities.map((activity) => (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Activity Icon */}
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={activity.profile?.avatar_url || ""} />
                                <AvatarFallback className="text-xs">
                                  {activity.profile?.first_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <p className="font-medium text-sm">
                                {activity.profile?.first_name} {activity.profile?.last_name}
                              </p>
                            </div>
                            {getActivityBadge(activity.type)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          
                          {/* Activity Description */}
                          <div className="space-y-2">
                            {activity.type === 'post' && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Posted in community</p>
                                <p className="text-foreground bg-muted/30 p-3 rounded-lg">
                                  {activity.content}
                                </p>
                              </div>
                            )}
                            
                            {activity.type === 'comment' && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Commented on a post</p>
                                <p className="text-foreground bg-muted/30 p-3 rounded-lg">
                                  {activity.content}
                                </p>
                              </div>
                            )}
                            
                            {activity.type === 'like' && (
                              <p className="text-foreground">
                                {activity.content}
                              </p>
                            )}
                            
                            {activity.type === 'join' && (
                              <p className="text-foreground">
                                {activity.content}
                              </p>
                            )}
                            
                            {activity.type === 'create' && (
                              <div>
                                <p className="text-foreground">
                                  {activity.content}
                                </p>
                                {activity.community_name && (
                                  <Badge variant="outline" className="mt-2">
                                    {activity.community_name}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {activity.type === 'share' && (
                              <p className="text-foreground">
                                {activity.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Load More Button */}
                {userActivities.length >= 20 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => fetchUserActivities()}>
                      Load More Activities
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start engaging with your communities to see your activity here. 
                  Try posting, commenting, liking, or joining communities!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActiveTab("communities")}>
                    <Globe className="mr-2 h-4 w-4" />
                    View My Communities
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/community')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Go to Community Feed
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

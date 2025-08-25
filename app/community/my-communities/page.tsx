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

export default function MyCommunitiesPage() {
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
  const [memberCountMap, setMemberCountMap] = useState<Record<string, number>>({})

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

  // Fetch live member counts whenever the user's community list changes
  useEffect(() => {
    if (userCommunities.length > 0) {
      fetchMemberCounts()
    } else {
      setMemberCountMap({})
    }
  }, [userCommunities])

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
        const userComms = (memberships || [])
          .map((m: any) => m?.communities)
          .filter(Boolean) as Community[]
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

  const fetchMemberCounts = async () => {
    try {
      const supabase = getSupabaseClient()
      const communityIds = userCommunities.map(c => c.id)
      if (communityIds.length === 0) {
        setMemberCountMap({})
        return
      }

      const { data: memberRows, error } = await supabase
        .from('community_members')
        .select('community_id')
        .in('community_id', communityIds)

      if (error) {
        console.error('Error fetching member counts:', error)
        return
      }

      const counts: Record<string, number> = {}
      memberRows?.forEach((row: { community_id: string }) => {
        counts[row.community_id] = (counts[row.community_id] || 0) + 1
      })

      setMemberCountMap(counts)
    } catch (err) {
      console.error('Failed to compute member counts:', err)
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

        const normalizedPosts: CommunityPost[] = (posts || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          user_id: p.user_id,
          profile: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
        }))

        setRecentPosts(normalizedPosts)
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
          posts.forEach((post: any) => {
            const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
            activities.push({
              id: post.id,
              type: 'post',
              created_at: post.created_at,
              user_id: post.user_id,
              profile,
              content: post.content,
              post_content: post.content
            })
          })
        }
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
          joins.forEach((join: any) => {
            const profile = Array.isArray(join.profiles) ? join.profiles[0] : join.profiles
            const communityName = Array.isArray(join.communities)
              ? join.communities[0]?.name
              : join.communities?.name
            activities.push({
              id: join.id,
              type: 'join',
              created_at: join.joined_at,
              user_id: join.user_id,
              profile,
              community_name: communityName,
              content: `joined ${communityName || 'a community'}`
            })
          })
        }
      } catch (error) {
        console.log('Community members table not available yet')
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

      setDiscoverCommunities(communitiesData || [])
    } catch (error) {
      console.error('Error fetching discover communities:', error)
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">👥 My Communities</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Manage and discover communities in the diaspora network.
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

        {/* Communities Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Communities</h2>
              <p className="text-muted-foreground">Communities you've joined and created</p>
            </div>
            <Button onClick={() => router.push('/communities/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </div>

          {userCommunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/communities/${community.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant={community.created_by === user?.id ? "default" : "secondary"}>
                        {community.created_by === user?.id ? "Owner" : "Member"}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{community.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{(memberCountMap[community.id] ?? community.member_count ?? 0)} members</span>
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
                <Button onClick={() => router.push('/communities/create')}>
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
        </div>
      </div>
    </div>
  )
}

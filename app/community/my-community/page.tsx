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
  Crown
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

export default function MyCommunityPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    activeCommunities: 0,
    totalPosts: 0,
    communitiesCreated: 0
  })
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([])

  // Fetch user's communities and stats on component mount
  useEffect(() => {
    if (user) {
      fetchUserCommunities()
      fetchCommunityStats()
      fetchRecentPosts()
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
        return
      }

      const userComms = memberships?.map(m => m.communities).filter(Boolean) || []
      setUserCommunities(userComms)
      setCommunities(userComms)
    } catch (error) {
      console.error('Error fetching user communities:', error)
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
        .in('community_id', userCommunities.map(c => c.id))

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
    if (!user || userCommunities.length === 0) return

    try {
      const supabase = getSupabaseClient()
      
      console.log('Fetching recent posts for user communities...')
      
      // First, try to fetch posts with profile data
      let postsData = null
      let postsError = null
      
      try {
        console.log('Attempting to fetch posts with profile data...')
        const { data, error } = await supabase
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
          console.log('Posts with profiles query error:', error)
          postsError = error
        } else {
          console.log('Successfully fetched posts with profiles:', data)
          postsData = data
        }
      } catch (profileError) {
        console.log('Exception fetching posts with profiles:', profileError)
        postsError = error
      }

      // If profiles failed, try to fetch just the posts
      if (!postsData && postsError) {
        try {
          console.log('Attempting to fetch posts without profile data...')
          const { data, error } = await supabase
            .from('community_posts')
            .select('id, content, created_at, user_id')
            .in('community_id', userCommunities.map(c => c.id))
            .order('created_at', { ascending: false })
            .limit(5)

          if (error) {
            console.log('Basic posts query error:', error)
            throw error
          } else {
            console.log('Successfully fetched basic posts:', data)
            postsData = data
          }
        } catch (basicError) {
          console.log('Exception fetching basic posts:', basicError)
          throw basicError
        }
      }

      if (postsData) {
        console.log('Setting recent posts:', postsData)
        setRecentPosts(postsData)
      } else {
        console.log('No posts data available')
        setRecentPosts([])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      console.log('Error type:', typeof error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      setRecentPosts([])
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
                      <div className="grid gap-4 auto-rows-fr">
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
                                                             <span 
                             className="cursor-pointer hover:text-foreground transition-colors"
                             onClick={() => router.push(`/communities/${community.id}/members`)}
                           >
                             {community.member_count} members
                           </span>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {userCommunities.map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col" onClick={() => handleViewCommunity(community.id)}>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover New Communities</h3>
              <p className="text-muted-foreground mb-6">Browse and join communities that match your interests</p>
              <Button onClick={() => router.push('/communities')}>
                <Globe className="mr-2 h-4 w-4" />
                Browse All Communities
              </Button>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Community Activity</h2>
              <p className="text-muted-foreground">Your recent community interactions</p>
            </div>

            {recentPosts.length > 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {recentPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.profile?.avatar_url || ""} />
                          <AvatarFallback>
                            {post.profile?.first_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">
                              {post.profile?.first_name} {post.profile?.last_name}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              Posted
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{post.content}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground mb-6">Start engaging with your communities to see activity here</p>
                <Button onClick={() => setActiveTab("communities")}>
                  <Globe className="mr-2 h-4 w-4" />
                  View My Communities
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

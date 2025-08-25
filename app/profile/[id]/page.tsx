"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useFriendRequests } from "@/hooks/use-friend-requests"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  Users, 
  MessageSquare, 
  Heart,
  Building2,
  Loader2,
  ArrowLeft,
  UserPlus,
  MessageCircle
} from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  date_of_birth: string | null
  occupation: string | null
  interests: string[] | null
  created_at: string
}

interface UserPost {
  id: string
  content: string
  created_at: string
  community_id: string
  community: {
    name: string
  }
}

interface UserCommunity {
  id: string
  name: string
  description: string
  member_count: number
  role: string
  joined_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { sendRequest } = useFriendRequests()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [communities, setCommunities] = useState<UserCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isFriend, setIsFriend] = useState(false)
  const [isLoadingFriend, setIsLoadingFriend] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserPosts()
      fetchUserCommunities()
      checkFriendshipStatus()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const supabase = getSupabaseClient()
      
      console.log('Fetching profile for user ID:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Supabase error fetching profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast.error(`Failed to load user profile: ${error.message}`)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error instanceof Error) {
        toast.error(`Failed to load user profile: ${error.message}`)
      } else {
        toast.error('Failed to load user profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Prefer explicit FK aliases to avoid relationship ambiguity
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          created_at,
          community_id,
          user:profiles!community_posts_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          ),
          communities (
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching posts:', error)
        // Fall back to a two-step fetch below
      }

      if (data && data.length > 0 && !error) {
        // Normalize in case the relation returns an array/object
        const normalized: UserPost[] = (data || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          community_id: p.community_id,
          community: {
            name: (Array.isArray(p.communities) ? p.communities[0]?.name : p.communities?.name) || 'Community'
          }
        }))
        setPosts(normalized)
        return
      }

      // Fallback: two-step fetch (posts then communities)
      const { data: basicPosts, error: basicErr } = await supabase
        .from('community_posts')
        .select('id, content, created_at, community_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (basicErr) {
        console.error('Error fetching basic posts:', basicErr)
        return
      }

      const communityIds = (basicPosts || []).map((p: any) => p.community_id)
      let communityMap: Record<string, string> = {}
      if (communityIds.length > 0) {
        const { data: comms, error: commErr } = await supabase
          .from('communities')
          .select('id, name')
          .in('id', communityIds)

        if (!commErr && comms) {
          comms.forEach((c: any) => {
            communityMap[c.id] = c.name
          })
        }
      }

      const normalizedFallback: UserPost[] = (basicPosts || []).map((p: any) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        community_id: p.community_id,
        community: { name: communityMap[p.community_id] || 'Community' }
      }))

      setPosts(normalizedFallback)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchUserCommunities = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          id,
          communities (
            id,
            name,
            description,
            member_count
          ),
          role,
          joined_at
        `)
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching communities:', error)
        return
      }

      // Compute live member counts per community
      const communityIds = (data || []).map((item: any) => item.communities?.id).filter(Boolean)
      let memberCountMap: Record<string, number> = {}
      if (communityIds.length > 0) {
        const { data: memberRows, error: memberErr } = await supabase
          .from('community_members')
          .select('community_id')
          .in('community_id', communityIds)

        if (!memberErr && memberRows) {
          memberRows.forEach((row: any) => {
            memberCountMap[row.community_id] = (memberCountMap[row.community_id] || 0) + 1
          })
        }
      }

      const userCommunities = (data || []).map((item: any) => ({
        id: item.communities.id,
        name: item.communities.name,
        description: item.communities.description,
        member_count: memberCountMap[item.communities.id] ?? item.communities.member_count ?? 0,
        role: item.role,
        joined_at: item.joined_at
      }))

      setCommunities(userCommunities)
    } catch (error) {
      console.error('Error fetching communities:', error)
    }
  }

  const checkFriendshipStatus = async () => {
    if (!currentUser) return

    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUser.id})`)
        .single()

      if (!error && data) {
        setIsFriend(true)
      }
    } catch (error) {
      console.log('Friendship status check failed')
    }
  }

  const handleAddFriend = async () => {
    if (!currentUser) {
      toast.error('Please sign in to add friends')
      return
    }

    if (currentUser.id === userId) {
      toast.error('You cannot add yourself as a friend')
      return
    }

    setIsLoadingFriend(true)
    try {
      await sendRequest(userId)
      setIsFriend(true)
    } catch (error) {
      console.error('Error adding friend:', error)
    } finally {
      setIsLoadingFriend(false)
    }
  }

  const handleSendMessage = () => {
    // Navigate to messaging with this user
    router.push(`/messages?user=${userId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">This user profile could not be found.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {profile.first_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    
                    {profile.bio && (
                      <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      
                      {profile.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{calculateAge(profile.date_of_birth)} years old</span>
                        </div>
                      )}
                      
                      {profile.occupation && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{profile.occupation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleAddFriend}
                        disabled={isFriend || isLoadingFriend}
                        variant={isFriend ? "outline" : "default"}
                      >
                        {isLoadingFriend ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : isFriend ? (
                          <UserPlus className="h-4 w-4 mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        {isFriend ? "Friends" : "Add Friend"}
                      </Button>
                      
                      <Button variant="outline" onClick={handleSendMessage}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.date_of_birth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Born {formatDate(profile.date_of_birth)}</span>
                    </div>
                  )}
                  
                  {profile.occupation && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.occupation}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {formatDate(profile.created_at)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Communities</span>
                    <Badge variant="outline">{communities.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Posts</span>
                    <Badge variant="outline">{posts.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Recent Posts</h2>
              <p className="text-muted-foreground">Posts by {profile.first_name} in communities</p>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {post.community.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                          <p className="text-foreground">{post.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground">
                  {profile.first_name} hasn't posted in any communities yet.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Communities</h2>
              <p className="text-muted-foreground">Communities {profile.first_name} is a member of</p>
            </div>

            {communities.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/communities/${community.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="secondary">{community.role}</Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {community.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{community.member_count} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {formatDate(community.joined_at)}</span>
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
                <p className="text-muted-foreground">
                  {profile.first_name} hasn't joined any communities yet.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

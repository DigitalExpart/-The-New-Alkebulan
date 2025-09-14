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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MessageCircle,
  Star,
  Image,
  ChevronDown,
  Shield,
  Settings,
  Camera
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
  const [activeTab, setActiveTab] = useState("posts")
  const [isFriend, setIsFriend] = useState(false)
  const [isLoadingFriend, setIsLoadingFriend] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserPosts()
      fetchUserCommunities()
      checkFriendshipStatus()
    }
  }, [userId])

  // Fetch media files when media tab becomes active
  useEffect(() => {
    if (activeTab === 'media' && userId && mediaFiles.length === 0) {
      fetchMediaFiles()
    }
  }, [activeTab, userId])

  // Fetch posts when posts tab becomes active
  useEffect(() => {
    if (activeTab === 'posts' && userId && userPosts.length === 0) {
      fetchUserPostsNew()
    }
  }, [activeTab, userId])

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

  const fetchMediaFiles = async () => {
    if (!userId) return
    
    setMediaLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Fetch posts with media from the user
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching media files:', error)
        return
      }

      // Transform posts into media files format
      const mediaData: any[] = []
      posts?.forEach(post => {
        if (post.image_url) {
          mediaData.push({
            id: `${post.id}-primary`,
            url: post.image_url,
            type: post.post_type === 'image' ? 'image' : 'video',
            created_at: post.created_at,
            content: post.content,
            metadata: post.metadata
          })
        }
        
        // Add additional media from metadata
        if (post.metadata?.media_urls && Array.isArray(post.metadata.media_urls)) {
          post.metadata.media_urls.forEach((url: string, index: number) => {
            if (url !== post.image_url) { // Avoid duplicates
              mediaData.push({
                id: `${post.id}-${index}`,
                url: url,
                type: post.post_type === 'image' ? 'image' : 'video',
                created_at: post.created_at,
                content: post.content,
                metadata: post.metadata
              })
            }
          })
        }
      })

      setMediaFiles(mediaData)
    } catch (error) {
      console.error('Error fetching media files:', error)
    } finally {
      setMediaLoading(false)
    }
  }

  const fetchUserPostsNew = async () => {
    if (!userId) return

    setPostsLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Try to fetch posts using the posts_with_stats view first
      let { data: posts, error } = await supabase
        .from('posts_with_stats')
        .select(`
          id,
          content,
          image_url,
          post_type,
          visibility,
          feeling,
          location,
          metadata,
          created_at,
          likes_count,
          comments_count,
          author_name,
          author_avatar,
          author_username
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // If posts_with_stats view doesn't exist, fallback to posts table
      if (error && error.code === '42P01') {
        console.log('posts_with_stats view not found, falling back to posts table')
        const fallbackResult = await supabase
          .from('posts')
          .select(`
            id,
            content,
            image_url,
            post_type,
            visibility,
            feeling,
            location,
            metadata,
            created_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        posts = fallbackResult.data?.map(post => ({
          ...post,
          likes_count: 0,
          comments_count: 0,
          author_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
          author_avatar: profile?.avatar_url,
          author_username: profile?.username
        }))
        error = fallbackResult.error
      }

      if (error) {
        console.error('Error fetching posts:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast.error(`Failed to load posts: ${error.message || 'Unknown error'}`)
        return
      }

      setUserPosts(posts || [])
    } catch (error) {
      console.error('Error fetching user posts:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      toast.error(`Failed to load posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setPostsLoading(false)
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

        {/* Profile Header - Facebook Style */}
        <Card className="mb-8 overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-600">
            {profile.cover_photo_url ? (
              <img 
                src={profile.cover_photo_url} 
                alt="Cover photo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            )}
            
            {/* Profile Picture overlapping cover photo */}
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <div className="flex items-end gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={`${profile.first_name} ${profile.last_name}`} />
                    <AvatarFallback className="text-xl">
                      {profile.first_name?.charAt(0) || "U"}{profile.last_name?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* User Info */}
                <div className="text-white mb-2">
                  <h1 className="text-2xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <p className="text-sm opacity-90">
                    {profile.bio || "Active community member"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <CardContent className="pt-16 pb-4">
            <div className="flex justify-end gap-3 mb-4">
              {!isOwnProfile && (
                <>
                  <Button 
                    onClick={handleAddFriend}
                    disabled={isFriend || isLoadingFriend}
                    variant={isFriend ? "outline" : "default"}
                  >
                    {isLoadingFriend ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {isFriend ? "Friends" : "Add Friend"}
                  </Button>
                  
                  <Button variant="outline" onClick={handleSendMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>

            {/* Profile Statistics */}
            <div className="flex justify-end gap-6 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">{userPosts.length}</div>
                <div>Posts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">0</div>
                <div>Followers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">0</div>
                <div>Following</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">0</div>
                <div>Likes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs - Facebook Style */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            <Button 
              variant="ghost" 
              className={`px-0 py-4 border-b-2 rounded-none ${activeTab === 'posts' ? 'border-primary' : 'border-transparent hover:border-border'}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </Button>
            <Button 
              variant="ghost" 
              className={`px-0 py-4 border-b-2 rounded-none ${activeTab === 'media' ? 'border-primary' : 'border-transparent hover:border-border'}`}
              onClick={() => setActiveTab('media')}
            >
              Media Gallery
            </Button>
            <Button 
              variant="ghost" 
              className={`px-0 py-4 border-b-2 rounded-none ${activeTab === 'followers' ? 'border-primary' : 'border-transparent hover:border-border'}`}
              onClick={() => setActiveTab('followers')}
            >
              Followers
            </Button>
            <Button 
              variant="ghost" 
              className={`px-0 py-4 border-b-2 rounded-none ${activeTab === 'following' ? 'border-primary' : 'border-transparent hover:border-border'}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </Button>
          </nav>
        </div>

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

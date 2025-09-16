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
  Image
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
  cover_photo_url?: string | null
}

interface UserPost {
  id: string
  content: string
  created_at: string
  community_id?: string
  community?: {
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
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          community_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      // Get community names for posts that have community_id
      const communityIds = posts?.filter(p => p.community_id).map(p => p.community_id) || []
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

      const normalizedFallback: UserPost[] = (posts || []).map((p: any) => ({
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

    setIsLoadingFriend(true)
    try {
      await sendRequest(userId)
      setIsFriend(true)
      toast.success('Friend request sent!')
    } catch (error) {
      console.error('Error adding friend:', error)
      toast.error('Failed to send friend request')
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

        {/* Tab Content */}
        {activeTab === 'posts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {profile.first_name} hasn't created any posts yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-3">
                    {/* Post Header */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author_avatar || profile.avatar_url || "/placeholder.svg"} alt={post.author_name} />
                        <AvatarFallback>
                          {post.author_name?.split(' ').map(n => n[0]).join('') || profile.first_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.author_name || `${profile.first_name} ${profile.last_name}`}</h4>
                          {post.feeling && (
                            <span className="text-sm text-muted-foreground">is feeling {post.feeling}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                          {post.location && ` • ${post.location}`}
                        </p>
                      </div>
                    </div>

                    {/* Post Image */}
                    {post.image_url && (
                      <div className="w-full">
                        <img 
                          src={post.image_url} 
                          alt="Post content" 
                          className="w-full max-w-md mx-auto rounded-lg object-cover"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    )}

                    {/* Post Content */}
                    {post.content && (
                      <div className="text-sm leading-relaxed">
                        {post.content}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        {post.likes_count || 0}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activeTab === 'media' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Gallery
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {mediaLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading media...</p>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-8">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Media Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {profile.first_name} hasn't shared any media yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={media.url} 
                      alt="Media content" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activeTab === 'followers' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Followers Yet</h3>
              <p className="text-muted-foreground">
                {profile.first_name} doesn't have any followers yet.
              </p>
            </div>
          </CardContent>
        </Card>
        )}

        {activeTab === 'following' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Following
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not Following Anyone</h3>
              <p className="text-muted-foreground">
                {profile.first_name} isn't following anyone yet.
              </p>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}

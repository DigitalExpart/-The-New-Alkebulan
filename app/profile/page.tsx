"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import CreatePostModal from "@/components/create-post-modal"
import SupabaseDebug from "@/components/supabase-debug"
import { supabase } from "@/lib/supabase"
import {
  Mail,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Edit,
  Camera,
  Award,
  TrendingUp,
  BarChart3,
  Users,
  MessageSquare,
  Star,
  Globe,
  Phone,
  ChevronDown,
  Briefcase,
  GraduationCap,
  Image,
} from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // Use authProfile if available, otherwise fetch
      if (authProfile) {
        setProfile(authProfile)
        setLoading(false)
      } else {
        fetchProfile()
      }
    }
  }, [user, authProfile])

  // Fetch media files when media tab becomes active
  useEffect(() => {
    if (activeTab === 'media' && user && mediaFiles.length === 0) {
      fetchMediaFiles()
    }
  }, [activeTab, user])

  // Fetch posts when posts tab becomes active
  useEffect(() => {
    if (activeTab === 'posts' && user && userPosts.length === 0) {
      fetchUserPosts()
    }
  }, [activeTab, user])

  const fetchProfile = async () => {
    if (!user) {
      console.log('No user found, skipping profile fetch')
      setLoading(false)
      return
    }
    
    if (!supabase) {
      console.error('Supabase client not available')
      setError('Database connection not available. Please check your configuration.')
      setLoading(false)
      return
    }

    try {
      console.log('Fetching profile for user:', user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await createDefaultProfile()
        } else if (error.code === '23505') {
          // Duplicate key error - profile exists but there's a constraint issue
          console.log('Profile exists but has constraint issues, attempting to fetch again...')
          // Try to fetch the existing profile
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (fetchError) {
            console.error('Error fetching existing profile:', fetchError)
            setError(`Failed to load existing profile: ${fetchError.message}`)
          } else {
            console.log('Found existing profile:', existingProfile)
            setProfile(existingProfile)
          }
        } else {
          console.error('Unexpected error details:', {
            message: error.message,
            code: error.code,
            details: error.details
          })
          setError(`Failed to load profile: ${error.message || 'Unknown error'}`)
        }
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Catch block error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchMediaFiles = async () => {
    if (!user || !supabase) return
    
    setMediaLoading(true)
    try {
      // Fetch posts with media from the user
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching media files:', error)
        return
      }

      // Transform posts into media files format
      const mediaData: any[] = []
      
      posts?.forEach(post => {
        // Add primary image if exists
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

  const fetchUserPosts = async () => {
    if (!user || !supabase) return

    setPostsLoading(true)
    try {
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
        .eq('user_id', user.id)
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
          .eq('user_id', user.id)
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

  const fetchUserMedia = async () => {
    // Refresh both profile and media data
    await fetchProfile()
    await fetchMediaFiles()
    await fetchUserPosts()
  }

  const createDefaultProfile = async () => {
    if (!user || !supabase) return

    // Extract first and last name from user metadata or email
    const fullName = (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || ''

    const defaultProfile = {
      id: user.id, // CRITICAL: Set id to user.id (required by database schema)
      user_id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      username: user.email?.split('@')[0] || 'User',
      bio: '',
      location: '',
      website: '',
      phone: '',
      occupation: '',
      education: [], // Array type - use empty array instead of empty string
      avatar_url: null,
      is_public: true,
      cover_photo_url: null,
      // Add array fields with proper array literals
      interests: [],
      core_competencies: [],
      skills: [],
      languages: [],
      selected_roles: ['buyer'], // Default role
      // Add other array fields that might exist
      goals: [],
      achievements: [],
      challenges: [],
      community_interests: [],
      certifications: []
      // Note: created_at and updated_at will be auto-generated by the database
    }
    
    console.log('Profile data to insert:', JSON.stringify(defaultProfile, null, 2))

    try {
      console.log('Creating/updating default profile with data:', defaultProfile)
      const { data, error } = await supabase
        .from('profiles')
        .upsert([defaultProfile], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating profile:', JSON.stringify({
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        }, null, 2))
        
        // Also log the raw error object
        console.error('Raw Supabase error object:', error)
        console.error('Error type:', typeof error)
        console.error('Error keys:', Object.keys(error))
        
        setError(`Failed to create profile: ${error.message || 'Unknown database error'}`)
      } else {
        console.log('Profile created successfully:', data)
        setProfile(data)
        setError(null) // Clear any previous errors
      }
    } catch (error) {
      console.error('Network/JavaScript error creating profile:', JSON.stringify({
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      }, null, 2))
      
      // Also log the raw error
      console.error('Raw catch error object:', error)
      console.error('Catch error type:', typeof error)
      
      setError(`Network error creating profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !supabase) {
      toast.error('Please select a file and ensure you are signed in')
      return
    }

    // Validate file size (max 10MB for cover photos)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('Cover photo must be less than 10MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
      return
    }

    const loadingToastId = toast.loading('Uploading cover photo...')
    
    try {
      // Upload to Supabase storage with timeout
      const fileName = `cover-photos/${user.id}/${Date.now()}-${file.name}`
      console.log('Uploading cover photo:', fileName)
      
      // Create a timeout promise
      const uploadTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - please try again')), 30000)
      )
      
      const uploadPromise = supabase.storage
        .from('post-media')
        .upload(fileName, file)
      
      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        uploadTimeout
      ]) as any

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        toast.dismiss(loadingToastId)
        toast.error(`Upload failed: ${uploadError.message}`)
        return
      }

      console.log('Cover photo uploaded to storage:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName)

      console.log('Cover photo public URL:', urlData.publicUrl)

      // Update profile with new cover photo URL
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ cover_photo_url: urlData.publicUrl })
        .eq('user_id', user.id)
        .select()

      if (updateError) {
        console.error('Database update error:', updateError)
        toast.dismiss(loadingToastId)
        toast.error(`Failed to save cover photo: ${updateError.message}`)
        return
      }

      console.log('Profile updated successfully:', updateData)

      // Update local state
      setProfile((prev: any) => prev ? { ...prev, cover_photo_url: urlData.publicUrl } : null)
      
      toast.dismiss(loadingToastId)
      toast.success('Cover photo uploaded successfully!')
      console.log('Cover photo upload completed successfully!')
      
    } catch (error) {
      console.error('Cover photo upload error:', error)
      toast.dismiss(loadingToastId)
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      // Clear the file input
      event.target.value = ''
    }
  }

  // Default stats and badges
  const defaultStats = {
    communities: 0,
    posts: 0,
    followers: 0,
    following: 0,
    reputation: 0,
  }

  const defaultBadges = [
    { name: "New Member", icon: "🌟", color: "bg-blue-100 text-blue-800" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <Button 
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchProfile()
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
          
          {/* Debug Information */}
          <SupabaseDebug />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const userData = profile || {
    first_name: (user as any)?.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User',
    last_name: (user as any)?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user.email,
    bio: '',
    location: '',
    website: '',
    phone: '',
    occupation: '',
    education: '',
    avatar_url: null,
    created_at: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings</p>
        </div>

        <div className="space-y-4">
          {/* Profile Info - Full Width */}
          <div className="space-y-4">
            {/* Enhanced Profile Header Card */}
            <Card className="overflow-hidden">
              {/* Cover Photo */}
              <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-600">
                {profile?.cover_photo_url ? (
                  <img 
                    src={profile.cover_photo_url} 
                    alt="Cover photo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                  onClick={() => document.getElementById('cover-photo-input')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Edit Cover
                </Button>
                <input
                  id="cover-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverPhotoUpload}
                />
                
                {/* Profile Picture and User Info positioned at bottom-left of cover photo */}
                <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                  <div className="flex items-end gap-4">
                    {/* Profile Picture */}
                  <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={userData.avatar_url || "/placeholder.svg"} alt={`${userData.first_name} ${userData.last_name}`} />
                        <AvatarFallback className="text-xl">
                        {`${userData.first_name} ${userData.last_name}`
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-background"
                      asChild
                    >
                      <Link href="/profile/edit">
                        <Camera className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* User Info */}
                    <div className="space-y-1 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-white">
                        {profile?.first_name && profile?.last_name 
                          ? `${profile.first_name} ${profile.last_name}`
                          : profile?.first_name || userData.first_name
                        }
                      </h2>
                      {profile?.username && (
                          <Badge variant="outline" className="bg-white/90 text-black">@{profile.username}</Badge>
                      )}
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="mr-1 h-3 w-3" />
                        Member
                      </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Below Cover Photo */}
              <div className="px-6 pt-2 pb-1">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                    </div>

                {/* Profile Statistics - Under Action Buttons */}
                <div className="flex items-center gap-6 mt-2 justify-end">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile?.posts_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile?.followers_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile?.following_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile?.likes_received || 0}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                </div>
                      </div>

              <CardContent className="p-4 pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">

                  {/* Social Links */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {userData.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {userData.location}
                        </div>
                      )}
                      {profile?.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      {profile?.linkedin && (
                      <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            LinkedIn
                          </a>
                      </div>
                      )}
                      {profile?.twitter && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Twitter
                          </a>
                    </div>
                      )}
                    </div>
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
                
                {/* Account Management - Dropdown */}
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="px-2 py-4 border-b-2 border-transparent rounded-none hover:border-border">
                        Account Management
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/profile/account-protection" className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Account Protection
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/settings" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings & Privacy
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/communities" className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          My Communities
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/investor-dashboard" className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Investor Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </nav>
            </div>



            {/* Tab Content */}
            {activeTab === 'posts' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Posts
                  </CardTitle>
                  <CreatePostModal onPostCreated={fetchUserMedia}>
                    <Button size="sm">
                      What's on your mind?
                    </Button>
                  </CreatePostModal>
                </div>
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
                      You haven't created any posts yet. Start sharing your thoughts!
                    </p>
                    <CreatePostModal onPostCreated={fetchUserMedia}>
                      <Button>
                        Create Your First Post
                      </Button>
                    </CreatePostModal>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4 space-y-3">
                        {/* Post Header */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author_avatar || "/placeholder.svg"} alt={post.author_name} />
                            <AvatarFallback>
                              {post.author_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{post.author_name || 'You'}</h4>
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
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile/media">
                      See All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                  {mediaLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading media...</p>
                    </div>
                  ) : mediaFiles.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaFiles.map((media) => (
                        <div key={media.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={media.content || 'Media'}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                controls
                              />
                            )}
                </div>
                          {media.content && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="truncate">{media.content}</p>
                  </div>
                )}
                    </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Media Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't uploaded any media yet. Share your photos and videos!
                      </p>
                      <Button asChild>
                        <Link href="/profile/media/upload">
                          Upload Media
                        </Link>
                      </Button>
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
                    <p className="text-muted-foreground mb-4">
                      You don't have any followers yet. Start engaging with the community!
                    </p>
                    <Button asChild>
                      <Link href="/social-feed">
                        Explore Community
                  </Link>
                </Button>
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
                    <p className="text-muted-foreground mb-4">
                      You're not following anyone yet. Discover interesting people to follow!
                    </p>
                    <Button asChild>
                      <Link href="/social-feed">
                        Discover People
                      </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Crown, 
  UserPlus, 
  UserMinus,
  Trash2,
  Edit,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"

interface CommunityMember {
  id: string
  user_id: string
  role: string
  joined_at: string
  user: {
    email: string
    profiles: {
      first_name: string
      last_name: string
    } | null
  }
}

interface CommunityPost {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  likes_count: number
  comments_count: number
  user: {
    email: string
    profiles: {
      first_name: string
      last_name: string
    } | null
  }
}

export default function ManageCommunityPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState<any>(null)
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [activeTab, setActiveTab] = useState("members")

  useEffect(() => {
    if (params.id && user) {
      fetchCommunityData()
    }
  }, [params.id, user])

  const fetchCommunityData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', params.id)
        .eq('created_by', user?.id)
        .single()

      if (communityError) {
        if (communityError.code === 'PGRST116') {
          toast.error("Community not found or you don't have permission to manage it")
          router.push("/dashboard")
          return
        }
        throw communityError
      }

      setCommunity(communityData)

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          user:auth.users!inner(
            email,
            profiles(first_name, last_name)
          )
        `)
        .eq('community_id', params.id)

      if (membersError) throw membersError
      setMembers(membersData || [])

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          id,
          title,
          content,
          user_id,
          created_at,
          likes_count,
          comments_count,
          user:auth.users!inner(
            email,
            profiles(first_name, last_name)
          )
        `)
        .eq('community_id', params.id)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError
      setPosts(postsData || [])

    } catch (error) {
      console.error('Error fetching community data:', error)
      toast.error("Failed to load community data")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the community?`)) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast.success("Member removed successfully")
      fetchCommunityData() // Refresh data
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error("Failed to remove member")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      // Delete likes and comments first
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)

      await supabase
        .from('post_comments')
        .delete()
        .eq('post_id', postId)

      // Delete the post
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      toast.success("Post deleted successfully")
      fetchCommunityData() // Refresh data
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error("Failed to delete post")
    }
  }

  const getDisplayName = (member: CommunityMember) => {
    if (member.user.profiles?.first_name && member.user.profiles?.last_name) {
      return `${member.user.profiles.first_name} ${member.user.profiles.last_name}`
    }
    return member.user.email
  }

  const getPostAuthorName = (post: CommunityPost) => {
    if (post.user.profiles?.first_name && post.user.profiles?.last_name) {
      return `${post.user.profiles.first_name} ${post.user.profiles.last_name}`
    }
    return post.user.email
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-center text-muted-foreground">Loading community...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!community) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Manage Community</h1>
          <p className="text-muted-foreground mt-2">
            Manage members, posts, and settings for "{community.name}"
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Community Members</span>
                  <Button size="sm" onClick={() => router.push(`/communities/${community.id}/invite`)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No members yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {getDisplayName(member).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{getDisplayName(member)}</p>
                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role === 'admin' ? (
                              <>
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              'Member'
                            )}
                          </Badge>
                          {member.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id, member.user.email)}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div key={post.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{post.title || 'Untitled Post'}</h4>
                            <p className="text-sm text-muted-foreground">
                              by {getPostAuthorName(post)} • {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{post.likes_count} likes</span>
                          <span>{post.comments_count} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Edit Community Details</h4>
                    <p className="text-sm text-muted-foreground">Update community information and settings</p>
                  </div>
                  <Button onClick={() => router.push(`/communities/${community.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete Community</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete this community and all its content</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${community.name}"? This action cannot be undone.`)) {
                        router.push("/dashboard")
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

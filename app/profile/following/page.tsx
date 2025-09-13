"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Calendar,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Search
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface Following {
  id: string
  following_id: string
  created_at: string
  following: {
    id: string
    first_name: string
    last_name: string
    username: string
    avatar_url: string | null
    bio: string | null
    location: string | null
    created_at: string
  }
}

export default function FollowingPage() {
  const { user } = useAuth()
  const [following, setFollowing] = useState<Following[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user) {
      fetchFollowing()
    }
  }, [user])

  const fetchFollowing = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          following_id,
          created_at,
          following:profiles!user_follows_following_id_fkey(
            id,
            first_name,
            last_name,
            username,
            avatar_url,
            bio,
            location,
            created_at
          )
        `)
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching following:', error)
        toast.error('Failed to load following')
        return
      }

      setFollowing(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load following')
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (followingId: string) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('following_id', followingId)

      if (error) {
        console.error('Error unfollowing:', error)
        toast.error('Failed to unfollow user')
        return
      }

      setFollowing(following.filter(f => f.following_id !== followingId))
      toast.success('Unfollowed successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to unfollow user')
    }
  }

  const filteredFollowing = following.filter(f => {
    if (!searchTerm) return true
    const fullName = `${f.following.first_name} ${f.following.last_name}`.toLowerCase()
    const username = f.following.username?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) || username.includes(search)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading following...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Following</h1>
              <p className="text-muted-foreground mt-1">
                People you follow ({following.length})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        {following.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search following..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filteredFollowing.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No matching users found' : 'Not following anyone yet'}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Start following people to see their posts and updates.'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/communities">Explore Communities</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredFollowing.map((follow) => (
              <Card key={follow.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={follow.following.avatar_url || "/placeholder.svg"} 
                          alt={`${follow.following.first_name} ${follow.following.last_name}`} 
                        />
                        <AvatarFallback>
                          {`${follow.following.first_name} ${follow.following.last_name}`
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {follow.following.first_name} {follow.following.last_name}
                          </h3>
                          {follow.following.username && (
                            <Badge variant="outline" className="text-xs">
                              @{follow.following.username}
                            </Badge>
                          )}
                        </div>
                        
                        {follow.following.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {follow.following.bio}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {follow.following.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{follow.following.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Following since {new Date(follow.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/profile/${follow.following.id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnfollow(follow.following_id)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

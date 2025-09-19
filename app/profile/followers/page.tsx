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
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Follower {
  id: string
  follower_id: string
  created_at: string
  follower: {
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

export default function FollowersPage() {
  const { user } = useAuth()
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFollowers()
    }
  }, [user])

  const fetchFollowers = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          follower_id,
          created_at,
          follower:profiles!user_follows_follower_id_fkey(
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
        .eq('following_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching followers:', error)
        toast.error('Failed to load followers')
        return
      }

      setFollowers(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load followers')
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (followerId: string) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', user?.id)

      if (error) {
        console.error('Error unfollowing:', error)
        toast.error('Failed to unfollow user')
        return
      }

      setFollowers(followers.filter(f => f.follower_id !== followerId))
      toast.success('User unfollowed successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to unfollow user')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading followers...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Followers</h1>
              <p className="text-muted-foreground mt-1">
                People who follow you ({followers.length})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {followers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No followers yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start creating content and engaging with others to gain followers.
              </p>
              <Button asChild>
                <Link href="/profile/posts">Create Your First Post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {followers.map((follower) => (
              <Card key={follower.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={follower.follower.avatar_url || "/placeholder.svg"} 
                          alt={`${follower.follower.first_name} ${follower.follower.last_name}`} 
                        />
                        <AvatarFallback>
                          {`${follower.follower.first_name} ${follower.follower.last_name}`
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {follower.follower.first_name} {follower.follower.last_name}
                          </h3>
                          {follower.follower.username && (
                            <Badge variant="outline" className="text-xs">
                              @{follower.follower.username}
                            </Badge>
                          )}
                        </div>
                        
                        {follower.follower.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {follower.follower.bio}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {follower.follower.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{follower.follower.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Following since {new Date(follower.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/profile/${follower.follower.id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnfollow(follower.follower_id)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
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

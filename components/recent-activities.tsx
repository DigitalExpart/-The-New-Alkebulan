"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Users, MessageCircle, LogIn, Plus, Star, MapPin, Heart, TrendingUp, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Activity {
  id: string
  type: 'login' | 'community_join' | 'post_created' | 'badge_earned' | 'community_created' | 'profile_updated'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  color: string
}

export default function RecentActivities() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserActivities()
    }
  }, [user])

  const fetchUserActivities = async () => {
    if (!user) return

    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const userId = user.id

      // Fetch recent activities from multiple sources
      const [communityMemberships, posts, communities] = await Promise.all([
        // Community memberships (joins)
        supabase
          .from('community_members')
          .select(`
            *,
            community:communities(name)
          `)
          .eq('user_id', userId)
          .order('joined_at', { ascending: false })
          .limit(5),

        // Posts created
        supabase
          .from('community_posts')
          .select(`
            *,
            community:communities(name)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Communities created
        supabase
          .from('communities')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      // Transform data into activities
      const allActivities: Activity[] = []

      // Add community joins
      if (communityMemberships.data) {
        communityMemberships.data.forEach((membership) => {
          allActivities.push({
            id: `join_${membership.id}`,
            type: 'community_join',
            title: `Joined ${membership.community?.name || 'Community'}`,
            description: `You became a member of this community`,
            timestamp: membership.joined_at,
            icon: <Users className="h-4 w-4" />,
            color: 'bg-blue-500/10 text-blue-600'
          })
        })
      }

      // Add posts created
      if (posts.data) {
        posts.data.forEach((post) => {
          allActivities.push({
            id: `post_${post.id}`,
            type: 'post_created',
            title: `Posted in ${post.community?.name || 'Community'}`,
            description: post.content.length > 50 ? `${post.content.substring(0, 50)}...` : post.content,
            timestamp: post.created_at,
            icon: <MessageCircle className="h-4 w-4" />,
            color: 'bg-green-500/10 text-green-600'
          })
        })
      }

      // Add communities created
      if (communities.data) {
        communities.data.forEach((community) => {
          allActivities.push({
            id: `community_${community.id}`,
            type: 'community_created',
            title: `Created "${community.name}"`,
            description: `You started a new community`,
            timestamp: community.created_at,
            icon: <Plus className="h-4 w-4" />,
            color: 'bg-purple-500/10 text-purple-600'
          })
        })
      }

      // Add login activity (most recent)
      allActivities.push({
        id: 'login_recent',
        type: 'login',
        title: 'Logged in to The New Alkebulan',
        description: 'You accessed your account',
        timestamp: new Date().toISOString(),
        icon: <LogIn className="h-4 w-4" />,
        color: 'bg-orange-500/10 text-orange-600'
      })

      // Sort by timestamp and take the most recent 8
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8)

      setActivities(sortedActivities)
    } catch (error) {
      console.error('Error fetching user activities:', error)
      toast.error('Failed to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMs = now.getTime() - activityTime.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return activityTime.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No recent activity yet</p>
        <p className="text-muted-foreground text-xs mt-1">Start exploring to see your activity here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
          <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center`}>
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{activity.title}</p>
            <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimeAgo(activity.timestamp)}
          </span>
        </div>
      ))}
    </div>
  )
}

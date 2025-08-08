"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Heart, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function CommunityStats() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    if (!supabase) return

    try {
      // Get total posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      // Get total comments
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })

      // Get total likes
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })

      // Get active users (users who posted in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: activeUsersCount } = await supabase
        .from('posts')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      setStats({
        totalPosts: postsCount || 0,
        totalComments: commentsCount || 0,
        totalLikes: likesCount || 0,
        activeUsers: activeUsersCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Total Posts</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalPosts}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Total Comments</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalComments}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Heart className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Total Likes</p>
          <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Users className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Active Users</p>
          <p className="text-2xl font-bold text-purple-600">{stats.activeUsers}</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Engagement Rate</span>
          <Badge variant="secondary">
            {stats.totalPosts > 0 
              ? Math.round((stats.totalLikes + stats.totalComments) / stats.totalPosts * 100) / 100
              : 0
            }x
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Average interactions per post
        </p>
      </div>
    </div>
  )
} 
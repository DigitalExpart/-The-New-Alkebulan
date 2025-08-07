"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, Calendar, Search, Plus, Share2, Settings, Globe, Activity } from "lucide-react"
import { CommunityCard } from "@/components/community/community-card"
import type { Community } from "@/types/community"

export default function MyCommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for featured communities with proper structure
  const featuredCommunities: Community[] = [
    {
      id: "1",
      name: "African Entrepreneurs Network",
      description: "Connect with fellow African entrepreneurs building the future",
      memberCount: 2847,
      category: "Business",
      isPrivate: false,
      image: "/placeholder.svg?height=200&width=300&text=Entrepreneurs",
      tags: ["Business", "Networking", "Startups"],
      createdAt: "2023-01-15",
      lastActivity: "2024-01-15T10:30:00Z",
      unreadMessages: 12,
      isPinned: true,
      color: "bg-blue-500",
      icon: "💼",
      isJoined: true,
      role: "member",
    },
    {
      id: "2",
      name: "Diaspora Cultural Exchange",
      description: "Celebrating our heritage and sharing cultural experiences",
      memberCount: 1523,
      category: "Culture",
      isPrivate: false,
      image: "/placeholder.svg?height=200&width=300&text=Culture",
      tags: ["Culture", "Heritage", "Arts"],
      createdAt: "2023-03-20",
      lastActivity: "2024-01-14T15:45:00Z",
      unreadMessages: 5,
      isPinned: false,
      color: "bg-purple-500",
      icon: "🎭",
      isJoined: true,
      role: "moderator",
    },
    {
      id: "3",
      name: "Tech Innovators Hub",
      description: "African tech professionals driving innovation globally",
      memberCount: 3241,
      category: "Technology",
      isPrivate: false,
      image: "/placeholder.svg?height=200&width=300&text=Tech",
      tags: ["Technology", "Innovation", "AI"],
      createdAt: "2022-11-10",
      lastActivity: "2024-01-15T09:20:00Z",
      unreadMessages: 23,
      isPinned: true,
      color: "bg-green-500",
      icon: "💻",
      isJoined: true,
      role: "admin",
    },
    {
      id: "4",
      name: "Wellness & Mindfulness",
      description: "Supporting mental health and wellness in our community",
      memberCount: 892,
      category: "Health",
      isPrivate: true,
      image: "/placeholder.svg?height=200&width=300&text=Wellness",
      tags: ["Health", "Wellness", "Mindfulness"],
      createdAt: "2023-06-05",
      lastActivity: "2024-01-13T18:10:00Z",
      unreadMessages: 3,
      isPinned: false,
      color: "bg-teal-500",
      icon: "🧘",
      isJoined: true,
      role: "member",
    },
  ]

  const communityStats = {
    totalMembers: 8503,
    activeCommunities: 4,
    totalMessages: 1247,
    eventsAttended: 12,
  }

  const recentActivity = [
    {
      id: 1,
      type: "message",
      community: "African Entrepreneurs Network",
      user: "Amara Okafor",
      action: "shared a business opportunity",
      time: "5 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      type: "event",
      community: "Tech Innovators Hub",
      user: "Kwame Asante",
      action: "created a new event: AI Workshop",
      time: "2 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      type: "join",
      community: "Diaspora Cultural Exchange",
      user: "Fatima Al-Hassan",
      action: "joined the community",
      time: "1 day ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      type: "post",
      community: "Wellness & Mindfulness",
      user: "Zara Ibrahim",
      action: "shared a wellness tip",
      time: "2 days ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const handlePin = (communityId: string) => {
    console.log("Pinning community:", communityId)
    // Handle pin logic here
  }

  const handleJoin = (communityId: string) => {
    console.log("Joining community:", communityId)
    // Handle join logic here
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      case "join":
        return <Users className="h-4 w-4" />
      case "post":
        return <Share2 className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "message":
        return "text-blue-500"
      case "event":
        return "text-purple-500"
      case "join":
        return "text-green-500"
      case "post":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
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
                  <p className="text-sm text-muted-foreground">Active Communities</p>
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
                  <p className="text-2xl font-bold">{communityStats.totalMessages.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.eventsAttended}</p>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
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
              {/* Featured Communities */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Featured Communities</CardTitle>
                      <CardDescription>Your most active communities</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {featuredCommunities.slice(0, 2).map((community) => (
                        <CommunityCard key={community.id} community={community} onPin={handlePin} onJoin={handleJoin} />
                      ))}
                    </div>
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
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-4 h-4 ${getActivityColor(activity.type)}`}>
                                {getActivityIcon(activity.type)}
                              </div>
                              <p className="text-sm font-medium truncate">{activity.user}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              in {activity.community} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Community
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Find Communities
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Browse Events
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Settings
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Community
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} onPin={handlePin} onJoin={handleJoin} />
              ))}
            </div>
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
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCommunities
                .filter((community) => !community.isJoined)
                .map((community) => (
                  <CommunityCard key={community.id} community={community} onPin={handlePin} onJoin={handleJoin} />
                ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Community Activity</h2>
              <p className="text-muted-foreground">Your recent community interactions</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-5 h-5 ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <p className="font-medium">{activity.user}</p>
                          <Badge variant="secondary" className="text-xs">
                            {activity.community}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

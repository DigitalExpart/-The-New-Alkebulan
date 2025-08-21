"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp, 
  Calendar,
  Globe,
  Filter,
  Search,
  Hash,
  ArrowUp,
  Plus,
  Image as ImageIcon
} from "lucide-react"
import { SocialFeed } from "@/components/social-feed/social-feed"
import { CommunityFeed } from "@/components/community/community-feed"
import { CommunityStats } from "@/components/community/community-stats"
import { useAuth } from "@/hooks/use-auth"
import { CreatePostDialog } from "@/components/social-feed/create-post-dialog"

export default function CommunityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("feed")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock trending topics data
  const trendingTopics = [
    { hashtag: "DiasporaEntrepreneurs", posts: 234, trending: true },
    { hashtag: "AfricanTech", posts: 189, trending: true },
    { hashtag: "CulturalHeritage", posts: 156, trending: true },
    { hashtag: "BusinessNetworking", posts: 142, trending: false },
    { hashtag: "InnovationHub", posts: 98, trending: true },
    { hashtag: "CommunityGrowth", posts: 87, trending: false },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold text-foreground mb-2">Community</h1>
                <p className="text-lg text-muted-foreground">
                  Connect, share, and grow with the Alkebulan community
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search posts, communities, or people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </form>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Create Post Section */}
              {user && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CreatePostDialog onPostCreated={() => {
                          // Refresh the feed when a new post is created
                          window.location.reload()
                        }}>
                          <Button variant="outline" className="w-full justify-start text-left text-muted-foreground">
                            What's on your mind?
                          </Button>
                        </CreatePostDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="communities">Communities</TabsTrigger>
                </TabsList>

                {/* Feed Tab */}
                <TabsContent value="feed" className="mt-6">
                  <CommunityFeed />
                </TabsContent>

                {/* Trending Tab */}
                <TabsContent value="trending" className="mt-6">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Trending Posts</h3>
                          <p className="text-muted-foreground mb-6">
                            Discover the most popular and engaging content from our community
                          </p>
                          <Button>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Trending
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Following Tab */}
                <TabsContent value="following" className="mt-6">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Following Feed</h3>
                          <p className="text-muted-foreground mb-6">
                            See posts from people and communities you follow
                          </p>
                          <Button>
                            <Users className="h-4 w-4 mr-2" />
                            Find People to Follow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Communities Tab */}
                <TabsContent value="communities" className="mt-6">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Your Communities</h3>
                          <p className="text-muted-foreground mb-6">
                            Manage and explore the communities you're part of
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button asChild>
                              <a href="/communities/my-community">
                                <Globe className="h-4 w-4 mr-2" />
                                My Communities
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href="/communities/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Community
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Live Indicator */}
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                <Globe className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="font-medium">#{topic.hashtag}</span>
                      {topic.trending && (
                        <ArrowUp className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {topic.posts} posts
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/communities/create">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Discussion
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/communities">
                    <Users className="h-4 w-4 mr-2" />
                    Find Members
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/community/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Events
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/communities/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">Be Respectful</p>
                  <p className="text-muted-foreground">
                    Treat all members with kindness and respect.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium">Share Meaningfully</p>
                  <p className="text-muted-foreground">
                    Contribute valuable content that helps the community grow.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium">Stay On Topic</p>
                  <p className="text-muted-foreground">
                    Keep discussions relevant to our community's mission.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Icons */}
            <div className="flex flex-col items-center space-y-4 pt-4">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

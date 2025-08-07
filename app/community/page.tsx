"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostCard } from "@/components/community/post-card"
import { CreatePostDialog } from "@/components/community/create-post-dialog"
import { Search, Plus, TrendingUp, Users, Calendar, Filter, MessageCircle } from "lucide-react"

// Mock data for posts
const mockPosts = [
  {
    id: "1",
    author: {
      name: "Amara Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content:
      "Just launched my new fintech app focused on diaspora remittances! Would love feedback from the community. 🚀",
    timestamp: "2 hours ago",
    likes: 45,
    comments: 12,
    shares: 8,
    community: "Tech Innovators",
    images: ["/placeholder.svg?height=300&width=500"],
  },
  {
    id: "2",
    author: {
      name: "Kwame Asante",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content:
      "Sharing some insights from my recent trip to Ghana. The tech ecosystem there is absolutely thriving! Here are 5 key observations...",
    timestamp: "4 hours ago",
    likes: 78,
    comments: 23,
    shares: 15,
    community: "Business Network",
  },
  {
    id: "3",
    author: {
      name: "Zara Okafor",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    content:
      "Beautiful Adinkra symbols I've been incorporating into my latest art series. Each symbol tells a story of our ancestors. 🎨",
    timestamp: "6 hours ago",
    likes: 92,
    comments: 18,
    shares: 25,
    community: "Cultural Heritage",
    images: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
  },
]

const trendingTopics = [
  { name: "DiasporaEntrepreneurs", posts: 234 },
  { name: "AfricanTech", posts: 189 },
  { name: "CulturalHeritage", posts: 156 },
  { name: "BusinessNetworking", posts: 143 },
  { name: "WellnessJourney", posts: 98 },
]

const suggestedCommunities = [
  {
    name: "Tech Innovators",
    members: "1.2K members",
    description: "African diaspora tech professionals",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Cultural Heritage",
    members: "890 members",
    description: "Preserving our rich traditions",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Business Network",
    members: "2.1K members",
    description: "Connecting diaspora entrepreneurs",
    image: "/placeholder.svg?height=60&width=60",
  },
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("feed")

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
            <p className="text-muted-foreground">Connect, share, and grow with the diaspora community</p>
          </div>
          <CreatePostDialog>
            <Button className="mt-4 md:mt-0 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </CreatePostDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts, communities, or people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="communities">Communities</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                {mockPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Trending Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Posts with the most engagement in the last 24 hours</p>
                  </CardContent>
                </Card>
                {mockPosts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="following" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Following
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Posts from people and communities you follow</p>
                  </CardContent>
                </Card>
                {mockPosts.slice(1).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="communities" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedCommunities.map((community, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={community.image || "/placeholder.svg"}
                            alt={community.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{community.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{community.members}</p>
                            <p className="text-sm text-muted-foreground">{community.description}</p>
                            <Button size="sm" className="mt-2">
                              Join Community
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">#{topic.name}</p>
                      <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Total Members</span>
                  </div>
                  <span className="font-semibold">12.5K</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Posts Today</span>
                  </div>
                  <span className="font-semibold">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Events This Week</span>
                  </div>
                  <span className="font-semibold">8</span>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Communities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedCommunities.slice(0, 2).map((community, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={community.image || "/placeholder.svg"}
                      alt={community.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.members}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

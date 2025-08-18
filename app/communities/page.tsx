"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Users, 
  Plus, 
  Globe, 
  MapPin, 
  Calendar,
  MessageCircle,
  Heart,
  Share2
} from "lucide-react"

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  category: string
  location: string
  isPublic: boolean
  tags: string[]
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: "1",
    name: "African Entrepreneurs Network",
    description: "Connect with fellow African entrepreneurs, share experiences, and collaborate on business opportunities across the continent.",
    memberCount: 1247,
    category: "Business",
    location: "Pan-African",
    isPublic: true,
    tags: ["Entrepreneurship", "Networking", "Business", "Africa"]
  },
  {
    id: "2",
    name: "Tech Innovators Hub",
    description: "A community for tech enthusiasts, developers, and innovators to share knowledge, collaborate on projects, and stay updated with the latest trends.",
    memberCount: 892,
    category: "Technology",
    location: "Global",
    isPublic: true,
    tags: ["Technology", "Innovation", "Development", "AI"]
  },
  {
    id: "3",
    name: "Creative Arts Collective",
    description: "Join artists, designers, and creative professionals to showcase work, find inspiration, and collaborate on creative projects.",
    memberCount: 567,
    category: "Arts & Culture",
    location: "Lagos, Nigeria",
    isPublic: true,
    tags: ["Arts", "Design", "Creativity", "Culture"]
  },
  {
    id: "4",
    name: "Investment & Finance Group",
    description: "Connect with investors, financial advisors, and entrepreneurs to discuss investment opportunities, market trends, and financial strategies.",
    memberCount: 743,
    category: "Finance",
    location: "Pan-African",
    isPublic: false,
    tags: ["Investment", "Finance", "Business", "Strategy"]
  }
]

export default function CommunitiesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [communities] = useState<Community[]>(MOCK_COMMUNITIES)

  const categories = ["all", "Business", "Technology", "Arts & Culture", "Finance", "Education", "Health", "Sports"]

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || community.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground text-lg">
            Connect with like-minded people, share knowledge, and build meaningful relationships
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              className="md:w-auto"
              onClick={() => router.push('/communities/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{community.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {community.category}
                      </Badge>
                      {!community.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {community.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{community.location}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {community.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {community.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{community.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Join Community
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No communities found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find the community you're looking for.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Community
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
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
  Share2,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface Community {
  id: string
  name: string
  description: string
  member_count: number
  category: string
  location: string | null
  is_public: boolean
  tags: string[]
  created_at: string
  created_by: string
}

export default function CommunitiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const categories = ["all", "Business", "Technology", "Arts & Culture", "Finance", "Education", "Health", "Sports"]

  // Fetch communities on component mount
  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching communities:', error)
        toast.error('Failed to load communities')
        return
      }

      setCommunities(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCommunities()
      return
    }

    try {
      setSearchLoading(true)
      const supabase = getSupabaseClient()
      
      // Search in communities table
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Search error:', error)
        toast.error('Search failed')
        return
      }

      setCommunities(data || [])
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  // Filter communities by category
  const filteredCommunities = communities.filter(community => {
    const matchesCategory = selectedCategory === "all" || community.category === selectedCategory
    return matchesCategory
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={searchLoading}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
              >
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading communities...</p>
          </div>
        )}

        {/* Communities Grid */}
        {!loading && (
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
                        {!community.is_public && (
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
                      <span>{community.member_count?.toLocaleString() || 0} members</span>
                    </div>
                    {community.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{community.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {community.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{community.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/communities/${community.id}`)}
                    >
                      View Community
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
        )}

        {/* Empty State */}
        {!loading && filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No communities found' : 'No communities yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search or filters to find the community you\'re looking for.'
                : 'Be the first to create a community and start building connections!'
              }
            </p>
            <Button onClick={() => router.push('/communities/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Community
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

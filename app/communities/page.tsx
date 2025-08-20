"use client"

import { useState, useEffect, useMemo } from "react"
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
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Performance optimization: Memoize filtered communities
  const filteredCommunities = useMemo(() => {
    return communities.filter(community => {
      const matchesCategory = selectedCategory === "all" || community.category === selectedCategory
      return matchesCategory
    })
  }, [communities, selectedCategory])

  const categories = ["all", "Business", "Technology", "Arts & Culture", "Finance", "Education", "Health", "Sports"]
  
  // Search suggestions for better mobile UX
  const searchSuggestions = [
    "Technology", "Business", "Health", "Education", "Sports", "Arts", "Finance", "Community"
  ]

  // Fetch communities on component mount
  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Optimized query with limit for faster initial load
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select(`
          *,
          member_count:community_members(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50) // Limit initial load for faster performance

      if (communitiesError) {
        console.error('Error fetching communities:', communitiesError)
        toast.error('Failed to load communities')
        return
      }

      // Process the data with proper member counts
      if (communitiesData && communitiesData.length > 0) {
        const processedCommunities = communitiesData.map(community => ({
          ...community,
          member_count: Array.isArray(community.member_count) 
            ? community.member_count.length 
            : 0
        }))
        setCommunities(processedCommunities)
        setHasMore(communitiesData.length === 50) // Check if there are more communities
      } else {
        setCommunities([])
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreCommunities = async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      const supabase = getSupabaseClient()
      
      const { data: moreCommunities, error } = await supabase
        .from('communities')
        .select(`
          *,
          member_count:community_members(count)
        `)
        .order('created_at', { ascending: false })
        .range(communities.length, communities.length + 49)

      if (error) {
        console.error('Error loading more communities:', error)
        return
      }

      if (moreCommunities && moreCommunities.length > 0) {
        const processedMoreCommunities = moreCommunities.map(community => ({
          ...community,
          member_count: Array.isArray(community.member_count) 
            ? community.member_count.length 
            : 0
        }))
        setCommunities(prev => [...prev, ...processedMoreCommunities])
        setHasMore(moreCommunities.length === 50)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more communities:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim()
    
    if (!trimmedQuery) {
      fetchCommunities()
      return
    }

    try {
      setSearchLoading(true)
      const supabase = getSupabaseClient()
      
      // Fast search without timeout
      const { data: searchResults, error } = await supabase
        .from('communities')
        .select(`
          *,
          member_count:community_members(count)
        `)
        .or(`name.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%,category.ilike.%${trimmedQuery}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Search error:', error)
        toast.error('Search failed. Please try again.')
        return
      }

      // Process search results
      if (searchResults && searchResults.length > 0) {
        const processedResults = searchResults.map(community => ({
          ...community,
          member_count: Array.isArray(community.member_count) 
            ? community.member_count.length 
            : 0
        }))
        setCommunities(processedResults)
        toast.success(`Found ${processedResults.length} community${processedResults.length !== 1 ? 's' : ''}`)
      } else {
        setCommunities([])
        toast.info('No communities found matching your search. Try different keywords.')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please check your connection and try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Debounced search for better mobile experience
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        handleSearch()
      } else if (searchQuery.trim() === '') {
        fetchCommunities()
      }
    }, 300) // Reduced from 500ms to 300ms for faster response

    return () => clearTimeout(timer)
  }, [searchQuery])



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
          {/* Search Bar - Mobile Optimized */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search communities by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-24 h-12 text-base"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      fetchCommunities()
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="h-8 px-3"
                >
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Search Suggestions for Mobile */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground mr-2">Try:</span>
                {searchSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(suggestion)}
                    className="text-xs h-7 px-2"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
            className="w-full sm:w-auto"
            onClick={() => router.push('/communities/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Button>
          

            
            {/* Search Status */}
            {searchQuery && (
              <div className="flex items-center justify-between sm:justify-start gap-2 text-sm text-muted-foreground">
                <span>
                  {searchLoading ? 'Searching...' : `Found ${communities.length} result${communities.length !== 1 ? 's' : ''}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    fetchCommunities()
                  }}
                  className="h-8 px-2 text-xs"
                >
                  Show All
                </Button>
              </div>
            )}
          </div>

          {/* Category Filters - Mobile Optimized */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Categories:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="text-xs h-7 px-2"
              >
                Show All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.filter(cat => cat !== "all").map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize text-xs h-8 px-3"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

                         {/* Loading State - Mobile Optimized */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">Loading communities...</p>
          </div>
        )}

                                 {/* Communities Grid - Mobile Optimized */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
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
                  
                  <CardContent className="space-y-4 flex flex-col h-full">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {community.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
                            onClick={() => {
                              console.log('Navigating to members page:', `/communities/${community.id}/members`)
                              try {
                                router.push(`/communities/${community.id}/members`)
                              } catch (error) {
                                console.error('Navigation error:', error)
                                // Fallback to window.location if router fails
                                window.location.href = `/communities/${community.id}/members`
                              }
                            }}
                          >
                            {community.member_count === 1 
                              ? '1 member' 
                              : `${community.member_count || 0} members`
                            }
                          </Button>
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
                        <div className="flex flex-wrap gap-1 mb-4">
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

                      {/* Creation Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Always at bottom */}
                    <div className="flex items-center gap-2 pt-4 mt-auto">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/communities/${community.id}`)}
                      >
                        View Community
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && !searchQuery && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMoreCommunities}
                  disabled={loadingMore}
                  className="w-full sm:w-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Communities'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

                {/* Empty State - Mobile Optimized */}
        {!loading && filteredCommunities.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {searchQuery ? 'No communities found' : 'No communities yet'}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
              {searchQuery 
                ? 'Try adjusting your search or filters to find the community you\'re looking for.'
                : 'Be the first to create a community and start building connections!'
              }
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/communities/create')}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Community
              </Button>
              {searchQuery && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    fetchCommunities()
                  }}
                  className="w-full sm:w-auto"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

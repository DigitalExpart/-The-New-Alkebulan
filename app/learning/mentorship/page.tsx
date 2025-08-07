"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Users, Star, MapPin, BookOpen } from "lucide-react"
import { MentorFilters } from "@/components/mentorship/mentor-filters"
import { MentorCard } from "@/components/mentorship/mentor-card"
import { sampleMentors } from "@/data/mentors"
import type { MentorshipFilters, SortOption } from "@/types/mentorship"

export default function MentorshipPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<MentorshipFilters>({
    specializations: [],
    languages: [],
    location: "",
    maxDistance: 10000,
    minRating: 0,
    availability: [],
    priceRange: [0, 500],
    isVerified: false,
  })
  const [sortBy, setSortBy] = useState<SortOption>("topRated")
  const [favorites, setFavorites] = useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Filter and sort mentors
  const filteredMentors = useMemo(() => {
    const filtered = sampleMentors.filter((mentor) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          mentor.name.toLowerCase().includes(query) ||
          mentor.title.toLowerCase().includes(query) ||
          mentor.bio.toLowerCase().includes(query) ||
          mentor.specializations.some((spec) => spec.toLowerCase().includes(query)) ||
          mentor.tags.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Specialization filter
      if (filters.specializations.length > 0) {
        const hasSpecialization = filters.specializations.some((spec) => mentor.specializations.includes(spec))
        if (!hasSpecialization) return false
      }

      // Language filter
      if (filters.languages.length > 0) {
        const hasLanguage = filters.languages.some((lang) => mentor.languages.includes(lang))
        if (!hasLanguage) return false
      }

      // Location filter
      if (filters.location) {
        const locationMatch = mentor.location.toLowerCase().includes(filters.location.toLowerCase())
        if (!locationMatch) return false
      }

      // Distance filter
      if (mentor.distance !== undefined && mentor.distance > filters.maxDistance) {
        return false
      }

      // Rating filter
      if (mentor.rating < filters.minRating) {
        return false
      }

      // Price filter
      if (mentor.hourlyRate) {
        if (mentor.hourlyRate < filters.priceRange[0] || mentor.hourlyRate > filters.priceRange[1]) {
          return false
        }
      }

      // Verified filter
      if (filters.isVerified && !mentor.isVerified) {
        return false
      }

      return true
    })

    // Sort mentors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "topRated":
          return b.rating - a.rating
        case "mostActive":
          return b.totalSessions - a.totalSessions
        case "closest":
          return (a.distance || 0) - (b.distance || 0)
        case "newest":
          return 0 // Would sort by join date if available
        case "priceAsc":
          return (a.hourlyRate || 0) - (b.hourlyRate || 0)
        case "priceDesc":
          return (b.hourlyRate || 0) - (a.hourlyRate || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, filters, sortBy])

  const handleBookSession = (mentorId: string) => {
    // TODO: Implement booking logic
    console.log("Booking session with mentor:", mentorId)
  }

  const handleToggleFavorite = (mentorId: string) => {
    setFavorites((prev) => (prev.includes(mentorId) ? prev.filter((id) => id !== mentorId) : [...prev, mentorId]))
  }

  const stats = {
    totalMentors: sampleMentors.length,
    averageRating: (sampleMentors.reduce((sum, mentor) => sum + mentor.rating, 0) / sampleMentors.length).toFixed(1),
    totalSessions: sampleMentors.reduce((sum, mentor) => sum + mentor.totalSessions, 0),
    specializations: [...new Set(sampleMentors.flatMap((mentor) => mentor.specializations))].length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with experienced professionals who can guide your growth journey
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold">{stats.totalMentors}</span>
                </div>
                <p className="text-sm text-muted-foreground">Expert Mentors</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{stats.averageRating}</span>
                </div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold">{stats.specializations}</span>
                </div>
                <p className="text-sm text-muted-foreground">Specializations</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, expertise, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <MentorFilters filters={filters} onFiltersChange={setFilters} sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Filter Button & Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">{filteredMentors.length} Mentors Found</h2>

                {/* Active Filters */}
                {(filters.specializations.length > 0 ||
                  filters.languages.length > 0 ||
                  filters.location ||
                  filters.isVerified) && (
                  <div className="flex flex-wrap gap-2">
                    {filters.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {filters.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                    {filters.location && (
                      <Badge variant="secondary" className="text-xs">
                        📍 {filters.location}
                      </Badge>
                    )}
                    {filters.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filter Mentors</SheetTitle>
                    <SheetDescription>Refine your search to find the perfect mentor</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <MentorFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      isCollapsed={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Mentors Grid */}
            {filteredMentors.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setFilters({
                        specializations: [],
                        languages: [],
                        location: "",
                        maxDistance: 10000,
                        minRating: 0,
                        availability: [],
                        priceRange: [0, 500],
                        isVerified: false,
                      })
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onBookSession={handleBookSession}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorited={favorites.includes(mentor.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

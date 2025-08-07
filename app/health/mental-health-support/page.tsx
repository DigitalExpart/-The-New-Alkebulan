"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, BookOpen, Heart, Star, MapPin } from "lucide-react"
import { MentalHealthFiltersComponent } from "@/components/mental-health/mental-health-filters"
import { MentalHealthProfessionalCard } from "@/components/mental-health/mental-health-professional-card"
import { MentalHealthJournal } from "@/components/mental-health/mental-health-journal"
import { mentalHealthProfessionals } from "@/data/mental-health-data"
import type { MentalHealthFilters, JournalEntry } from "@/types/mental-health"

export default function MentalHealthSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<MentalHealthFilters>({
    professionalType: [],
    specializations: [],
    languages: [],
    availability: [],
    location: "",
    maxDistance: 50,
    minRating: 0,
    maxPrice: 200,
    verified: false,
  })
  const [favorites, setFavorites] = useState<string[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])

  // Filter professionals based on search and filters
  const filteredProfessionals = useMemo(() => {
    return mentalHealthProfessionals.filter((professional) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          professional.name.toLowerCase().includes(query) ||
          professional.title.toLowerCase().includes(query) ||
          professional.specializations.some((spec) => spec.toLowerCase().includes(query)) ||
          professional.therapeuticApproach.toLowerCase().includes(query) ||
          professional.about.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Professional type filter
      if (filters.professionalType.length > 0) {
        const matchesType = filters.professionalType.some((type) =>
          professional.title.toLowerCase().includes(type.toLowerCase()),
        )
        if (!matchesType) return false
      }

      // Specializations filter
      if (filters.specializations.length > 0) {
        const matchesSpec = filters.specializations.some((spec) => professional.specializations.includes(spec))
        if (!matchesSpec) return false
      }

      // Languages filter
      if (filters.languages.length > 0) {
        const matchesLang = filters.languages.some((lang) => professional.languages.includes(lang))
        if (!matchesLang) return false
      }

      // Availability filter
      if (filters.availability.length > 0) {
        const matchesAvail =
          filters.availability.includes(professional.availability) ||
          (filters.availability.includes("both") && professional.availability === "both")
        if (!matchesAvail) return false
      }

      // Location filter
      if (filters.location) {
        const matchesLocation = professional.location.toLowerCase().includes(filters.location.toLowerCase())
        if (!matchesLocation) return false
      }

      // Rating filter
      if (professional.rating < filters.minRating) return false

      // Price filter
      if (professional.hourlyRate > filters.maxPrice) return false

      // Verified filter
      if (filters.verified && !professional.verified) return false

      return true
    })
  }, [searchQuery, filters])

  const handleRequestSession = (professionalId: string) => {
    // In a real app, this would open a booking modal or redirect to booking page
    console.log("Requesting session with professional:", professionalId)
    alert("Session request functionality would be implemented here!")
  }

  const handleSaveFavorite = (professionalId: string) => {
    setFavorites((prev) =>
      prev.includes(professionalId) ? prev.filter((id) => id !== professionalId) : [...prev, professionalId],
    )
  }

  const handleAddJournalEntry = (entry: Omit<JournalEntry, "id" | "userId">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: "current-user", // In a real app, this would come from auth
    }
    setJournalEntries((prev) => [newEntry, ...prev])
  }

  const handleDeleteJournalEntry = (entryId: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  const stats = {
    totalProfessionals: mentalHealthProfessionals.length,
    verifiedProfessionals: mentalHealthProfessionals.filter((p) => p.verified).length,
    averageRating: (
      mentalHealthProfessionals.reduce((sum, p) => sum + p.rating, 0) / mentalHealthProfessionals.length
    ).toFixed(1),
    languagesSupported: [...new Set(mentalHealthProfessionals.flatMap((p) => p.languages))].length,
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-card rounded-full border border-border">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Mental Health Support</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with culturally-responsive mental health professionals who understand your journey. Find support,
            healing, and growth in a safe, welcoming environment.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.totalProfessionals}</p>
              <p className="text-sm text-muted-foreground">Professionals</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.averageRating}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.languagesSupported}</p>
              <p className="text-sm text-muted-foreground">Languages</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.verifiedProfessionals}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="professionals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
            <TabsTrigger
              value="professionals"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Find Professionals
            </TabsTrigger>
            <TabsTrigger
              value="journal"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Journal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="space-y-6">
            {/* Filters */}
            <MentalHealthFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Results */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {filteredProfessionals.length} Professional{filteredProfessionals.length !== 1 ? "s" : ""} Found
              </h2>
              {(searchQuery || Object.values(filters).some((f) => (Array.isArray(f) ? f.length > 0 : f))) && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Filtered Results
                </Badge>
              )}
            </div>

            {filteredProfessionals.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-12">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No professionals found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms to find the right mental health professional for you.
                  </p>
                  <Button
                    onClick={() => {
                      setFilters({
                        professionalType: [],
                        specializations: [],
                        languages: [],
                        availability: [],
                        location: "",
                        maxDistance: 50,
                        minRating: 0,
                        maxPrice: 200,
                        verified: false,
                      })
                      setSearchQuery("")
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProfessionals.map((professional) => (
                  <MentalHealthProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onRequestSession={handleRequestSession}
                    onSaveFavorite={handleSaveFavorite}
                    isFavorite={favorites.includes(professional.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="journal">
            <MentalHealthJournal
              entries={journalEntries}
              onAddEntry={handleAddJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

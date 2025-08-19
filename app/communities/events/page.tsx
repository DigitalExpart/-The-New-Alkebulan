"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Search, Plus, CalendarIcon, List, Users, Clock } from "lucide-react"
import { EventCard } from "@/components/events/event-card"
import { EventFiltersComponent } from "@/components/events/event-filters"
import { CreateEventModal } from "@/components/events/create-event-modal"
import { eventsData } from "@/data/events-data"
import type { EventFilters, ViewMode } from "@/types/events"
import { isToday, isThisWeek, isThisMonth } from "@/utils/date-formatting"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [filters, setFilters] = useState<EventFilters>({
    location: "",
    dateRange: "week",
    category: "all",
    communities: [],
    friendsAttending: false,
    sortBy: "soonest",
  })

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const filtered = eventsData.filter((event) => {
      // Search query
      if (
        searchQuery &&
        !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      // Location filter
      if (
        filters.location &&
        !event.location.city?.toLowerCase().includes(filters.location.toLowerCase()) &&
        !event.location.country?.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false
      }

      // Date range filter
      switch (filters.dateRange) {
        case "today":
          if (!isToday(event.date)) return false
          break
        case "week":
          if (!isThisWeek(event.date)) return false
          break
        case "month":
          if (!isThisMonth(event.date)) return false
          break
      }

      // Category filter
      if (filters.category !== "all" && event.category !== filters.category) {
        return false
      }

      // Friends attending filter (mock implementation)
      if (filters.friendsAttending) {
        // In a real app, this would check if user's friends are attending
        return Math.random() > 0.5 // Mock: randomly show some events
      }

      return true
    })

    // Sort events
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "soonest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "popular":
          return b.currentParticipants - a.currentParticipants
        case "closest":
          // Mock implementation - in real app would use user's location
          return Math.random() - 0.5
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, filters])

  const handleRsvp = (eventId: string) => {
    console.log("RSVP to event:", eventId)
    // Handle RSVP logic
  }

  const handleFavorite = (eventId: string) => {
    console.log("Favorite event:", eventId)
    // Handle favorite logic
  }

  const clearFilters = () => {
    setFilters({
      location: "",
      dateRange: "week",
      category: "all",
      communities: [],
      friendsAttending: false,
      sortBy: "soonest",
    })
    setSearchQuery("")
  }

  const getEventStats = () => {
    const upcoming = eventsData.filter((e) => e.status === "upcoming").length
    const rsvped = eventsData.filter((e) => e.isRsvped).length
    const thisWeek = eventsData.filter((e) => isThisWeek(e.date)).length

    return { upcoming, rsvped, thisWeek }
  }

  const stats = getEventStats()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Events</h1>
              <p className="text-muted-foreground">Discover, join, and co-create experiences across the diaspora.</p>
            </div>
            <CreateEventModal>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Host an Event
              </Button>
            </CreateEventModal>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.rsvped}</p>
                  <p className="text-sm text-muted-foreground">My RSVPs</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <EventFiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsContent value="list" className="mt-0">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} onRsvp={handleRsvp} onFavorite={handleFavorite} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <div className="bg-card rounded-lg p-8 text-center border">
                  <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                  <p className="text-muted-foreground">
                    Calendar view is coming soon! For now, enjoy the list view above.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Load More */}
            {filteredEvents.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Events
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

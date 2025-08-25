"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FriendCard } from "@/components/friends/friend-card"
import { FriendsFilters } from "@/components/friends/friends-filters"
import { FriendsStats } from "@/components/friends/friends-stats"
import { friendsData } from "@/data/friends-data"
import type { FriendFilters, ViewMode, FriendStats } from "@/types/friends"
import { useFriendRequests } from "@/hooks/use-friend-requests"
import { Search, Grid3X3, List, Users, UserPlus, SortAsc, Inbox } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAfter, subDays } from "date-fns"

export default function MyFriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState("name")
  const [filters, setFilters] = useState<FriendFilters>({
    searchQuery: "",
    community: "All Communities",
    location: "All Locations",
    relationship: "All Relationships",
    recentlyAdded: false,
    onlineOnly: false,
  })

  const { pendingRequests, sentRequests, fetchPendingRequests, fetchSentRequests } = useFriendRequests()

  useEffect(() => {
    fetchPendingRequests()
    fetchSentRequests()
  }, [])

  // Filter and sort friends
  const filteredFriends = useMemo(() => {
    const filtered = friendsData.filter((friend) => {
      // Search filter
      const matchesSearch =
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        friend.location?.toLowerCase().includes(searchQuery.toLowerCase())

      // Community filter
      const matchesCommunity =
        filters.community === "All Communities" ||
        friend.mutualCommunities.some((community) => community.toLowerCase().includes(filters.community.toLowerCase()))

      // Location filter
      const matchesLocation = filters.location === "All Locations" || friend.location?.includes(filters.location)

      // Relationship filter
      const matchesRelationship =
        filters.relationship === "All Relationships" || friend.relationship === filters.relationship

      // Recently added filter (within last 30 days)
      const matchesRecentlyAdded =
        !filters.recentlyAdded || isAfter(new Date(friend.friendSince), subDays(new Date(), 30))

      // Online only filter
      const matchesOnlineOnly = !filters.onlineOnly || friend.isOnline

      return (
        matchesSearch &&
        matchesCommunity &&
        matchesLocation &&
        matchesRelationship &&
        matchesRecentlyAdded &&
        matchesOnlineOnly
      )
    })

    // Sort friends
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "recent":
          return new Date(b.friendSince).getTime() - new Date(a.friendSince).getTime()
        case "active":
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        case "online":
          if (a.isOnline && !b.isOnline) return -1
          if (!a.isOnline && b.isOnline) return 1
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, filters, sortBy])

  // Calculate stats
  const stats: FriendStats = useMemo(() => {
    const totalFriends = friendsData.length
    const onlineFriends = friendsData.filter((friend) => friend.isOnline).length
    const recentlyAdded = friendsData.filter((friend) =>
      isAfter(new Date(friend.friendSince), subDays(new Date(), 30)),
    ).length

    // Calculate mutual connections (simplified - just count unique communities)
    const allCommunities = friendsData.flatMap((friend) => friend.mutualCommunities)
    const mutualConnections = new Set(allCommunities).size

    return {
      totalFriends,
      onlineFriends,
      mutualConnections,
      recentlyAdded,
      sentRequests: sentRequests?.length || 0,
      receivedRequests: pendingRequests?.length || 0,
    }
  }, [pendingRequests, sentRequests])

  const handleRemoveFriend = (friendId: string) => {
    // In a real app, this would make an API call to remove the friend
    console.log("Removing friend:", friendId)
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Friends</h1>
              <p className="text-muted-foreground">Your trusted circle in the Diaspora Hub</p>
            </div>

            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <Link href="/communities/my-friend-requests" passHref>
                <Button variant="outline" size="sm">
                  <Inbox className="w-4 h-4 mr-2" />
                  Friend Requests
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Find Friends
              </Button>
            </div>
          </div>

          {/* Stats */}
          <FriendsStats stats={stats} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <FriendsFilters filters={filters} onFiltersChange={setFilters} friendsCount={filteredFriends.length} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search friends by name, location, or interests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="active">Last Active</SelectItem>
                    <SelectItem value="online">Online First</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredFriends.length} of {friendsData.length} friends
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear search
                </Button>
              )}
            </div>

            {/* Friends Grid/List */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {filteredFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} viewMode={viewMode} onRemoveFriend={handleRemoveFriend} />
              ))}
            </div>

            {/* Empty state */}
            {filteredFriends.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ||
                  Object.values(filters).some(
                    (f) => f !== "All Communities" && f !== "All Locations" && f !== "All Relationships" && f !== false,
                  )
                    ? "Try adjusting your search terms or filters to find friends."
                    : "Start building your network by connecting with people in the community."}
                </p>
                <div className="flex justify-center space-x-2">
                  <Link href="/communities/my-friend-requests" passHref>
                    <Button variant="outline">
                      <Inbox className="w-4 h-4 mr-2" />
                      View Friend Requests
                    </Button>
                  </Link>
                  {(searchQuery ||
                    Object.values(filters).some(
                      (f) =>
                        f !== "All Communities" && f !== "All Locations" && f !== "All Relationships" && f !== false,
                    )) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setFilters({
                          searchQuery: "",
                          community: "All Communities",
                          location: "All Locations",
                          relationship: "All Relationships",
                          recentlyAdded: false,
                          onlineOnly: false,
                        })
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Find Friends
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

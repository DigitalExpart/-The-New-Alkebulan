"use client"

import type { FriendFilters } from "@/types/friends"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { communityOptions, relationshipOptions, locationOptions } from "@/data/friends-data"
import { Filter, Users, MapPin, Heart, Clock, Wifi } from "lucide-react"

interface FriendsFiltersProps {
  filters: FriendFilters
  onFiltersChange: (filters: FriendFilters) => void
  friendsCount: number
}

export function FriendsFilters({ filters, onFiltersChange, friendsCount }: FriendsFiltersProps) {
  const updateFilter = (key: keyof FriendFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const activeFiltersCount = [
    filters.community !== "All Communities",
    filters.location !== "All Locations",
    filters.relationship !== "All Relationships",
    filters.recentlyAdded,
    filters.onlineOnly,
  ].filter(Boolean).length

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Results count */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{friendsCount} friends found</span>
        </div>

        {/* Community filter */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Community</span>
          </Label>
          <Select value={filters.community} onValueChange={(value) => updateFilter("community", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {communityOptions.map((community) => (
                <SelectItem key={community} value={community}>
                  {community}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location filter */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </Label>
          <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Relationship filter */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Relationship</span>
          </Label>
          <Select value={filters.relationship} onValueChange={(value) => updateFilter("relationship", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {relationshipOptions.map((relationship) => (
                <SelectItem key={relationship} value={relationship}>
                  {relationship === "All Relationships"
                    ? relationship
                    : relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recently added toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="recently-added" className="flex items-center space-x-2 cursor-pointer">
            <Clock className="w-4 h-4" />
            <span>Recently Added</span>
          </Label>
          <Switch
            id="recently-added"
            checked={filters.recentlyAdded}
            onCheckedChange={(checked) => updateFilter("recentlyAdded", checked)}
          />
        </div>

        {/* Online only toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="online-only" className="flex items-center space-x-2 cursor-pointer">
            <Wifi className="w-4 h-4" />
            <span>Online Only</span>
          </Label>
          <Switch
            id="online-only"
            checked={filters.onlineOnly}
            onCheckedChange={(checked) => updateFilter("onlineOnly", checked)}
          />
        </div>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={() =>
              onFiltersChange({
                searchQuery: filters.searchQuery,
                community: "All Communities",
                location: "All Locations",
                relationship: "All Relationships",
                recentlyAdded: false,
                onlineOnly: false,
              })
            }
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all filters
          </button>
        )}
      </CardContent>
    </Card>
  )
}

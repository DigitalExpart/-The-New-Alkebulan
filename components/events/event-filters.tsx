"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, MapPin, CalendarIcon, Users, X, ChevronDown, ChevronUp } from "lucide-react"
import type { EventFilters } from "@/types/events"
import { eventCategories, dateRangeOptions, sortOptions } from "@/data/events-data"
import { format } from "date-fns"

interface EventFiltersProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  onClearFilters: () => void
}

export function EventFiltersComponent({ filters, onFiltersChange, onClearFilters }: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [customDateStart, setCustomDateStart] = useState<Date>()
  const [customDateEnd, setCustomDateEnd] = useState<Date>()

  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = () => {
    return (
      filters.location !== "" ||
      filters.dateRange !== "week" ||
      filters.category !== "all" ||
      filters.communities.length > 0 ||
      filters.friendsAttending
    )
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.location) count++
    if (filters.dateRange !== "week") count++
    if (filters.category !== "all") count++
    if (filters.communities.length > 0) count++
    if (filters.friendsAttending) count++
    return count
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort by</Label>
          <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter("sortBy", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            placeholder="Enter city or country..."
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Date Range
          </Label>
          <Select value={filters.dateRange} onValueChange={(value: any) => updateFilter("dateRange", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filters.dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                    {customDateStart ? format(customDateStart, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customDateStart} onSelect={setCustomDateStart} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                    {customDateEnd ? format(customDateEnd, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customDateEnd} onSelect={setCustomDateEnd} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <>
            {/* Friends Attending */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Friends attending
              </Label>
              <Switch
                checked={filters.friendsAttending}
                onCheckedChange={(checked) => updateFilter("friendsAttending", checked)}
              />
            </div>

            {/* My Communities Only */}
            <div className="flex items-center justify-between">
              <Label>My communities only</Label>
              <Switch
                checked={filters.communities.length > 0}
                onCheckedChange={(checked) => updateFilter("communities", checked ? ["my-communities"] : [])}
              />
            </div>
          </>
        )}

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-1">
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.location}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("location", "")} />
                </Badge>
              )}
              {filters.category !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {eventCategories.find((c) => c.value === filters.category)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("category", "all")} />
                </Badge>
              )}
              {filters.friendsAttending && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Friends attending
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("friendsAttending", false)} />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

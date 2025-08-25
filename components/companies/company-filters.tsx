"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Star } from "lucide-react"
import type { CompanyFilters as CompanyFiltersType } from "@/types/company"

interface CompanyFiltersProps {
  filters: CompanyFiltersType
  onFiltersChange: (filters: CompanyFiltersType) => void
  industries: string[]
  locations: string[]
}

const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"]

export function CompanyFilters({ filters, onFiltersChange, industries, locations }: CompanyFiltersProps) {
  const updateFilter = (key: keyof CompanyFiltersType, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      industry: "",
      location: "",
      size: "",
      featured: false,
    })
  }

  const hasActiveFilters = filters.search || filters.industry || filters.location || filters.size || filters.featured

  return (
    <Card className="dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/20 mb-8 bg-card shadow-sm shadow-outline">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 dark:text-green-100" />
            <Input
              placeholder="Search companies, descriptions, or tags..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-green-100 focus:border-yellow-400"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 dark:text-white">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Industry Filter */}
            <Select value={filters.industry} onValueChange={(value) => updateFilter("industry", value)}>
              <SelectTrigger className="w-[180px] dark:bg-white/10 dark:border-white/20 dark:text-white">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allIndustries">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
              <SelectTrigger className="w-[180px] dark:bg-white/10 dark:border-white/20 dark:text-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allLocations">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Size Filter */}
            <Select value={filters.size} onValueChange={(value) => updateFilter("size", value)}>
              <SelectTrigger className="w-[180px] dark:bg-white/10 dark:border-white/20 dark:text-white">
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allSizes">All Sizes</SelectItem>
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Featured Toggle */}
            <Button
              variant={filters.featured ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("featured", !filters.featured)}
              className={
                filters.featured
                  ? "bg-yellow-400 hover:bg-yellow-500 text-green-900"
                  : "dark:bg-white/10 dark:border-white/20 dark:text-white hover:bg-white/20"
              }
            >
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/10">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="dark:bg-yellow-400/20 bg-dark-border text-yellow-400 border-yellow-400/30">
                  Search: "{filters.search}"
                  <button onClick={() => updateFilter("search", "")} className="ml-1 hover:text-yellow-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.industry && (
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                  Industry: {filters.industry}
                  <button onClick={() => updateFilter("industry", "")} className="ml-1 hover:text-yellow-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                  Location: {filters.location}
                  <button onClick={() => updateFilter("location", "")} className="ml-1 hover:text-yellow-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.size && (
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                  Size: {filters.size}
                  <button onClick={() => updateFilter("size", "")} className="ml-1 hover:text-yellow-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

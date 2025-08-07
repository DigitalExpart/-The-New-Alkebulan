"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { projectCategories, projectRegions, projectStatuses } from "@/data/projects-data"
import type { ProjectFilters, ProjectSortBy } from "@/types/project"

interface ProjectFiltersComponentProps {
  filters: ProjectFilters
  sortBy: ProjectSortBy
  onFiltersChange: (filters: ProjectFilters) => void
  onSortChange: (sortBy: ProjectSortBy) => void
  onClearFilters: () => void
  resultsCount: number
}

const availableTags = [
  "Innovation",
  "Technology",
  "Mentorship",
  "Startup",
  "Heritage",
  "Culture",
  "Archive",
  "Community",
  "Healthcare",
  "Telemedicine",
  "Global",
  "Renewable Energy",
  "Sustainability",
  "Investment",
  "Education",
  "Youth",
  "Development",
  "Real Estate",
  "Fund",
]

export function ProjectFiltersComponent({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  resultsCount,
}: ProjectFiltersComponentProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value as any })
  }

  const handleRegionChange = (value: string) => {
    onFiltersChange({ ...filters, region: value as any })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as any })
  }

  const handleTeamSizeChange = (value: string) => {
    onFiltersChange({ ...filters, teamSize: value as any })
  }

  const handleImpactScaleChange = (value: string) => {
    onFiltersChange({ ...filters, impactScale: value as any })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category !== "All") count++
    if (filters.region !== "All") count++
    if (filters.status !== "All") count++
    if (filters.teamSize !== "Any") count++
    if (filters.impactScale !== "Any") count++
    if (filters.tags && filters.tags.length > 0) count++
    return count
  }

  return (
    <div className="space-y-6">
      {/* Results Count and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {resultsCount} project{resultsCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort" className="text-sm">
            Sort by:
          </Label>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as ProjectSortBy)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Most Viewed">Most Viewed</SelectItem>
              <SelectItem value="Newest">Newest</SelectItem>
              <SelectItem value="Top Rated">Top Rated</SelectItem>
              <SelectItem value="Ending Soon">Ending Soon</SelectItem>
              <SelectItem value="Most Funded">Most Funded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {projectCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="region">Region</Label>
          <Select value={filters.region} onValueChange={handleRegionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Regions</SelectItem>
              {projectRegions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {projectStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </span>
            {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Team Size Filter */}
          <div>
            <Label>Team Size</Label>
            <Select value={filters.teamSize} onValueChange={handleTeamSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any Size</SelectItem>
                <SelectItem value="Small (1-5)">Small (1-5)</SelectItem>
                <SelectItem value="Medium (6-15)">Medium (6-15)</SelectItem>
                <SelectItem value="Large (16+)">Large (16+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Impact Scale Filter */}
          <div>
            <Label>Impact Scale</Label>
            <Select value={filters.impactScale} onValueChange={handleImpactScaleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select impact scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any Scale</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags?.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {filters.tags?.includes(tag) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearchChange("")} />
            </Badge>
          )}
          {filters.category !== "All" && (
            <Badge variant="secondary" className="gap-1">
              {projectCategories.find((c) => c.value === filters.category)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("All")} />
            </Badge>
          )}
          {filters.region !== "All" && (
            <Badge variant="secondary" className="gap-1">
              {projectRegions.find((r) => r.value === filters.region)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRegionChange("All")} />
            </Badge>
          )}
          {filters.status !== "All" && (
            <Badge variant="secondary" className="gap-1">
              {projectStatuses.find((s) => s.value === filters.status)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleStatusChange("All")} />
            </Badge>
          )}
          {filters.teamSize !== "Any" && (
            <Badge variant="secondary" className="gap-1">
              {filters.teamSize}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleTeamSizeChange("Any")} />
            </Badge>
          )}
          {filters.impactScale !== "Any" && (
            <Badge variant="secondary" className="gap-1">
              {filters.impactScale}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleImpactScaleChange("Any")} />
            </Badge>
          )}
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

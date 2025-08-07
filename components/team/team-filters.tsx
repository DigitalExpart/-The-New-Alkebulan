"use client"

import { useState } from "react"
import type { TeamFilters } from "@/types/team"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"
import { skillsets, availabilityOptions, locationOptions, areaOptions } from "@/data/team-roles"

interface TeamFiltersProps {
  filters: TeamFilters
  onFiltersChange: (filters: TeamFilters) => void
  isOpen: boolean
  onToggle: () => void
}

export function TeamFiltersComponent({ filters, onFiltersChange, isOpen, onToggle }: TeamFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TeamFilters>(filters)

  const handleFilterChange = (category: keyof TeamFilters, value: string, checked: boolean) => {
    const newFilters = { ...localFilters }
    if (checked) {
      newFilters[category] = [...newFilters[category], value]
    } else {
      newFilters[category] = newFilters[category].filter((item) => item !== value)
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const emptyFilters: TeamFilters = {
      skillset: [],
      availability: [],
      location: [],
      areaOfInterest: [],
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count, filterArray) => count + filterArray.length, 0)
  }

  const FilterSection = ({
    title,
    options,
    category,
  }: {
    title: string
    options: string[]
    category: keyof TeamFilters
  }) => (
    <div className="space-y-3">
      <h4 className="text-foreground font-semibold text-sm">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${category}-${option}`}
              checked={localFilters[category].includes(option)}
              onCheckedChange={(checked) => handleFilterChange(category, option, checked as boolean)}
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor={`${category}-${option}`}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full justify-between bg-card border-border text-foreground hover:bg-muted"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {getActiveFilterCount()}
              </Badge>
            )}
          </span>
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <Card className="bg-card border-border sticky top-24">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground text-lg">Filters</CardTitle>
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            {getActiveFilterCount() > 0 && (
              <div className="text-sm text-muted-foreground">
                {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? "s" : ""} active
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <FilterSection title="Area of Interest" options={areaOptions} category="areaOfInterest" />

            <FilterSection title="Availability" options={availabilityOptions} category="availability" />

            <FilterSection title="Location" options={locationOptions} category="location" />

            <FilterSection
              title="Key Skills"
              options={skillsets.slice(0, 10)} // Show top 10 skills
              category="skillset"
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

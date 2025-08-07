"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, MapPin, Star, DollarSign } from "lucide-react"
import type { MentalHealthFilters } from "@/types/mental-health"
import { professionalTypes, specializations, languages } from "@/data/mental-health-data"

interface MentalHealthFiltersProps {
  filters: MentalHealthFilters
  onFiltersChange: (filters: MentalHealthFilters) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function MentalHealthFiltersComponent({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: MentalHealthFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (key: keyof MentalHealthFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (
    key: "professionalType" | "specializations" | "languages" | "availability",
    value: string,
  ) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateFilters(key, newArray)
  }

  const clearFilters = () => {
    onFiltersChange({
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
    onSearchChange("")
  }

  const activeFiltersCount =
    filters.professionalType.length +
    filters.specializations.length +
    filters.languages.length +
    filters.availability.length +
    (filters.location ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice < 200 ? 1 : 0) +
    (filters.verified ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="search"
          placeholder="Search by name, specialization, or approach..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 focus:border-blue-300"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 hover:from-blue-100 hover:to-green-100"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-900">Filter Mental Health Professionals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Professional Type */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-3 block">Professional Type</Label>
              <div className="flex flex-wrap gap-2">
                {professionalTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={filters.professionalType.includes(type) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      filters.professionalType.includes(type)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }`}
                    onClick={() => toggleArrayFilter("professionalType", type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-3 block">Specializations</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {specializations.map((spec) => (
                  <Badge
                    key={spec}
                    variant={filters.specializations.includes(spec) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      filters.specializations.includes(spec)
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "border-green-200 text-green-700 hover:bg-green-50"
                    }`}
                    onClick={() => toggleArrayFilter("specializations", spec)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-3 block">Languages Spoken</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant={filters.languages.includes(lang) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      filters.languages.includes(lang)
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-purple-200 text-purple-700 hover:bg-purple-50"
                    }`}
                    onClick={() => toggleArrayFilter("languages", lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-3 block">Availability</Label>
              <div className="flex flex-wrap gap-2">
                {["online", "in-person", "both"].map((avail) => (
                  <Badge
                    key={avail}
                    variant={filters.availability.includes(avail) ? "default" : "outline"}
                    className={`cursor-pointer transition-all capitalize ${
                      filters.availability.includes(avail)
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "border-teal-200 text-teal-700 hover:bg-teal-50"
                    }`}
                    onClick={() => toggleArrayFilter("availability", avail)}
                  >
                    {avail === "both" ? "Online & In-Person" : avail.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-blue-900 mb-2 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Enter city, country, or region..."
                value={filters.location}
                onChange={(e) => updateFilters("location", e.target.value)}
                className="border-blue-200 focus:border-blue-300"
              />
            </div>

            {/* Rating */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-2 block">
                <Star className="w-4 h-4 inline mr-1" />
                Minimum Rating: {filters.minRating}/5
              </Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => updateFilters("minRating", value[0])}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-2 block">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Maximum Price: ${filters.maxPrice}/hour
              </Label>
              <Slider
                value={[filters.maxPrice]}
                onValueChange={(value) => updateFilters("maxPrice", value[0])}
                max={200}
                min={20}
                step={10}
                className="w-full"
              />
            </div>

            {/* Verified Only */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => updateFilters("verified", checked)}
                className="border-blue-300 data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="verified" className="text-sm text-blue-900">
                Show only verified professionals
              </Label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

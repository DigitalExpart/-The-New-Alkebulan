"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, X, MapPin, Star, DollarSign, Shield } from "lucide-react"
import type { MentorshipFilters, SortOption } from "@/types/mentorship"
import { specializationOptions, languageOptions } from "@/data/mentors"

interface MentorFiltersProps {
  filters: MentorshipFilters
  onFiltersChange: (filters: MentorshipFilters) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  isCollapsed?: boolean
}

export function MentorFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  isCollapsed = false,
}: MentorFiltersProps) {
  const [openSections, setOpenSections] = useState({
    specialization: true,
    language: true,
    location: true,
    rating: true,
    price: true,
    other: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const updateFilters = (updates: Partial<MentorshipFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const addSpecialization = (spec: string) => {
    if (!filters.specializations.includes(spec)) {
      updateFilters({
        specializations: [...filters.specializations, spec],
      })
    }
  }

  const removeSpecialization = (spec: string) => {
    updateFilters({
      specializations: filters.specializations.filter((s) => s !== spec),
    })
  }

  const addLanguage = (lang: string) => {
    if (!filters.languages.includes(lang)) {
      updateFilters({
        languages: [...filters.languages, lang],
      })
    }
  }

  const removeLanguage = (lang: string) => {
    updateFilters({
      languages: filters.languages.filter((l) => l !== lang),
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      specializations: [],
      languages: [],
      location: "",
      maxDistance: 10000,
      minRating: 0,
      availability: [],
      priceRange: [0, 500],
      isVerified: false,
    })
  }

  const sortOptions = [
    { value: "topRated", label: "Top Rated" },
    { value: "mostActive", label: "Most Active" },
    { value: "closest", label: "Closest to Me" },
    { value: "newest", label: "Newest" },
    { value: "priceAsc", label: "Price: Low to High" },
    { value: "priceDesc", label: "Price: High to Low" },
  ]

  return (
    <Card className={`${isCollapsed ? "w-full" : "w-80"} h-fit`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        </div>

        {/* Sort Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort by</Label>
          <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialization Filter */}
        <Collapsible open={openSections.specialization} onOpenChange={() => toggleSection("specialization")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">Specialization</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${openSections.specialization ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <Select onValueChange={addSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializationOptions
                  .filter((spec) => !filters.specializations.includes(spec))
                  .map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {filters.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeSpecialization(spec)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Language Filter */}
        <Collapsible open={openSections.language} onOpenChange={() => toggleSection("language")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <span className="font-medium">Languages</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.language ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <Select onValueChange={addLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions
                  .filter((lang) => !filters.languages.includes(lang))
                  .map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {filters.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                    <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => removeLanguage(lang)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Location Filter */}
        <Collapsible open={openSections.location} onOpenChange={() => toggleSection("location")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.location ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <Label className="text-sm">Location</Label>
              <Input
                placeholder="Enter city or country"
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm">
                Max Distance: {filters.maxDistance === 10000 ? "Any" : `${filters.maxDistance} km`}
              </Label>
              <Slider
                value={[filters.maxDistance]}
                onValueChange={([value]) => updateFilters({ maxDistance: value })}
                max={10000}
                min={0}
                step={100}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating Filter */}
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection("rating")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">Minimum Rating</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.rating ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <Label className="text-sm">Minimum Rating: {filters.minRating} stars</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => updateFilters({ minRating: value })}
                max={5}
                min={0}
                step={0.5}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Price Filter */}
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection("price")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Price Range</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <Label className="text-sm">
                Price: ${filters.priceRange[0]} - ${filters.priceRange[1]} per hour
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                max={500}
                min={0}
                step={10}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Other Filters */}
        <Collapsible open={openSections.other} onOpenChange={() => toggleSection("other")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Other</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.other ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.isVerified}
                onCheckedChange={(checked) => updateFilters({ isVerified: !!checked })}
              />
              <Label htmlFor="verified" className="text-sm">
                Verified mentors only
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  MapPin,
  Users,
  Globe,
  Languages,
  History,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Info,
} from "lucide-react"
import { tribes, filterOptions } from "@/data/regions-tribes-data"
import type { Tribe, SearchFilters } from "@/types/regions-tribes"

export default function RegionsTribesPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    selectedCountries: [],
    selectedLanguageFamilies: [],
    selectedPopulationRange: "",
    selectedDiasporaRange: "",
    selectedCulturalZones: [],
  })

  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null)
  const [hoveredTribe, setHoveredTribe] = useState<Tribe | null>(null)
  const [mapView, setMapView] = useState<"overview" | "detailed">("overview")

  // Filter tribes based on search criteria
  const filteredTribes = useMemo(() => {
    return tribes.filter((tribe) => {
      // Search term filter
      if (searchFilters.searchTerm) {
        const searchLower = searchFilters.searchTerm.toLowerCase()
        const matchesSearch =
          tribe.name.toLowerCase().includes(searchLower) ||
          tribe.region.toLowerCase().includes(searchLower) ||
          tribe.country.some((c) => c.toLowerCase().includes(searchLower)) ||
          tribe.languages.some((l) => l.toLowerCase().includes(searchLower)) ||
          tribe.languageFamily.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Country filter
      if (searchFilters.selectedCountries.length > 0) {
        const hasMatchingCountry = tribe.country.some((country) => searchFilters.selectedCountries.includes(country))
        if (!hasMatchingCountry) return false
      }

      // Language family filter
      if (searchFilters.selectedLanguageFamilies.length > 0) {
        if (!searchFilters.selectedLanguageFamilies.includes(tribe.languageFamily)) {
          return false
        }
      }

      // Population range filter
      if (searchFilters.selectedPopulationRange) {
        const range = filterOptions.populationRanges.find((r) => r.label === searchFilters.selectedPopulationRange)
        if (range && (tribe.population < range.min || tribe.population > range.max)) {
          return false
        }
      }

      // Diaspora range filter
      if (searchFilters.selectedDiasporaRange) {
        const range = filterOptions.diasporaRanges.find((r) => r.label === searchFilters.selectedDiasporaRange)
        if (range && (tribe.diaspora < range.min || tribe.diaspora > range.max)) {
          return false
        }
      }

      // Cultural zone filter
      if (searchFilters.selectedCulturalZones.length > 0) {
        if (!searchFilters.selectedCulturalZones.includes(tribe.culturalZone)) {
          return false
        }
      }

      return true
    })
  }, [searchFilters])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  const clearFilters = () => {
    setSearchFilters({
      searchTerm: "",
      selectedCountries: [],
      selectedLanguageFamilies: [],
      selectedPopulationRange: "",
      selectedDiasporaRange: "",
      selectedCulturalZones: [],
    })
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">African Regions & Tribes</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Explore the rich diversity of African ethnic groups, their traditional territories, languages, and cultural
            heritage. Connect with diaspora communities worldwide.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter Tribes
            </CardTitle>
            <CardDescription>Find tribes by name, region, language, or cultural characteristics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by tribe name, region, language, or country..."
                value={searchFilters.searchTerm}
                onChange={(e) => setSearchFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={searchFilters.selectedCountries[0] || ""}
                onValueChange={(value) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    selectedCountries: value ? [value] : [],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={searchFilters.selectedLanguageFamilies[0] || ""}
                onValueChange={(value) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    selectedLanguageFamilies: value ? [value] : [],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Language Family" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.languageFamilies.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={searchFilters.selectedPopulationRange}
                onValueChange={(value) => setSearchFilters((prev) => ({ ...prev, selectedPopulationRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Population Size" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.populationRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={searchFilters.selectedDiasporaRange}
                onValueChange={(value) => setSearchFilters((prev) => ({ ...prev, selectedDiasporaRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Diaspora Size" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.diasporaRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={searchFilters.selectedCulturalZones[0] || ""}
                onValueChange={(value) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    selectedCulturalZones: value ? [value] : [],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cultural Zone" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.culturalZones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters and Clear Button */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {searchFilters.searchTerm && <Badge variant="secondary">Search: {searchFilters.searchTerm}</Badge>}
                {searchFilters.selectedCountries.map((country) => (
                  <Badge key={country} variant="secondary">
                    Country: {country}
                  </Badge>
                ))}
                {searchFilters.selectedLanguageFamilies.map((family) => (
                  <Badge key={family} variant="secondary">
                    Language: {family}
                  </Badge>
                ))}
                {searchFilters.selectedPopulationRange && (
                  <Badge variant="secondary">Population: {searchFilters.selectedPopulationRange}</Badge>
                )}
                {searchFilters.selectedDiasporaRange && (
                  <Badge variant="secondary">Diaspora: {searchFilters.selectedDiasporaRange}</Badge>
                )}
                {searchFilters.selectedCulturalZones.map((zone) => (
                  <Badge key={zone} variant="secondary">
                    Zone: {zone}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear All
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredTribes.length} of {tribes.length} tribes
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Interactive African Map
            </CardTitle>
            <CardDescription>Explore tribal regions across Africa. Hover over regions for details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted rounded-lg p-8 min-h-[500px] flex items-center justify-center">
              {/* Simplified Map Representation */}
              <div className="relative w-full max-w-2xl">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Africa - Tribal Regions</h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive map showing traditional tribal territories
                  </p>
                </div>

                {/* Map Grid with Tribal Regions */}
                <div className="grid grid-cols-3 gap-2 aspect-square max-w-md mx-auto">
                  {filteredTribes.slice(0, 9).map((tribe, index) => (
                    <div
                      key={tribe.id}
                      className="relative border-2 border-border rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      style={{ backgroundColor: `${tribe.colorCode}20` }}
                      onMouseEnter={() => setHoveredTribe(tribe)}
                      onMouseLeave={() => setHoveredTribe(null)}
                      onClick={() => setSelectedTribe(tribe)}
                    >
                      <div className="text-xs font-medium text-center">{tribe.name}</div>
                      <div className="text-xs text-muted-foreground text-center mt-1">{tribe.region}</div>
                    </div>
                  ))}
                </div>

                {/* Hover Tooltip */}
                {hoveredTribe && (
                  <div className="absolute top-4 right-4 bg-popover border border-border rounded-lg p-4 shadow-lg max-w-xs z-10">
                    <h4 className="font-semibold text-sm mb-2">{hoveredTribe.name}</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Languages className="w-3 h-3" />
                        <span>{hoveredTribe.languages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>Population: {formatNumber(hoveredTribe.population)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span>Diaspora: {formatNumber(hoveredTribe.diaspora)}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-2 bg-transparent" variant="outline">
                      Explore More
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tribes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTribes.map((tribe) => (
            <Card key={tribe.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tribe.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {tribe.region} • {tribe.country.join(", ")}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${tribe.colorCode}20`, color: tribe.colorCode }}
                  >
                    {tribe.culturalZone}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{tribe.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{formatNumber(tribe.population)}</div>
                      <div className="text-xs text-muted-foreground">Population</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{formatNumber(tribe.diaspora)}</div>
                      <div className="text-xs text-muted-foreground">Diaspora</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">{tribe.languages.join(", ")}</div>
                    <div className="text-xs text-muted-foreground">{tribe.languageFamily} family</div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedTribe(tribe)}>
                      <Info className="w-4 h-4 mr-2" />
                      Explore More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {tribe.name}
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: `${tribe.colorCode}20`, color: tribe.colorCode }}
                        >
                          {tribe.culturalZone}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        {tribe.region} • {tribe.country.join(", ")}
                      </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh]">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                          <TabsTrigger value="culture">Culture</TabsTrigger>
                          <TabsTrigger value="diaspora">Diaspora</TabsTrigger>
                          <TabsTrigger value="connect">Connect</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold">{formatNumber(tribe.population)}</div>
                                <div className="text-sm text-muted-foreground">Population</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold">{formatNumber(tribe.diaspora)}</div>
                                <div className="text-sm text-muted-foreground">Diaspora</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <Languages className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold">{tribe.languages.length}</div>
                                <div className="text-sm text-muted-foreground">Languages</div>
                              </CardContent>
                            </Card>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{tribe.description}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {tribe.languages.map((language) => (
                                <Badge key={language} variant="outline">
                                  {language}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Language Family: {tribe.languageFamily}
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <History className="w-4 h-4" />
                              Historical Background
                            </h4>
                            <p className="text-sm text-muted-foreground">{tribe.history}</p>
                          </div>
                        </TabsContent>

                        <TabsContent value="culture" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Traditions</h4>
                              <ul className="space-y-1">
                                {tribe.traditions.map((tradition, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    {tradition}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Customs</h4>
                              <ul className="space-y-1">
                                {tribe.customs.map((custom, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    {custom}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Cultural Symbols</h4>
                            <div className="flex flex-wrap gap-2">
                              {tribe.symbols.map((symbol) => (
                                <Badge key={symbol} variant="outline">
                                  {symbol}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="diaspora" className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-4">Global Diaspora Locations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {tribe.diasporaLocations.map((location, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h5 className="font-medium">
                                          {location.city}, {location.country}
                                        </h5>
                                        <p className="text-sm text-muted-foreground">
                                          Population: {formatNumber(location.population)}
                                        </p>
                                      </div>
                                      <MapPin className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    {location.communityCenter && (
                                      <p className="text-sm text-muted-foreground">
                                        Community Center: {location.communityCenter}
                                      </p>
                                    )}
                                    {location.contactInfo && (
                                      <p className="text-sm text-muted-foreground">Contact: {location.contactInfo}</p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="connect" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Community Forums
                              </h4>
                              <div className="space-y-3">
                                {tribe.forums.map((forum) => (
                                  <Card key={forum.id}>
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h5 className="font-medium">{forum.name}</h5>
                                          <p className="text-sm text-muted-foreground">{forum.description}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          {formatNumber(forum.memberCount)} members
                                        </span>
                                        <span className="text-muted-foreground">Active {forum.lastActivity}</span>
                                      </div>
                                      <Button size="sm" className="w-full mt-2 bg-transparent" variant="outline">
                                        Join Forum
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Local Chapters
                              </h4>
                              <div className="space-y-3">
                                {tribe.localChapters.map((chapter) => (
                                  <Card key={chapter.id}>
                                    <CardContent className="p-4">
                                      <div className="mb-2">
                                        <h5 className="font-medium">{chapter.name}</h5>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {chapter.location}
                                        </p>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-3 h-3 text-muted-foreground" />
                                          <span>{chapter.memberCount} members</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-3 h-3 text-muted-foreground" />
                                          <span>{chapter.email}</span>
                                        </div>
                                        {chapter.phone && (
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <span>{chapter.phone}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-3 h-3 text-muted-foreground" />
                                          <span>{chapter.meetingSchedule}</span>
                                        </div>
                                      </div>
                                      <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Activities:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {chapter.activities.map((activity) => (
                                            <Badge key={activity} variant="outline" className="text-xs">
                                              {activity}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <Button size="sm" className="w-full mt-3 bg-transparent" variant="outline">
                                        Contact Chapter
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {filteredTribes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tribes found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or clearing the filters</p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

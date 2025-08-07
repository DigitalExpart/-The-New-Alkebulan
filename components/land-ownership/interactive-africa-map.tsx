"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ZoomIn, ZoomOut, Locate, MapPinIcon, Layers, Maximize, Navigation, Info, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MapLocation {
  id: string
  name: string
  country: string
  coordinates: [number, number]
  type: "country" | "city" | "landmark"
  population?: number
  description?: string
}

const AFRICAN_LOCATIONS: MapLocation[] = [
  // Countries (capitals)
  { id: "egypt", name: "Cairo", country: "Egypt", coordinates: [30.0444, 31.2357], type: "city", population: 20900000 },
  {
    id: "nigeria",
    name: "Lagos",
    country: "Nigeria",
    coordinates: [6.5244, 3.3792],
    type: "city",
    population: 15000000,
  },
  {
    id: "kenya",
    name: "Nairobi",
    country: "Kenya",
    coordinates: [-1.2921, 36.8219],
    type: "city",
    population: 4500000,
  },
  {
    id: "south-africa",
    name: "Cape Town",
    country: "South Africa",
    coordinates: [-33.9249, 18.4241],
    type: "city",
    population: 4600000,
  },
  {
    id: "morocco",
    name: "Casablanca",
    country: "Morocco",
    coordinates: [33.5731, -7.5898],
    type: "city",
    population: 3700000,
  },
  { id: "ghana", name: "Accra", country: "Ghana", coordinates: [5.6037, -0.187], type: "city", population: 2300000 },
  {
    id: "ethiopia",
    name: "Addis Ababa",
    country: "Ethiopia",
    coordinates: [9.145, 38.7577],
    type: "city",
    population: 5200000,
  },
  {
    id: "senegal",
    name: "Dakar",
    country: "Senegal",
    coordinates: [14.7167, -17.4677],
    type: "city",
    population: 1200000,
  },
  {
    id: "tanzania",
    name: "Dar es Salaam",
    country: "Tanzania",
    coordinates: [-6.7924, 39.2083],
    type: "city",
    population: 6700000,
  },
  {
    id: "uganda",
    name: "Kampala",
    country: "Uganda",
    coordinates: [0.3476, 32.5825],
    type: "city",
    population: 1700000,
  },

  // Major landmarks
  {
    id: "pyramids",
    name: "Pyramids of Giza",
    country: "Egypt",
    coordinates: [29.9792, 31.1342],
    type: "landmark",
    description: "Ancient Wonder of the World",
  },
  {
    id: "kilimanjaro",
    name: "Mount Kilimanjaro",
    country: "Tanzania",
    coordinates: [-3.0674, 37.3556],
    type: "landmark",
    description: "Highest peak in Africa",
  },
  {
    id: "victoria-falls",
    name: "Victoria Falls",
    country: "Zambia/Zimbabwe",
    coordinates: [-17.9243, 25.8572],
    type: "landmark",
    description: "One of the largest waterfalls in the world",
  },
  {
    id: "table-mountain",
    name: "Table Mountain",
    country: "South Africa",
    coordinates: [-33.9628, 18.4098],
    type: "landmark",
    description: "Iconic flat-topped mountain",
  },
]

interface UserPin {
  id: string
  coordinates: [number, number]
  title: string
  description?: string
  type: "user" | "landmark" | "property"
}

export function InteractiveAfricaMap() {
  const [zoom, setZoom] = useState(4)
  const [center, setCenter] = useState<[number, number]>([0, 20]) // Center of Africa
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [pins, setPins] = useState<UserPin[]>([])
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite" | "terrain">("streets")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number] | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Search functionality
  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = AFRICAN_LOCATIONS.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.country.toLowerCase().includes(searchQuery.toLowerCase()),
      ).slice(0, 5)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Handle coordinate search (e.g., "-1.2921, 36.8219")
  const handleCoordinateSearch = (query: string) => {
    const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/
    const match = query.match(coordPattern)
    if (match) {
      const lat = Number.parseFloat(match[1])
      const lng = Number.parseFloat(match[2])
      if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 55) {
        // Africa bounds
        setCenter([lat, lng])
        setZoom(12)
        addPin([lat, lng], `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      }
    }
  }

  const handleSearch = (location: MapLocation) => {
    setCenter(location.coordinates)
    setZoom(location.type === "country" ? 6 : location.type === "city" ? 10 : 14)
    setSelectedLocation(location)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to lat/lng (simplified calculation)
    const lat = center[0] + (rect.height / 2 - y) * (0.1 / zoom)
    const lng = center[1] + (x - rect.width / 2) * (0.1 / zoom)

    setMouseCoordinates([lat, lng])
    addPin([lat, lng], `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  const addPin = (coordinates: [number, number], title: string, description?: string) => {
    const newPin: UserPin = {
      id: Date.now().toString(),
      coordinates,
      title,
      description,
      type: "user",
    }
    setPins((prev) => [...prev, newPin])
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 1, 18))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 1, 2))

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCenter([latitude, longitude])
          setZoom(12)
          addPin([latitude, longitude], "Your Location", "Current GPS position")
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
      )
    }
  }

  const getMapStyleClass = () => {
    switch (mapStyle) {
      case "satellite":
        return "bg-gradient-to-br from-green-900 via-yellow-800 to-blue-900"
      case "terrain":
        return "bg-gradient-to-br from-green-600 via-yellow-600 to-brown-600"
      default:
        return "bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600"
    }
  }

  return (
    <TooltipProvider>
      <div
        className={`relative ${isFullscreen ? "fixed inset-0 z-50" : "h-[600px]"} bg-white dark:bg-slate-900 rounded-lg overflow-hidden border`}
      >
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by address, city, country, or coordinates (lat, lng)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCoordinateSearch(searchQuery)
                }
              }}
              className="pl-10 pr-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardContent className="p-2">
                  {searchResults.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleSearch(location)}
                    >
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-500">
                          {location.country} • {location.type}
                        </div>
                        {location.population && (
                          <div className="text-xs text-gray-400">
                            Population: {location.population.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary" onClick={() => setIsFullscreen(!isFullscreen)}>
                  <Maximize className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Fullscreen</TooltipContent>
            </Tooltip>

            <Select value={mapStyle} onValueChange={(value: any) => setMapStyle(value)}>
              <SelectTrigger className="w-32">
                <Layers className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="streets">Streets</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary" onClick={zoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary" onClick={zoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary" onClick={locateUser}>
                  <Locate className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Find My Location</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Coordinate Display */}
        {showCoordinates && (
          <div className="absolute bottom-4 left-4 z-10">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardContent className="p-2 text-xs">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3" />
                  <span>
                    Center: {center[0].toFixed(4)}, {center[1].toFixed(4)}
                  </span>
                  <span>•</span>
                  <span>Zoom: {zoom}</span>
                </div>
                {mouseCoordinates && (
                  <div className="text-gray-500 mt-1">
                    Last Click: {mouseCoordinates[0].toFixed(4)}, {mouseCoordinates[1].toFixed(4)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map Canvas */}
        <div
          ref={mapRef}
          className={`w-full h-full cursor-crosshair ${getMapStyleClass()} relative overflow-hidden`}
          onClick={handleMapClick}
          style={{
            backgroundImage:
              zoom > 10 ? "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)" : "none",
            backgroundSize: zoom > 10 ? "20px 20px" : "auto",
          }}
        >
          {/* Africa Continent Outline (Simplified) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 600"
            style={{
              transform: `scale(${zoom / 4}) translate(${400 - center[1] * 10}px, ${300 + center[0] * 10}px)`,
            }}
          >
            {/* Simplified Africa outline */}
            <path
              d="M400 50 L450 80 L480 120 L500 180 L520 240 L540 300 L520 360 L480 420 L440 460 L400 480 L360 460 L320 420 L280 360 L260 300 L280 240 L300 180 L320 120 L350 80 Z"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
            />

            {/* Country borders (simplified) */}
            <g stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none">
              <line x1="320" y1="120" x2="480" y2="120" /> {/* North Africa */}
              <line x1="300" y1="180" x2="500" y2="180" /> {/* Sahel */}
              <line x1="280" y1="240" x2="520" y2="240" /> {/* Central */}
              <line x1="300" y1="300" x2="500" y2="300" /> {/* East-West divide */}
              <line x1="350" y1="50" x2="350" y2="200" /> {/* West */}
              <line x1="450" y1="50" x2="450" y2="200" /> {/* East */}
            </g>
          </svg>

          {/* Location Markers */}
          {AFRICAN_LOCATIONS.map((location) => {
            const isVisible = zoom >= (location.type === "country" ? 4 : location.type === "city" ? 6 : 8)
            if (!isVisible) return null

            const x = 400 + (location.coordinates[1] - center[1]) * zoom * 10
            const y = 300 - (location.coordinates[0] - center[0]) * zoom * 10

            return (
              <Tooltip key={location.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: x, top: y }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedLocation(location)
                    }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        location.type === "landmark"
                          ? "bg-purple-500"
                          : location.type === "city"
                            ? "bg-blue-500"
                            : "bg-green-500"
                      } border-2 border-white shadow-lg`}
                    />
                    {zoom >= 8 && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs">
                          {location.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm">{location.country}</div>
                    {location.population && <div className="text-xs">Pop: {location.population.toLocaleString()}</div>}
                    <div className="text-xs text-gray-400">
                      {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* User Pins */}
          {pins.map((pin) => {
            const x = 400 + (pin.coordinates[1] - center[1]) * zoom * 10
            const y = 300 - (pin.coordinates[0] - center[0]) * zoom * 10

            return (
              <Tooltip key={pin.id}>
                <TooltipTrigger asChild>
                  <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
                    <MapPinIcon className="w-6 h-6 text-red-500 drop-shadow-lg" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <div className="font-medium">{pin.title}</div>
                    {pin.description && <div className="text-sm">{pin.description}</div>}
                    <div className="text-xs text-gray-400">
                      {pin.coordinates[0].toFixed(4)}, {pin.coordinates[1].toFixed(4)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Selected Location Info Panel */}
        {selectedLocation && (
          <Card className="absolute bottom-4 right-4 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedLocation.country}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedLocation(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>
                    {selectedLocation.coordinates[0].toFixed(4)}, {selectedLocation.coordinates[1].toFixed(4)}
                  </span>
                </div>

                {selectedLocation.population && (
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>Population: {selectedLocation.population.toLocaleString()}</span>
                  </div>
                )}

                {selectedLocation.description && (
                  <p className="text-gray-600 dark:text-gray-300">{selectedLocation.description}</p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => addPin(selectedLocation.coordinates, selectedLocation.name)}>
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    Pin Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="absolute top-20 left-4 z-10">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="p-3 text-xs">
              <div className="font-medium mb-1">Map Instructions:</div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Click anywhere to place a pin</li>
                <li>• Search by name or coordinates (lat, lng)</li>
                <li>• Use zoom controls or mouse wheel</li>
                <li>• Click markers for location info</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Users, MapPin, Search, Volume2 } from "lucide-react"
import { tribes, languages } from "@/data/culture-data"

export function LanguagesTribesSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")

  const filteredTribes = tribes.filter((tribe) => {
    const matchesSearch =
      tribe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribe.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribe.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = selectedRegion === "all" || tribe.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  const regions = Array.from(new Set(tribes.map((tribe) => tribe.region)))

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-green-900 dark:text-green-100">Languages & Tribes</h2>
          </div>
          <p className="text-lg text-green-700 dark:text-green-300 max-w-3xl mx-auto">
            Explore the rich diversity of African peoples, their languages, customs, and cultural heritage.
          </p>
        </div>

        <Tabs defaultValue="tribes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tribes" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Tribes & Peoples
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Languages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tribes">
            {/* Search and Filter */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tribes, regions, or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedRegion === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion("all")}
                >
                  All Regions
                </Button>
                {regions.map((region) => (
                  <Button
                    key={region}
                    variant={selectedRegion === region ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRegion(region)}
                  >
                    {region}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tribes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTribes.map((tribe) => (
                <Card
                  key={tribe.id}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-green-900 dark:text-green-100 mb-2">{tribe.name}</CardTitle>
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {tribe.region}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatNumber(tribe.population)} people
                        </Badge>
                      </div>
                      <img
                        src={tribe.image || "/placeholder.svg"}
                        alt={tribe.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-green-700 dark:text-green-300 mb-4">
                      {tribe.description}
                    </CardDescription>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          Traditional Greeting:
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 italic">"{tribe.greeting}"</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Core Values:</div>
                        <div className="flex flex-wrap gap-1">
                          {tribe.values.slice(0, 3).map((value) => (
                            <Badge key={value} variant="secondary" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Countries:</div>
                        <div className="text-sm text-green-600 dark:text-green-400">{tribe.country}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="languages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {languages.map((language) => (
                <Card
                  key={language.id}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-200 dark:border-green-800"
                >
                  <CardHeader>
                    <CardTitle className="text-xl text-green-900 dark:text-green-100 flex items-center justify-between">
                      <div>
                        <div>{language.name}</div>
                        <div className="text-sm font-normal text-green-600 dark:text-green-400">
                          {language.nativeName}
                        </div>
                      </div>
                      <Badge variant="outline">{formatNumber(language.speakers)} speakers</Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          Language Family:
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {language.family}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          Common Greetings:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Hello:</span> {language.greetings.hello}
                          </div>
                          <div>
                            <span className="font-medium">Thank you:</span> {language.greetings.thankYou}
                          </div>
                          <div>
                            <span className="font-medium">Welcome:</span> {language.greetings.welcome}
                          </div>
                          <div>
                            <span className="font-medium">Goodbye:</span> {language.greetings.goodbye}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          Useful Phrases:
                        </div>
                        <div className="space-y-1">
                          {language.phrases.slice(0, 2).map((phrase, index) => (
                            <div key={index} className="text-sm">
                              <span className="italic text-green-600 dark:text-green-400">"{phrase.phrase}"</span>
                              <span className="text-green-700 dark:text-green-300 ml-2">- {phrase.translation}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Spoken in:</div>
                        <div className="flex flex-wrap gap-1">
                          {language.countries.map((country) => (
                            <Badge key={country} variant="outline" className="text-xs">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Heart, Quote, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { proverbs, culturalLeaders, culturalMilestones } from "@/data/culture-data"

export function WisdomLegacySection() {
  const [currentProverbIndex, setCurrentProverbIndex] = useState(0)
  const [favoriteProverbs, setFavoriteProverbs] = useState<string[]>([])

  const nextProverb = () => {
    setCurrentProverbIndex((prev) => (prev + 1) % proverbs.length)
  }

  const prevProverb = () => {
    setCurrentProverbIndex((prev) => (prev - 1 + proverbs.length) % proverbs.length)
  }

  const toggleFavorite = (proverbId: string) => {
    setFavoriteProverbs((prev) =>
      prev.includes(proverbId) ? prev.filter((id) => id !== proverbId) : [...prev, proverbId],
    )
  }

  const currentProverb = proverbs[currentProverbIndex]

  const getCategoryColor = (category: string) => {
    const colors = {
      wisdom: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      life: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      community: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      nature: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      leadership: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      political: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      cultural: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      spiritual: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
      educational: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      artistic: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-purple-900 dark:text-purple-100">Wisdom & Legacy</h2>
          </div>
          <p className="text-lg text-purple-700 dark:text-purple-300 max-w-3xl mx-auto">
            Draw inspiration from ancestral wisdom, visionary leaders, and the rich tapestry of African intellectual
            heritage.
          </p>
        </div>

        <Tabs defaultValue="proverbs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="proverbs" className="flex items-center">
              <Quote className="w-4 h-4 mr-2" />
              Proverbs
            </TabsTrigger>
            <TabsTrigger value="leaders" className="flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Leaders
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proverbs">
            {/* Featured Proverb */}
            <Card className="mb-8 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 border-purple-200 dark:border-purple-800">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevProverb}
                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 dark:text-purple-400 dark:hover:text-purple-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex-1 text-center">
                    <Quote className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <blockquote className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100 mb-4 italic">
                      "{currentProverb.proverb}"
                    </blockquote>
                    <p className="text-lg text-purple-700 dark:text-purple-300 mb-4">{currentProverb.meaning}</p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <Badge className={getCategoryColor(currentProverb.category)}>{currentProverb.category}</Badge>
                      <span className="text-purple-600 dark:text-purple-400">
                        {currentProverb.origin} • {currentProverb.language}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextProverb}
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(currentProverb.id)}
                      className={`${
                        favoriteProverbs.includes(currentProverb.id)
                          ? "text-red-500 hover:text-red-600"
                          : "text-purple-600 hover:text-purple-800"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${favoriteProverbs.includes(currentProverb.id) ? "fill-current" : ""}`}
                      />
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-purple-600 dark:text-purple-400">
                  {currentProverbIndex + 1} of {proverbs.length} proverbs
                </div>
              </CardContent>
            </Card>

            {/* All Proverbs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proverbs.map((proverb, index) => (
                <Card
                  key={proverb.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    index === currentProverbIndex
                      ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/50"
                      : "bg-white/80 dark:bg-gray-900/80"
                  }`}
                  onClick={() => setCurrentProverbIndex(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(proverb.category)} size="sm">
                        {proverb.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(proverb.id)
                        }}
                        className={`p-1 ${favoriteProverbs.includes(proverb.id) ? "text-red-500" : "text-gray-400"}`}
                      >
                        <Heart className={`w-4 h-4 ${favoriteProverbs.includes(proverb.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <blockquote className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2 italic">
                      "{proverb.proverb}"
                    </blockquote>
                    <p className="text-xs text-purple-600 dark:text-purple-400">{proverb.origin}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaders">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {culturalLeaders.map((leader) => (
                <Card
                  key={leader.id}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200 dark:border-purple-800"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img
                        src={leader.image || "/placeholder.svg"}
                        alt={leader.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-xl text-purple-900 dark:text-purple-100">{leader.name}</CardTitle>
                        <CardDescription className="text-purple-600 dark:text-purple-400">
                          {leader.title} • {leader.country}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {leader.era}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <blockquote className="text-sm italic text-purple-700 dark:text-purple-300 mb-4 border-l-4 border-purple-300 pl-4">
                      "{leader.quote}"
                    </blockquote>

                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">{leader.biography}</p>

                    <div className="mb-4">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Key Achievements:</h4>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        {leader.achievements.slice(0, 3).map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-purple-300 dark:bg-purple-700 transform md:-translate-x-1/2" />

              <div className="space-y-8">
                {culturalMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-purple-500 rounded-full transform md:-translate-x-1/2 z-10" />

                    {/* Content */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200 dark:border-purple-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className={getCategoryColor(milestone.category)}>{milestone.category}</Badge>
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {milestone.year > 0 ? milestone.year : `${Math.abs(milestone.year)} BCE`}
                            </span>
                          </div>
                          <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                            {milestone.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">{milestone.description}</p>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            <strong>Significance:</strong> {milestone.significance}
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {milestone.region}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

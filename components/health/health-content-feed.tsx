"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, BookOpen, Headphones, Dumbbell, Star, Eye } from "lucide-react"
import type { HealthContent } from "@/types/health"

interface HealthContentFeedProps {
  content: HealthContent[]
}

export function HealthContentFeed({ content }: HealthContentFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "article":
        return <BookOpen className="h-4 w-4" />
      case "meditation":
        return <Headphones className="h-4 w-4" />
      case "exercise":
        return <Dumbbell className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-700"
      case "article":
        return "bg-blue-100 text-blue-700"
      case "meditation":
        return "bg-purple-100 text-purple-700"
      case "exercise":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredContent =
    selectedCategory === "all" ? content : content.filter((item) => item.category === selectedCategory)

  const categories = ["all", ...Array.from(new Set(content.map((item) => item.category)))]

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="mental">Mental</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getTypeColor(item.type)} flex items-center gap-1`}>
                      {getTypeIcon(item.type)}
                      {item.type}
                    </Badge>
                  </div>
                  {item.difficulty && (
                    <div className="absolute top-2 right-2">
                      <Badge className={getDifficultyColor(item.difficulty)}>{item.difficulty}</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>By {item.author}</span>
                    <span>•</span>
                    <span>{item.duration || item.readTime}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    {item.type === "video" && "Watch Now"}
                    {item.type === "article" && "Read Article"}
                    {item.type === "meditation" && "Start Session"}
                    {item.type === "exercise" && "Begin Workout"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category or check back later for new content.
          </p>
        </div>
      )}
    </div>
  )
}

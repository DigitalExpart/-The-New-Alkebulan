"use client"

import type { LearningItem } from "@/types/learning-hub"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Clock,
  Users,
  Play,
  FileText,
  BookOpen,
  Headphones,
  Video,
  Layers,
  Bookmark,
  BookmarkCheck,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface LearningModuleCardProps {
  item: LearningItem
  onToggleBookmark?: (id: string) => void
  onAddToJourney?: (id: string) => void
}

export function LearningModuleCard({ item, onToggleBookmark, onAddToJourney }: LearningModuleCardProps) {
  const getIcon = () => {
    switch (item.type) {
      case "course":
        return Play
      case "article":
        return FileText
      case "book":
        return BookOpen
      case "audio":
        return Headphones
      case "video":
        return Video
      case "program":
        return Layers
      default:
        return BookOpen
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getContentDetails = () => {
    const details = []
    if (item.duration) details.push(formatDuration(item.duration))
    if (item.lessons) details.push(`${item.lessons} lessons`)
    if (item.pages) details.push(`${item.pages} pages`)
    if (item.episodes) details.push(`${item.episodes} episodes`)
    return details.join(" • ")
  }

  const getAudienceCount = () => {
    if (item.students) return item.students
    if (item.readers) return item.readers
    if (item.listeners) return item.listeners
    return item.views
  }

  const Icon = getIcon()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-green-800 border-green-200 dark:border-green-700">
      <div className="aspect-video relative overflow-hidden">
        <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {item.format}
          </Badge>
          {item.price === 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Free
            </Badge>
          )}
          {item.featured && <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={() => onToggleBookmark?.(item.id)}
            title={item.bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {item.bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={() => onAddToJourney?.(item.id)}
            title="Add to My Journey"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">{item.category}</Badge>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{item.rating}</span>
          </div>
        </div>
        <CardTitle className="line-clamp-2">{item.title}</CardTitle>
        <CardDescription className="line-clamp-3">{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar (if in progress) */}
        {item.progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-2" />
          </div>
        )}

        {/* Content Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {getContentDetails() && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{getContentDetails()}</span>
            </div>
          )}
        </div>

        {/* Instructor/Author */}
        <div className="text-sm">
          <span className="text-muted-foreground">by </span>
          <span className="font-medium">{item.instructor || item.author || item.host}</span>
        </div>

        {/* Students/Readers/Listeners */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{getAudienceCount().toLocaleString()}</span>
          <span>
            {item.students && "students"}
            {item.readers && "readers"}
            {item.listeners && "listeners"}
            {!item.students && !item.readers && !item.listeners && "views"}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-2xl font-bold">{item.price === 0 ? "Free" : `$${item.price}`}</div>
          <Link
            href={
              item.type === "course"
                ? `/learning/${item.id}`
                : item.type === "article" || item.type === "book" || item.type === "video" || item.type === "program"
                  ? `/learning/library/${item.id}`
                  : `/learning/${item.id}`
            }
          >
            <Button size="sm">{item.progress > 0 ? "Continue" : "Start Learning"}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

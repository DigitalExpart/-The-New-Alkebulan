"use client"

import type { LearningItem } from "@/types/learning-hub"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Eye,
  Clock,
  BookOpen,
  Video,
  FileText,
  Layers,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  Play,
  Headphones,
  Users,
  Plus,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface LearningItemCardProps {
  item: LearningItem
  onToggleBookmark?: (id: string) => void
  onAddToJourney?: (id: string) => void
}

export function LearningItemCard({ item, onToggleBookmark, onAddToJourney }: LearningItemCardProps) {
  const getTypeIcon = () => {
    switch (item.type) {
      case "article":
        return <FileText className="h-4 w-4" />
      case "book":
        return <BookOpen className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "course":
        return <Play className="h-4 w-4" />
      case "audio":
        return <Headphones className="h-4 w-4" />
      case "program":
        return <Layers className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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

  const getContentStats = () => {
    if (item.lessons) return `${item.lessons} lessons`
    if (item.pages) return `${item.pages} pages`
    if (item.episodes) return `${item.episodes} episodes`
    return null
  }

  const getAudienceCount = () => {
    if (item.students) return `${item.students.toLocaleString()} students`
    if (item.readers) return `${item.readers.toLocaleString()} readers`
    if (item.listeners) return `${item.listeners.toLocaleString()} listeners`
    return `${item.views.toLocaleString()} views`
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 simple-card">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {item.featured && <Badge className="absolute top-2 left-2 simple-button">Featured</Badge>}
          {item.userHasSeen && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
          <Badge className="absolute bottom-2 left-2 badge-simple">
            <span className="flex items-center gap-1">
              {getTypeIcon()}
              {item.format}
            </span>
          </Badge>
          {item.duration && (
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(item.duration)}
            </Badge>
          )}
          {item.price > 0 && <Badge className="absolute top-2 right-12 simple-button">${item.price}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-agrandir-semibold text-lg text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-300 mt-1">by {item.author || item.instructor || item.host}</p>
          </div>

          <p className="text-sm text-gray-400 line-clamp-3">{item.description}</p>

          {/* Progress Bar (if started) */}
          {item.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Progress</span>
                <span className="text-gray-300">{item.progress}%</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs badge-simple">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs badge-simple">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {item.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {item.rating} ({item.reviewCount})
              </span>
              {getContentStats() && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {getContentStats()}
                </span>
              )}
            </div>
            <span>{format(item.publishedDate, "MMM d, yyyy")}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            <span>{getAudienceCount()}</span>
            <span>•</span>
            <span>{item.level}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link
              href={
                item.type === "course"
                  ? `/learning/${item.id}`
                  : item.type === "article" || item.type === "book" || item.type === "video" || item.type === "program"
                    ? `/learning/library/${item.id}`
                    : `/learning/${item.id}`
              }
              className="flex-1"
            >
              <Button className="w-full simple-button">
                {item.progress > 0 ? "Continue" : item.type === "course" ? "Start Course" : "View Content"}
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="p-2 button-outline bg-transparent"
              onClick={() => onToggleBookmark?.(item.id)}
              title={item.bookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {item.bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="p-2 button-outline bg-transparent"
              onClick={() => onAddToJourney?.(item.id)}
              title="Add to My Journey"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

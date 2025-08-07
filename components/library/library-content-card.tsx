"use client"

import type { LibraryItem } from "@/types/library"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Eye, Clock, BookOpen, ImageIcon, Video, FileText, Layers, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface LibraryContentCardProps {
  item: LibraryItem
}

export function LibraryContentCard({ item }: LibraryContentCardProps) {
  const getTypeIcon = () => {
    switch (item.type) {
      case "article":
        return <FileText className="h-4 w-4" />
      case "book":
        return <BookOpen className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "program":
        return <Layers className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = () => {
    switch (item.type) {
      case "article":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "book":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "program":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white dark:bg-green-800 border-green-200 dark:border-green-700">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {item.featured && <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">Featured</Badge>}
          {item.userHasSeen && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
          <Badge className={`absolute bottom-2 left-2 ${getTypeColor()}`}>
            <span className="flex items-center gap-1">
              {getTypeIcon()}
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
          </Badge>
          {item.duration && (
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(item.duration)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-agrandir-semibold text-lg text-green-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">by {item.author}</p>
          </div>

          <p className="text-sm text-green-700 dark:text-green-300 line-clamp-3">{item.description}</p>

          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {item.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {item.rating} ({item.reviewCount})
              </span>
            </div>
            <span>{format(item.publishedDate, "MMM d, yyyy")}</span>
          </div>

          <Link href={`/learning/library/${item.id}`}>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              {item.userHasSeen ? "View Again" : "View Content"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, Heart, Share2, ExternalLink, Video, DollarSign } from "lucide-react"
import type { Event } from "@/types/events"
import { formatDate, formatTime } from "@/utils/date-formatting"

interface EventCardProps {
  event: Event
  onRsvp?: (eventId: string) => void
  onFavorite?: (eventId: string) => void
}

export function EventCard({ event, onRsvp, onFavorite }: EventCardProps) {
  const [isRsvped, setIsRsvped] = useState(event.isRsvped)
  const [isFavorited, setIsFavorited] = useState(event.isFavorited)

  const handleRsvp = () => {
    setIsRsvped(!isRsvped)
    onRsvp?.(event.id)
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    onFavorite?.(event.id)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      wellness: "bg-green-100 text-green-800",
      tech: "bg-blue-100 text-blue-800",
      business: "bg-purple-100 text-purple-800",
      culture: "bg-orange-100 text-orange-800",
      education: "bg-indigo-100 text-indigo-800",
      networking: "bg-pink-100 text-pink-800",
      entertainment: "bg-yellow-100 text-yellow-800",
      sports: "bg-red-100 text-red-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getLocationIcon = () => {
    switch (event.location.type) {
      case "online":
        return <Video className="w-4 h-4" />
      case "hybrid":
        return <ExternalLink className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getLocationText = () => {
    switch (event.location.type) {
      case "online":
        return "Online Event"
      case "hybrid":
        return `${event.location.city}, ${event.location.country} + Online`
      default:
        return `${event.location.city}, ${event.location.country}`
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img src={event.coverImage || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
        <div className="absolute top-4 left-4">
          <Badge className={getCategoryColor(event.category)}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white" onClick={handleFavorite}>
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Event Title */}
          <h3 className="text-xl font-semibold line-clamp-2">{event.title}</h3>

          {/* Date and Time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(event.time)}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {getLocationIcon()}
            <span>{getLocationText()}</span>
          </div>

          {/* Host Community */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.hostCommunity.avatar || "/placeholder.svg"} alt={event.hostCommunity.name} />
              <AvatarFallback>
                {event.hostCommunity.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Hosted by {event.hostCommunity.name}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Participants and Price */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                {event.currentParticipants}
                {event.maxParticipants && `/${event.maxParticipants}`} attending
              </span>
            </div>
            {event.price && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">
                  {event.price.type === "free" ? "Free" : `${event.price.amount} ${event.price.currency}`}
                </span>
              </div>
            )}
          </div>

          {/* RSVP Button */}
          <Button
            onClick={handleRsvp}
            className={`w-full ${isRsvped ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}`}
          >
            {isRsvped ? "RSVP'd ✓" : "RSVP"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

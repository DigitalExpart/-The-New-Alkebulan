"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Community } from "@/types/community"
import { Pin, PinOff, MessageCircle, Users, Clock } from "lucide-react"

interface CommunityCardProps {
  community: Community
  onPin: (id: string) => void
  onJoin: (id: string) => void
}

export function CommunityCard({ community, onPin, onJoin }: CommunityCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        {/* Pin Button */}
        {isHovered && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onPin(community.id)
            }}
          >
            {community.isPinned ? (
              <PinOff className="h-4 w-4 text-yellow-600" />
            ) : (
              <Pin className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        )}

        {/* Community Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-full ${community.color} flex items-center justify-center text-2xl`}>
            {community.icon}
          </div>
        </div>

        {/* Community Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-semibold text-lg">{community.name}</h3>
            {community.isPinned && <Pin className="h-4 w-4 text-yellow-600 fill-current" />}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{community.memberCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{community.lastActivity}</span>
            </div>
          </div>

          {/* Unread Messages Badge */}
          {community.unreadMessages > 0 && (
            <div className="flex justify-center">
              <Badge variant="destructive" className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {community.unreadMessages} unread
              </Badge>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {community.isJoined ? (
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate to community chat
                }}
              >
                Go to Hub
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onJoin(community.id)
                }}
              >
                Join Community
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

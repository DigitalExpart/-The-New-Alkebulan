"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Community } from "@/types/community"
import { Pin, Hash } from "lucide-react"

interface CommunitySidebarItemProps {
  community: Community
  isActive?: boolean
  onClick: () => void
}

export function CommunitySidebarItem({ community, isActive = false, onClick }: CommunitySidebarItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`w-full justify-start gap-3 px-3 py-2 h-auto ${
        isActive ? "bg-green-100 dark:bg-green-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      onClick={onClick}
    >
      {/* Community Icon */}
      <div className={`w-8 h-8 rounded-full ${community.color} flex items-center justify-center text-sm flex-shrink-0`}>
        {community.icon}
      </div>

      {/* Community Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{community.name}</span>
          {community.isPinned && <Pin className="h-3 w-3 text-yellow-600 fill-current flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span>{community.memberCount.toLocaleString()} members</span>
        </div>
      </div>

      {/* Unread Badge */}
      {community.unreadMessages > 0 && (
        <Badge variant="destructive" className="text-xs px-2 py-0 h-5 flex-shrink-0">
          {community.unreadMessages > 99 ? "99+" : community.unreadMessages}
        </Badge>
      )}
    </Button>
  )
}

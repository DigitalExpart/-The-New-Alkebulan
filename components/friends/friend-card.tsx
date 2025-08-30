"use client"

import { useState } from "react"
import Link from "next/link"
import type { Friend } from "@/types/friends"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MessageCircle, User, MapPin, Calendar, MoreVertical, UserMinus, Users, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FriendCardProps {
  friend: Friend
  viewMode: "grid" | "list"
  onRemoveFriend?: (friendId: string) => void
}

export function FriendCard({ friend, viewMode, onRemoveFriend }: FriendCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  const handleRemoveFriend = () => {
    onRemoveFriend?.(friend.id)
    setShowRemoveDialog(false)
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "mentor":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "collaborator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "colleague":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "family":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                  <AvatarFallback>
                    {friend.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {friend.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{friend.name}</h3>
                  <Badge variant="secondary" className={`text-xs ${getRelationshipColor(friend.relationship)}`}>
                    {friend.relationship}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {friend.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{friend.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Friends since {new Date(friend.friendSince).getFullYear()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Active {formatDistanceToNow(new Date(friend.lastActive))} ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={friend.messageUrl}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Link>
              </Button>

              <Button size="sm" variant="outline" asChild>
                <Link href={friend.profileUrl}>
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowRemoveDialog(true)} className="text-red-600">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove Friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 group">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar with online status */}
            <div className="flex justify-end w-full items-start px-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowRemoveDialog(true)} className="text-red-600">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove Friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            <div className="relative">

              
              {/* <div className="w-full"></div> */}
              

              <Avatar className="h-20 w-20">
                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                <AvatarFallback className="text-lg">
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>

            

            {/* Name and relationship */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{friend.name}</h3>
              <Badge variant="secondary" className={getRelationshipColor(friend.relationship)}>
                {friend.relationship}
              </Badge>
            </div>

            {/* Location */}
            {friend.location && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{friend.location}</span>
              </div>
            )}

            {/* Bio */}
            {friend.bio && <p className="text-sm text-muted-foreground line-clamp-2">{friend.bio}</p>}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center">
              {friend.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {friend.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{friend.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Mutual connections */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{friend.mutualCommunities.length} mutual</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Since {new Date(friend.friendSince).getFullYear()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 w-full">
              <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href={friend.messageUrl}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Link>
              </Button>

              <Button size="sm" className="flex-1" asChild>
                <Link href={friend.profileUrl}>
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>
              </Button>

              {/* Removed DropdownMenu for removing friend */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove friend confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friend.name} from your friends list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFriend} className="bg-red-600 hover:bg-red-700">
              Remove Friend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

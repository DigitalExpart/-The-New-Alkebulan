"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MoreHorizontal, Verified } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PostCardProps {
  post: {
    id: string
    author: {
      name: string
      avatar: string
      verified: boolean
    }
    content: string
    timestamp: string
    likes: number
    comments: number
    shares: number
    community: string
    images?: string[]
  }
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                {post.author.verified && <Verified className="w-4 h-4 text-blue-500 fill-current" />}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{post.timestamp}</span>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  {post.community}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save Post</DropdownMenuItem>
              <DropdownMenuItem>Report Post</DropdownMenuItem>
              <DropdownMenuItem>Hide Post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div
            className={`grid gap-2 mb-4 ${
              post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-2"
            }`}
          >
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`Post image ${index + 1}`}
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${liked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
              <Share2 className="w-4 h-4" />
              <span>{post.shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

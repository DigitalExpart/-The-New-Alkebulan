"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video, Link, MapPin, Users, X } from "lucide-react"

const communities = ["Tech Innovators", "Cultural Heritage", "Business Network", "Wellness Circle", "Creative Arts"]

interface CreatePostDialogProps {
  children: React.ReactNode
}

export function CreatePostDialog({ children }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [location, setLocation] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    // Handle post creation logic here
    console.log({
      content,
      community: selectedCommunity,
      location,
      tags,
    })

    // Reset form
    setContent("")
    setSelectedCommunity("")
    setLocation("")
    setTags([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>Share your thoughts, ideas, or updates with the community</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>YU</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Your Name</p>
              <p className="text-sm text-muted-foreground">Posting to community</p>
            </div>
          </div>

          {/* Community Selection */}
          <div className="space-y-2">
            <Label htmlFor="community">Community</Label>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger>
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community} value={community}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {community}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="location"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Media Options */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <span className="text-sm font-medium">Add to your post:</span>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedCommunity}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black"
            >
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, CalendarIcon, MapPin, X, Video, Globe } from "lucide-react"
import { eventCategories } from "@/data/events-data"
import { format } from "date-fns"

interface CreateEventModalProps {
  children: React.ReactNode
}

export function CreateEventModal({ children }: CreateEventModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: undefined as Date | undefined,
    time: "",
    endDate: undefined as Date | undefined,
    endTime: "",
    locationType: "offline" as "online" | "offline" | "hybrid",
    address: "",
    city: "",
    country: "",
    onlineLink: "",
    category: "",
    tags: [] as string[],
    maxParticipants: "",
    isPaid: false,
    price: "",
    currency: "USD",
    rsvpDeadline: undefined as Date | undefined,
    coverImage: null as File | null,
  })

  const [currentTag, setCurrentTag] = useState("")

  const updateEventData = (key: string, value: any) => {
    setEventData((prev) => ({ ...prev, [key]: value }))
  }

  const addTag = () => {
    if (currentTag.trim() && !eventData.tags.includes(currentTag.trim())) {
      updateEventData("tags", [...eventData.tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateEventData(
      "tags",
      eventData.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle event creation logic here
    console.log("Creating event:", eventData)
    setIsOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateEventData("coverImage", file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Host an Event</DialogTitle>
          <DialogDescription>Create a new event to bring your community together</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="cover-image" />
              <label htmlFor="cover-image" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload cover image</p>
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => updateEventData("title", e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={eventData.description}
                onChange={(e) => updateEventData("description", e.target.value)}
                placeholder="Describe your event..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventData.date ? format(eventData.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventData.date}
                    onSelect={(date) => updateEventData("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Start Time *</Label>
              <Input
                id="time"
                type="time"
                value={eventData.time}
                onChange={(e) => updateEventData("time", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location Type */}
          <div className="space-y-4">
            <Label>Event Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "offline", label: "In-Person", icon: MapPin },
                { value: "online", label: "Online", icon: Video },
                { value: "hybrid", label: "Hybrid", icon: Globe },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={eventData.locationType === value ? "default" : "outline"}
                  onClick={() => updateEventData("locationType", value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Location Details */}
            {(eventData.locationType === "offline" || eventData.locationType === "hybrid") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={eventData.address}
                    onChange={(e) => updateEventData("address", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={eventData.city}
                    onChange={(e) => updateEventData("city", e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
              </div>
            )}

            {(eventData.locationType === "online" || eventData.locationType === "hybrid") && (
              <div className="space-y-2">
                <Label htmlFor="onlineLink">Online Link</Label>
                <Input
                  id="onlineLink"
                  value={eventData.onlineLink}
                  onChange={(e) => updateEventData("onlineLink", e.target.value)}
                  placeholder="Zoom, Meet, or other platform link"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={eventData.category} onValueChange={(value) => updateEventData("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {eventCategories
                  .filter((cat) => cat.value !== "all")
                  .map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {eventData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {eventData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Capacity and Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={eventData.maxParticipants}
                onChange={(e) => updateEventData("maxParticipants", e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Paid Event</Label>
                <Switch checked={eventData.isPaid} onCheckedChange={(checked) => updateEventData("isPaid", checked)} />
              </div>

              {eventData.isPaid && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={eventData.price}
                    onChange={(e) => updateEventData("price", e.target.value)}
                    placeholder="Price"
                  />
                  <Select value={eventData.currency} onValueChange={(value) => updateEventData("currency", value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

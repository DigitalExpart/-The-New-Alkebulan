"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopicTagSelector } from "@/components/ui/topic-tag-selector"
import { TopicTagDisplay } from "@/components/ui/topic-tag-display"
import { Upload, FileText, Video, BookOpen, ImageIcon, Layers } from "lucide-react"

interface ContentUploadFormProps {
  onSubmit?: (data: ContentFormData) => void
}

interface ContentFormData {
  title: string
  description: string
  content: string
  type: "article" | "video" | "book" | "image" | "program"
  tags: string[]
  thumbnail?: File
  contentFile?: File
}

export function ContentUploadForm({ onSubmit }: ContentUploadFormProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    content: "",
    type: "article",
    tags: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, tags }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "book":
        return <BookOpen className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "program":
        return <Layers className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6 text-green-600" />
          Upload New Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Content Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("article")}
                      Article
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("video")}
                      Video
                    </div>
                  </SelectItem>
                  <SelectItem value="book">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("book")}
                      Book/eBook
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("image")}
                      Image/Infographic
                    </div>
                  </SelectItem>
                  <SelectItem value="program">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("program")}
                      Program/Course
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Provide a brief description of your content..."
              rows={3}
              required
            />
          </div>

          {/* Topic Tags */}
          <div className="space-y-4">
            <TopicTagSelector
              selectedTags={formData.tags}
              onTagsChange={handleTagsChange}
              maxTags={8}
              placeholder="Search for relevant topics..."
              showCategories={true}
            />
          </div>

          {/* Content Preview */}
          {formData.tags.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Topics Preview</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <TopicTagDisplay tagIds={formData.tags} showAll={true} variant="default" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your content here or upload a file..."
              rows={8}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Publish Content
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

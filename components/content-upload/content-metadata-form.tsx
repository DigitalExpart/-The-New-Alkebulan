"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles, X, Plus, Globe, Users, Lock, MessageCircle, Star, Share } from "lucide-react"
import { CONTENT_TYPES, SUBJECTS, LANGUAGES, TOPIC_TAGS } from "@/data/content-categories"
import type { ContentUpload, AIEnhancement } from "@/types/content-upload"

interface ContentMetadataFormProps {
  initialData?: Partial<ContentUpload>
  onSubmit: (data: ContentUpload) => void
  onSaveDraft: (data: Partial<ContentUpload>) => void
  isSubmitting?: boolean
}

export function ContentMetadataForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
}: ContentMetadataFormProps) {
  const [formData, setFormData] = useState<Partial<ContentUpload>>({
    title: "",
    description: "",
    contentType: "article",
    subject: "business",
    language: "en",
    tags: [],
    visibility: "public",
    allowComments: true,
    allowRatings: true,
    allowSharing: true,
    ...initialData,
  })

  const [aiEnhancement, setAiEnhancement] = useState<AIEnhancement | null>(null)
  const [isAiEnabled, setIsAiEnabled] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)

  // Simulate AI enhancement
  const generateAiSuggestions = async () => {
    if (!formData.title && !formData.description) return

    // Mock AI response
    const mockAi: AIEnhancement = {
      suggestedTags: ["entrepreneurship", "innovation", "leadership"],
      suggestedCategory: "business",
      generatedSummary: "This content focuses on business development and entrepreneurial strategies.",
      confidence: 0.85,
    }

    setAiEnhancement(mockAi)
  }

  useEffect(() => {
    if (isAiEnabled && (formData.title || formData.description)) {
      const timer = setTimeout(generateAiSuggestions, 1000)
      return () => clearTimeout(timer)
    }
  }, [formData.title, formData.description, isAiEnabled])

  const handleInputChange = (field: keyof ContentUpload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      handleInputChange("tags", [...(formData.tags || []), tag])
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange("tags", formData.tags?.filter((tag) => tag !== tagToRemove) || [])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.description) {
      onSubmit(formData as ContentUpload)
    }
  }

  const handleSaveDraft = () => {
    onSaveDraft(formData)
  }

  const applyAiSuggestion = (type: "tags" | "category" | "summary") => {
    if (!aiEnhancement) return

    switch (type) {
      case "tags":
        handleInputChange("tags", [...(formData.tags || []), ...aiEnhancement.suggestedTags])
        break
      case "category":
        handleInputChange("subject", aiEnhancement.suggestedCategory)
        break
      case "summary":
        if (aiEnhancement.generatedSummary) {
          handleInputChange("description", aiEnhancement.generatedSummary)
        }
        break
    }
  }

  const availableTags = formData.subject ? TOPIC_TAGS[formData.subject] || [] : []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Enhancement Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              AI Enhancement
            </CardTitle>
            <Switch checked={isAiEnabled} onCheckedChange={setIsAiEnabled} />
          </div>
        </CardHeader>
        {isAiEnabled && (
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              AI will analyze your content and provide smart suggestions for tags, categories, and summaries.
            </p>
            {aiEnhancement && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Confidence: {Math.round(aiEnhancement.confidence * 100)}%</Badge>
                </div>

                {aiEnhancement.suggestedTags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Suggested Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiEnhancement.suggestedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addTag(tag)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {aiEnhancement.suggestedCategory !== formData.subject && (
                  <div>
                    <p className="text-sm font-medium mb-2">Suggested Category:</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyAiSuggestion("category")}>
                      Use "{SUBJECTS.find((s) => s.value === aiEnhancement.suggestedCategory)?.label}"
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Basic Information */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter a compelling title for your content"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your content and what value it provides"
            rows={4}
            required
          />
        </div>
      </div>

      {/* Categorization */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="contentType">Content Type</Label>
          <Select value={formData.contentType} onValueChange={(value) => handleInputChange("contentType", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject.value} value={subject.value}>
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.flag} {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Tags</Label>
          <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Browse Tags
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Select Tags</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags?.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.tags?.includes(tag)) {
                          removeTag(tag)
                        } else {
                          addTag(tag)
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add custom tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => addTag(tagInput)} disabled={!tagInput}>
            Add
          </Button>
        </div>

        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Privacy & Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Privacy & Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="visibility">Who can see this content?</Label>
            <Select value={formData.visibility} onValueChange={(value) => handleInputChange("visibility", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <div>
                      <div>Public</div>
                      <div className="text-xs text-muted-foreground">Everyone can see this</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="community">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <div>
                      <div>Community Only</div>
                      <div className="text-xs text-muted-foreground">Only community members</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <div>
                      <div>Private</div>
                      <div className="text-xs text-muted-foreground">Only you can see this</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <Label htmlFor="allowComments">Allow Comments</Label>
              </div>
              <Switch
                id="allowComments"
                checked={formData.allowComments}
                onCheckedChange={(checked) => handleInputChange("allowComments", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <Label htmlFor="allowRatings">Allow Ratings</Label>
              </div>
              <Switch
                id="allowRatings"
                checked={formData.allowRatings}
                onCheckedChange={(checked) => handleInputChange("allowRatings", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share className="w-4 h-4" />
                <Label htmlFor="allowSharing">Allow Sharing</Label>
              </div>
              <Switch
                id="allowSharing"
                checked={formData.allowSharing}
                onCheckedChange={(checked) => handleInputChange("allowSharing", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={!formData.title || !formData.description || isSubmitting} className="flex-1">
          {isSubmitting ? "Publishing..." : "Publish Content"}
        </Button>
        <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
          Save Draft
        </Button>
      </div>
    </form>
  )
}

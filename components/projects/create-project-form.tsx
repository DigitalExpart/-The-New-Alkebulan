"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Plus, X, Upload, FileText } from "lucide-react"
import { format } from "date-fns"
import { projectCategories, projectRegions } from "@/data/projects-data"
import type { CreateProjectForm, ProjectCategory, ProjectRegion } from "@/types/project"

interface CreateProjectFormComponentProps {
  onSubmit: (data: CreateProjectForm) => void
}

const availableTags = [
  "Innovation",
  "Technology",
  "Mentorship",
  "Startup",
  "Heritage",
  "Culture",
  "Archive",
  "Community",
  "Healthcare",
  "Telemedicine",
  "Global",
  "Renewable Energy",
  "Sustainability",
  "Investment",
  "Education",
  "Youth",
  "Development",
  "Real Estate",
  "Fund",
]

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
]

export function CreateProjectFormComponent({ onSubmit }: CreateProjectFormComponentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [endDate, setEndDate] = useState<Date>()

  const [formData, setFormData] = useState<CreateProjectForm>({
    title: "",
    description: "",
    fullDescription: "",
    category: "Technology",
    region: "Global",
    tags: [],
    location: "",
    budget: undefined,
    currency: "USD",
    teamRoles: [],
    timeline: "",
    endDate: undefined,
    visibility: "Public",
    documents: [],
  })

  const [newTag, setNewTag] = useState("")
  const [newRole, setNewRole] = useState("")

  const handleInputChange = (field: keyof CreateProjectForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange("tags", [...formData.tags, tag])
    }
    setNewTag("")
  }

  const handleRemoveTag = (tag: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((t) => t !== tag),
    )
  }

  const handleAddRole = () => {
    if (newRole && !formData.teamRoles.includes(newRole)) {
      handleInputChange("teamRoles", [...formData.teamRoles, newRole])
    }
    setNewRole("")
  }

  const handleRemoveRole = (role: string) => {
    handleInputChange(
      "teamRoles",
      formData.teamRoles.filter((r) => r !== role),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      endDate: endDate ? endDate.toISOString() : undefined,
    }
    onSubmit(submitData)
    setIsOpen(false)
    // Reset form
    setFormData({
      title: "",
      description: "",
      fullDescription: "",
      category: "Technology",
      region: "Global",
      tags: [],
      location: "",
      budget: undefined,
      currency: "USD",
      teamRoles: [],
      timeline: "",
      endDate: undefined,
      visibility: "Public",
      documents: [],
    })
    setEndDate(undefined)
    setActiveTab("basic")
  }

  const isFormValid = formData.title && formData.description && formData.fullDescription

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team & Roles</TabsTrigger>
              <TabsTrigger value="media">Media & Files</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value as ProjectCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleInputChange("region", value as ProjectRegion)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectRegions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of your project (max 200 characters)"
                  maxLength={200}
                  required
                />
                <div className="text-xs text-muted-foreground text-right">{formData.description.length}/200</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description *</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange("fullDescription", e.target.value)}
                  placeholder="Detailed description of your project, goals, and impact"
                  rows={4}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget || ""}
                    onChange={(e) => handleInputChange("budget", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Enter budget amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => handleInputChange("timeline", e.target.value)}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => handleInputChange("visibility", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Community">Community Only</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag(newTag)
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddTag(newTag)}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => handleAddTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="space-y-2">
                <Label>Team Roles Needed</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.teamRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="gap-1">
                      {role}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveRole(role)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g., Frontend Developer, Marketing Manager"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddRole()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddRole}>
                    Add Role
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop your cover image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Banner Image (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop your banner image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Documents</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload project documents, proposals, or presentations
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, PPT up to 25MB each</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation and Submit */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-2">
              {activeTab !== "basic" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ["basic", "details", "team", "media"]
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1])
                    }
                  }}
                >
                  Previous
                </Button>
              )}
              {activeTab !== "media" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ["basic", "details", "team", "media"]
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1])
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid} className="bg-yellow-600 hover:bg-yellow-700">
                Create Project
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

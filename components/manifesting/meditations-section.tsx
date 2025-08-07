"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Brain, Plus, Play, Bookmark, Clock, Upload, Link, Bell } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Meditation } from "@/types/manifesting"
import { meditationTypes } from "@/data/manifesting-data"

interface MeditationsSectionProps {
  meditations: {
    saved: Meditation[]
    bookmarked: string[]
    dailyReminder: boolean
    reminderTime?: string
    lastUpdated: Date
  }
  onUpdate: (meditations: any) => void
}

export function MeditationsSection({ meditations, onUpdate }: MeditationsSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newMeditation, setNewMeditation] = useState<Partial<Meditation>>({
    title: "",
    description: "",
    duration: 0,
    type: "guided",
    tags: [],
    isBookmarked: false,
  })
  const [uploadType, setUploadType] = useState<"file" | "url">("url")

  const handleAddMeditation = () => {
    const meditation: Meditation = {
      id: Date.now().toString(),
      title: newMeditation.title!,
      description: newMeditation.description!,
      duration: newMeditation.duration!,
      type: newMeditation.type!,
      url: newMeditation.url,
      tags: newMeditation.tags!,
      isBookmarked: false,
      createdAt: new Date(),
    }

    const updatedMeditations = {
      ...meditations,
      saved: [...meditations.saved, meditation],
      lastUpdated: new Date(),
    }

    onUpdate(updatedMeditations)
    setNewMeditation({
      title: "",
      description: "",
      duration: 0,
      type: "guided",
      tags: [],
      isBookmarked: false,
    })
    setShowAddDialog(false)
  }

  const handleToggleBookmark = (meditationId: string) => {
    const isBookmarked = meditations.bookmarked.includes(meditationId)
    const updatedBookmarks = isBookmarked
      ? meditations.bookmarked.filter((id) => id !== meditationId)
      : [...meditations.bookmarked, meditationId]

    onUpdate({
      ...meditations,
      bookmarked: updatedBookmarks,
      lastUpdated: new Date(),
    })
  }

  const handleReminderToggle = (enabled: boolean) => {
    onUpdate({
      ...meditations,
      dailyReminder: enabled,
      lastUpdated: new Date(),
    })
  }

  const handleReminderTimeChange = (time: string) => {
    onUpdate({
      ...meditations,
      reminderTime: time,
      lastUpdated: new Date(),
    })
  }

  const getTypeInfo = (type: string) => {
    return meditationTypes.find((t) => t.value === type) || meditationTypes[0]
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Brain className="w-5 h-5" />
          Meditations
          <Badge variant="secondary" className="ml-auto">
            {meditations.saved.length} Saved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Reminder Settings */}
        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-green-600" />
              <Label className="text-sm font-medium">Daily Meditation Reminder</Label>
            </div>
            <Switch checked={meditations.dailyReminder} onCheckedChange={handleReminderToggle} />
          </div>
          {meditations.dailyReminder && (
            <div className="flex items-center gap-2">
              <Label className="text-xs">Time:</Label>
              <Input
                type="time"
                value={meditations.reminderTime || "07:00"}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="w-32 h-8 text-xs"
              />
            </div>
          )}
        </div>

        {/* Add Meditation Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Meditation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Meditation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newMeditation.title}
                  onChange={(e) => setNewMeditation({ ...newMeditation, title: e.target.value })}
                  placeholder="Meditation title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newMeditation.description}
                  onChange={(e) => setNewMeditation({ ...newMeditation, description: e.target.value })}
                  placeholder="Brief description"
                  className="min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newMeditation.type}
                    onValueChange={(value) => setNewMeditation({ ...newMeditation, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meditationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newMeditation.duration}
                    onChange={(e) =>
                      setNewMeditation({ ...newMeditation, duration: Number.parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label>Source</Label>
                <Select value={uploadType} onValueChange={(value) => setUploadType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">
                      <span className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        URL/Link
                      </span>
                    </SelectItem>
                    <SelectItem value="file">
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload File
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {uploadType === "url" ? (
                <div>
                  <Label>URL</Label>
                  <Input
                    value={newMeditation.url || ""}
                    onChange={(e) => setNewMeditation({ ...newMeditation, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              ) : (
                <div>
                  <Label>Upload File</Label>
                  <Input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setNewMeditation({ ...newMeditation, file })
                      }
                    }}
                  />
                </div>
              )}
              <Button
                onClick={handleAddMeditation}
                disabled={!newMeditation.title || !newMeditation.description}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Add Meditation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Meditations List */}
        {meditations.saved.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No meditations saved yet.</p>
            <p className="text-sm">Add your first meditation to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meditations.saved.map((meditation) => {
              const typeInfo = getTypeInfo(meditation.type)
              const isBookmarked = meditations.bookmarked.includes(meditation.id)

              return (
                <div
                  key={meditation.id}
                  className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-green-200 dark:border-green-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{meditation.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          <span className="mr-1">{typeInfo.icon}</span>
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{meditation.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meditation.duration} min
                        </div>
                        <div>Added {meditation.createdAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBookmark(meditation.id)}
                        className={isBookmarked ? "text-yellow-500" : "text-gray-400"}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {meditation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {meditation.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {meditations.lastUpdated && (
          <p className="text-xs text-gray-500 text-right">
            Last updated: {meditations.lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Smile, Zap, Moon, Tag } from "lucide-react"
import type { JournalEntry } from "@/types/health"

interface WellnessJournalProps {
  entries: JournalEntry[]
}

export function WellnessJournal({ entries }: WellnessJournalProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    mood: [7],
    energy: [7],
    sleep: [7],
    notes: "",
    tags: "",
  })

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return "😄"
    if (mood >= 7) return "😊"
    if (mood >= 5) return "😐"
    if (mood >= 3) return "😔"
    return "😢"
  }

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return "text-green-600"
    if (energy >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getSleepQuality = (sleep: number) => {
    if (sleep >= 8) return "Excellent"
    if (sleep >= 6) return "Good"
    if (sleep >= 4) return "Fair"
    return "Poor"
  }

  const handleSaveEntry = () => {
    // In a real app, this would save to a database
    console.log("Saving entry:", {
      date: new Date().toISOString().split("T")[0],
      mood: newEntry.mood[0],
      energy: newEntry.energy[0],
      sleep: newEntry.sleep[0],
      notes: newEntry.notes,
      tags: newEntry.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })

    setIsAddingEntry(false)
    setNewEntry({
      mood: [7],
      energy: [7],
      sleep: [7],
      notes: "",
      tags: "",
    })
  }

  return (
    <div className="space-y-6">
      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Wellness Journal
            </CardTitle>
            <Button onClick={() => setIsAddingEntry(!isAddingEntry)} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </div>
        </CardHeader>

        {isAddingEntry && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mood */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4" />
                  <label className="text-sm font-medium">Mood</label>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">{getMoodEmoji(newEntry.mood[0])}</div>
                  <div className="text-lg font-semibold">{newEntry.mood[0]}/10</div>
                </div>
                <Slider
                  value={newEntry.mood}
                  onValueChange={(value) => setNewEntry((prev) => ({ ...prev, mood: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Energy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <label className="text-sm font-medium">Energy</label>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className={`text-lg font-semibold ${getEnergyColor(newEntry.energy[0])}`}>
                    {newEntry.energy[0]}/10
                  </div>
                </div>
                <Slider
                  value={newEntry.energy}
                  onValueChange={(value) => setNewEntry((prev) => ({ ...prev, energy: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Sleep */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <label className="text-sm font-medium">Sleep Quality</label>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">😴</div>
                  <div className="text-lg font-semibold">{newEntry.sleep[0]}/10</div>
                  <div className="text-xs text-muted-foreground">{getSleepQuality(newEntry.sleep[0])}</div>
                </div>
                <Slider
                  value={newEntry.sleep}
                  onValueChange={(value) => setNewEntry((prev) => ({ ...prev, sleep: value }))}
                  max={10}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes & Reflections</label>
              <Textarea
                placeholder="How are you feeling today? What happened? Any insights or thoughts to remember..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <label className="text-sm font-medium">Tags</label>
              </div>
              <Input
                placeholder="workout, stress, family, work (comma separated)"
                value={newEntry.tags}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry} className="flex-1">
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setIsAddingEntry(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Previous Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Entries</h3>

        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="text-sm text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">{getMoodEmoji(entry.mood)}</div>
                  <div className="text-sm font-medium">Mood: {entry.mood}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className={`text-sm font-medium ${getEnergyColor(entry.energy)}`}>Energy: {entry.energy}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">😴</div>
                  <div className="text-sm font-medium">Sleep: {entry.sleep}/10</div>
                </div>
              </div>

              {entry.notes && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                </div>
              )}

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

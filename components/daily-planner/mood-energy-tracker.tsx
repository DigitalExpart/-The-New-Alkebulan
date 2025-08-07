"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Zap, Plus, TrendingUp } from "lucide-react"
import type { MoodEntry } from "@/types/daily-planner"

interface MoodEnergyTrackerProps {
  moodEntries: MoodEntry[]
  onAddEntry: (entry: Omit<MoodEntry, "id">) => void
}

export function MoodEnergyTracker({ moodEntries, onAddEntry }: MoodEnergyTrackerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    onAddEntry({
      mood,
      energy,
      notes: notes.trim(),
      timestamp: new Date(),
    })
    setMood(3)
    setEnergy(3)
    setNotes("")
    setIsAdding(false)
  }

  const getMoodEmoji = (level: number) => {
    const emojis = ["😢", "😕", "😐", "😊", "😄"]
    return emojis[level - 1]
  }

  const getEnergyEmoji = (level: number) => {
    const emojis = ["🔋", "🔋", "🔋", "🔋", "⚡"]
    return emojis[level - 1]
  }

  const getMoodLabel = (level: number) => {
    const labels = ["Very Low", "Low", "Neutral", "Good", "Excellent"]
    return labels[level - 1]
  }

  const getEnergyLabel = (level: number) => {
    const labels = ["Drained", "Low", "Moderate", "High", "Energized"]
    return labels[level - 1]
  }

  const latestEntry = moodEntries[moodEntries.length - 1]
  const averageMood =
    moodEntries.length > 0
      ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length)
      : 0
  const averageEnergy =
    moodEntries.length > 0
      ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.energy, 0) / moodEntries.length)
      : 0

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Heart className="w-5 h-5 text-primary" />
            Mood & Energy
          </CardTitle>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            className="gap-1 h-8 px-3 text-xs"
            variant={isAdding ? "outline" : "default"}
          >
            <Plus className="w-3 h-3" />
            {isAdding ? "Cancel" : "Log"}
          </Button>
        </div>

        {latestEntry && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mood:</span>
              <span className="text-lg">{getMoodEmoji(latestEntry.mood)}</span>
              <span className="font-semibold text-foreground">{getMoodLabel(latestEntry.mood)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Energy:</span>
              <span className="text-lg">{getEnergyEmoji(latestEntry.energy)}</span>
              <span className="font-semibold text-foreground">{getEnergyLabel(latestEntry.energy)}</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {isAdding && (
          <div className="p-4 border border-border rounded bg-muted space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block text-foreground">How are you feeling?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={mood === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMood(level as 1 | 2 | 3 | 4 | 5)}
                    className="h-10 w-10 p-0 text-lg"
                  >
                    {getMoodEmoji(level)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{getMoodLabel(mood)}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block text-foreground">Energy level?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={energy === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnergy(level as 1 | 2 | 3 | 4 | 5)}
                    className="h-10 w-10 p-0 text-lg"
                  >
                    {getEnergyEmoji(level)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{getEnergyLabel(energy)}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block text-foreground">Notes (optional)</label>
              <Textarea
                placeholder="What's influencing your mood and energy today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20 text-sm resize-none bg-background border-border text-foreground"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} size="sm" className="h-8 px-4 text-xs bg-primary hover:bg-primary/80">
                Save Entry
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" size="sm" className="h-8 px-4 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {moodEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No mood entries yet</p>
            <p className="text-xs mt-1">Track your daily mood and energy levels</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/10 rounded border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Avg Mood</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMoodEmoji(averageMood)}</span>
                  <span className="text-sm font-semibold text-foreground">{getMoodLabel(averageMood)}</span>
                </div>
              </div>

              <div className="p-3 bg-primary/10 rounded border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Avg Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEnergyEmoji(averageEnergy)}</span>
                  <span className="text-sm font-semibold text-foreground">{getEnergyLabel(averageEnergy)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4" />
                Recent Entries
              </h4>
              {moodEntries
                .slice(-3)
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="p-3 bg-card rounded border border-border text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span>{getMoodEmoji(entry.mood)}</span>
                        <span>{getEnergyEmoji(entry.energy)}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {entry.notes && <p className="text-muted-foreground text-xs">{entry.notes}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

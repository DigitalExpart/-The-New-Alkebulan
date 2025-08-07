"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Save, Edit3, CheckCircle } from "lucide-react"
import type { ReflectionEntry } from "@/types/daily-planner"

interface ReflectionJournalProps {
  reflectionEntry?: ReflectionEntry
  onSaveReflection: (entry: Omit<ReflectionEntry, "id">) => void
}

export function ReflectionJournal({ reflectionEntry, onSaveReflection }: ReflectionJournalProps) {
  const [isEditing, setIsEditing] = useState(!reflectionEntry)
  const [wins, setWins] = useState(reflectionEntry?.wins || "")
  const [challenges, setChallenges] = useState(reflectionEntry?.challenges || "")
  const [improvements, setImprovements] = useState(reflectionEntry?.improvements || "")
  const [gratitude, setGratitude] = useState(reflectionEntry?.gratitude || "")

  const handleSave = () => {
    onSaveReflection({
      wins: wins.trim(),
      challenges: challenges.trim(),
      improvements: improvements.trim(),
      gratitude: gratitude.trim(),
      date: new Date(),
    })
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const isComplete = wins.trim() || challenges.trim() || improvements.trim() || gratitude.trim()

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            Daily Reflection
            {isComplete && !isEditing && (
              <Badge className="bg-primary/20 text-primary text-xs border-primary/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </CardTitle>
          {!isEditing ? (
            <Button onClick={handleEdit} size="sm" className="gap-1 h-8 px-3 text-xs bg-primary hover:bg-primary/80">
              <Edit3 className="w-3 h-3" />
              Edit
            </Button>
          ) : (
            <Button onClick={handleSave} size="sm" className="gap-1 h-8 px-3 text-xs bg-primary hover:bg-primary/80">
              <Save className="w-3 h-3" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {!isEditing && !isComplete ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No reflection written yet</p>
            <p className="text-xs mt-1">Take a moment to reflect on your day</p>
            <Button onClick={() => setIsEditing(true)} className="mt-3 h-8 px-4 text-xs bg-primary hover:bg-primary/80">
              Start Reflecting
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-primary">🎉 Today's Wins</label>
              {isEditing ? (
                <Textarea
                  placeholder="What went well today? What are you proud of?"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="h-20 text-sm resize-none bg-background border-border text-foreground"
                />
              ) : (
                <div className="p-3 bg-primary/10 rounded border border-primary/30 text-sm min-h-[4rem]">
                  {wins || <span className="text-muted-foreground italic">No wins recorded</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-orange-400">🚧 Challenges Faced</label>
              {isEditing ? (
                <Textarea
                  placeholder="What challenges did you encounter? How did you handle them?"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="h-20 text-sm resize-none bg-background border-border text-foreground"
                />
              ) : (
                <div className="p-3 bg-orange-500/10 rounded border border-orange-500/30 text-sm min-h-[4rem]">
                  {challenges || <span className="text-muted-foreground italic">No challenges recorded</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-blue-400">💡 Tomorrow's Improvements</label>
              {isEditing ? (
                <Textarea
                  placeholder="What would you do differently? How can you improve tomorrow?"
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="h-20 text-sm resize-none bg-background border-border text-foreground"
                />
              ) : (
                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30 text-sm min-h-[4rem]">
                  {improvements || <span className="text-muted-foreground italic">No improvements noted</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-purple-400">🙏 Gratitude</label>
              {isEditing ? (
                <Textarea
                  placeholder="What are you grateful for today?"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="h-20 text-sm resize-none bg-background border-border text-foreground"
                />
              ) : (
                <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30 text-sm min-h-[4rem]">
                  {gratitude || <span className="text-muted-foreground italic">No gratitude recorded</span>}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm" className="h-8 px-4 text-xs bg-primary hover:bg-primary/80">
                  Save Reflection
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="h-8 px-4 text-xs">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {!isEditing && isComplete && (
          <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/30">
            <p className="text-xs text-muted-foreground">
              ✨ <strong className="text-primary">Great job!</strong> Daily reflection helps build self-awareness and
              continuous improvement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

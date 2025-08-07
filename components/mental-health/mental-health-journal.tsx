"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Calendar, BookOpen, Heart, Plus, Save, Trash2 } from "lucide-react"
import type { JournalEntry } from "@/types/mental-health"
import { commonFeelings } from "@/data/mental-health-data"
import { format } from "date-fns"

interface MentalHealthJournalProps {
  entries: JournalEntry[]
  onAddEntry: (entry: Omit<JournalEntry, "id" | "userId">) => void
  onDeleteEntry: (entryId: string) => void
}

export function MentalHealthJournal({ entries, onAddEntry, onDeleteEntry }: MentalHealthJournalProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    mood: 5,
    feelings: [] as string[],
    notes: "",
    questionsForTherapist: "",
  })

  const handleAddEntry = () => {
    if (newEntry.notes.trim()) {
      onAddEntry({
        date: new Date().toISOString(),
        mood: newEntry.mood,
        feelings: newEntry.feelings,
        notes: newEntry.notes,
        questionsForTherapist: newEntry.questionsForTherapist || undefined,
      })
      setNewEntry({
        mood: 5,
        feelings: [],
        notes: "",
        questionsForTherapist: "",
      })
      setIsAddingEntry(false)
    }
  }

  const toggleFeeling = (feeling: string) => {
    setNewEntry((prev) => ({
      ...prev,
      feelings: prev.feelings.includes(feeling)
        ? prev.feelings.filter((f) => f !== feeling)
        : [...prev.feelings, feeling],
    }))
  }

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😢"
    if (mood <= 4) return "😕"
    if (mood <= 6) return "😐"
    if (mood <= 8) return "🙂"
    return "😊"
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "text-red-600"
    if (mood <= 4) return "text-orange-600"
    if (mood <= 6) return "text-yellow-600"
    if (mood <= 8) return "text-green-600"
    return "text-blue-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Mental Health Journal</h2>
            <p className="text-sm text-gray-600">Track your feelings and prepare for sessions</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddingEntry(true)}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Add New Entry Form */}
      {isAddingEntry && (
        <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Slider */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-3 block">
                Mood Level: {newEntry.mood}/10 {getMoodEmoji(newEntry.mood)}
              </Label>
              <Slider
                value={[newEntry.mood]}
                onValueChange={(value) => setNewEntry((prev) => ({ ...prev, mood: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Neutral</span>
                <span>Very High</span>
              </div>
            </div>

            {/* Feelings Selection */}
            <div>
              <Label className="text-sm font-medium text-blue-900 mb-3 block">
                What feelings are you experiencing?
              </Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {commonFeelings.map((feeling) => (
                  <Badge
                    key={feeling}
                    variant={newEntry.feelings.includes(feeling) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      newEntry.feelings.includes(feeling)
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "border-green-200 text-green-700 hover:bg-green-50"
                    }`}
                    onClick={() => toggleFeeling(feeling)}
                  >
                    {feeling}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-blue-900 mb-2 block">
                What's on your mind? *
              </Label>
              <Textarea
                id="notes"
                placeholder="Describe your thoughts, experiences, or anything you'd like to remember..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px] border-blue-200 focus:border-blue-300"
              />
            </div>

            {/* Questions for Therapist */}
            <div>
              <Label htmlFor="questions" className="text-sm font-medium text-blue-900 mb-2 block">
                Questions for your therapist (optional)
              </Label>
              <Textarea
                id="questions"
                placeholder="Any questions or topics you'd like to discuss in your next session..."
                value={newEntry.questionsForTherapist}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, questionsForTherapist: e.target.value }))}
                className="min-h-[80px] border-blue-200 focus:border-blue-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddEntry}
                disabled={!newEntry.notes.trim()}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingEntry(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200">
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">Start Your Mental Health Journey</h3>
              <p className="text-gray-600 mb-4">
                Begin by adding your first journal entry to track your feelings and thoughts.
              </p>
              <Button
                onClick={() => setIsAddingEntry(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-200">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Mood:</span>
                        <span className={`text-sm font-medium ${getMoodColor(entry.mood)}`}>
                          {entry.mood}/10 {getMoodEmoji(entry.mood)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feelings */}
                {entry.feelings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-2">Feelings:</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.feelings.map((feeling, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {feeling}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">Notes:</p>
                  <p className="text-gray-700 leading-relaxed">{entry.notes}</p>
                </div>

                {/* Questions for Therapist */}
                {entry.questionsForTherapist && (
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-2">Questions for Therapist:</p>
                    <p className="text-purple-700 leading-relaxed bg-purple-50 p-3 rounded-lg border border-purple-200">
                      {entry.questionsForTherapist}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

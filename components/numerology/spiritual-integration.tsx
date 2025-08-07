"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { BookOpen, Target, Heart, Lightbulb } from "lucide-react"
import { journalingPrompts } from "@/data/numerology-meanings"
import type { CoreNumbers, JournalingPrompt } from "@/types/numerology"

interface SpiritualIntegrationProps {
  coreNumbers: CoreNumbers
}

export function SpiritualIntegration({ coreNumbers }: SpiritualIntegrationProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<JournalingPrompt | null>(null)
  const [journalEntry, setJournalEntry] = useState("")
  const [savedEntries, setSavedEntries] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Load saved journal entries
    const saved = localStorage.getItem("numerologyJournal")
    if (saved) {
      try {
        setSavedEntries(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse journal entries:", error)
      }
    }
  }, [])

  const saveJournalEntry = () => {
    if (selectedPrompt && journalEntry.trim()) {
      const updatedEntries = {
        ...savedEntries,
        [selectedPrompt.id]: journalEntry,
      }
      setSavedEntries(updatedEntries)
      localStorage.setItem("numerologyJournal", JSON.stringify(updatedEntries))
      setJournalEntry("")
      setSelectedPrompt(null)
    }
  }

  const getRelevantPrompts = () => {
    return journalingPrompts.filter(
      (prompt) =>
        prompt.numberType === "lifePath" &&
        (prompt.number === coreNumbers.lifePathNumber ||
          prompt.number === coreNumbers.destinyNumber ||
          prompt.number === coreNumbers.soulUrgeNumber),
    )
  }

  const spiritualThemes = [
    {
      title: "Soul Purpose",
      icon: Target,
      description: "Understanding your deeper calling and life mission",
      numbers: [coreNumbers.lifePathNumber, coreNumbers.destinyNumber],
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Karmic Lessons",
      icon: BookOpen,
      description: "Patterns and lessons your soul is here to learn",
      numbers: [coreNumbers.soulUrgeNumber],
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Inner Wisdom",
      icon: Lightbulb,
      description: "Accessing your intuitive guidance and inner knowing",
      numbers: [coreNumbers.personalityNumber, coreNumbers.birthdayNumber],
      color: "from-blue-500 to-teal-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">Spiritual Integration</h2>
        <p className="text-purple-700 dark:text-purple-300">
          Connect your numbers with your spiritual journey and soul purpose
        </p>
      </div>

      {/* Spiritual Themes */}
      <div className="grid gap-6 md:grid-cols-3">
        {spiritualThemes.map((theme, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-purple-200 dark:border-purple-800"
          >
            <CardHeader className="text-center">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-r ${theme.color} flex items-center justify-center mx-auto mb-3`}
              >
                <theme.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-purple-900 dark:text-purple-100">{theme.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-700 dark:text-purple-300 mb-4">{theme.description}</p>
              <div className="flex justify-center gap-2">
                {theme.numbers.map((number, numIndex) => (
                  <Badge key={numIndex} className={`bg-gradient-to-r ${theme.color} text-white`}>
                    {number}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Journaling Section */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <BookOpen className="h-5 w-5" />
            Spiritual Journaling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-amber-700 dark:text-amber-300">
            Use these prompts to deepen your understanding of your numerological path and spiritual journey.
          </p>

          <div className="grid gap-3">
            {getRelevantPrompts().map((prompt, index) => (
              <Button
                key={index}
                variant={selectedPrompt?.id === prompt.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedPrompt(prompt)
                  setJournalEntry(savedEntries[prompt.id] || "")
                }}
                className="text-left h-auto p-4 justify-start"
              >
                <div>
                  <div className="font-medium mb-1">
                    {prompt.category.charAt(0).toUpperCase() + prompt.category.slice(1)} Reflection
                  </div>
                  <div className="text-sm opacity-80">{prompt.prompt}</div>
                </div>
              </Button>
            ))}
          </div>

          {selectedPrompt && (
            <div className="space-y-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Reflection Prompt</h4>
                <p className="text-amber-700 dark:text-amber-300 italic">"{selectedPrompt.prompt}"</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Your Reflection
                </label>
                <Textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Take your time to reflect deeply on this question. Let your thoughts flow freely..."
                  className="min-h-[150px] border-amber-200 dark:border-amber-700"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveJournalEntry}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={!journalEntry.trim()}
                >
                  Save Reflection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPrompt(null)
                    setJournalEntry("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Reflections */}
      {Object.keys(savedEntries).length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Heart className="h-5 w-5" />
              Your Spiritual Reflections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(savedEntries).map(([promptId, entry], index) => {
                const prompt = journalingPrompts.find((p) => p.id === promptId)
                if (!prompt) return null

                return (
                  <div key={index} className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-600 text-white shrink-0">{prompt.category}</Badge>
                      <div className="flex-1">
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-2 italic">"{prompt.prompt}"</p>
                        <p className="text-purple-800 dark:text-purple-200">{entry}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

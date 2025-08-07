"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Calendar, Moon, Sun, Star, Heart } from "lucide-react"
import { calculatePersonalDay, getNumberColor } from "@/utils/numerology-calculator"
import { numberMeanings } from "@/data/numerology-meanings"
import type { DailyVibe } from "@/types/numerology"

interface DailyVibesTrackerProps {
  birthDate: Date
}

export function DailyVibesTracker({ birthDate }: DailyVibesTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyVibes, setDailyVibes] = useState<DailyVibe[]>([])
  const [currentVibe, setCurrentVibe] = useState<DailyVibe>({
    date: new Date(),
    personalDay: calculatePersonalDay(birthDate, new Date()),
    mood: null,
    notes: "",
    energy: 5,
  })

  useEffect(() => {
    // Load saved vibes from localStorage
    const saved = localStorage.getItem("dailyVibes")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((vibe: any) => ({
          ...vibe,
          date: new Date(vibe.date),
        }))
        setDailyVibes(parsed)
      } catch (error) {
        console.error("Failed to parse daily vibes:", error)
      }
    }
  }, [])

  useEffect(() => {
    const personalDay = calculatePersonalDay(birthDate, selectedDate)
    const existingVibe = dailyVibes.find((vibe) => vibe.date.toDateString() === selectedDate.toDateString())

    if (existingVibe) {
      setCurrentVibe(existingVibe)
    } else {
      setCurrentVibe({
        date: selectedDate,
        personalDay,
        mood: null,
        notes: "",
        energy: 5,
      })
    }
  }, [selectedDate, dailyVibes, birthDate])

  const saveVibe = () => {
    const updatedVibes = dailyVibes.filter((vibe) => vibe.date.toDateString() !== currentVibe.date.toDateString())
    updatedVibes.push(currentVibe)
    setDailyVibes(updatedVibes)
    localStorage.setItem("dailyVibes", JSON.stringify(updatedVibes))
  }

  const personalDayMeaning = numberMeanings.find((meaning) => meaning.number === currentVibe.personalDay)

  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case "aligned":
        return <Star className="h-4 w-4" />
      case "neutral":
        return <Moon className="h-4 w-4" />
      case "challenging":
        return <Sun className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case "aligned":
        return "bg-green-500"
      case "neutral":
        return "bg-blue-500"
      case "challenging":
        return "bg-orange-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">Daily Vibes Tracker</h2>
        <p className="text-purple-700 dark:text-purple-300">
          Track how aligned you feel with your daily numerological energy
        </p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Calendar className="h-5 w-5" />
            Daily Energy Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full p-2 border border-blue-200 dark:border-blue-700 rounded-md bg-white dark:bg-gray-800"
            />
          </div>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
              style={{ backgroundColor: getNumberColor(currentVibe.personalDay) }}
            >
              {currentVibe.personalDay}
            </div>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Personal Day {currentVibe.personalDay}
            </h3>
            {personalDayMeaning && (
              <p className="text-blue-700 dark:text-blue-300 mt-2">
                {personalDayMeaning.title} - {personalDayMeaning.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              How aligned did you feel today?
            </label>
            <div className="flex gap-2 justify-center">
              {[
                { value: "aligned", label: "Aligned", icon: Star },
                { value: "neutral", label: "Neutral", icon: Moon },
                { value: "challenging", label: "Challenging", icon: Sun },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={currentVibe.mood === option.value ? "default" : "outline"}
                  onClick={() => setCurrentVibe({ ...currentVibe, mood: option.value as any })}
                  className={`flex items-center gap-2 ${
                    currentVibe.mood === option.value
                      ? getMoodColor(option.value) + " text-white"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              Energy Level: {currentVibe.energy}/10
            </label>
            <Slider
              value={[currentVibe.energy]}
              onValueChange={(value) => setCurrentVibe({ ...currentVibe, energy: value[0] })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Daily Notes & Reflections
            </label>
            <Textarea
              value={currentVibe.notes}
              onChange={(e) => setCurrentVibe({ ...currentVibe, notes: e.target.value })}
              placeholder="How did this day's energy manifest in your life? Any insights or patterns you noticed?"
              className="min-h-[100px] border-blue-200 dark:border-blue-700"
            />
          </div>

          <Button onClick={saveVibe} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Save Daily Vibe
          </Button>
        </CardContent>
      </Card>

      {dailyVibes.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-100">Recent Vibes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyVibes
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 7)
                .map((vibe, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: getNumberColor(vibe.personalDay) }}
                      >
                        {vibe.personalDay}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {vibe.date.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Energy: {vibe.energy}/10</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {vibe.mood && (
                        <Badge className={`${getMoodColor(vibe.mood)} text-white`}>
                          {getMoodIcon(vibe.mood)}
                          <span className="ml-1 capitalize">{vibe.mood}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

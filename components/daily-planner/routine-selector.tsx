"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Users, Star, Plus } from "lucide-react"
import type { Routine } from "@/types/daily-planner"

interface RoutineSelectorProps {
  routines?: Routine[]
  selectedRoutine?: string
  onSelectRoutine: (routineId: string) => void
  onCreateCustom: () => void
}

export function RoutineSelector({
  routines = [],
  selectedRoutine,
  onSelectRoutine,
  onCreateCustom,
}: RoutineSelectorProps) {
  const [filter, setFilter] = useState<"all" | "morning" | "evening" | "workout">("all")

  const getRoutineTags = (routine: Routine) => {
    const tags = []

    // Safe duration calculation
    const totalDuration =
      routine.timeBlocks?.reduce((total, block) => {
        return total + (block?.duration || 0)
      }, 0) || 0

    if (totalDuration > 0) {
      tags.push(`${totalDuration}min`)
    }

    // Safe habits count
    const habitsCount = routine.habits?.length || 0
    if (habitsCount > 0) {
      tags.push(`${habitsCount} habits`)
    }

    // Safe difficulty check
    if (routine.difficulty) {
      tags.push(routine.difficulty)
    }

    return tags
  }

  const filteredRoutines = routines.filter((routine) => {
    if (!routine) return false
    if (filter === "all") return true
    return routine.category === filter
  })

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="simple-card">
      <CardHeader>
        <CardTitle className="text-white">Choose Your Routine</CardTitle>
        <div className="flex gap-2 flex-wrap">
          {["all", "morning", "evening", "workout"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption as any)}
              className={filter === filterOption ? "simple-button" : "button-outline"}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredRoutines.length > 0 ? (
              filteredRoutines.map((routine) => (
                <Card
                  key={routine.id}
                  className={`cursor-pointer transition-all simple-card hover:border-yellow-500 ${
                    selectedRoutine === routine.id ? "border-yellow-500 bg-yellow-50/10" : ""
                  }`}
                  onClick={() => onSelectRoutine(routine.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{routine.name}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2">{routine.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{routine.rating || 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {getRoutineTags(routine)
                        .slice(0, 3)
                        .map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-gray-300 border-gray-600">
                            {tag}
                          </Badge>
                        ))}
                      {routine.difficulty && (
                        <Badge className={`text-xs ${getDifficultyColor(routine.difficulty)}`}>
                          {routine.difficulty}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {routine.timeBlocks?.reduce((total, block) => total + (block?.duration || 0), 0) || 0}min
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{routine.usedBy?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <span className="capitalize">{routine.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No routines found for this category.</p>
              </div>
            )}

            {/* Create Custom Routine Option */}
            <Card
              className="cursor-pointer transition-all simple-card hover:border-yellow-500 border-dashed"
              onClick={onCreateCustom}
            >
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <h3 className="font-semibold text-white mb-1">Create Custom Routine</h3>
                <p className="text-sm text-gray-300">Build your own personalized daily routine</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

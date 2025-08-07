"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Plus, Flame, Calendar } from "lucide-react"
import type { Habit } from "@/types/daily-planner"

interface HabitTrackerProps {
  habits: Habit[]
  onToggleHabit: (id: string) => void
  onAddHabit: () => void
}

export function HabitTracker({ habits, onToggleHabit, onAddHabit }: HabitTrackerProps) {
  const [showAll, setShowAll] = useState(false)

  const displayHabits = showAll ? habits : habits.slice(0, 4)
  const completedToday = habits.filter((h) => h.completedToday).length
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  const getCategoryColor = (category: string) => {
    const colors = {
      health: "bg-green-500/20 text-green-300 border-green-500/30",
      productivity: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      mindfulness: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      learning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    }
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground border-border"
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Habit Tracker
          </CardTitle>
          <Button onClick={onAddHabit} size="sm" className="gap-1 h-8 px-3 text-xs bg-primary hover:bg-primary/80">
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Today's Progress</span>
            <span className="font-semibold text-foreground">
              {completedToday}/{habits.length}
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No habits tracked yet</p>
            <Button onClick={onAddHabit} className="mt-3 h-8 px-4 text-xs bg-primary hover:bg-primary/80">
              Add Your First Habit
            </Button>
          </div>
        ) : (
          <>
            {displayHabits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded border transition-all duration-200 hover:shadow-sm ${
                  habit.completedToday
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleHabit(habit.id)}
                      className="h-8 w-8 p-0 hover:bg-transparent"
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-medium ${habit.completedToday ? "text-primary" : "text-foreground"}`}
                        >
                          {habit.name}
                        </span>
                        <Badge variant="outline" className={`${getCategoryColor(habit.category)} text-xs px-2 py-1`}>
                          {habit.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>{habit.streak} day streak</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span>{habit.frequency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {habits.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                {showAll ? "Show Less" : `Show ${habits.length - 4} More`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

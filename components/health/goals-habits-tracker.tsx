"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Flame, CheckCircle, Circle } from "lucide-react"
import type { HealthGoal, HealthHabit } from "@/types/health"

interface GoalsHabitsTrackerProps {
  goals: HealthGoal[]
  habits: HealthHabit[]
}

export function GoalsHabitsTracker({ goals, habits }: GoalsHabitsTrackerProps) {
  const [localHabits, setLocalHabits] = useState(habits)

  const toggleHabit = (habitId: string) => {
    setLocalHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? { ...habit, completed: !habit.completed, streak: habit.completed ? 0 : habit.streak + 1 }
          : habit,
      ),
    )
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fitness":
        return "🏃"
      case "nutrition":
        return "🥗"
      case "sleep":
        return "😴"
      case "mental":
        return "🧠"
      default:
        return "🎯"
    }
  }

  return (
    <Tabs defaultValue="goals" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="goals" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Goals
        </TabsTrigger>
        <TabsTrigger value="habits" className="flex items-center gap-2">
          <Flame className="h-4 w-4" />
          Habits
        </TabsTrigger>
      </TabsList>

      <TabsContent value="goals" className="space-y-4">
        <div className="grid gap-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100)
            const isCompleted = goal.current >= goal.target

            return (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                      <h3 className="font-semibold">{goal.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.streak > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {goal.streak}
                        </Badge>
                      )}
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>

                    <Progress value={percentage} className="h-2" />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{percentage.toFixed(0)}% complete</span>
                      {isCompleted ? (
                        <span className="text-green-600 font-medium">Goal achieved! 🎉</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {goal.target - goal.current} {goal.unit} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="habits" className="space-y-4">
        <div className="grid gap-3">
          {localHabits.map((habit) => (
            <Card key={habit.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={habit.completed}
                      onCheckedChange={() => toggleHabit(habit.id)}
                      className="h-5 w-5"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(habit.category)}</span>
                      <span className={`font-medium ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {habit.streak > 0 && (
                      <Badge variant={habit.completed ? "default" : "secondary"} className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {habit.streak}
                      </Badge>
                    )}
                    {habit.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {habit.streak > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {habit.streak === 1 ? "1 day streak" : `${habit.streak} day streak`}
                    {habit.streak >= 7 && " 🔥"}
                    {habit.streak >= 30 && " 💪"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Keep the streak alive!</span>
            </div>
            <p className="text-sm text-muted-foreground">Consistency is key to building lasting healthy habits.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

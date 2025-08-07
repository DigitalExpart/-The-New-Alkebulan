"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Check, Star, AlertCircle } from "lucide-react"
import type { DailyGoal } from "@/types/daily-planner"

interface DailyGoalsProps {
  goals: DailyGoal[]
  onToggleGoal: (id: string) => void
  onAddGoal: (goal: Omit<DailyGoal, "id">) => void
  successMessage?: string
}

export function DailyGoals({ goals, onToggleGoal, onAddGoal, successMessage }: DailyGoalsProps) {
  const [newGoal, setNewGoal] = useState("")
  const [priority, setPriority] = useState<1 | 2 | 3>(1)
  const [isAdding, setIsAdding] = useState(false)

  const completedGoals = goals.filter((g) => g.completed).length
  const totalGoals = goals.length

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onAddGoal({
        text: newGoal.trim(),
        priority,
        completed: false,
        category: "personal",
      })
      setNewGoal("")
      setPriority(1)
      setIsAdding(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case 2:
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case 3:
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "High"
      case 2:
        return "Med"
      case 3:
        return "Low"
      default:
        return "Priority"
    }
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Target className="w-5 h-5 text-primary" />
            Today's Goals
          </CardTitle>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            className="gap-1 h-8 px-3 text-xs bg-primary hover:bg-primary/80 text-primary-foreground"
            variant={isAdding ? "outline" : "default"}
          >
            <Plus className="w-3 h-3" />
            {isAdding ? "Cancel" : "Add"}
          </Button>
        </div>

        {totalGoals > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span className="font-semibold text-foreground">
              {completedGoals}/{totalGoals}
            </span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-primary/10 rounded border border-primary/30">
            <p className="text-primary text-sm font-medium">{successMessage}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {isAdding && (
          <div className="p-4 border border-border rounded bg-muted space-y-3">
            <Input
              placeholder="What do you want to accomplish today?"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
              className="h-9 text-sm bg-background border-border text-foreground"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Priority:</span>
              {[1, 2, 3].map((p) => (
                <Button
                  key={p}
                  variant={priority === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority(p as 1 | 2 | 3)}
                  className="text-xs h-7 px-3"
                >
                  {getPriorityLabel(p)}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddGoal}
                size="sm"
                disabled={!newGoal.trim()}
                className="h-8 px-4 text-xs bg-primary hover:bg-primary/80"
              >
                Add Goal
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" size="sm" className="h-8 px-4 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No goals set for today</p>
            <p className="text-xs mt-1">Add your first goal to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals
              .sort((a, b) => a.priority - b.priority)
              .map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded border transition-all duration-200 hover:shadow-sm ${
                    goal.completed ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {goal.priority === 1 && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {goal.priority === 2 && <Star className="w-4 h-4 text-yellow-400" />}
                        {goal.priority === 3 && <Target className="w-4 h-4 text-green-400" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`${getPriorityColor(goal.priority)} text-xs px-2 py-1`}>
                            P{goal.priority}
                          </Badge>
                        </div>

                        <p
                          className={`text-sm ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {goal.text}
                        </p>

                        {goal.completed && <p className="text-xs text-primary mt-2 font-medium">✓ Completed!</p>}
                      </div>
                    </div>

                    <Button
                      variant={goal.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleGoal(goal.id)}
                      className={`ml-3 h-8 w-8 p-0 ${
                        goal.completed ? "bg-primary hover:bg-primary/80 text-primary-foreground" : ""
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {totalGoals > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/30">
            <h4 className="font-semibold text-primary mb-1 text-sm">Success Criteria</h4>
            <p className="text-xs text-muted-foreground">
              "If I only accomplish my Priority 1 goals, today was a success!"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

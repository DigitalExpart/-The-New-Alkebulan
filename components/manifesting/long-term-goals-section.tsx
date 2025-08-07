"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, Trash2, Calendar, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Goal, GoalCategory } from "@/types/manifesting"
import { goalCategories } from "@/data/manifesting-data"

interface LongTermGoalsSectionProps {
  goals: {
    oneYear: Goal[]
    fiveYear: Goal[]
    tenYear: Goal[]
    lastUpdated: Date
  }
  onUpdate: (goals: any) => void
}

export function LongTermGoalsSection({ goals, onUpdate }: LongTermGoalsSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState<"oneYear" | "fiveYear" | "tenYear">("oneYear")
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    category: "personal",
    priority: "medium",
    progress: 0,
    milestones: [],
    completed: false,
  })

  const handleCreateGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title!,
      description: newGoal.description!,
      category: newGoal.category!,
      priority: newGoal.priority!,
      progress: 0,
      milestones: [],
      targetDate: newGoal.targetDate,
      completed: false,
      createdAt: new Date(),
    }

    const updatedGoals = {
      ...goals,
      [activeTimeframe]: [...goals[activeTimeframe], goal],
      lastUpdated: new Date(),
    }

    onUpdate(updatedGoals)
    setNewGoal({
      title: "",
      description: "",
      category: "personal",
      priority: "medium",
      progress: 0,
      milestones: [],
      completed: false,
    })
    setShowCreateDialog(false)
  }

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = {
      ...goals,
      [activeTimeframe]: goals[activeTimeframe].map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)),
      lastUpdated: new Date(),
    }
    onUpdate(updatedGoals)
  }

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = {
      ...goals,
      [activeTimeframe]: goals[activeTimeframe].filter((goal) => goal.id !== goalId),
      lastUpdated: new Date(),
    }
    onUpdate(updatedGoals)
  }

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case "oneYear":
        return "1 Year Goals"
      case "fiveYear":
        return "5 Year Goals"
      case "tenYear":
        return "10 Year Goals"
      default:
        return ""
    }
  }

  const getCategoryInfo = (category: GoalCategory) => {
    return goalCategories.find((cat) => cat.value === category) || goalCategories[0]
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Target className="w-5 h-5" />
          Long-Term Goals
          <Badge variant="secondary" className="ml-auto">
            {Object.values(goals).flat().length} Goals
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTimeframe} onValueChange={(value) => setActiveTimeframe(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="oneYear">1 Year</TabsTrigger>
            <TabsTrigger value="fiveYear">5 Years</TabsTrigger>
            <TabsTrigger value="tenYear">10 Years</TabsTrigger>
          </TabsList>

          {(["oneYear", "fiveYear", "tenYear"] as const).map((timeframe) => (
            <TabsContent key={timeframe} value={timeframe} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">{getTimeframeLabel(timeframe)}</h3>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setActiveTimeframe(timeframe)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Goal Title</Label>
                        <Input
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="Enter your goal title"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          placeholder="Describe your goal in detail"
                          className="min-h-[80px]"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={newGoal.category}
                          onValueChange={(value) => setNewGoal({ ...newGoal, category: value as GoalCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {goalCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <span className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  {category.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select
                          value={newGoal.priority}
                          onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Target Date (Optional)</Label>
                        <Input
                          type="date"
                          value={newGoal.targetDate ? new Date(newGoal.targetDate).toISOString().split("T")[0] : ""}
                          onChange={(e) =>
                            setNewGoal({
                              ...newGoal,
                              targetDate: e.target.value ? new Date(e.target.value) : undefined,
                            })
                          }
                        />
                      </div>
                      <Button
                        onClick={handleCreateGoal}
                        disabled={!newGoal.title || !newGoal.description}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Create Goal
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {goals[timeframe].length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No goals set for this timeframe yet.</p>
                  <p className="text-sm">Click "Add Goal" to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals[timeframe].map((goal) => {
                    const categoryInfo = getCategoryInfo(goal.category)
                    return (
                      <div
                        key={goal.id}
                        className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-blue-200 dark:border-blue-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h4>
                              <Badge className={categoryInfo.color}>
                                <span className="mr-1">{categoryInfo.icon}</span>
                                {categoryInfo.label}
                              </Badge>
                              <Badge
                                variant={
                                  goal.priority === "high"
                                    ? "destructive"
                                    : goal.priority === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {goal.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                            {goal.targetDate && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                Target: {new Date(goal.targetDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateGoal(goal.id, { completed: !goal.completed })}
                              className={goal.completed ? "text-green-600" : "text-gray-400"}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateGoal(goal.id, { progress: Math.min(100, goal.progress + 10) })}
                              disabled={goal.completed}
                            >
                              +10%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateGoal(goal.id, { progress: Math.max(0, goal.progress - 10) })}
                              disabled={goal.completed}
                            >
                              -10%
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {goals.lastUpdated && (
          <p className="text-xs text-gray-500 text-right">Last updated: {goals.lastUpdated.toLocaleDateString()}</p>
        )}
      </CardContent>
    </Card>
  )
}

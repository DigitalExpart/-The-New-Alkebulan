"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Plus, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import type { BusinessGoal } from "@/types/business"
import { CreateGoalDialog } from "./create-goal-dialog"

interface BusinessGoalsTrackerProps {
  goals?: BusinessGoal[]
}

export function BusinessGoalsTracker({ goals = [] }: BusinessGoalsTrackerProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "on_track":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "at_risk":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "revenue":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "product":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "marketing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "customer":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "USD" || unit === "€") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: unit === "€" ? "EUR" : "USD",
      }).format(value)
    }
    return `${value} ${unit}`
  }

  const filteredGoals = goals.filter((goal) => {
    if (categoryFilter === "all") return true
    return goal.category === categoryFilter
  })

  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Business Goals
            </CardTitle>
            <CreateGoalDialog onGoalCreated={() => {}} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Goals Set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set business goals to track your progress and achieve success.
            </p>
            <CreateGoalDialog 
              onGoalCreated={() => {}} 
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedGoals = goals.filter((g) => g.status === "completed").length
  const inProgressGoals = goals.filter((g) => g.status === "in_progress").length
  const overdueGoals = goals.filter((g) => isOverdue(g.deadline)).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Business Goals
            <Badge variant="secondary" className="ml-2">
              {goals.length} total
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <CreateGoalDialog onGoalCreated={() => {}} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Goals Overview Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{inProgressGoals}</div>
            <div className="text-xs text-blue-600">In Progress</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{overdueGoals}</div>
            <div className="text-xs text-red-600">Overdue</div>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal.current, goal.target)
            const overdue = isOverdue(goal.deadline)

            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        {overdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
                        <Badge className={getStatusColor(goal.status)}>{goal.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDeadline(goal.deadline)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {progress > 75 ? "On track" : progress > 50 ? "Good progress" : "Needs attention"}
                    </div>
                    <Button size="sm" variant="outline">
                      Update Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredGoals.length === 0 && categoryFilter !== "all" && (
          <div className="text-center py-8">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No goals found in the {categoryFilter} category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

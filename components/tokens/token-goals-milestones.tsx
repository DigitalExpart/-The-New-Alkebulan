"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Target, Trophy, Lock } from "lucide-react"
import type { TokenGoal } from "@/types/tokens"

interface TokenGoalsMilestonesProps {
  goals: TokenGoal[]
}

export function TokenGoalsMilestones({ goals }: TokenGoalsMilestonesProps) {
  const activeGoals = goals.filter((goal) => !goal.isCompleted)
  const completedGoals = goals.filter((goal) => goal.isCompleted)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Goals & Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Active Goals
              </h3>
              <div className="space-y-4">
                {activeGoals.map((goal) => {
                  const progress = (goal.currentTokens / goal.targetTokens) * 100
                  const isNearCompletion = progress >= 90

                  return (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg ${
                        isNearCompletion ? "border-yellow-200 bg-yellow-50" : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                        </div>
                        <Badge variant={goal.category === "badge" ? "default" : "secondary"}>{goal.category}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {goal.currentTokens.toLocaleString()} / {goal.targetTokens.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {Math.max(0, goal.targetTokens - goal.currentTokens).toLocaleString()} tokens remaining
                          </span>
                          <span className="text-xs font-medium">{progress.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Reward:</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{goal.reward}</p>
                      </div>

                      {isNearCompletion && (
                        <div className="mt-3 flex items-center gap-2 text-yellow-600">
                          <span className="text-sm">🔥</span>
                          <span className="text-sm font-medium">Almost there! Keep going!</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Completed Goals
              </h3>
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <h4 className="font-medium text-green-900">{goal.title}</h4>
                          <p className="text-sm text-green-700">
                            Completed on{" "}
                            {goal.completedDate ? new Date(goal.completedDate).toLocaleDateString() : "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800">
                      <strong>Reward Unlocked:</strong> {goal.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-semibold mb-2">Keep Earning Tokens!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete courses, mentor others, and contribute to the community to unlock more rewards.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm">
                <Target className="h-4 w-4 mr-2" />
                View All Opportunities
              </Button>
              <Button variant="outline" size="sm">
                <Lock className="h-4 w-4 mr-2" />
                Unlock Premium Goals
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

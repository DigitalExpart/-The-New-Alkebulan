"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HealthMetrics {
  physicalHealth: number
  mentalWellbeing: number
  nutrition: number
  sleep: number
  fitness: number
  stress: number
}

interface HealthOverviewProps {
  data: {
    metrics: HealthMetrics
    period: string
  }
}

export function HealthOverview({ data }: HealthOverviewProps) {
  const { metrics, period } = data

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "😊"
    if (score >= 60) return "😐"
    return "😟"
  }

  const getTrendIcon = (score: number) => {
    if (score >= 75) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 50) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const overallScore = Math.round(
    (metrics.physicalHealth +
      metrics.mentalWellbeing +
      metrics.nutrition +
      metrics.sleep +
      metrics.fitness +
      (100 - metrics.stress)) /
      6,
  )

  const healthCategories = [
    { key: "physicalHealth", label: "Physical Health", value: metrics.physicalHealth, icon: "💪" },
    { key: "mentalWellbeing", label: "Mental Wellbeing", value: metrics.mentalWellbeing, icon: "🧠" },
    { key: "nutrition", label: "Nutrition", value: metrics.nutrition, icon: "🥗" },
    { key: "sleep", label: "Sleep Quality", value: metrics.sleep, icon: "😴" },
    { key: "fitness", label: "Fitness Level", value: metrics.fitness, icon: "🏃" },
    { key: "stress", label: "Stress Level", value: 100 - metrics.stress, icon: "😌", inverted: true },
  ]

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <span className="text-2xl">{getScoreEmoji(overallScore)}</span>
            Overall Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>{overallScore}%</div>
          <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
            {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Attention"}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">Based on {period} data</p>
        </CardContent>
      </Card>

      {/* Health Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthCategories.map((category) => (
          <Card key={category.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-sm">{category.label}</span>
                </div>
                {getTrendIcon(category.value)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(category.value)}`}>{category.value}%</span>
                  <span className="text-lg">{getScoreEmoji(category.value)}</span>
                </div>

                <Progress value={category.value} className="h-2" />

                <p className="text-xs text-muted-foreground">
                  {category.value >= 80 ? "Excellent" : category.value >= 60 ? "Good" : "Needs improvement"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span>
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallScore >= 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 Great job! Your overall health is excellent. Keep up the good work with your current routine.
                </p>
              </div>
            )}

            {metrics.stress > 70 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ Your stress levels are high. Consider meditation, exercise, or speaking with a health coach.
                </p>
              </div>
            )}

            {metrics.sleep < 60 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  😴 Your sleep quality could improve. Try establishing a consistent bedtime routine.
                </p>
              </div>
            )}

            {metrics.fitness < 50 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🏃 Consider increasing your physical activity. Even 30 minutes of daily exercise can make a big
                  difference.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

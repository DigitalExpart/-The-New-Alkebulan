import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, AlertTriangle, Info, CheckCircle } from "lucide-react"
import type { FinanceTip } from "@/types/finance"

interface FinanceTipsProps {
  tips: FinanceTip[]
}

export function FinanceTips({ tips }: FinanceTipsProps) {
  const getPriorityIcon = (priority: FinanceTip["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: FinanceTip["priority"]) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    }

    return <Badge className={colors[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</Badge>
  }

  const getCategoryBadge = (category: FinanceTip["category"]) => {
    const colors = {
      investment: "bg-blue-100 text-blue-800 border-blue-200",
      savings: "bg-green-100 text-green-800 border-green-200",
      spending: "bg-purple-100 text-purple-800 border-purple-200",
      earning: "bg-orange-100 text-orange-800 border-orange-200",
    }

    return (
      <Badge variant="outline" className={colors[category]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  // Calculate financial health score based on tips
  const highPriorityCount = tips.filter((tip) => tip.priority === "high").length
  const totalTips = tips.length
  const healthScore = Math.max(
    0,
    100 - highPriorityCount * 20 - tips.filter((tip) => tip.priority === "medium").length * 10,
  )

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg font-semibold">AI Finance Tips</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Financial Health Score</div>
            <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}/100</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(tip.priority)}
                  <h3 className="font-semibold">{tip.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(tip.priority)}
                  {getCategoryBadge(tip.category)}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{tip.description}</p>

              {tip.actionable && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>Actionable recommendation</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Take Action
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {tips.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No finance tips available at the moment.</p>
            <p className="text-sm">Check back later for personalized recommendations.</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Financial Health Summary</span>
          </div>
          <p className="text-sm text-green-700">
            {healthScore >= 80 && "Excellent! Your financial health is strong. Keep up the good work!"}
            {healthScore >= 60 &&
              healthScore < 80 &&
              "Good progress! Address the medium priority items to improve further."}
            {healthScore < 60 && "Focus on the high priority recommendations to improve your financial health."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

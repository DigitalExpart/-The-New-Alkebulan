"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Target } from "lucide-react"

interface FundingProgressProps {
  currentRaised: number
  goalAmount: number
  investors?: number
  daysLeft?: number
  currentRound: string
}

export function FundingProgress({
  currentRaised,
  goalAmount,
  investors,
  daysLeft,
  currentRound,
}: FundingProgressProps) {
  const progressPercentage = goalAmount ? (currentRaised / goalAmount) * 100 : 0

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount.toLocaleString()}`
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">
              {formatLargeCurrency(currentRaised)} of {formatLargeCurrency(goalAmount)} raised
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {currentRound}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {(investors ?? 0).toLocaleString()} investors
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {daysLeft ?? 0} days left
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{progressPercentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">of goal reached</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <Progress value={progressPercentage} className="h-3 mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>€0</span>
          <span>{formatLargeCurrency(goalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

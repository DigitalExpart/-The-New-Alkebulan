"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { TokenSource } from "@/types/tokens"

interface TokenSourceBreakdownProps {
  sources: TokenSource[]
}

export function TokenSourceBreakdown({ sources }: TokenSourceBreakdownProps) {
  const totalTokens = sources.reduce((sum, source) => sum + source.tokensEarned, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Token Sources Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sources.map((source) => (
            <div key={source.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{source.icon}</span>
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{source.tokensEarned.toLocaleString()}</div>
                  <Badge variant="secondary" className="text-xs">
                    {source.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={source.percentage}
                className="h-2"
                style={{
                  background: `linear-gradient(to right, ${source.color}20, ${source.color}10)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Tokens Earned</span>
            <span className="text-xl font-bold">{totalTokens.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Star, Lock, ArrowRight } from "lucide-react"
import type { TokenUse } from "@/types/tokens"

interface TokenUsesPreviewProps {
  uses: TokenUse[]
  currentBalance: number
}

export function TokenUsesPreview({ uses, currentBalance }: TokenUsesPreviewProps) {
  const availableUses = uses.filter((use) => use.available)
  const popularUses = uses.filter((use) => use.popular)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            Ways to Use Your Tokens
          </CardTitle>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Popular Uses */}
          {popularUses.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Popular Choices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularUses.slice(0, 4).map((use) => {
                  const canAfford = currentBalance >= use.cost

                  return (
                    <div
                      key={use.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                        canAfford ? "border-border hover:border-primary/50" : "border-muted bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{use.icon}</span>
                          <div>
                            <h4 className={`font-medium ${!canAfford ? "text-muted-foreground" : ""}`}>{use.title}</h4>
                            <p className={`text-sm ${!canAfford ? "text-muted-foreground" : "text-muted-foreground"}`}>
                              {use.description}
                            </p>
                          </div>
                        </div>
                        {use.popular && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Popular</Badge>}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-yellow-600" />
                          <span className={`font-semibold ${!canAfford ? "text-muted-foreground" : ""}`}>
                            {use.cost.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          disabled={!canAfford || !use.available}
                          variant={canAfford ? "default" : "secondary"}
                        >
                          {!use.available ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Coming Soon
                            </>
                          ) : !canAfford ? (
                            "Need More Tokens"
                          ) : (
                            "Use Tokens"
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* All Available Uses */}
          <div>
            <h3 className="font-semibold mb-4">All Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableUses.slice(0, 6).map((use) => {
                const canAfford = currentBalance >= use.cost

                return (
                  <div
                    key={use.id}
                    className={`p-3 border rounded-lg text-center transition-all hover:shadow-sm ${
                      canAfford ? "border-border" : "border-muted bg-muted/20"
                    }`}
                  >
                    <div className="text-2xl mb-2">{use.icon}</div>
                    <h4 className={`font-medium text-sm mb-1 ${!canAfford ? "text-muted-foreground" : ""}`}>
                      {use.title}
                    </h4>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Coins className="h-3 w-3 text-yellow-600" />
                      <span className={`text-xs font-semibold ${!canAfford ? "text-muted-foreground" : ""}`}>
                        {use.cost}
                      </span>
                    </div>
                    <Badge variant={canAfford ? "default" : "secondary"} className="text-xs">
                      {canAfford ? "Available" : "Need More"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Token Earning Tips */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">💡</span>
              <h3 className="font-semibold">Need More Tokens?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Here are some quick ways to earn more tokens:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span>🎓</span>
                <span>Complete courses</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✍️</span>
                <span>Create content</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👨‍🏫</span>
                <span>Mentor others</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>Refer friends</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

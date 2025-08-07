"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TokenBalanceOverview } from "@/components/tokens/token-balance-overview"
import { TokenSourceBreakdown } from "@/components/tokens/token-source-breakdown"
import { TokenActivityLog } from "@/components/tokens/token-activity-log"
import { TokenGrowthChart } from "@/components/tokens/token-growth-chart"
import { TokenGoalsMilestones } from "@/components/tokens/token-goals-milestones"
import { TokenUsesPreview } from "@/components/tokens/token-uses-preview"
import { Coins, TrendingUp, Target, Gift, Sparkles, Calendar, Award, Zap } from "lucide-react"
import {
  tokenBalance,
  tokenSources,
  tokenTransactions,
  tokenGrowthData,
  tokenGoals,
  tokenUses,
  tokenAnalytics,
} from "@/data/tokens-data"

export default function MyTokensPage() {
  const [showAnimation, setShowAnimation] = useState(false)

  const triggerTokenAnimation = () => {
    setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Coins className="h-12 w-12" />
                {showAnimation && (
                  <div className="absolute -top-2 -right-2 animate-bounce">
                    <span className="text-2xl">+20 🎉</span>
                  </div>
                )}
              </div>
              <h1 className="font-bold text-4xl md:text-5xl">🪙 Your Token Wallet</h1>
            </div>
            <p className="text-xl md:text-2xl font-medium mb-6">Track, earn, and spend your DMH tokens</p>
            <p className="text-lg text-yellow-100 mb-8 max-w-3xl mx-auto">
              Tokens are your gateway to premium features, exclusive content, and community rewards. Every action you
              take in the diaspora community earns you tokens that unlock new possibilities.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{tokenBalance.current.toLocaleString()}</div>
                <div className="text-yellow-100 text-sm">Current Balance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">+{tokenAnalytics.weeklyGrowth}%</div>
                <div className="text-yellow-100 text-sm">Weekly Growth</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{tokenAnalytics.streakDays}</div>
                <div className="text-yellow-100 text-sm">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  #{tokenSources.findIndex((s) => s.name === tokenAnalytics.topEarningSource) + 1}
                </div>
                <div className="text-yellow-100 text-sm">Top Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Token Balance Overview */}
          <TokenBalanceOverview balance={tokenBalance} />

          {/* Welcome Message */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">Welcome to Your Token Economy!</h2>
                  <p className="text-blue-700">
                    Your tokens represent your contributions and engagement in the diaspora community.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl mb-2">🎓</div>
                  <h3 className="font-semibold mb-1">Learn & Earn</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete courses and gain knowledge while earning tokens
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl mb-2">🤝</div>
                  <h3 className="font-semibold mb-1">Share & Grow</h3>
                  <p className="text-sm text-muted-foreground">
                    Mentor others and create content to multiply your earnings
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl mb-2">🎁</div>
                  <h3 className="font-semibold mb-1">Spend & Unlock</h3>
                  <p className="text-sm text-muted-foreground">Use tokens for premium features and exclusive access</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="spend" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Spend
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TokenSourceBreakdown sources={tokenSources} />
                <TokenUsesPreview uses={tokenUses} currentBalance={tokenBalance.current} />
              </div>
              <TokenGrowthChart data={tokenGrowthData} />
            </TabsContent>

            <TabsContent value="activity">
              <TokenActivityLog transactions={tokenTransactions} />
            </TabsContent>

            <TabsContent value="goals">
              <TokenGoalsMilestones goals={tokenGoals} />
            </TabsContent>

            <TabsContent value="spend">
              <div className="space-y-6">
                <TokenUsesPreview uses={tokenUses} currentBalance={tokenBalance.current} />

                {/* Detailed Token Uses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      All Available Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tokenUses.map((use) => {
                        const canAfford = tokenBalance.current >= use.cost

                        return (
                          <Card key={use.id} className={`${!canAfford ? "opacity-60" : ""}`}>
                            <CardContent className="p-4">
                              <div className="text-center mb-4">
                                <div className="text-3xl mb-2">{use.icon}</div>
                                <h3 className="font-semibold">{use.title}</h3>
                                <p className="text-sm text-muted-foreground">{use.description}</p>
                              </div>

                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Coins className="h-4 w-4 text-yellow-600" />
                                  <span className="font-semibold">{use.cost.toLocaleString()}</span>
                                </div>
                                <Badge variant={use.category === "education" ? "default" : "secondary"}>
                                  {use.category}
                                </Badge>
                              </div>

                              <Button
                                className="w-full"
                                disabled={!canAfford || !use.available}
                                onClick={triggerTokenAnimation}
                              >
                                {!use.available ? "Coming Soon" : !canAfford ? "Need More Tokens" : "Use Tokens"}
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <TokenGrowthChart data={tokenGrowthData} />

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">+{tokenAnalytics.weeklyGrowth}%</div>
                      <p className="text-xs text-muted-foreground">vs last week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">+{tokenAnalytics.monthlyGrowth}%</div>
                      <p className="text-xs text-muted-foreground">vs last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Weekly Earnings</CardTitle>
                      <Coins className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tokenAnalytics.averageEarningsPerWeek}</div>
                      <p className="text-xs text-muted-foreground">tokens per week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                      <Zap className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{tokenAnalytics.streakDays}</div>
                      <p className="text-xs text-muted-foreground">days active</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-4">Ready to Earn More Tokens?</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Join courses, mentor others, create content, and participate in community projects to maximize your
                token earnings and unlock exclusive rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Explore Earning Opportunities
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Set New Goals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

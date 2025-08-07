"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp } from "lucide-react"

export function InvestmentCalculator() {
  const [investmentAmount, setInvestmentAmount] = useState(1000)
  const [timeHorizon, setTimeHorizon] = useState(5)
  const [scenario, setScenario] = useState<"conservative" | "realistic" | "optimistic">("realistic")

  const growthRates = {
    conservative: 0.05,
    realistic: 0.15,
    optimistic: 0.25,
  }

  const calculateFutureValue = (principal: number, rate: number, years: number) => {
    return principal * Math.pow(1 + rate, years)
  }

  const futureValue = calculateFutureValue(investmentAmount, growthRates[scenario], timeHorizon)
  const totalGain = futureValue - investmentAmount
  const totalReturn = ((totalGain / investmentAmount) * 100).toFixed(1)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const investmentTiers = [
    { name: "Supporter", min: 100, max: 499, badge: "🌱" },
    { name: "Investor", min: 500, max: 1999, badge: "💎" },
    { name: "Partner", min: 2000, max: 4999, badge: "👑" },
    { name: "Champion", min: 5000, max: 10000, badge: "🚀" },
  ]

  const getCurrentTier = (amount: number) => {
    return investmentTiers.find((tier) => amount >= tier.min && amount <= tier.max)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Investment Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  min={100}
                  max={10000}
                />
                {getCurrentTier(investmentAmount) && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg">{getCurrentTier(investmentAmount)?.badge}</span>
                    <Badge variant="secondary">{getCurrentTier(investmentAmount)?.name} Tier</Badge>
                  </div>
                )}
              </div>

              <div>
                <Label>Time Horizon: {timeHorizon} years</Label>
                <Slider
                  value={[timeHorizon]}
                  onValueChange={(value) => setTimeHorizon(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 year</span>
                  <span>10 years</span>
                </div>
              </div>

              <div>
                <Label>Growth Scenario</Label>
                <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative (5% annually)</SelectItem>
                    <SelectItem value="realistic">Realistic (15% annually)</SelectItem>
                    <SelectItem value="optimistic">Optimistic (25% annually)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-muted-foreground">Projected Value</div>
                    <div className="text-3xl font-bold text-primary">{formatCurrency(futureValue)}</div>
                    <div className="text-sm text-green-600">
                      +{formatCurrency(totalGain)} ({totalReturn}% return)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Initial Investment</div>
                  <div className="text-lg font-semibold">{formatCurrency(investmentAmount)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Annual Growth</div>
                  <div className="text-lg font-semibold">{(growthRates[scenario] * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Year-by-Year Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: Math.min(timeHorizon, 10) }, (_, i) => {
              const year = i + 1
              const value = calculateFutureValue(investmentAmount, growthRates[scenario], year)
              const gain = value - investmentAmount
              const returnPercentage = ((gain / investmentAmount) * 100).toFixed(1)

              return (
                <div key={year} className="flex items-center justify-between py-2 border-b border-muted">
                  <div className="font-medium">Year {year}</div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(value)}</div>
                    <div className="text-sm text-green-600">+{returnPercentage}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

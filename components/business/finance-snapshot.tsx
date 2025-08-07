"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Euro, TrendingUp, CreditCard, AlertCircle, ArrowRight } from "lucide-react"

export function FinanceSnapshot() {
  const financeData = {
    totalEarnings: 12450,
    availableBalance: 8320,
    pendingPayouts: 2130,
    monthlyFees: 245,
    payoutMethod: "Bank Transfer",
    payoutStatus: "verified",
    nextPayout: "2024-01-25",
  }

  const payoutProgress =
    (financeData.availableBalance / (financeData.availableBalance + financeData.pendingPayouts)) * 100

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Finance Snapshot
          </CardTitle>
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4 mr-2" />
            Full Finance Dashboard
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Earnings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold">€{financeData.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>

          {/* Available Balance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Available Balance</span>
            </div>
            <div className="text-2xl font-bold">€{financeData.availableBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </div>

          {/* Pending Payouts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending Payouts</span>
            </div>
            <div className="text-2xl font-bold">€{financeData.pendingPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </div>

          {/* Monthly Fees */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Monthly Fees</span>
            </div>
            <div className="text-2xl font-bold">€{financeData.monthlyFees}</div>
            <p className="text-xs text-muted-foreground">Platform & processing</p>
          </div>
        </div>

        {/* Payout Information */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Payout Settings</h4>
            <Badge variant={financeData.payoutStatus === "verified" ? "default" : "secondary"}>
              {financeData.payoutStatus}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method:</span>
              <span>{financeData.payoutMethod}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Payout:</span>
              <span>{new Date(financeData.nextPayout).toLocaleDateString()}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payout Progress:</span>
                <span>{payoutProgress.toFixed(0)}%</span>
              </div>
              <Progress value={payoutProgress} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

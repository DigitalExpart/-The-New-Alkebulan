"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import type { TokenBalance } from "@/types/tokens"

interface TokenBalanceOverviewProps {
  balance: TokenBalance
}

export function TokenBalanceOverview({ balance }: TokenBalanceOverviewProps) {
  const spentPercentage = (balance.totalSpent / balance.totalEarned) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800">Current Balance</CardTitle>
          <div className="p-2 bg-yellow-100 rounded-full">
            <Coins className="h-4 w-4 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🪙</span>
            <div>
              <div className="text-2xl font-bold text-yellow-900">{balance.current.toLocaleString()}</div>
              {balance.currencyEquivalent && (
                <p className="text-xs text-yellow-700">≈ €{balance.currencyEquivalent.amount.toFixed(2)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Earned */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Total Earned</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <div>
              <div className="text-2xl font-bold text-green-900">{balance.totalEarned.toLocaleString()}</div>
              <p className="text-xs text-green-700">All-time earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Spent</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💸</span>
            <div>
              <div className="text-2xl font-bold text-blue-900">{balance.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-blue-700">{spentPercentage.toFixed(1)}% of earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Savings Rate</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {((balance.current / balance.totalEarned) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-purple-700">Tokens saved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

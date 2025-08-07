import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, DollarSign, Clock, ArrowUp } from "lucide-react"
import type { FinanceOverview } from "@/types/finance"

interface FinanceOverviewCardsProps {
  data: FinanceOverview
  selectedCurrency: "eur" | "usd" | "dmh"
}

export function FinanceOverviewCards({ data, selectedCurrency }: FinanceOverviewCardsProps) {
  const formatCurrency = (amount: number, currency: "eur" | "usd" | "dmh") => {
    if (currency === "dmh") {
      return `${amount.toFixed(2)} DMH`
    }
    const symbol = currency === "eur" ? "€" : "$"
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const getWalletBalance = () => {
    switch (selectedCurrency) {
      case "eur":
        return data.walletBalance.eur
      case "usd":
        return data.walletBalance.usd
      case "dmh":
        return data.walletBalance.dmhTokens
      default:
        return data.walletBalance.eur
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Wallet Balance */}
      <Card className="simple-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Wallet Balance</CardTitle>
          <Wallet className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(getWalletBalance(), selectedCurrency)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="text-xs badge-simple">
              Available
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Invested */}
      <Card className="simple-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Invested</CardTitle>
          <TrendingUp className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(data.totalInvested, selectedCurrency)}</div>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUp className="h-3 w-3 text-green-400" />
            <span className="text-xs text-green-400 font-medium">+{data.monthlyGrowth.invested}% this month</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Earned */}
      <Card className="simple-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Earned</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(data.totalEarned, selectedCurrency)}</div>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUp className="h-3 w-3 text-green-400" />
            <span className="text-xs text-green-400 font-medium">+{data.monthlyGrowth.earned}% this month</span>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card className="simple-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Pending Payments</CardTitle>
          <Clock className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(data.pendingPayments, selectedCurrency)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs badge-simple">
              Processing
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Eye, ArrowUpRight, Calendar } from "lucide-react"
import type { Investment } from "@/types/finance"

interface InvestmentsSectionProps {
  investments: Investment[]
}

export function InvestmentsSection({ investments }: InvestmentsSectionProps) {
  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const getStatusBadge = (status: Investment["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "Green Energy": "bg-green-100 text-green-800 border-green-200",
      Technology: "bg-blue-100 text-blue-800 border-blue-200",
      Agriculture: "bg-amber-100 text-amber-800 border-amber-200",
      Healthcare: "bg-red-100 text-red-800 border-red-200",
      Education: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalReturn = totalCurrentValue - totalInvested
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-xl font-semibold">Active Investments</CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Total Invested</div>
              <div className="font-semibold">{formatCurrency(totalInvested)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Current Value</div>
              <div className="font-semibold">{formatCurrency(totalCurrentValue)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Total Return</div>
              <div className={`font-semibold ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalReturn >= 0 ? "+" : ""}
                {formatCurrency(totalReturn)} ({totalReturnPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {investments.map((investment) => (
            <div key={investment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Investment Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{investment.projectTitle}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryColor(investment.category)}>{investment.category}</Badge>
                        {getStatusBadge(investment.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Invested on {new Date(investment.investmentDate).toLocaleDateString()}</span>
                  </div>

                  {/* Investment Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Invested</div>
                      <div className="font-semibold">{formatCurrency(investment.investedAmount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Value</div>
                      <div className="font-semibold">{formatCurrency(investment.currentValue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Return</div>
                      <div
                        className={`font-semibold flex items-center ${investment.returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {investment.returnPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Profit/Loss</div>
                      <div
                        className={`font-semibold ${investment.currentValue >= investment.investedAmount ? "text-green-600" : "text-red-600"}`}
                      >
                        {investment.currentValue >= investment.investedAmount ? "+" : ""}
                        {formatCurrency(investment.currentValue - investment.investedAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Performance</span>
                      <span>{investment.returnPercentage.toFixed(1)}% return</span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, investment.returnPercentage + 50))} className="h-2" />
                  </div>

                  {/* Projections */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Return Projections</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500">1 Year</div>
                        <div className="font-semibold">{formatCurrency(investment.projections.oneYear)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">3 Years</div>
                        <div className="font-semibold">{formatCurrency(investment.projections.threeYear)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">5 Years</div>
                        <div className="font-semibold">{formatCurrency(investment.projections.fiveYear)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 lg:ml-6">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {investments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active investments yet.</p>
            <p className="text-sm">Start investing to see your portfolio here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

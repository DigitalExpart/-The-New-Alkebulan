import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import type { IncomeStream } from "@/types/finance"

interface IncomeStreamsProps {
  incomeStreams: IncomeStream[]
}

export function IncomeStreams({ incomeStreams }: IncomeStreamsProps) {
  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const totalMonthlyIncome = incomeStreams.reduce((sum, stream) => sum + stream.monthlyAmount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-xl font-semibold">Income Streams</CardTitle>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Monthly Income</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyIncome)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {incomeStreams.map((stream) => (
            <div key={stream.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{stream.icon}</div>
                  <div>
                    <h3 className="font-semibold">{stream.source}</h3>
                    <div className="text-sm text-gray-500">{stream.percentage}% of total income</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">{formatCurrency(stream.monthlyAmount)}</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Contribution to total income</span>
                  <span>{stream.percentage}%</span>
                </div>
                <Progress value={stream.percentage} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Earned</div>
                  <div className="font-medium">{formatCurrency(stream.totalEarned)}</div>
                </div>
                <div className="flex items-center space-x-1">
                  {stream.growth >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${stream.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stream.growth >= 0 ? "+" : ""}
                    {stream.growth.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {incomeStreams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No income streams tracked yet.</p>
            <p className="text-sm">Start earning to see your income breakdown here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

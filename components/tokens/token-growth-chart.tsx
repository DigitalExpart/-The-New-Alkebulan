"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { TokenGrowthData } from "@/types/tokens"

interface TokenGrowthChartProps {
  data: TokenGrowthData[]
}

export function TokenGrowthChart({ data }: TokenGrowthChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y">("30d")
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const getFilteredData = () => {
    const now = new Date()
    let daysBack = 30

    switch (timeRange) {
      case "7d":
        daysBack = 7
        break
      case "30d":
        daysBack = 30
        break
      case "1y":
        daysBack = 365
        break
    }

    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    return data.filter((item) => new Date(item.date) >= cutoffDate)
  }

  const filteredData = getFilteredData()

  const chartConfig = {
    tokens: {
      label: "Total Tokens",
      color: "hsl(var(--chart-1))",
    },
    earned: {
      label: "Earned",
      color: "hsl(var(--chart-2))",
    },
    spent: {
      label: "Spent",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Token Growth Over Time
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
              >
                Area
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                Line
              </Button>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button variant={timeRange === "7d" ? "default" : "ghost"} size="sm" onClick={() => setTimeRange("7d")}>
                7D
              </Button>
              <Button variant={timeRange === "30d" ? "default" : "ghost"} size="sm" onClick={() => setTimeRange("30d")}>
                30D
              </Button>
              <Button variant={timeRange === "1y" ? "default" : "ghost"} size="sm" onClick={() => setTimeRange("1y")}>
                1Y
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  fill="var(--color-tokens)"
                  fillOpacity={0.3}
                  name="Total Tokens"
                />
                <Area
                  type="monotone"
                  dataKey="earned"
                  stroke="var(--color-earned)"
                  fill="var(--color-earned)"
                  fillOpacity={0.3}
                  name="Daily Earned"
                />
              </AreaChart>
            ) : (
              <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  strokeWidth={2}
                  name="Total Tokens"
                />
                <Line
                  type="monotone"
                  dataKey="earned"
                  stroke="var(--color-earned)"
                  strokeWidth={2}
                  name="Daily Earned"
                />
                <Line type="monotone" dataKey="spent" stroke="var(--color-spent)" strokeWidth={2} name="Daily Spent" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{filteredData.reduce((sum, item) => sum + item.earned, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              -{filteredData.reduce((sum, item) => sum + item.spent, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredData.length > 0 ? filteredData[filteredData.length - 1].tokens : 0}
            </div>
            <div className="text-sm text-muted-foreground">Current Balance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

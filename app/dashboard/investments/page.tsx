"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Calendar, Target, Plus, Download, Eye } from "lucide-react"
import Link from "next/link"
import { InvestmentChart } from "@/components/funding/investment-chart"

export default function InvestmentsDashboardPage() {
  // Mock user investment data
  const userInvestments = {
    totalInvested: 2500,
    currentValue: 2750,
    totalGain: 250,
    totalReturn: 10.0,
    investments: [
      {
        id: 1,
        date: "2024-01-15",
        amount: 1000,
        currentValue: 1100,
        status: "active",
        tier: "Investor",
      },
      {
        id: 2,
        date: "2024-02-20",
        amount: 1500,
        currentValue: 1650,
        status: "active",
        tier: "Investor",
      },
    ],
    documents: [
      {
        id: 1,
        name: "Investment Agreement - Series A",
        date: "2024-01-15",
        type: "PDF",
        size: "2.4 MB",
      },
      {
        id: 2,
        name: "Q1 2024 Investor Report",
        date: "2024-04-01",
        type: "PDF",
        size: "1.8 MB",
      },
    ],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const chartData = [
    { date: "2024-01-15", value: 1000 },
    { date: "2024-02-01", value: 1050 },
    { date: "2024-02-15", value: 1100 },
    { date: "2024-02-20", value: 2600 },
    { date: "2024-03-01", value: 2650 },
    { date: "2024-03-15", value: 2700 },
    { date: "2024-04-01", value: 2750 },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investment Dashboard</h1>
          <p className="text-muted-foreground">Track your investments and portfolio performance</p>
        </div>
        <Button asChild>
          <Link href="/funding">
            <Plus className="mr-2 h-4 w-4" />
            Invest More
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(userInvestments.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Across {userInvestments.investments.length} investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(userInvestments.currentValue)}</div>
            <p className="text-xs text-green-600">
              +{formatCurrency(userInvestments.totalGain)} ({userInvestments.totalReturn.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Investment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 2024</div>
            <p className="text-xs text-muted-foreground">3 months ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investor Tier</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div className="text-lg font-bold">Investor</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Your investment value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <InvestmentChart data={chartData} />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userInvestments.investments.map((investment) => {
                  const gain = investment.currentValue - investment.amount
                  const returnPercentage = ((gain / investment.amount) * 100).toFixed(1)
                  return (
                    <div key={investment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{formatCurrency(investment.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(investment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(investment.currentValue)}</div>
                        <div className="text-sm text-green-600">+{returnPercentage}%</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investor Benefits</CardTitle>
                <CardDescription>Your current tier benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Platform updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Community access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Quarterly reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Investor webinars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Platform merchandise</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <div className="space-y-4">
            {userInvestments.investments.map((investment) => {
              const gain = investment.currentValue - investment.amount
              const returnPercentage = ((gain / investment.amount) * 100).toFixed(1)
              return (
                <Card key={investment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Investment #{investment.id}</h3>
                          <Badge variant="outline">{investment.tier}</Badge>
                          <Badge variant="secondary">{investment.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invested on {new Date(investment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">{formatCurrency(investment.currentValue)}</div>
                        <div className="text-sm text-green-600">
                          +{formatCurrency(gain)} ({returnPercentage}%)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Initial: {formatCurrency(investment.amount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="space-y-4">
            {userInvestments.documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{document.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(document.date).toLocaleDateString()}</span>
                        <span>{document.type}</span>
                        <span>{document.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

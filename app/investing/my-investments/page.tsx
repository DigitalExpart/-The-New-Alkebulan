"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

export default function MyInvestmentsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const portfolioStats = [
    {
      title: "Total Portfolio Value",
      value: "$47,250",
      change: "+$3,420",
      trend: "up",
      percentage: "+7.8%"
    },
    {
      title: "Total Invested",
      value: "$42,000",
      change: "$0",
      trend: "neutral",
      percentage: "0%"
    },
    {
      title: "Total Returns",
      value: "$5,250",
      change: "+$3,420",
      trend: "up",
      percentage: "+186%"
    },
    {
      title: "Avg. Return Rate",
      value: "12.5%",
      change: "+2.1%",
      trend: "up",
      percentage: "+20.2%"
    }
  ]

  const myInvestments = [
    {
      id: 1,
      title: "Alkebulan Tech Hub",
      category: "Technology",
      investedAmount: 15000,
      currentValue: 17250,
      returnRate: 15.0,
      status: "Active",
      startDate: "2024-03-15",
      endDate: "2026-03-15",
      progress: 35,
      lastUpdate: "2 days ago"
    },
    {
      id: 2,
      title: "Green Energy Farm",
      category: "Renewable Energy",
      investedAmount: 12000,
      currentValue: 13800,
      returnRate: 15.0,
      status: "Active",
      startDate: "2024-02-20",
      endDate: "2027-02-20",
      progress: 28,
      lastUpdate: "1 week ago"
    },
    {
      id: 3,
      title: "Urban Housing Complex",
      category: "Real Estate",
      investedAmount: 8000,
      currentValue: 8400,
      returnRate: 5.0,
      status: "Active",
      startDate: "2024-01-10",
      endDate: "2028-01-10",
      progress: 15,
      lastUpdate: "3 days ago"
    },
    {
      id: 4,
      title: "AgriTech Solutions",
      category: "Agriculture",
      investedAmount: 7000,
      currentValue: 7800,
      returnRate: 11.4,
      status: "Active",
      startDate: "2024-04-05",
      endDate: "2026-04-05",
      progress: 45,
      lastUpdate: "5 days ago"
    }
  ]

  const recentTransactions = [
    {
      id: 1,
      type: "Investment",
      project: "Alkebulan Tech Hub",
      amount: 15000,
      date: "2024-03-15",
      status: "Completed"
    },
    {
      id: 2,
      type: "Return",
      project: "Green Energy Farm",
      amount: 1800,
      date: "2024-03-10",
      status: "Completed"
    },
    {
      id: 3,
      type: "Investment",
      project: "Urban Housing Complex",
      amount: 8000,
      date: "2024-01-10",
      status: "Completed"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Investments</h1>
        <p className="text-muted-foreground text-lg">
          Track your investment portfolio and monitor performance
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {portfolioStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    {getTrendIcon(stat.trend)}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-500' : 
                      stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {stat.percentage}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="investments">My Investments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Portfolio Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Portfolio performance chart</p>
                    <p className="text-sm">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Technology</span>
                    </div>
                    <span className="font-medium">36.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Renewable Energy</span>
                    </div>
                    <span className="font-medium">29.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Real Estate</span>
                    </div>
                    <span className="font-medium">17.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Agriculture</span>
                    </div>
                    <span className="font-medium">16.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Investments Tab */}
        <TabsContent value="investments" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Investments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myInvestments.map((investment) => (
              <Card key={investment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{investment.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {investment.category}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(investment.status)}>
                      {investment.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invested Amount</span>
                      <span className="font-medium">${investment.investedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Value</span>
                      <span className="font-medium">${investment.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Return Rate</span>
                      <span className="font-medium text-green-500">{investment.returnRate}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Project Progress</span>
                      <span className="font-medium">{investment.progress}%</span>
                    </div>
                    <Progress value={investment.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium ml-1">{investment.startDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-medium ml-1">{investment.endDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Update:</span>
                      <span className="font-medium ml-1">{investment.lastUpdate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="icon">
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {transaction.type === 'Investment' ? (
                          <DollarSign className="h-5 w-5 text-primary" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{transaction.project}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

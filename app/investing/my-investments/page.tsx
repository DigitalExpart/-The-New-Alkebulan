"use client"

import { useEffect, useMemo, useState } from "react"
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
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export default function MyInvestmentsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  type Position = {
    id: string
    title: string
    category: string | null
    investedAmount: number
    currentValue: number
    returnRate: number
    status: string
    startDate: string | null
    endDate: string | null
    progress: number
    lastUpdate?: string | null
  }

  type Txn = {
    id: string
    type: string
    project: string | null
    amount: number
    date: string
    status: string
  }

  const [positions, setPositions] = useState<Position[]>([])
  const [transactions, setTransactions] = useState<Txn[]>([])
  const [portfolio, setPortfolio] = useState<{ total_invested: number; total_value: number; total_returns: number; avg_return_rate: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !supabase) return
      setLoading(true)
      try {
        const [{ data: posData }, { data: txData }, { data: statsData }] = await Promise.all([
          supabase
            .from('investment_positions')
            .select('id, invested_amount, current_value, return_rate, status, start_date, end_date, progress, last_update, investments:investments(id, title, category)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('investment_transactions')
            .select('id, type, amount, occurred_at, status, investments:investments(title)')
            .eq('user_id', user.id)
            .order('occurred_at', { ascending: false })
            .limit(25),
          supabase
            .from('v_investment_portfolio_stats')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
        ])

        const mappedPositions: Position[] = (posData || []).map((p: any) => ({
          id: p.id,
          title: p.investments?.title || 'Untitled Investment',
          category: p.investments?.category ?? null,
          investedAmount: Number(p.invested_amount || 0),
          currentValue: Number(p.current_value || 0),
          returnRate: Number(p.return_rate || 0),
          status: String(p.status || 'active'),
          startDate: p.start_date || null,
          endDate: p.end_date || null,
          progress: Number(p.progress || 0),
          lastUpdate: p.last_update || null,
        }))

        const mappedTxns: Txn[] = (txData || []).map((t: any) => ({
          id: t.id,
          type: String(t.type || 'investment'),
          project: t.investments?.title || null,
          amount: Number(t.amount || 0),
          date: (t.occurred_at || new Date().toISOString()).slice(0, 10),
          status: String(t.status || 'completed')
        }))

        setPositions(mappedPositions)
        setTransactions(mappedTxns)
        if (statsData) setPortfolio({
          total_invested: Number(statsData.total_invested || 0),
          total_value: Number(statsData.total_value || 0),
          total_returns: Number(statsData.total_returns || 0),
          avg_return_rate: Number(statsData.avg_return_rate || 0)
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const portfolioStats = useMemo(() => {
    const invested = portfolio?.total_invested ?? 0
    const value = portfolio?.total_value ?? 0
    const returns = portfolio?.total_returns ?? (value - invested)
    const rate = portfolio?.avg_return_rate ?? (invested === 0 ? 0 : ((value - invested) / invested) * 100)

    const trend = returns > 0 ? 'up' : returns < 0 ? 'down' : 'neutral'

    return [
      { title: 'Total Portfolio Value', value: `$${value.toLocaleString()}`, change: `${returns >= 0 ? '+' : ''}$${Math.abs(returns).toLocaleString()}`, trend, percentage: `${rate.toFixed(1)}%` },
      { title: 'Total Invested', value: `$${invested.toLocaleString()}`, change: '$0', trend: 'neutral', percentage: '0%' },
      { title: 'Total Returns', value: `$${returns.toLocaleString()}`, change: `${returns >= 0 ? '+' : ''}$${Math.abs(returns).toLocaleString()}`, trend, percentage: `${rate.toFixed(1)}%` },
      { title: 'Avg. Return Rate', value: `${rate.toFixed(1)}%`, change: '', trend: trend, percentage: `${rate.toFixed(1)}%` },
    ]
  }, [portfolio])

  const myInvestments = useMemo(() => positions, [positions])
  const recentTransactions = useMemo(() => transactions, [transactions])

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

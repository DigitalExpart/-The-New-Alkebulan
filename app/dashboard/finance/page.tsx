"use client"

import { useEffect, useMemo, useState } from "react"
import { FinanceOverviewCards } from "@/components/finance/finance-overview-cards"
import { TransactionsTable } from "@/components/finance/transactions-table"
import { InvestmentsSection } from "@/components/finance/investments-section"
import { IncomeStreams } from "@/components/finance/income-streams"
import { WalletSettings } from "@/components/finance/wallet-settings"
import { FinanceAnalytics } from "@/components/finance/finance-analytics"
import { FinanceTips } from "@/components/finance/finance-tips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  CreditCard,
  PiggyBank,
  Shield,
  Globe,
  ArrowRight,
  Bell,
  Banknote,
  TrendingUp,
  Eye,
  Wallet,
  Lock,
} from "lucide-react"
import { incomeStreams, walletConnections, financeTips, financeAnalytics } from "@/data/finance-data"
import type { FinanceOverview, Transaction, Investment } from "@/types/finance"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function FinancePage() {
  const [selectedCurrency, setSelectedCurrency] = useState<"eur" | "usd" | "dmh">("eur")
  const [overview, setOverview] = useState<FinanceOverview | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [invs, setInvs] = useState<Investment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      setLoading(true)
      try {
        // Load projects as proxy for investments
        const { data: projects } = await supabase
          .from('projects')
          .select('id,title,description,current_funding,funding_goal,category,return_rate_min,return_rate_max,updated_at')
          .order('updated_at', { ascending: false })
          .limit(10)

        const mappedInvs: Investment[] = (projects || []).map((p: any) => ({
          id: String(p.id),
          projectTitle: p.title || 'Project',
          investedAmount: Number(p.current_funding) || 0,
          currentValue: Number(p.current_funding) || 0,
          returnPercentage: p.return_rate_min != null && p.return_rate_max != null
            ? (Number(p.return_rate_min) + Number(p.return_rate_max)) / 2
            : 0,
          projections: {
            oneYear: (Number(p.current_funding) || 0) * 1.1,
            threeYear: (Number(p.current_funding) || 0) * 1.5,
            fiveYear: (Number(p.current_funding) || 0) * 2,
          },
          status: 'active',
          investmentDate: p.updated_at || new Date().toISOString(),
          category: p.category || 'General',
        }))

        setInvs(mappedInvs)

        // Try to load orders as transactions; fallback to projects activity
        let tx: Transaction[] = []
        try {
          const { data: orders } = await supabase
            .from('orders')
            .select('id,total,created_at,status')
            .order('created_at', { ascending: false })
            .limit(20) as any
          if (orders) {
            tx = orders.map((o: any) => ({
              id: String(o.id),
              date: o.created_at,
              description: 'Marketplace order',
              amount: Number(o.total) || 0,
              type: 'earned',
              status: (o.status || 'completed') as any,
              category: 'Marketplace',
              reference: String(o.id),
            }))
          }
        } catch {}

        if (tx.length === 0) {
          tx = (projects || []).map((p: any) => ({
            id: String(p.id),
            date: p.updated_at || new Date().toISOString(),
            description: `Project update: ${p.title}`,
            amount: Number(p.current_funding) || 0,
            type: 'invested',
            status: 'completed',
            category: 'Projects',
            reference: String(p.id),
          }))
        }

        setTxs(tx)

        const totalInvested = mappedInvs.reduce((s, i) => s + i.investedAmount, 0)
        const totalEarned = tx.filter(t => t.type === 'earned').reduce((s, t) => s + Number(t.amount || 0), 0)
        const ov: FinanceOverview = {
          walletBalance: { eur: 0, usd: 0, dmhTokens: 0 },
          totalInvested,
          totalEarned,
          pendingPayments: tx.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.amount || 0), 0),
          monthlyGrowth: { invested: 0, earned: 0 }
        }
        setOverview(ov)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const overviewData = useMemo<FinanceOverview>(() => overview || {
    walletBalance: { eur: 0, usd: 0, dmhTokens: 0 },
    totalInvested: 0,
    totalEarned: 0,
    pendingPayments: 0,
    monthlyGrowth: { invested: 0, earned: 0 }
  }, [overview])

  const upcomingFeatures = [
    {
      icon: CreditCard,
      title: "Digital Banking",
      description: "Full-featured digital banking services with multi-currency support",
      status: "In Development",
      timeline: "Q3 2024",
    },
    {
      icon: PiggyBank,
      title: "Savings & Investment",
      description: "Automated savings plans and investment portfolios",
      status: "Planning",
      timeline: "Q4 2024",
    },
    {
      icon: Shield,
      title: "Insurance Services",
      description: "Comprehensive insurance products tailored for diaspora communities",
      status: "Planning",
      timeline: "Q1 2025",
    },
    {
      icon: Globe,
      title: "Cross-Border Payments",
      description: "Low-cost international money transfers and remittances",
      status: "In Development",
      timeline: "Q2 2024",
    },
    {
      icon: Banknote,
      title: "Microfinance",
      description: "Small loans and credit services for entrepreneurs",
      status: "Research",
      timeline: "Q2 2025",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header with Welcome Content */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">💸 Welcome to the Finance Hub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Own your economy. Track your growth. Invest with purpose.
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            The Finance Hub is where your economic empowerment begins. Whether you're earning, investing, donating or
            learning — this is your central space to understand, manage, and grow your financial activity within the
            Diaspora Market Hub ecosystem.
          </p>
        </div>

        {/* Why Finance Matters Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Globe className="h-6 w-6 text-green-600 mr-2" />🌍 Why Finance Matters in the Diaspora
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Economic independence is the foundation for freedom, opportunity and legacy.
            </p>
            <p className="text-muted-foreground">
              Diaspora Market Hub believes that wealth creation should be inclusive, transparent, and community-powered
              — no matter where you are in the world.
            </p>
          </CardContent>
        </Card>

        {/* What You Can Do Here Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">💼 What You Can Do Here</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">📊 See the Full Picture</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your total earnings (from sales, mentoring, content, referrals)</li>
                  <li>• Your investments (in projects, crowdfunding, DAOs)</li>
                  <li>• Your spending and transaction history</li>
                  <li>• Your current wallet/token balances</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">💸 Invest & Build Wealth</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Support trusted diaspora-led initiatives</li>
                  <li>• Invest in verified community projects</li>
                  <li>• Track long-term growth with real-time ROI forecasts</li>
                  <li>• View live stats (e.g. "€1.2M raised of €3.6M goal")</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">🧾 Manage Your Wallet</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Connect your Web3 wallet (e.g. MetaMask)</li>
                  <li>• Switch between crypto and fiat (USD, EUR, etc.)</li>
                  <li>• Track your token activity</li>
                  <li>• Manage withdrawals, deposits and payouts with ease</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">🔐 Finance, Built for Trust</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Transparent fees</li>
                  <li>• Real-time tracking</li>
                  <li>• Decentralized when you want it, secure by design</li>
                  <li>• Verified identity & protection features</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Control Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">🔍 Total Control. Clear Insight.</h2>
            <p className="text-lg text-muted-foreground mb-4">This is not just another dashboard.</p>
            <p className="text-muted-foreground mb-4">
              This is your financial headquarters in the digital economy — designed for creators, entrepreneurs,
              investors, and changemakers across the diaspora.
            </p>
            <p className="text-muted-foreground font-medium">
              Whether you're contributing €5 or €50,000, every transaction is a vote for a better future.
            </p>
          </CardContent>
        </Card>

        {/* Ready to Take Ownership CTA */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">🚀 Ready to Take Ownership?</h2>
            <p className="text-lg mb-2">Finance is not just numbers.</p>
            <p className="text-lg mb-4">It's vision. It's impact.</p>
            <p className="text-lg mb-6">It's how we build legacies — together.</p>
            <div className="space-y-2 mb-6">
              <p className="font-medium">Track it. Grow it. Empower others through it.</p>
              <p className="text-xl font-bold">This is diaspora finance — redefined.</p>
            </div>
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              Start Your Financial Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview Cards */}
      <div className="mb-8">
        <FinanceOverviewCards data={overviewData} selectedCurrency={selectedCurrency} />
      </div>

      {/* Add this after the FinanceOverviewCards component */}
      <div className="mb-8 flex justify-center">
        <Link href="/dashboard/finance/add-funds">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
        </Link>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeStreams incomeStreams={incomeStreams} />
            <FinanceTips tips={financeTips} />
          </div>
          <TransactionsTable transactions={txs.slice(0, 5)} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTable transactions={txs} />
        </TabsContent>

        <TabsContent value="investments">
          <InvestmentsSection investments={invs} />
        </TabsContent>

        <TabsContent value="analytics">
          <FinanceAnalytics analytics={financeAnalytics} />
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {/* Upcoming Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Upcoming Financial Services</CardTitle>
              <CardDescription>
                New features and services currently in development to enhance your financial experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {upcomingFeatures.map((feature, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <feature.icon className="h-8 w-8 text-green-600" />
                        <Badge
                          variant={feature.status === "In Development" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {feature.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">{feature.description}</CardDescription>
                      <div className="text-sm text-green-600 font-medium">Expected: {feature.timeline}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Waitlist CTA */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Be the First to Know</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Join our waitlist to get early access to new financial services. We'll notify you as soon as
                    features become available.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Join Waitlist
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Development Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Development Roadmap</CardTitle>
              <CardDescription>Our planned timeline for rolling out new financial services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Q2 2024: Cross-Border Payments</p>
                    <p className="text-sm text-muted-foreground">Launch international money transfer services</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Q3 2024: Digital Banking</p>
                    <p className="text-sm text-muted-foreground">Full banking platform with multi-currency accounts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Q4 2024: Investment Services</p>
                    <p className="text-sm text-muted-foreground">Savings and investment portfolio management</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Q1 2025: Insurance Services</p>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive insurance products for diaspora communities
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Q2 2025: Microfinance</p>
                    <p className="text-sm text-muted-foreground">Small loans and credit services for entrepreneurs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <WalletSettings
            walletConnections={walletConnections}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

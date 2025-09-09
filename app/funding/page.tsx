"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Users,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Wallet,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react"
import { InvestmentChart } from "@/components/funding/investment-chart"
import { FundingProgress } from "@/components/funding/funding-progress"
import { InvestmentCalculator } from "@/components/funding/investment-calculator"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Building2, Coins, Activity, BarChart3 } from "lucide-react";



export default function FundingPage() {
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe")
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false)
  const [projectionScenario, setProjectionScenario] = useState<"conservative" | "realistic" | "optimistic">("realistic")

  // Mock user investment data
  const userInvestment = {
    totalInvested: 2500,
    investmentDate: "2024-01-15",
    currentValue: 2750,
    projectedReturns: {
      conservative: {
        "1y": 2625,
        "2y": 2875,
        "5y": 3750,
        "10y": 5000,
      },
      realistic: {
        "1y": 2750,
        "2y": 3250,
        "5y": 5000,
        "10y": 8750,
      },
      optimistic: {
        "1y": 3000,
        "2y": 4000,
        "5y": 7500,
        "10y": 15000,
      },
    },
  }

  // Live aggregates from projects/investments
  const [currentRaised, setCurrentRaised] = useState(0)
  const [goalAmount, setGoalAmount] = useState(0)
  const [investors, setInvestors] = useState<number | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const fundingData = {
    minInvestment: 100,
    maxInvestment: 10000,
    currentRound: "Series A",
  }
  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select('funding_goal,current_funding,end_date,status')
        let raised = 0, goal = 0, minDays: number | null = null
        ;(projects || []).forEach((p: any) => {
          raised += Number(p.current_funding) || 0
          goal += Number(p.funding_goal) || 0
          if (p.end_date) {
            const d = Math.ceil((new Date(p.end_date).getTime() - Date.now())/(1000*60*60*24))
            if (!isNaN(d)) minDays = minDays == null ? d : Math.min(minDays, d)
          }
        })
        setCurrentRaised(raised)
        setGoalAmount(goal)
        if (minDays != null) setDaysLeft(Math.max(0, minDays))
        try {
          const { count } = await supabase.from('investments').select('*', { count: 'exact', head: true })
          if (typeof count === 'number') setInvestors(count)
        } catch {}
      } catch {}
    }
    load()
  }, [])

  const progressPercentage = useMemo(() => goalAmount ? (currentRaised / goalAmount) * 100 : 0, [currentRaised, goalAmount])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return formatCurrency(amount)
  }

  const handleInvestment = async () => {
    const amount = Number.parseFloat(investmentAmount)
    if (amount < fundingData.minInvestment || amount > fundingData.maxInvestment) {
      return
    }

    // In a real app, this would integrate with Stripe or other payment processor
    console.log("Processing investment:", {
      amount,
      paymentMethod: selectedPaymentMethod,
    })

    // Simulate payment processing
    setTimeout(() => {
      setIsInvestmentDialogOpen(false)
      setInvestmentAmount("")
      // Show success message or redirect to dashboard
    }, 2000)
  }

  const investmentTiers = [
    {
      name: "Supporter",
      min: 100,
      max: 499,
      benefits: ["Platform updates", "Community access", "Early feature previews"],
      badge: "🌱",
    },
    {
      name: "Investor",
      min: 500,
      max: 1999,
      benefits: ["All Supporter benefits", "Quarterly reports", "Investor webinars", "Platform merchandise"],
      badge: "💎",
    },
    {
      name: "Partner",
      min: 2000,
      max: 4999,
      benefits: ["All Investor benefits", "Direct founder access", "Product roadmap input", "VIP events"],
      badge: "👑",
    },
    {
      name: "Champion",
      min: 5000,
      max: 10000,
      benefits: [
        "All Partner benefits",
        "Advisory board consideration",
        "Co-marketing opportunities",
        "Custom integrations",
      ],
      badge: "🚀",
    },
  ]

  const getCurrentTier = (amount: number) => {
    return investmentTiers.find((tier) => amount >= tier.min && amount <= tier.max)
  }

  const investRef = useRef<HTMLDivElement>(null)
  const [isInvestVisible, setIsInvestVisible] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Invest in the Future of Diaspora Communities
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of investors supporting the growth of diaspora entrepreneurship and cultural exchange
            worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="text-lg px-8">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Investing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Make an Investment</DialogTitle>
                  <DialogDescription>
                    Invest in Diaspora Market Hub and support global entrepreneurship.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Investment Amount (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={fundingData.minInvestment}
                      max={fundingData.maxInvestment}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Min: {formatCurrency(fundingData.minInvestment)} • Max:{" "}
                      {formatCurrency(fundingData.maxInvestment)}
                    </p>
                  </div>

                  {investmentAmount && Number.parseFloat(investmentAmount) >= fundingData.minInvestment && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCurrentTier(Number.parseFloat(investmentAmount))?.badge}</span>
                        <span className="font-semibold">
                          {getCurrentTier(Number.parseFloat(investmentAmount))?.name} Tier
                        </span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {getCurrentTier(Number.parseFloat(investmentAmount))?.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Label>Payment Method</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit/Debit Card
                          </div>
                        </SelectItem>
                        <SelectItem value="wallet">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Digital Wallet
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInvestmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvestment}
                    disabled={
                      !investmentAmount ||
                      Number.parseFloat(investmentAmount) < fundingData.minInvestment ||
                      Number.parseFloat(investmentAmount) > fundingData.maxInvestment
                    }
                  >
                    Invest {investmentAmount && formatCurrency(Number.parseFloat(investmentAmount))}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
              <a href="#learn-more">
                <Info className="mr-2 h-5 w-5" />
                Learn More
              </a>
            </Button>
          </div>
        </div>

        {/* Global Funding Progress */}
        <FundingProgress
          currentRaised={currentRaised}
          goalAmount={goalAmount}
          investors={investors ?? undefined}
          daysLeft={daysLeft ?? undefined}
          currentRound={fundingData.currentRound}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mt-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investment">Your Investment</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatLargeCurrency(currentRaised)}</div>
                  <p className="text-xs text-muted-foreground">
                    {progressPercentage.toFixed(1)}% of {formatLargeCurrency(goalAmount)} goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(investors ?? 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Active investors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Left</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{daysLeft ?? '—'}</div>
                  <p className="text-xs text-muted-foreground">Days remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Investment Tiers */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">Investment Tiers</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {investmentTiers.map((tier) => (
                  <Card key={tier.name} className="relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tier.badge}</span>
                        <div>
                          <CardTitle className="text-lg text-foreground">{tier.name}</CardTitle>
                          <CardDescription>
                            {formatCurrency(tier.min)} - {formatCurrency(tier.max)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Invest Highlight */}
            <div className="py-20 invest-gradient overflow-hidden z-10" >
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div
                          ref={investRef}
                          className={`transition-all duration-1000 ${isInvestVisible ? "fade-in-up" : "opacity-0 translate-y-8"}`}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Side - Text Block */}
                            <div className="text-left">
                              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Invest in the Future of The New Alkebulan
                              </h2>
            
                              <p className="text-xl md:text-2xl italic text-primary mb-8">
                                You're not just funding a platform — you're fueling a movement.
                              </p>
            
                              <div className="prose prose-lg max-w-none">
                                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                                  Every contribution builds the digital foundation for a united African diaspora.
                                </p>
            
                                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                                  From decentralized education and finance to global commerce and culture — your investment powers a
                                  future designed by us, for us.
                                </p>
            
                                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                                  Whether you're giving €10 or €10,000, you're shaping a new economic reality.
                                </p>
            
                                <p className="text-lg font-medium text-white leading-relaxed">
                                  Built on <span className="text-primary font-bold">purpose</span>. Backed by{" "}
                                  <span className="text-primary font-bold">vision</span>. Powered by{" "}
                                  <span className="text-primary font-bold">the people</span>.
                                </p>
                              </div>
                            </div>
            
                            {/* Right Side - Action Box with CTA */}
                            <div className="flex justify-center lg:justify-end">
                              <div className="relative">
                                {/* Sparkle Effects */}
                                <div className="absolute -top-4 -left-4 w-8 h-8 text-primary sparkle-effect">
                                  <Sparkles className="w-full h-full" />
                                </div>
                                <div
                                  className="absolute -bottom-4 -right-4 w-6 h-6 text-primary sparkle-effect"
                                  style={{ animationDelay: "1s" }}
                                >
                                  <Sparkles className="w-full h-full" />
                                </div>
                                <div
                                  className="absolute top-1/2 -left-6 w-4 h-4 text-primary sparkle-effect"
                                  style={{ animationDelay: "0.5s" }}
                                >
                                  <Sparkles className="w-full h-full" />
                                </div>
            
                                {/* CTA Box */}
                                <Card className="bg-card/90 backdrop-blur-sm border-primary/30 p-8 text-center glow-effect max-w-sm">
                                  <CardContent className="space-y-6">
                                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                      <TrendingUp className="w-8 h-8 text-primary-foreground" />
                                    </div>
            
                                    <h3 className="text-2xl font-bold text-foreground mb-4">Be Part of History</h3>
            
                                    <p className="text-muted-foreground mb-6">
                                      Join visionary investors building the future of the African diaspora
                                    </p>
            
                                    <Button
                                      size="lg"
                                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-4"
                                    >
                                      <Link href="/funding" className="flex items-center justify-center">
                                        👉 Become an Investor Now
                                      </Link>
                                    </Button>
            
                                    <p className="text-sm text-muted-foreground">Starting from €10 • Secure • Transparent</p>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


         {/* Future Features */}

            <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mx-auto px-6 py-12 text-white"
          >
            
            <h2 className="text-3xl font-bold mb-1">Why Important to Invest</h2>

            
            <p className="text-gray-300 mb-6">
              Investing empowers individuals and communities by creating sustainable wealth, supporting projects, and ensuring long-term growth.
            </p>

            <h3 className="text-xl font-semibold mb-4">Future Features</h3>
            <div className="max-w-4xl mx-auto">
        {/* Community Projects */}
       <Accordion type="single" collapsible className="w-full space-y-2">
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Community Projects
          </AccordionTrigger>
          <AccordionContent>
            Support local and global community-driven initiatives that make lasting social impact.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Business Projects
          </AccordionTrigger>
          <AccordionContent>
            Back promising businesses and startups to drive innovation and job creation.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            Token Award System
          </AccordionTrigger>
          <AccordionContent>
            Earn rewards and recognition through blockchain-based token incentives.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Health Tracking System
          </AccordionTrigger>
          <AccordionContent>
            Monitor your wellbeing while staying engaged with community-driven health projects.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Finance Dashboard
          </AccordionTrigger>
          <AccordionContent>
            Access analytics, finance tips, and manage your portfolio with an integrated dashboard.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            Governance & Crypto Wallet
          </AccordionTrigger>
          <AccordionContent>
            Participate in decentralized governance (DAO), manage crypto securely, and contribute to future decision-making.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>
          </motion.section>

            {/* Why Invest Section */}
            <div id="learn-more">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Why Invest in Diaspora Market Hub?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Globe className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Global Market Opportunity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      The global diaspora economy is worth over $3.7 trillion annually, representing a massive untapped
                      market for cultural commerce and education.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Zap className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Proven Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our platform has grown 300% year-over-year with strong user engagement and increasing revenue from
                      marketplace transactions and premium content.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Social Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Invest in a platform that empowers diaspora communities, preserves cultural heritage, and creates
                      economic opportunities for underrepresented creators.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Your Investment Tab */}
          <TabsContent value="investment" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(userInvestment.totalInvested)}</div>
                  <p className="text-xs text-muted-foreground">Since {userInvestment.investmentDate}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(userInvestment.currentValue)}</div>
                  <p className="text-xs text-green-600">
                    +{formatCurrency(userInvestment.currentValue - userInvestment.totalInvested)} (
                    {(
                      ((userInvestment.currentValue - userInvestment.totalInvested) / userInvestment.totalInvested) *
                      100
                    ).toFixed(1)}
                    %)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investor Tier</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCurrentTier(userInvestment.totalInvested)?.badge}</span>
                    <div>
                      <div className="text-lg font-bold">{getCurrentTier(userInvestment.totalInvested)?.name}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Investment History</CardTitle>
                <CardDescription>Your investment timeline and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentChart
                  data={[
                    { date: "2024-01-15", value: 2500 },
                    { date: "2024-02-01", value: 2550 },
                    { date: "2024-02-15", value: 2600 },
                    { date: "2024-03-01", value: 2650 },
                    { date: "2024-03-15", value: 2700 },
                    { date: "2024-04-01", value: 2750 },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Investment Projections</h3>
                <p className="text-muted-foreground">
                  Projected returns based on your current investment of {formatCurrency(userInvestment.totalInvested)}
                </p>
              </div>
              <Select value={projectionScenario} onValueChange={(value: any) => setProjectionScenario(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(userInvestment.projectedReturns[projectionScenario]).map(([period, value]) => {
                const gain = value - userInvestment.totalInvested
                const percentage = ((gain / userInvestment.totalInvested) * 100).toFixed(1)
                return (
                  <Card key={period}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{period}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(value)}</div>
                      <div className="text-sm text-green-600">
                        +{formatCurrency(gain)} ({percentage}%)
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Scenario Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Conservative</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 5% annual growth</li>
                      <li>• Market challenges</li>
                      <li>• Slower user adoption</li>
                      <li>• Economic headwinds</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Realistic</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 15% annual growth</li>
                      <li>• Steady market expansion</li>
                      <li>• Normal user growth</li>
                      <li>• Stable economic conditions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Optimistic</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 25% annual growth</li>
                      <li>• Rapid market expansion</li>
                      <li>• Viral user adoption</li>
                      <li>• Strong economic tailwinds</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <InvestmentCalculator />
          </TabsContent>
        </Tabs>

        {/* Risk Disclaimer */}
        <Card className="mt-12 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800 dark:text-orange-200">Investment Risk Disclaimer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-orange-700 dark:text-orange-300">
            <p>
              All investments carry risk and you may lose some or all of your investment. Past performance is not
              indicative of future results. The projections shown are estimates based on current market conditions and
              business performance, and actual results may vary significantly. Please consult with a financial advisor
              before making investment decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  Share2
} from "lucide-react"

export default function InvestingAlkebulanPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const investmentCategories = [
    { id: 'all', name: 'All Investments', count: 24 },
    { id: 'real-estate', name: 'Real Estate', count: 8 },
    { id: 'business', name: 'Business Ventures', count: 6 },
    { id: 'technology', name: 'Technology', count: 5 },
    { id: 'agriculture', name: 'Agriculture', count: 3 },
    { id: 'renewable-energy', name: 'Renewable Energy', count: 2 }
  ]

  const featuredInvestments = [
    {
      id: 1,
      title: "Alkebulan Tech Hub",
      description: "Modern technology incubator in Lagos, Nigeria",
      category: "Technology",
      targetAmount: 500000,
      raisedAmount: 375000,
      investors: 127,
      daysLeft: 15,
      returnRate: "12-18%",
      image: "/api/placeholder/400/250",
      trending: "up",
      change: "+8.5%"
    },
    {
      id: 2,
      title: "Green Energy Farm",
      description: "Solar and wind energy project in Kenya",
      category: "Renewable Energy",
      targetAmount: 750000,
      raisedAmount: 520000,
      investors: 89,
      daysLeft: 8,
      returnRate: "15-22%",
      image: "/api/placeholder/400/250",
      trending: "up",
      change: "+12.3%"
    },
    {
      id: 3,
      title: "Urban Housing Complex",
      description: "Affordable housing development in Accra, Ghana",
      category: "Real Estate",
      targetAmount: 1200000,
      raisedAmount: 890000,
      investors: 203,
      daysLeft: 22,
      returnRate: "18-25%",
      image: "/api/placeholder/400/250",
      trending: "down",
      change: "-2.1%"
    }
  ]

  const stats = [
    {
      title: "Total Investments",
      value: "$2.4M",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Active Projects",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Target
    },
    {
      title: "Total Investors",
      value: "1,247",
      change: "+89",
      trend: "up",
      icon: Users
    },
    {
      title: "Avg. Return Rate",
      value: "16.8%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Investing Alkebulan</h1>
        <p className="text-muted-foreground text-lg">
          Discover and invest in promising projects across the African diaspora
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Investment Categories</h2>
        <div className="flex flex-wrap gap-3">
          {investmentCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Investments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Featured Investment Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredInvestments.map((investment) => (
            <Card key={investment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    {investment.category}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
                    {investment.trending === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      investment.trending === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {investment.change}
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{investment.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{investment.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Amount</span>
                    <span className="font-medium">${investment.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-medium">${investment.raisedAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full">
                    <Progress 
                      value={(investment.raisedAmount / investment.targetAmount) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Investors:</span>
                    <span className="font-medium ml-1">{investment.investors}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days Left:</span>
                    <span className="font-medium ml-1">{investment.daysLeft}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Return Rate:</span>
                    <span className="font-medium ml-1">{investment.returnRate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Start Investing?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of investors who are building wealth while supporting the growth and development of the African diaspora community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <TrendingUp className="h-5 w-5 mr-2" />
              Start Investing Today
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

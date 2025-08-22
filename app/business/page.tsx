"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Target, ArrowRight, Building2, BarChart3, Plus } from "lucide-react"
import Link from "next/link"

export default function BusinessPage() {
  const businessTools = [
    {
      title: "Business Dashboard",
      description: "Monitor your business performance and analytics",
      icon: BarChart3,
      href: "/business/dashboard",
      color: "bg-primary",
    },
    {
      title: "Long-term Planning",
      description: "Strategic planning tools for business growth",
      icon: Target,
      href: "/business/long-term-planning",
      color: "bg-primary",
    },
    {
      title: "Process Management",
      description: "Streamline your business operations",
      icon: Building2,
      href: "/process-management",
      color: "bg-primary",
    },
    {
      title: "Investment Opportunities",
      description: "Explore funding and investment options",
      icon: TrendingUp,
      href: "/funding",
      color: "bg-primary",
    },
  ]

  const stats = [
    { label: "Active Businesses", value: "1,250+", icon: Building2 },
    { label: "Total Revenue", value: "$2.4M", icon: DollarSign },
    { label: "Success Rate", value: "87%", icon: TrendingUp },
    { label: "Community Members", value: "15K+", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Hub</h1>
          <p className="text-muted-foreground">
            Grow your business with our comprehensive suite of tools and resources
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Business Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Business Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessTools.map((tool, index) => (
              <Card key={index} className="bg-card border-border hover:border-primary transition-colors group">
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <tool.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{tool.description}</p>
                  <Link href={tool.href}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Access Tool
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sell Product Section */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              Sell Your Products
            </CardTitle>
            <p className="text-muted-foreground">
              Reach customers worldwide by listing your products on our marketplace
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Start Selling Today</h3>
                <p className="text-muted-foreground mb-4">
                  Upload digital goods, physical products, services, and more to reach the diaspora community.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Digital Products</Badge>
                  <Badge variant="secondary" className="text-xs">Physical Goods</Badge>
                  <Badge variant="secondary" className="text-xs">Services</Badge>
                  <Badge variant="secondary" className="text-xs">Art & Crafts</Badge>
                  <Badge variant="secondary" className="text-xs">Food & Beverages</Badge>
                </div>
              </div>
              <Link href="/marketplace/upload">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                  <Plus className="mr-3 h-6 w-6" />
                  Sell Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/business/dashboard">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Business Dashboard
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Browse Projects
                </Button>
              </Link>
              <Link href="/learning/mentorship">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Find a Mentor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

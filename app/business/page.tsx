"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, Target, ArrowRight, Building2, BarChart3 } from "lucide-react"
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

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/marketplace/upload">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  List a Product
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

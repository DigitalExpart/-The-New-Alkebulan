"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Activity, Brain, Leaf, Users, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HealthPage() {
  const healthCategories = [
    {
      title: "Physical Wellness",
      description: "Exercise routines, nutrition, and fitness tracking",
      icon: Activity,
      href: "/health/physical",
      color: "bg-red-600",
      count: "150+ resources",
    },
    {
      title: "Mental Health",
      description: "Mental wellness support and professional guidance",
      icon: Brain,
      href: "/health/mental-health-support",
      color: "bg-blue-600",
      count: "80+ professionals",
    },
    {
      title: "Traditional Medicine",
      description: "African traditional healing practices and remedies",
      icon: Leaf,
      href: "/health/traditional",
      color: "bg-green-600",
      count: "200+ remedies",
    },
    {
      title: "Community Support",
      description: "Connect with health-focused community groups",
      icon: Users,
      href: "/health/community",
      color: "bg-purple-600",
      count: "50+ groups",
    },
  ]

  const healthStats = [
    { label: "Active Users", value: "8,500+", icon: Users },
    { label: "Health Professionals", value: "120+", icon: Heart },
    { label: "Wellness Programs", value: "45", icon: Activity },
    { label: "Success Stories", value: "92%", icon: TrendingUp },
  ]

  const featuredContent = [
    {
      title: "Holistic Wellness Workshop",
      type: "Workshop",
      date: "March 15, 2024",
      instructor: "Dr. Amina Hassan",
      participants: 45,
    },
    {
      title: "Traditional Healing Practices",
      type: "Course",
      date: "March 20, 2024",
      instructor: "Elder Kwame Osei",
      participants: 78,
    },
    {
      title: "Mental Health Support Group",
      type: "Support Group",
      date: "Weekly",
      instructor: "Dr. Sarah Johnson",
      participants: 32,
    },
  ]

  return (
    <div className="min-h-screen bg-[#142b20]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Health & Wellness</h1>
          <p className="text-gray-300">
            Holistic health resources combining modern medicine with traditional African healing practices
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthStats.map((stat, index) => (
            <Card key={index} className="bg-[#1a3326] border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Health Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Health Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthCategories.map((category, index) => (
              <Card
                key={index}
                className="bg-[#1a3326] border-gray-600 hover:border-yellow-500 transition-colors group"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{category.title}</CardTitle>
                  <Badge variant="outline" className="w-fit border-gray-600 text-gray-300">
                    {category.count}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{category.description}</p>
                  <Link href={category.href}>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                      Explore
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredContent.map((content, index) => (
              <Card key={index} className="bg-[#1a3326] border-gray-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-500 text-black">{content.type}</Badge>
                    <span className="text-sm text-gray-400">{content.date}</span>
                  </div>
                  <CardTitle className="text-white">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-300">Instructor: {content.instructor}</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{content.participants} participants</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-[#1a3326] border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/health/stats">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">View Wellness Stats</Button>
              </Link>
              <Link href="/health/mental-health-support">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-[#1a3326] bg-transparent"
                >
                  Mental Health Support
                </Button>
              </Link>
              <Link href="/health/community">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-[#1a3326] bg-transparent"
                >
                  Join Health Groups
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

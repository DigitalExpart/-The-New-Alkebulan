"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
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
  Share2,
  Search,
  Filter,
  Globe,
  Building2,
  Leaf,
  Zap,
  Home,
  Car,
  BookOpen,
  Music,
  Palette
} from "lucide-react"

export default function MoreProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')

  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe, count: 156 },
    { id: 'technology', name: 'Technology', icon: Building2, count: 45 },
    { id: 'real-estate', name: 'Real Estate', icon: Home, count: 32 },
    { id: 'agriculture', name: 'Agriculture', icon: Leaf, count: 28 },
    { id: 'renewable-energy', name: 'Renewable Energy', icon: Zap, count: 18 },
    { id: 'transportation', name: 'Transportation', icon: Car, count: 15 },
    { id: 'education', name: 'Education', icon: BookOpen, count: 12 },
    { id: 'entertainment', name: 'Entertainment', icon: Music, count: 6 }
  ]

  const projects = [
    {
      id: 1,
      title: "Digital Learning Platform",
      description: "Comprehensive online education platform for African students",
      category: "Education",
      location: "Lagos, Nigeria",
      targetAmount: 300000,
      raisedAmount: 180000,
      investors: 89,
      daysLeft: 45,
      returnRate: "18-25%",
      riskLevel: "Medium",
      trending: "up",
      change: "+15.2%",
      image: "/api/placeholder/400/250",
      tags: ["EdTech", "Digital", "Africa"]
    },
    {
      id: 2,
      title: "Smart City Infrastructure",
      description: "IoT-based smart city solutions for urban development",
      category: "Technology",
      location: "Nairobi, Kenya",
      targetAmount: 800000,
      raisedAmount: 520000,
      investors: 156,
      daysLeft: 28,
      returnRate: "20-30%",
      riskLevel: "High",
      trending: "up",
      change: "+22.8%",
      image: "/api/placeholder/400/250",
      tags: ["Smart City", "IoT", "Urban"]
    },
    {
      id: 3,
      title: "Organic Farm Network",
      description: "Sustainable organic farming cooperative across West Africa",
      category: "Agriculture",
      location: "Accra, Ghana",
      targetAmount: 250000,
      raisedAmount: 175000,
      investors: 67,
      daysLeft: 38,
      returnRate: "12-18%",
      riskLevel: "Low",
      trending: "up",
      change: "+8.9%",
      image: "/api/placeholder/400/250",
      tags: ["Organic", "Sustainable", "Cooperative"]
    },
    {
      id: 4,
      title: "Electric Vehicle Charging",
      description: "Network of EV charging stations across major cities",
      category: "Transportation",
      location: "Cape Town, South Africa",
      targetAmount: 600000,
      raisedAmount: 420000,
      investors: 134,
      daysLeft: 52,
      returnRate: "16-22%",
      riskLevel: "Medium",
      trending: "up",
      change: "+11.4%",
      image: "/api/placeholder/400/250",
      tags: ["EV", "Charging", "Infrastructure"]
    },
    {
      id: 5,
      title: "Creative Arts Studio",
      description: "Modern art and music production facility",
      category: "Entertainment",
      location: "Dakar, Senegal",
      targetAmount: 150000,
      raisedAmount: 95000,
      investors: 43,
      daysLeft: 25,
      returnRate: "14-20%",
      riskLevel: "Medium",
      trending: "down",
      change: "-3.2%",
      image: "/api/placeholder/400/250",
      tags: ["Arts", "Music", "Creative"]
    },
    {
      id: 6,
      title: "Biodiversity Conservation",
      description: "Wildlife protection and habitat restoration project",
      category: "Agriculture",
      location: "Tanzania",
      targetAmount: 400000,
      raisedAmount: 280000,
      investors: 78,
      daysLeft: 41,
      returnRate: "10-15%",
      riskLevel: "Low",
      trending: "up",
      change: "+6.7%",
      image: "/api/placeholder/400/250",
      tags: ["Conservation", "Wildlife", "Eco"]
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    )
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || project.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return parseFloat(b.change.replace(/[+-%]/g, '')) - parseFloat(a.change.replace(/[+-%]/g, ''))
      case 'funding':
        return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount)
      case 'investors':
        return b.investors - a.investors
      case 'daysLeft':
        return a.daysLeft - b.daysLeft
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">More Projects</h1>
        <p className="text-muted-foreground text-lg">
          Discover additional investment opportunities across various sectors
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects by name, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: 'trending', label: 'Trending' },
              { value: 'funding', label: 'Funding Progress' },
              { value: 'investors', label: 'Most Investors' },
              { value: 'daysLeft', label: 'Days Left' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {project.category}
                </Badge>
                <Badge className={getRiskColor(project.riskLevel)}>
                  {project.riskLevel}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
                  {getTrendIcon(project.trending)}
                  <span className={`text-xs font-medium ${
                    project.trending === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {project.change}
                  </span>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Globe className="h-4 w-4" />
                  {project.location}
                </div>
              </div>

              {/* Funding Progress */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Amount</span>
                  <span className="font-medium">${project.targetAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-medium">${project.raisedAmount.toLocaleString()}</span>
                </div>
                <div className="w-full">
                  <Progress 
                    value={(project.raisedAmount / project.targetAmount) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Investors:</span>
                  <span className="font-medium ml-1">{project.investors}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Days Left:</span>
                  <span className="font-medium ml-1">{project.daysLeft}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Return Rate:</span>
                  <span className="font-medium ml-1">{project.returnRate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Level:</span>
                  <span className="font-medium ml-1">{project.riskLevel}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
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

      {/* Empty State */}
      {sortedProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or category filters
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Let us know about specific investment opportunities you'd like to see, or explore our other investment categories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <TrendingUp className="h-5 w-5 mr-2" />
              Suggest Project
            </Button>
            <Button variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
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
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function MoreProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      setLoading(true)
      try {
        const { data } = await supabase
          .from('projects')
          .select('id,title,description,category,image_url,funding_goal,current_funding,return_rate_min,return_rate_max,status,updated_at')
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(60)
        setProjects(data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach(p => {
      const c = (p.category || 'Other').toLowerCase()
      counts[c] = (counts[c] || 0) + 1
    })
    const list = Object.entries(counts).map(([id, count]) => ({ id, name: id.replace(/\b\w/g, c => c.toUpperCase()), icon: Globe, count }))
    return [{ id: 'all', name: 'All Categories', icon: Globe, count: projects.length }, ...list]
  }, [projects])

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
    const matchesSearch = (project.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || (project.category || '').toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return 0
      case 'funding':
        return ((Number(b.current_funding)||0) / (Number(b.funding_goal)||1)) - ((Number(a.current_funding)||0) / (Number(a.funding_goal)||1))
      case 'investors':
        return 0
      case 'daysLeft':
        return 0
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
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
                  {getTrendIcon('up')}
                  <span className={`text-xs font-medium ${
                    'text-green-500'
                  }`}>
                    +
                  </span>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
              </div>

              {/* Funding Progress */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Amount</span>
                  <span className="font-medium">${(project.funding_goal ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-medium">${(project.current_funding ?? 0).toLocaleString()}</span>
                </div>
                <div className="w-full">
                  <Progress 
                    value={((Number(project.current_funding)||0)/(Number(project.funding_goal)||1))*100} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Return Rate:</span>
                  <span className="font-medium ml-1">{project.return_rate_min ?? '-'}% – {project.return_rate_max ?? '-'}%</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4"></div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => router.push(`/investing/project/${project.id}`)}>
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

"use client"

import { useEffect, useMemo, useState } from "react"
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
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useWishlist } from "@/components/commerce/wishlist-context"

export default function InvestingAlkebulanPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  type ProjectRow = {
    id: string
    title: string | null
    description: string | null
    funding_goal: number | null
    current_funding: number | null
    category: string | null
    image_url: string | null
    return_rate_min: number | null
    return_rate_max: number | null
    status: string | null
  }

  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [investorCount, setInvestorCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { has, toggle } = useWishlist()

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      setLoading(true)
      try {
        const [{ data: proj }, invCountRes] = await Promise.all([
          supabase
            .from('projects')
            .select('id,title,description,funding_goal,current_funding,category,image_url,return_rate_min,return_rate_max,status')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(30),
          // count investors if investments table exists
          supabase.from('investments').select('*', { count: 'exact', head: true })
        ])
        setProjects(proj || [])
        setInvestorCount(invCountRes.count ?? null)
      } catch {
        setProjects([])
        setInvestorCount(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects) {
      const cat = (p.category || 'Other').toLowerCase()
      counts[cat] = (counts[cat] || 0) + 1
    }
    const entries = Object.entries(counts)
    entries.sort((a, b) => b[1] - a[1])
    return [{ id: 'all', name: 'All Investments', count: projects.length },
      ...entries.map(([id, count]) => ({ id, name: id.replace(/\b\w/g, c => c.toUpperCase()), count }))]
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects
    return projects.filter(p => (p.category || 'other').toLowerCase() === selectedCategory)
  }, [projects, selectedCategory])

  const totalRaised = useMemo(() => {
    return projects.reduce((sum, p) => sum + (Number(p.current_funding) || 0), 0)
  }, [projects])

  const activeProjects = projects.length
  const avgReturn = useMemo(() => {
    const rs: number[] = []
    for (const p of projects) {
      if (p.return_rate_min != null && p.return_rate_max != null) {
        rs.push((Number(p.return_rate_min) + Number(p.return_rate_max)) / 2)
      }
    }
    if (!rs.length) return null
    return rs.reduce((a, b) => a + b, 0) / rs.length
  }, [projects])

  const stats = useMemo(() => ([
    {
      title: "Total Investments",
      value: totalRaised > 0 ? `$${totalRaised.toLocaleString()}` : "$0",
      change: "",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Active Projects",
      value: String(activeProjects),
      change: "",
      trend: "up",
      icon: Target
    },
    {
      title: "Total Investors",
      value: investorCount != null ? investorCount.toLocaleString() : "—",
      change: "",
      trend: "up",
      icon: Users
    },
    {
      title: "Avg. Return Rate",
      value: avgReturn != null ? `${avgReturn.toFixed(1)}%` : "—",
      change: "",
      trend: "up",
      icon: TrendingUp
    }
  ]), [totalRaised, activeProjects, investorCount, avgReturn])

  const handleView = (id: string) => {
    router.push(`/investing/project/${id}`)
  }

  const handleToggleSave = (p: ProjectRow) => {
    toggle({ id: p.id, name: p.title || 'Project', imageUrl: p.image_url || undefined })
  }

  const handleShare = async (p: ProjectRow) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/investing/project/${p.id}` : `/investing/project/${p.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: p.title || 'Project', text: p.description || undefined, url })
        return
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url)
    } catch {}
  }

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
          {categories.map((category) => (
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
          {filteredProjects.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    {p.category || 'N/A'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className={`text-xs font-medium ${
                      'text-green-500'
                    }`}>
                      +
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{p.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Amount</span>
                    <span className="font-medium">${(p.funding_goal ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-medium">${(p.current_funding ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full">
                    <Progress 
                      value={((Number(p.current_funding) || 0) / (Number(p.funding_goal) || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Investors:</span>
                    <span className="font-medium ml-1">—</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days Left:</span>
                    <span className="font-medium ml-1">—</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Return Rate:</span>
                    <span className="font-medium ml-1">{p.return_rate_min ?? '-'}% – {p.return_rate_max ?? '-'}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleView(p.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant={has(p.id) ? "default" : "outline"} size="icon" onClick={() => handleToggleSave(p)}>
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare(p)}>
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

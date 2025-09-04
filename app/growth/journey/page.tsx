"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Star, Plus, Edit, Trash2, Flag } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Milestone {
  id: string
  title: string
  description: string
  date: string
  category: string
  status: "completed" | "in-progress" | "planned"
  impact: "low" | "medium" | "high"
  location?: string
}

export default function JourneyPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    impact: "medium" as const,
    location: ""
  })

  const loadMilestones = async () => {
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    if (!isSupabaseConfigured() || !supabase) return
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return
    const { data, error } = await supabase
      .from('journey_milestones')
      .select('*')
      .eq('user_id', userId)
      .order('milestone_date', { ascending: true })
    if (error) { console.error('Error loading milestones:', error); return }
    const mapped: Milestone[] = (data || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description || '',
      date: typeof m.milestone_date === 'string' ? m.milestone_date : (m.milestone_date ? new Date(m.milestone_date).toISOString().split('T')[0] : ''),
      category: m.category || '',
      status: (m.status || 'planned') as Milestone['status'],
      impact: (m.impact || 'medium') as Milestone['impact'],
      location: m.location || ''
    }))
    setMilestones(mapped)
  }

  useEffect(() => { loadMilestones() }, [])

  const addMilestone = async () => {
    if (!newMilestone.title || !newMilestone.date) return
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return

    const normalizeDate = (value: string) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
      const m = value.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/)
      if (m) { const [, dd, mm, yyyy] = m; return `${yyyy}-${mm}-${dd}` }
      const d = new Date(value); return isNaN(d.getTime()) ? value : d.toISOString().split('T')[0]
    }

    const payload = {
      user_id: userId,
      title: newMilestone.title,
      description: newMilestone.description || null,
      milestone_date: normalizeDate(newMilestone.date),
      category: newMilestone.category || null,
      status: 'planned',
      impact: newMilestone.impact || 'medium',
      location: newMilestone.location || null
    }

    try {
      const { data, error } = await supabase
        .from('journey_milestones')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        console.error('Error adding milestone:', error)
        toast.error(error.message || 'Failed to add milestone')
        return
      }

      const created: Milestone = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        date: typeof data.milestone_date === 'string' ? data.milestone_date : (data.milestone_date ? new Date(data.milestone_date).toISOString().split('T')[0] : ''),
        category: data.category || '',
        status: (data.status || 'planned') as Milestone['status'],
        impact: (data.impact || 'medium') as Milestone['impact'],
        location: data.location || ''
      }

      setMilestones(prev => [...prev, created])
      setNewMilestone({ title: "", description: "", date: "", category: "", impact: "medium", location: "" })
    setShowAddForm(false)
      toast.success('Milestone added')
    } catch (e) {
      console.error('Unexpected error adding milestone:', e)
      toast.error('Unexpected error adding milestone')
    }
  }

  const updateStatus = async (id: string, status: Milestone["status"]) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, status } : m))
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    await supabase.from('journey_milestones').update({ status }).eq('id', id)
    loadMilestones()
  }

  const deleteMilestone = async (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    await supabase.from('journey_milestones').delete().eq('id', id)
    loadMilestones()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "planned": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const completedMilestones = milestones.filter(m => m.status === "completed")
  const inProgressMilestones = milestones.filter(m => m.status === "in-progress")
  const plannedMilestones = milestones.filter(m => m.status === "planned")

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your personal and professional milestones on your path to success
          </p>
        </div>

        {/* Journey Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Milestones</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{milestones.length}</p>
                </div>
                <Flag className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedMilestones.length}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressMilestones.length}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">→</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Planned</p>
                  <p className="text-2xl font-bold text-yellow-600">{plannedMilestones.length}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">●</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Milestone Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Milestone
          </Button>
        </div>

        {/* Add Milestone Form */}
        {showAddForm && (
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Add New Milestone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  placeholder="Category (e.g., Business, Personal)"
                  value={newMilestone.category}
                  onChange={(e) => setNewMilestone({...newMilestone, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newMilestone.impact}
                  onChange={(e) => setNewMilestone({...newMilestone, impact: e.target.value as any})}
                >
                  <option value="low">Low Impact</option>
                  <option value="medium">Medium Impact</option>
                  <option value="high">High Impact</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Location (optional)"
                  value={newMilestone.location}
                  onChange={(e) => setNewMilestone({...newMilestone, location: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  placeholder="Milestone description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addMilestone} className="bg-purple-600 hover:bg-purple-700">
                  Add Milestone
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Journey Timeline */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-purple-600" />
              Your Journey Timeline
            </CardTitle>
            <CardDescription>
              {milestones.length === 0 ? "No milestones yet" : `${milestones.length} milestones on your journey`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Flag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start your journey
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add your first milestone to begin tracking your journey
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Milestone
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedMilestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {/* Timeline Connector */}
                    {index < sortedMilestones.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === "completed" 
                          ? "bg-green-500 text-white" 
                          : milestone.status === "in-progress"
                          ? "bg-blue-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}>
                        {milestone.status === "completed" ? (
                          <Star className="h-6 w-6" />
                        ) : milestone.status === "in-progress" ? (
                          <Clock className="h-6 w-6" />
                        ) : (
                          <Flag className="h-6 w-6" />
                        )}
                      </div>
                      
                      {/* Milestone Content */}
                      <Card className="flex-1 bg-gray-50 dark:bg-gray-700">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{milestone.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {milestone.description}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Badge className={getStatusColor(milestone.status)}>
                                {milestone.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              <Badge className={getImpactColor(milestone.impact)}>
                                {milestone.impact.charAt(0).toUpperCase() + milestone.impact.slice(1)} Impact
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(milestone.date).toLocaleDateString()}
                            </div>
                            {milestone.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {milestone.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                              {milestone.category}
                            </div>
                          </div>
                          
                          {/* Status Update Buttons */}
                          <div className="flex gap-2 mt-4">
                            {milestone.status !== "completed" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(milestone.id, "completed")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Mark Complete
                              </Button>
                            )}
                            {milestone.status === "planned" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(milestone.id, "in-progress")}
                              >
                                Start Progress
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMilestone(milestone.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

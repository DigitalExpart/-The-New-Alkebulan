"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Target, Calendar, Plus, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
  category: string
  status: "on-track" | "behind" | "completed"
}

export default function ProgressPage() {
  const [goals, setGoals] = useState<Goal[]>([])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: "",
    unit: "",
    deadline: "",
    category: ""
  })

  const loadGoals = async () => {
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    if (!isSupabaseConfigured() || !supabase) return

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return

    const { data, error } = await supabase
      .from('progress_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading goals:', error)
      return
    }

    const mapped: Goal[] = (data || []).map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description || '',
      target: Number(g.target),
      current: Number(g.current || 0),
      unit: g.unit || '',
      deadline: typeof g.deadline === 'string' ? g.deadline : (g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : ''),
      category: g.category || '',
      status: (g.status || 'on-track') as Goal['status']
    }))
    setGoals(mapped)
  }

  useEffect(() => { loadGoals() }, [])

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) return
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
      title: newGoal.title,
      description: newGoal.description || null,
      target: Number(newGoal.target),
      current: 0,
      unit: newGoal.unit || null,
      deadline: normalizeDate(newGoal.deadline),
      category: newGoal.category || null,
      status: 'on-track'
    }

    const { error } = await supabase
      .from('progress_goals')
      .insert(payload)

    if (error) {
      console.error('Error creating goal:', error)
      toast.error('Failed to add goal')
      return
    }

    setShowAddForm(false)
    setNewGoal({ title: "", description: "", target: "", unit: "", deadline: "", category: "" })
    toast.success('Goal added')
    loadGoals()
  }

  const updateProgress = async (id: string, newCurrent: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, current: newCurrent } : g))
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const progressPct = (newCurrent / goal.target) * 100
    const nextStatus: Goal['status'] = progressPct >= 100 ? 'completed' : progressPct < 60 ? 'behind' : 'on-track'
    await supabase.from('progress_goals').update({ current: newCurrent, status: nextStatus }).eq('id', id)
    loadGoals()
  }

  const deleteGoal = async (id: string) => {
    setGoals(goals.filter(g => g.id !== id))
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    await supabase.from('progress_goals').delete().eq('id', id)
    loadGoals()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "on-track": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "behind": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500"
      case "on-track": return "bg-blue-500"
      case "behind": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === "completed").length
  const onTrackGoals = goals.filter(g => g.status === "on-track").length
  const behindGoals = goals.filter(g => g.status === "behind").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Progress Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Monitor your goals and track progress towards success
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">On Track</p>
                  <p className="text-2xl font-bold text-blue-600">{onTrackGoals}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Behind</p>
                  <p className="text-2xl font-bold text-red-600">{behindGoals}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Goal Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Goal
          </Button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Add New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Target value"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                />
                <Input
                  placeholder="Unit (e.g., USD, products, %)"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Category (e.g., Business, Personal)"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                />
                <Input
                  placeholder="Goal description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addGoal} className="bg-blue-600 hover:bg-blue-700">
                  Add Goal
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

        {/* Goals List */}
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100)
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            
            return (
              <Card key={goal.id} className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        {goal.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {goal.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Progress: {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-3"
                        style={{
                          '--progress-color': getProgressColor(goal.status)
                        } as React.CSSProperties}
                      />
                    </div>

                    {/* Goal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </span>
                      </div>
                      {goal.category && (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {goal.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Update Progress */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Update Progress:</span>
                        <Input
                          type="number"
                          placeholder="Current value"
                          className="w-24"
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            if (!isNaN(value)) {
                              updateProgress(goal.id, value)
                            }
                          }}
                        />
                        <span className="text-sm text-gray-500">{goal.unit}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {goals.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No goals set yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start tracking your progress by adding your first goal
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, Plus, Trash2 } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description: string
  date: string
  time: string
  priority: "low" | "medium" | "high"
  completed: boolean
  category: string
}

export default function DailyPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium" as const,
    category: ""
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Helper: fetch tasks for current user
  const loadTasks = async () => {
    let supabase: any = null
    try {
      supabase = getSupabaseClient()
    } catch (e) {
      console.error('Supabase client not configured:', e)
      return
    }
    if (!isSupabaseConfigured() || !supabase) return
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        setTasks([])
        return
      }
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('task_date', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading daily tasks:', error)
        return
      }

      const mapped: Task[] = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title || '',
        description: t.description || '',
        // Supabase returns DATE as 'YYYY-MM-DD' string; use as-is to avoid timezone shifts
        date: typeof t.task_date === 'string' ? t.task_date : (t.task_date ? new Date(t.task_date).toISOString().split('T')[0] : ''),
        time: t.task_time || '',
        priority: ((t.priority || 'medium') as string).toLowerCase() as Task['priority'],
        completed: !!t.completed,
        category: t.category || ''
      }))
      setTasks(mapped)
    } catch (err) {
      console.error('Unexpected error loading daily tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load on mount
  useEffect(() => { loadTasks() }, [])

  const addTask = async () => {
    if (!newTask.title || !newTask.date) return
    let supabase: any = null
    try {
      supabase = getSupabaseClient()
    } catch (e) {
      alert('Service not configured. Please try again later.')
      return
    }
    if (!isSupabaseConfigured() || !supabase) {
      alert('Service not available. Please try again later.')
      return
    }

    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        alert('Please sign in to create tasks.')
        return
      }

      // Normalize date to YYYY-MM-DD to satisfy Postgres DATE type regardless of locale
      const normalizeDate = (value: string) => {
        // If value already looks like YYYY-MM-DD, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
        // Handle DD/MM/YYYY or DD-MM-YYYY
        const m = value.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/)
        if (m) {
          const [, dd, mm, yyyy] = m
          return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
        }
        // Fallback: try Date parsing
        const d = new Date(value)
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0]
        }
        return value
      }

      const normalizedDate = normalizeDate(newTask.date)

      const insertPayload = {
        user_id: userId,
        title: newTask.title,
        description: newTask.description || null,
        task_date: normalizedDate,
        task_time: newTask.time || null,
        priority: newTask.priority,
        category: newTask.category || null,
        completed: false
      }

      const { data, error } = await supabase
        .from('daily_tasks')
        .insert(insertPayload)
        .select('*')
        .single()

      if (error) {
        console.error('Error creating task:', error)
        alert(`Failed to create task: ${error.message || 'Unknown error'}`)
        return
      }

      const created: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        date: normalizedDate,
        time: newTask.time,
        priority: newTask.priority,
        completed: false,
        category: newTask.category
      }
      setTasks(prev => [...prev, created])
      setNewTask({ title: "", description: "", date: "", time: "", priority: "medium", category: "" })
      setShowAddForm(false)
      toast.success('Task added to your Daily Planner')
      // Also reload from server to stay in sync
      loadTasks()
    } catch (err) {
      console.error('Unexpected error creating task:', err)
      alert('Failed to create task. Please check your inputs and try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (id: string) => {
    const supabase = getSupabaseClient()
    if (!isSupabaseConfigured() || !supabase) {
      setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task))
      return
    }

    try {
      const current = tasks.find(t => t.id === id)
      if (!current) return
      const nextCompleted = !current.completed

      setTasks(tasks.map(task => task.id === id ? { ...task, completed: nextCompleted } : task))

      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) return

      const { error } = await supabase
        .from('daily_tasks')
        .update({ completed: nextCompleted })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error toggling task:', error)
      }
    } catch (err) {
      console.error('Unexpected error toggling task:', err)
    }
  }

  const deleteTask = async (id: string) => {
    const supabase = getSupabaseClient()
    setTasks(tasks.filter(task => task.id !== id))
    if (!isSupabaseConfigured() || !supabase) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) return
      const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) {
        console.error('Error deleting task:', error)
      }
    } catch (err) {
      console.error('Unexpected error deleting task:', err)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const todaysTasks = tasks.filter(task => task.date === today)
  const allTasksSorted = [...tasks].sort((a, b) => (a.date + (a.time||'')) > (b.date + (b.time||'')) ? 1 : -1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Planner
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Organize your day and track your progress towards your goals
          </p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
                <Input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                />
                <Input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Category (e.g., Business, Personal)"
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                />
                <Input
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                  Add Task
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

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Today's Tasks
            </CardTitle>
            <CardDescription>
              {todaysTasks.length === 0 ? "No tasks scheduled for today" : `${todaysTasks.length} tasks scheduled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks scheduled for today. Add some tasks to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline">{task.category}</Badge>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {task.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* All Tasks section */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              All Tasks
            </CardTitle>
            <CardDescription>
              {allTasksSorted.length === 0 ? "No tasks yet" : `${allTasksSorted.length} total tasks`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allTasksSorted.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks created yet. Add your first task to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTasksSorted.map((task) => (
                  <div
                    key={`all-${task.id}`}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline">{task.category}</Badge>
                          )}
                          <span>{task.date}</span>
                          {task.time && <span>{task.time}</span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

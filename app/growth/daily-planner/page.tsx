"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, Plus, Trash2, Loader2 } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"


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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()

      if (!newTask.title || !newTask.date) {
          toast.error("Title and date are required.")
          return
      }
      
      const supabase = getSupabaseClient()
      if (!isSupabaseConfigured() || !supabase) {
          toast.error('Service not configured. Please try again later.')
          return
      }

      setIsSubmitting(true)
      const toastId = toast.loading("Adding your task...")

      try {
          const { data: { session } } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) {
              toast.error('Please sign in to create tasks.', { id: toastId })
              return
          }

          const normalizeDate = (value: string) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
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
              toast.error(`Failed to create task: ${error.message || 'Unknown error'}`, { id: toastId })
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
          
          toast.success('Task added to your Daily Planner', { id: toastId })

      } catch (err) {
          console.error('Unexpected error creating task:', err)
          toast.error('Failed to create task. Please check your inputs and try again.', { id: toastId })
      } finally {
          setIsSubmitting(false)
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
      case "high": return "bg-red-500 text-white"
      case "medium": return "bg-orange-500 text-white"
      case "low": return "bg-emerald-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const todaysTasks = tasks.filter(task => task.date === today)
  const allTasksSorted = [...tasks].sort((a, b) => (a.date + (a.time||'')) > (b.date + (b.time||'')) ? 1 : -1)

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Daily Planner</h2>
          <p className="text-muted-foreground">
            Organize your day and track your progress towards your goals
          </p>
        </div>
        
        {showAddForm && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Add New Task</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="date"
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="time"
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <select
                    id="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Input
                    id="category"
                    placeholder="e.g., Business, Personal"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    id="description"
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Task
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" /> Add Task
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Button onClick={() => setShowAddForm(!showAddForm)} className="self-start">
          <Plus className="mr-2 h-4 w-4" /> Add New Task
        </Button>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="text-center col-span-full py-8">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
              </div>
            ) : allTasksSorted.length === 0 ? (
              <div className="text-center col-span-full py-8 text-muted-foreground">
                <p>No tasks created yet. Add your first task to get started!</p>
              </div>
            ) : (
              allTasksSorted.map((task) => (
                <Card
                  key={task.id}
                  className={`relative p-4 ${task.completed ? "opacity-60" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="h-6 w-6 rounded-full border-2 border-primary"
                      >
                        {task.completed && <CheckCircle className="h-4 w-4 text-primary" />}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge variant="secondary">{task.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => deleteTask(task.id)} 
                      size="icon" 
                      variant="ghost" 
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{task.date}</span>
                    <Clock className="ml-4 mr-1 h-3 w-3" />
                    <span>{task.time || 'No time'}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
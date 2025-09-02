"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, CheckCircle, Plus, Clock, Star, Users } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  description: string
  category: string
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  rating: number
  enrolled: number
  status: "not-started" | "in-progress" | "completed"
  progress: number
}

export default function LearningHubPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [saving, setSaving] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    difficulty: "beginner" as const
  })

  const loadCourses = async () => {
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    if (!isSupabaseConfigured() || !supabase) return
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return
    const { data, error } = await supabase
      .from('learning_courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) { console.error('Error loading courses:', error); return }
    const mapped: Course[] = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      category: c.category || '',
      duration: c.duration || '',
      difficulty: (c.difficulty || 'beginner') as Course['difficulty'],
      rating: Number(c.rating || 0),
      enrolled: Number(c.enrolled || 0),
      status: (c.status || 'not-started') as Course['status'],
      progress: Number(c.progress || 0)
    }))
    setCourses(mapped)
  }

  useEffect(() => { loadCourses() }, [])

  const addCourse = async () => {
    if (!newCourse.title || !newCourse.category || !newCourse.duration) return
    let supabase: any
    try { supabase = getSupabaseClient() } catch {
      toast.error('Service not configured')
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      toast.error('Please sign in to add a course')
      return
    }
    setSaving(true)
    const payload = {
      user_id: userId,
      title: newCourse.title,
      description: newCourse.description || null,
      category: newCourse.category || null,
      duration: newCourse.duration || null,
      difficulty: newCourse.difficulty,
      rating: 0,
      enrolled: 0,
      status: 'not-started',
      progress: 0
    }
    const { data, error } = await supabase
      .from('learning_courses')
      .insert(payload)
      .select('*')
      .single()
    if (error) { console.error('Error adding course:', error); toast.error('Failed to add course'); setSaving(false); return }
    const created: Course = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      category: data.category || '',
      duration: data.duration || '',
      difficulty: (data.difficulty || 'beginner') as Course['difficulty'],
      rating: Number(data.rating || 0),
      enrolled: Number(data.enrolled || 0),
      status: (data.status || 'not-started') as Course['status'],
      progress: Number(data.progress || 0)
    }
    setCourses(prev => [...prev, created])
    setNewCourse({ title: "", description: "", category: "", duration: "", difficulty: "beginner" })
    setShowAddForm(false)
    toast.success('Course added')
    setSaving(false)
  }

  const updateProgress = async (id: string, newProgress: number) => {
    setCourses(courses.map(c => c.id === id ? { ...c, progress: newProgress, status: newProgress >= 100 ? 'completed' : (newProgress > 0 ? 'in-progress' : 'not-started') } : c))
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    const status = newProgress >= 100 ? 'completed' : (newProgress > 0 ? 'in-progress' : 'not-started')
    await supabase.from('learning_courses').update({ progress: newProgress, status }).eq('id', id)
  }

  const deleteCourse = async (id: string) => {
    setCourses(courses.filter(c => c.id !== id))
    let supabase: any
    try { supabase = getSupabaseClient() } catch { return }
    await supabase.from('learning_courses').delete().eq('id', id)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "not-started": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const totalCourses = courses.length
  const completedCourses = courses.filter(c => c.status === "completed").length
  const inProgressCourses = courses.filter(c => c.status === "in-progress").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Learning Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Expand your knowledge and skills with our curated learning resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedCourses}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{inProgressCourses}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Course title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  placeholder="Category (e.g., Business, Marketing)"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  placeholder="Duration (e.g., 4 hours)"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCourse.difficulty}
                  onChange={(e) => setNewCourse({...newCourse, difficulty: e.target.value as any})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input
                  placeholder="Course description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCourse} className="bg-orange-600 hover:bg-orange-700">
                  Add Course
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {course.rating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolled}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {course.status === "not-started" && (
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Start Course
                    </Button>
                  )}
                  {course.status === "in-progress" && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  )}
                  {course.status === "completed" && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="%"
                      className="w-16 h-8 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        if (!isNaN(value) && value >= 0 && value <= 100) {
                          updateProgress(course.id, value)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No courses available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start your learning journey by adding your first course
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

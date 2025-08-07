"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  FilterIcon,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  Target,
  TrendingUp,
  Zap,
  Settings,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Paperclip,
  Flag,
  Users,
  Download,
  Upload,
  Link,
  FileText,
  ImageIcon,
  Send,
  Timer,
  CalendarIcon,
  Video,
} from "lucide-react"
import { processBoards, processStats, aiInsights, teamMembers, activityLogs } from "@/data/process-management-data"
import type { ViewType, TaskStatus, TaskPriority, Task } from "@/types/process-management"

export default function ProcessManagementPage() {
  const [currentView, setCurrentView] = useState<ViewType>("table")
  const [selectedBoard, setSelectedBoard] = useState(processBoards[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [timeEntry, setTimeEntry] = useState("")
  const [taskFilters, setTaskFilters] = useState({}) // Renamed Filter to taskFilters
  const [showFilters, setShowFilters] = useState(false)

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    return selectedBoard.tasks.filter((task) => {
      // Search filter
      const matchesSearch =
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Status filter
      const matchesStatus = !taskFilters.status?.length || taskFilters.status.includes(task.status)

      // Priority filter
      const matchesPriority = !taskFilters.priority?.length || taskFilters.priority.includes(task.priority)

      // Assignee filter
      const matchesAssignee =
        !taskFilters.assignee?.length || task.assignedUsers.some((user) => taskFilters.assignee?.includes(user.id))

      // Due date filter
      const matchesDueDate =
        !taskFilters.dueDate?.start ||
        (task.dueDate >= taskFilters.dueDate.start &&
          (!taskFilters.dueDate.end || task.dueDate <= taskFilters.dueDate.end))

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDueDate
    })
  }, [selectedBoard.tasks, searchQuery, taskFilters])

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return <Circle className="w-4 h-4 text-gray-400" />
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      case "review":
        return <PauseCircle className="w-4 h-4 text-yellow-500" />
      case "done":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "blocked":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const openTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleAddComment = () => {
    if (newComment.trim() && selectedTask) {
      // In a real app, this would make an API call
      console.log("Adding comment:", newComment)
      setNewComment("")
    }
  }

  const handleTimeEntry = () => {
    if (timeEntry.trim() && selectedTask) {
      // In a real app, this would make an API call
      console.log("Logging time:", timeEntry)
      setTimeEntry("")
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Process Management</h1>
              <p className="text-muted-foreground">Comprehensive project and task management for teams</p>
            </div>
            <div className="flex items-center gap-3">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{processStats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{processStats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((processStats.completedTasks / processStats.totalTasks) * 100)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
                <Timer className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatTime(processStats.totalTimeTracked)}</div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{processStats.overdueTasks}</div>
                <p className="text-xs text-muted-foreground">Needs immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>Smart recommendations to improve your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.priority === "high"
                            ? "destructive"
                            : insight.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{insight.description}</p>
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      {insight.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Project Boards */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Boards</CardTitle>
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Board
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {processBoards.map((board) => (
                  <div
                    key={board.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBoard.id === board.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => setSelectedBoard(board)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: board.color }} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{board.name}</div>
                        <div className="text-xs text-muted-foreground">{board.tasks.length} tasks</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedBoard.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                          member.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.department}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span style={{ color: selectedBoard.color }}>{selectedBoard.icon}</span>
                      {selectedBoard.name}
                    </CardTitle>
                    <CardDescription>{selectedBoard.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                      <FilterIcon className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Assignee</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All members" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Due Date</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All dates" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="today">Due Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {/* View Toggle */}
                <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="mb-6">
                  <TabsList>
                    <TabsTrigger value="table">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Table
                    </TabsTrigger>
                    <TabsTrigger value="kanban">
                      <Target className="w-4 h-4 mr-2" />
                      Kanban
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                      <Calendar className="w-4 h-4 mr-2" />
                      Calendar
                    </TabsTrigger>
                    <TabsTrigger value="timeline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Timeline
                    </TabsTrigger>
                  </TabsList>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="border rounded-lg">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                        <div className="col-span-3">Task</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1">Priority</div>
                        <div className="col-span-2">Assignees</div>
                        <div className="col-span-1">Due Date</div>
                        <div className="col-span-1">Time</div>
                        <div className="col-span-2">Progress</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                      {filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => openTaskDialog(task)}
                        >
                          <div className="col-span-3">
                            <div className="font-medium">{task.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {task.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{task.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                            {task.subtasks.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                              </div>
                            )}
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className="capitalize text-sm">{task.status.replace("_", " ")}</span>
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              {task.assignedUsers.slice(0, 3).map((user) => (
                                <Avatar key={user.id} className="w-6 h-6">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback className="text-xs">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {task.assignedUsers.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                  +{task.assignedUsers.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <div className={`text-sm ${isOverdue(task.dueDate) ? "text-red-600 font-medium" : ""}`}>
                              {task.dueDate.toLocaleDateString()}
                            </div>
                            {isOverdue(task.dueDate) && <div className="text-xs text-red-600">Overdue</div>}
                          </div>
                          <div className="col-span-1">
                            <div className="text-sm">{formatTime(task.timeTracked)}</div>
                            {task.estimatedTime && (
                              <div className="text-xs text-muted-foreground">/ {formatTime(task.estimatedTime)}</div>
                            )}
                          </div>
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <Progress value={task.progress} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{task.progress}%</span>
                                <div className="flex items-center gap-2">
                                  {task.comments.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {task.comments.length}
                                    </span>
                                  )}
                                  {task.attachments.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Paperclip className="w-3 h-3" />
                                      {task.attachments.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Timer className="w-4 h-4 mr-2" />
                                  Log Time
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Kanban View */}
                  <TabsContent value="kanban" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {selectedBoard.columns.map((column) => (
                        <div key={column.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
                              {column.name}
                            </h3>
                            <Badge variant="secondary">
                              {filteredTasks.filter((task) => task.status === column.id).length}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {filteredTasks
                              .filter((task) => task.status === column.id)
                              .map((task) => (
                                <Card
                                  key={task.id}
                                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => openTaskDialog(task)}
                                >
                                  <div className="space-y-3">
                                    <div className="font-medium text-sm">{task.name}</div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                        <Flag className="w-3 h-3 mr-1" />
                                        {task.priority}
                                      </Badge>
                                      {isOverdue(task.dueDate) && (
                                        <Badge variant="destructive" className="text-xs">
                                          Overdue
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        {task.assignedUsers.slice(0, 2).map((user) => (
                                          <Avatar key={user.id} className="w-6 h-6">
                                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                            <AvatarFallback className="text-xs">
                                              {user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MessageSquare className="w-3 h-3" />
                                        {task.comments.length}
                                        <Paperclip className="w-3 h-3 ml-1" />
                                        {task.attachments.length}
                                        <Timer className="w-3 h-3 ml-1" />
                                        {formatTime(task.timeTracked)}
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <Progress value={task.progress} className="h-2" />
                                      <div className="text-xs text-muted-foreground">{task.progress}% complete</div>
                                    </div>
                                    {task.subtasks.length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}{" "}
                                        subtasks completed
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            <Button variant="ghost" className="w-full border-2 border-dashed">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Task
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Calendar View */}
                  <TabsContent value="calendar" className="space-y-4">
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                      <p className="text-muted-foreground mb-4">
                        View tasks scheduled over time with monthly and weekly toggles
                      </p>
                      <Button variant="outline">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Timeline View */}
                  <TabsContent value="timeline" className="space-y-4">
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Timeline View</h3>
                      <p className="text-muted-foreground mb-4">
                        Gantt chart showing project phases, dependencies, and progress
                      </p>
                      <Button variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Task Detail Dialog */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getStatusIcon(selectedTask.status)}
                    {selectedTask.name}
                  </DialogTitle>
                  <DialogDescription>
                    Created by {selectedTask.createdBy.name} on {selectedTask.createdAt.toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTask.description || "No description provided."}
                      </p>
                    </div>

                    {/* Subtasks */}
                    {selectedTask.subtasks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Subtasks ({selectedTask.subtasks.filter((s) => s.completed).length}/
                          {selectedTask.subtasks.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedTask.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-3 p-2 border rounded">
                              <Checkbox checked={subtask.completed} />
                              <span
                                className={`flex-1 text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {subtask.name}
                              </span>
                              {subtask.assignedTo && (
                                <Avatar className="w-5 h-5">
                                  <AvatarImage
                                    src={subtask.assignedTo.avatar || "/placeholder.svg"}
                                    alt={subtask.assignedTo.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {subtask.assignedTo.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <h4 className="font-medium mb-2">Comments ({selectedTask.comments.length})</h4>
                      <div className="space-y-4">
                        {selectedTask.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={comment.author.avatar || "/placeholder.svg"}
                                alt={comment.author.name}
                              />
                              <AvatarFallback>
                                {comment.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{comment.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {comment.createdAt.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg" alt="You" />
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="Add a comment... Use @username to mention someone"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={handleAddComment}>
                                <Send className="w-4 h-4 mr-2" />
                                Comment
                              </Button>
                              <Button size="sm" variant="outline">
                                <Paperclip className="w-4 h-4 mr-2" />
                                Attach
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    {selectedTask.attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Attachments ({selectedTask.attachments.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedTask.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded">
                              {attachment.type === "image" && <ImageIcon className="w-5 h-5 text-blue-500" />}
                              {attachment.type === "document" && <FileText className="w-5 h-5 text-red-500" />}
                              {attachment.type === "video" && <Video className="w-5 h-5 text-purple-500" />}
                              {attachment.type === "link" && <Link className="w-5 h-5 text-green-500" />}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{attachment.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {(attachment.size / 1024 / 1024).toFixed(2)} MB • {attachment.uploadedBy.name}
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activity Log */}
                    <div>
                      <h4 className="font-medium mb-2">Activity</h4>
                      <ScrollArea className="h-48">
                        <div className="space-y-3">
                          {activityLogs
                            .filter((log) => log.taskId === selectedTask.id)
                            .map((log) => (
                              <div key={log.id} className="flex gap-3">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={log.user.avatar || "/placeholder.svg"} alt={log.user.name} />
                                  <AvatarFallback className="text-xs">
                                    {log.user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="text-sm">
                                    <span className="font-medium">{log.user.name}</span> {log.details}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{log.timestamp.toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Task Details */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Select defaultValue={selectedTask.status}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Select defaultValue={selectedTask.priority}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Assignees</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedTask.assignedUsers.map((user) => (
                            <Avatar key={user.id} className="w-8 h-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Due Date</Label>
                        <div
                          className={`mt-1 text-sm ${isOverdue(selectedTask.dueDate) ? "text-red-600 font-medium" : ""}`}
                        >
                          {selectedTask.dueDate.toLocaleDateString()}
                          {isOverdue(selectedTask.dueDate) && <span className="ml-2 text-red-600">(Overdue)</span>}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Progress</Label>
                        <div className="mt-1">
                          <Progress value={selectedTask.progress} className="h-2" />
                          <div className="text-sm text-muted-foreground mt-1">{selectedTask.progress}% complete</div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Time Tracking</Label>
                        <div className="mt-1 space-y-2">
                          <div className="text-sm">
                            Tracked: {formatTime(selectedTask.timeTracked)}
                            {selectedTask.estimatedTime && (
                              <span className="text-muted-foreground">
                                {" "}
                                / {formatTime(selectedTask.estimatedTime)} estimated
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Log time (e.g., 2h 30m)"
                              value={timeEntry}
                              onChange={(e) => setTimeEntry(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={handleTimeEntry}>
                              <Timer className="w-4 h-4 mr-1" />
                              Log
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTask.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedTask.dependencies.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Dependencies</Label>
                          <div className="mt-1 text-sm text-muted-foreground">
                            This task depends on {selectedTask.dependencies.length} other task(s)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <Button className="w-full" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Task
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Assign Members
                      </Button>
                      <Separator />
                      <Button variant="destructive" className="w-full" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

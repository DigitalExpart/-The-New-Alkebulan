export interface Task {
  id: string
  name: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedUsers: TeamMember[]
  startDate: Date
  dueDate: Date
  progress: number
  tags: string[]
  timeTracked: number // in minutes
  estimatedTime?: number // in minutes
  comments: Comment[]
  attachments: Attachment[]
  dependencies: string[] // task IDs
  subtasks: Subtask[]
  boardId: string
  createdAt: Date
  updatedAt: Date
  createdBy: TeamMember
}

export interface Subtask {
  id: string
  name: string
  completed: boolean
  assignedTo?: TeamMember
  createdAt: Date
}

export interface Board {
  id: string
  name: string
  description: string
  color: string
  icon: string
  tasks: Task[]
  columns: BoardColumn[]
  teamMembers: TeamMember[]
  createdAt: Date
  updatedAt: Date
}

export interface BoardColumn {
  id: string
  name: string
  color: string
  order: number
  tasks: string[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: TeamRole
  department: string
  isOnline: boolean
}

export interface Comment {
  id: string
  content: string
  author: TeamMember
  createdAt: Date
  mentions: string[]
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: AttachmentType
  size: number
  uploadedBy: TeamMember
  uploadedAt: Date
}

export interface ActivityLog {
  id: string
  taskId: string
  action: ActivityAction
  user: TeamMember
  timestamp: Date
  details: string
  oldValue?: any
  newValue?: any
}

export interface TimeEntry {
  id: string
  taskId: string
  user: TeamMember
  duration: number // in minutes
  description?: string
  date: Date
}

export interface ProcessStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  totalProjects: number
  activeProjects: number
  teamMembers: number
  avgCompletionTime: number
  totalTimeTracked: number
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TeamRole = "admin" | "manager" | "member" | "viewer"
export type ViewType = "table" | "kanban" | "calendar" | "timeline"
export type AttachmentType = "image" | "document" | "video" | "link" | "other"
export type ActivityAction =
  | "created"
  | "updated"
  | "commented"
  | "assigned"
  | "completed"
  | "status_changed"
  | "time_logged"

export interface Filter {
  assignee?: string[]
  status?: TaskStatus[]
  priority?: TaskPriority[]
  dueDate?: {
    start?: Date
    end?: Date
  }
  tags?: string[]
}

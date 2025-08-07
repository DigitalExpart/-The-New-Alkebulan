export interface BusinessIdea {
  id: string
  title: string
  description: string
  category: BusinessCategory
  status: "concept" | "planning" | "in-progress" | "on-hold" | "completed"
  priority: "low" | "medium" | "high" | "critical"
  startDate: string
  targetLaunchDate: string
  estimatedDuration: number // in months
  budget: {
    estimated: number
    allocated: number
    spent: number
    currency: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  collaborators: string[]
  isPublic: boolean
}

export interface BusinessGoal {
  id: string
  businessIdeaId: string
  title: string
  description: string
  type: "revenue" | "customers" | "market-share" | "product" | "team" | "other"
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  priority: "low" | "medium" | "high" | "critical"
  status: "not-started" | "in-progress" | "completed" | "overdue"
  milestones: BusinessMilestone[]
  createdAt: string
  updatedAt: string
}

export interface BusinessMilestone {
  id: string
  title: string
  description: string
  targetDate: string
  completedDate?: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  dependencies: string[]
}

export interface BusinessTask {
  id: string
  businessIdeaId: string
  goalId?: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "todo" | "in-progress" | "review" | "completed"
  assignedTo: string[]
  dueDate: string
  estimatedHours: number
  actualHours?: number
  tags: string[]
  dependencies: string[]
  attachments: string[]
  comments: TaskComment[]
  createdAt: string
  updatedAt: string
}

export interface TaskComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
}

export interface BusinessRole {
  id: string
  businessIdeaId: string
  title: string
  description: string
  responsibilities: string[]
  requiredSkills: string[]
  timeCommitment: string
  compensation?: {
    type: "equity" | "salary" | "hourly" | "commission" | "volunteer"
    amount?: number
    currency?: string
    equityPercentage?: number
  }
  status: "open" | "filled" | "on-hold"
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface BusinessPlanExport {
  format: "pdf" | "docx" | "json"
  sections: string[]
  includeFinancials: boolean
  includeTimeline: boolean
  includeTeam: boolean
}

export interface BusinessPlanShare {
  businessIdeaId: string
  sharedWith: string[]
  permissions: "view" | "comment" | "edit"
  expiresAt?: string
  message?: string
}

export interface AIBusinessSuggestion {
  id: string
  type: "improvement" | "risk" | "opportunity" | "duplicate" | "resource"
  title: string
  description: string
  confidence: number
  category: string
  actionable: boolean
  relatedItems: string[]
  createdAt: string
}

export type BusinessCategory =
  | "technology"
  | "retail"
  | "services"
  | "manufacturing"
  | "healthcare"
  | "education"
  | "finance"
  | "real-estate"
  | "food-beverage"
  | "entertainment"
  | "consulting"
  | "non-profit"
  | "other"

export interface TimelineEvent {
  id: string
  businessIdeaId: string
  title: string
  description: string
  date: string
  type: "milestone" | "task" | "goal" | "meeting" | "deadline"
  status: "upcoming" | "in-progress" | "completed" | "overdue"
  relatedId?: string
}

export interface BusinessPlanningFilters {
  status: string[]
  priority: string[]
  category: string[]
  dateRange: {
    start: string
    end: string
  }
  tags: string[]
  assignedTo: string[]
}

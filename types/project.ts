export interface Project {
  id: string
  title: string
  description: string
  fullDescription: string
  coverImage: string
  bannerImage?: string
  owner: {
    id: string
    name: string
    avatar: string
    title: string
  }
  team: Array<{
    id: string
    name: string
    avatar: string
    role: string
  }>
  category: ProjectCategory
  region: ProjectRegion
  status: ProjectStatus
  tags: string[]
  progress: number
  funding?: {
    target: number
    raised: number
    currency: string
  }
  milestones: ProjectMilestone[]
  createdAt: string
  updatedAt: string
  endDate?: string
  teamSize: number
  impactScale: "Local" | "Regional" | "Global"
  visibility: "Public" | "Community" | "Private"
  views: number
  rating: number
  followers: number
  documents: ProjectDocument[]
  comments: ProjectComment[]
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  completedDate?: string
}

export interface ProjectDocument {
  id: string
  name: string
  type: "PDF" | "Video" | "Slides" | "Image" | "Other"
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface ProjectComment {
  id: string
  author: {
    id: string
    name: string
    avatar: string
  }
  content: string
  createdAt: string
  replies?: ProjectComment[]
}

export type ProjectCategory =
  | "Technology"
  | "Education"
  | "Health"
  | "Real Estate"
  | "Culture"
  | "Environment"
  | "Finance"
  | "Agriculture"
  | "Arts"
  | "Social Impact"

export type ProjectRegion =
  | "Global"
  | "North America"
  | "Caribbean"
  | "Europe"
  | "Africa"
  | "Asia"
  | "South America"
  | "Oceania"

export type ProjectStatus = "Active" | "In Progress" | "Completed" | "Seeking Support" | "On Hold"

export interface ProjectFilters {
  search: string
  category: ProjectCategory | "All"
  region: ProjectRegion | "All"
  status: ProjectStatus | "All"
  teamSize: "Any" | "Small (1-5)" | "Medium (6-15)" | "Large (16+)"
  impactScale: "Any" | "Local" | "Regional" | "Global"
  tags?: string[]
}

export type ProjectSortBy = "Most Viewed" | "Newest" | "Top Rated" | "Ending Soon" | "Most Funded"

export interface CreateProjectForm {
  title: string
  description: string
  fullDescription: string
  category: ProjectCategory
  region: ProjectRegion
  tags: string[]
  location: string
  budget?: number
  currency: string
  teamRoles: string[]
  timeline: string
  endDate?: string
  visibility: "Public" | "Community" | "Private"
  coverImage?: File
  bannerImage?: File
  documents: File[]
}

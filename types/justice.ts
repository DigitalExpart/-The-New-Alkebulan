export interface NaturalLawPrinciple {
  id: string
  title: string
  description: string
  category: "fundamental" | "rights" | "responsibilities" | "procedures"
  examples: string[]
  relatedPrinciples: string[]
  resources: NaturalLawResource[]
}

export interface NaturalLawResource {
  id: string
  title: string
  type: "pdf" | "video" | "article" | "image"
  url: string
  description: string
  uploadDate: string
}

export interface IncidentReport {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: "discrimination" | "harassment" | "fraud" | "violence" | "corruption" | "other"
  files: UploadedFile[]
  isAnonymous: boolean
  status: "pending" | "under_review" | "approved" | "rejected"
  submittedBy?: string
  submittedAt: string
  isPublic: boolean
}

export interface CaseFileEntry {
  id: string
  title: string
  description: string
  date: string
  category: "evidence" | "correspondence" | "legal_document" | "witness_statement" | "other"
  files: UploadedFile[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PublicMisconductPost {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  type: "incident" | "misconduct" | "violation"
  region: string
  reactions: {
    support: number
    concern: number
    question: number
  }
  comments: Comment[]
  isApproved: boolean
  reportedAt: string
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  replies: Comment[]
  reactions: {
    like: number
    dislike: number
  }
}

export interface NaturalCourtRequest {
  id: string
  incidentId?: string
  caseSummary: string
  evidence: UploadedFile[]
  naturalLawPrinciples: string[]
  desiredOutcome: string
  priority: "low" | "medium" | "high" | "critical"
  status: "submitted" | "under_review" | "scheduled" | "in_progress" | "resolved" | "dismissed"
  submittedAt: string
  estimatedTimeline: string
  assignedArbitrator?: string
  hearingDate?: string
}

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface JusticeStats {
  totalReports: number
  resolvedCases: number
  activeInvestigations: number
  communityTrust: number
  averageResolutionTime: string
  userSatisfaction: number
}

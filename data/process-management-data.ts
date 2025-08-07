import type {
  Board,
  TeamMember,
  ProcessStats,
  Comment,
  Attachment,
  ActivityLog,
  TimeEntry,
} from "@/types/process-management"

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Amara Johnson",
    email: "amara@alkebulan.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin",
    department: "Marketing",
    isOnline: true,
  },
  {
    id: "2",
    name: "Kwame Asante",
    email: "kwame@alkebulan.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "manager",
    department: "Development",
    isOnline: true,
  },
  {
    id: "3",
    name: "Zara Okafor",
    email: "zara@alkebulan.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    department: "Design",
    isOnline: false,
  },
  {
    id: "4",
    name: "Malik Thompson",
    email: "malik@alkebulan.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    department: "Business",
    isOnline: true,
  },
  {
    id: "5",
    name: "Nia Williams",
    email: "nia@alkebulan.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    department: "QA",
    isOnline: true,
  },
]

const sampleComments: Comment[] = [
  {
    id: "comment-1",
    content: "Great progress on this! @kwame can you review the latest changes?",
    author: teamMembers[0],
    createdAt: new Date("2024-01-15T10:30:00"),
    mentions: ["2"],
  },
  {
    id: "comment-2",
    content: "Reviewed and approved. Moving to next phase.",
    author: teamMembers[1],
    createdAt: new Date("2024-01-15T14:20:00"),
    mentions: [],
  },
]

const sampleAttachments: Attachment[] = [
  {
    id: "att-1",
    name: "brand-guidelines.pdf",
    url: "/files/brand-guidelines.pdf",
    type: "document",
    size: 2048000,
    uploadedBy: teamMembers[0],
    uploadedAt: new Date("2024-01-10T09:00:00"),
  },
  {
    id: "att-2",
    name: "mockup-v2.png",
    url: "/files/mockup-v2.png",
    type: "image",
    size: 1024000,
    uploadedBy: teamMembers[2],
    uploadedAt: new Date("2024-01-12T15:30:00"),
  },
]

export const processBoards: Board[] = [
  {
    id: "marketing-launch",
    name: "Marketing Launch",
    description: "Q1 2024 Marketing Campaign Launch",
    color: "#FF6B6B",
    icon: "🚀",
    teamMembers: teamMembers.slice(0, 4),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    columns: [
      { id: "todo", name: "To Do", color: "#E3F2FD", order: 1, tasks: [] },
      { id: "in_progress", name: "In Progress", color: "#FFF3E0", order: 2, tasks: [] },
      { id: "review", name: "Review", color: "#F3E5F5", order: 3, tasks: [] },
      { id: "done", name: "Done", color: "#E8F5E8", order: 4, tasks: [] },
    ],
    tasks: [
      {
        id: "task-1",
        name: "Create brand guidelines",
        description:
          "Develop comprehensive brand guidelines for the new campaign including logo usage, color palette, typography, and voice guidelines.",
        status: "in_progress",
        priority: "high",
        assignedUsers: [teamMembers[0], teamMembers[2]],
        startDate: new Date("2024-01-10"),
        dueDate: new Date("2024-01-25"),
        progress: 65,
        tags: ["branding", "design", "guidelines"],
        timeTracked: 1560, // 26 hours
        estimatedTime: 2400, // 40 hours
        comments: sampleComments,
        attachments: sampleAttachments,
        dependencies: [],
        subtasks: [
          {
            id: "sub-1",
            name: "Logo usage guidelines",
            completed: true,
            assignedTo: teamMembers[2],
            createdAt: new Date("2024-01-10"),
          },
          {
            id: "sub-2",
            name: "Color palette definition",
            completed: true,
            assignedTo: teamMembers[2],
            createdAt: new Date("2024-01-10"),
          },
          {
            id: "sub-3",
            name: "Typography guidelines",
            completed: false,
            assignedTo: teamMembers[0],
            createdAt: new Date("2024-01-12"),
          },
          {
            id: "sub-4",
            name: "Voice and tone guidelines",
            completed: false,
            assignedTo: teamMembers[0],
            createdAt: new Date("2024-01-12"),
          },
        ],
        boardId: "marketing-launch",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-15"),
        createdBy: teamMembers[0],
      },
      {
        id: "task-2",
        name: "Social media content calendar",
        description:
          "Plan and schedule social media posts for the campaign across all platforms including Instagram, Twitter, LinkedIn, and Facebook.",
        status: "todo",
        priority: "medium",
        assignedUsers: [teamMembers[0]],
        startDate: new Date("2024-01-20"),
        dueDate: new Date("2024-02-01"),
        progress: 0,
        tags: ["social-media", "content", "planning"],
        timeTracked: 0,
        estimatedTime: 1200, // 20 hours
        comments: [],
        attachments: [],
        dependencies: ["task-1"],
        subtasks: [
          {
            id: "sub-5",
            name: "Instagram content plan",
            completed: false,
            assignedTo: teamMembers[0],
            createdAt: new Date("2024-01-15"),
          },
          {
            id: "sub-6",
            name: "Twitter content plan",
            completed: false,
            assignedTo: teamMembers[0],
            createdAt: new Date("2024-01-15"),
          },
        ],
        boardId: "marketing-launch",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        createdBy: teamMembers[1],
      },
      {
        id: "task-3",
        name: "Website landing page",
        description:
          "Create responsive landing page for campaign with optimized conversion funnel and A/B testing setup.",
        status: "review",
        priority: "high",
        assignedUsers: [teamMembers[1], teamMembers[4]],
        startDate: new Date("2024-01-05"),
        dueDate: new Date("2024-01-20"),
        progress: 90,
        tags: ["web", "development", "landing-page"],
        timeTracked: 1680, // 28 hours
        estimatedTime: 1800, // 30 hours
        comments: [],
        attachments: [],
        dependencies: [],
        subtasks: [
          {
            id: "sub-7",
            name: "Desktop layout",
            completed: true,
            assignedTo: teamMembers[1],
            createdAt: new Date("2024-01-05"),
          },
          {
            id: "sub-8",
            name: "Mobile responsive design",
            completed: true,
            assignedTo: teamMembers[1],
            createdAt: new Date("2024-01-05"),
          },
          {
            id: "sub-9",
            name: "A/B testing setup",
            completed: false,
            assignedTo: teamMembers[4],
            createdAt: new Date("2024-01-10"),
          },
        ],
        boardId: "marketing-launch",
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-18"),
        createdBy: teamMembers[1],
      },
    ],
  },
  {
    id: "development-sprint",
    name: "Development Sprint",
    description: "Sprint 12 - Platform Enhancement",
    color: "#4ECDC4",
    icon: "⚡",
    teamMembers: [teamMembers[1], teamMembers[3], teamMembers[4]],
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-16"),
    columns: [
      { id: "backlog", name: "Backlog", color: "#F5F5F5", order: 1, tasks: [] },
      { id: "in_progress", name: "In Progress", color: "#FFF3E0", order: 2, tasks: [] },
      { id: "testing", name: "Testing", color: "#E1F5FE", order: 3, tasks: [] },
      { id: "done", name: "Done", color: "#E8F5E8", order: 4, tasks: [] },
    ],
    tasks: [
      {
        id: "task-4",
        name: "User authentication system",
        description:
          "Implement secure user authentication with JWT tokens, password reset functionality, and two-factor authentication.",
        status: "in_progress",
        priority: "urgent",
        assignedUsers: [teamMembers[1]],
        startDate: new Date("2024-01-08"),
        dueDate: new Date("2024-01-22"),
        progress: 75,
        tags: ["backend", "security", "authentication"],
        timeTracked: 2280, // 38 hours
        estimatedTime: 3000, // 50 hours
        comments: [],
        attachments: [],
        dependencies: [],
        subtasks: [
          {
            id: "sub-10",
            name: "JWT implementation",
            completed: true,
            assignedTo: teamMembers[1],
            createdAt: new Date("2024-01-08"),
          },
          {
            id: "sub-11",
            name: "Password reset flow",
            completed: true,
            assignedTo: teamMembers[1],
            createdAt: new Date("2024-01-08"),
          },
          {
            id: "sub-12",
            name: "Two-factor authentication",
            completed: false,
            assignedTo: teamMembers[1],
            createdAt: new Date("2024-01-12"),
          },
        ],
        boardId: "development-sprint",
        createdAt: new Date("2024-01-08"),
        updatedAt: new Date("2024-01-18"),
        createdBy: teamMembers[1],
      },
    ],
  },
]

export const processStats: ProcessStats = {
  totalTasks: 42,
  completedTasks: 28,
  inProgressTasks: 8,
  overdueTasks: 3,
  totalProjects: 12,
  activeProjects: 8,
  teamMembers: 15,
  avgCompletionTime: 4.2,
  totalTimeTracked: 15840, // in minutes
}

export const activityLogs: ActivityLog[] = [
  {
    id: "log-1",
    taskId: "task-1",
    action: "updated",
    user: teamMembers[0],
    timestamp: new Date("2024-01-15T10:30:00"),
    details: "Updated progress to 65%",
    oldValue: 50,
    newValue: 65,
  },
  {
    id: "log-2",
    taskId: "task-1",
    action: "commented",
    user: teamMembers[0],
    timestamp: new Date("2024-01-15T10:32:00"),
    details: "Added comment with mention",
  },
  {
    id: "log-3",
    taskId: "task-3",
    action: "status_changed",
    user: teamMembers[1],
    timestamp: new Date("2024-01-18T14:20:00"),
    details: "Changed status from In Progress to Review",
    oldValue: "in_progress",
    newValue: "review",
  },
]

export const timeEntries: TimeEntry[] = [
  {
    id: "time-1",
    taskId: "task-1",
    user: teamMembers[0],
    duration: 480, // 8 hours
    description: "Working on brand guidelines document",
    date: new Date("2024-01-15"),
  },
  {
    id: "time-2",
    taskId: "task-1",
    user: teamMembers[2],
    duration: 360, // 6 hours
    description: "Designing logo usage examples",
    date: new Date("2024-01-15"),
  },
]

export const availableTags = [
  "branding",
  "design",
  "development",
  "marketing",
  "content",
  "social-media",
  "web",
  "mobile",
  "backend",
  "frontend",
  "security",
  "testing",
  "planning",
  "research",
  "analytics",
  "urgent",
  "bug-fix",
  "feature",
  "enhancement",
]

export const aiInsights = [
  {
    id: "1",
    type: "productivity",
    title: "Team Productivity Up 15%",
    description: "Your team completed 15% more tasks this week compared to last week.",
    action: "View detailed analytics",
    priority: "medium",
  },
  {
    id: "2",
    type: "deadline",
    title: "3 Tasks Due Tomorrow",
    description: "Marketing Launch project has 3 tasks due tomorrow. Consider reassigning if needed.",
    action: "Review tasks",
    priority: "high",
  },
  {
    id: "3",
    type: "optimization",
    title: "Optimize Sprint Planning",
    description: "Based on past performance, consider reducing sprint capacity by 10% for better delivery.",
    action: "Adjust sprint settings",
    priority: "low",
  },
  {
    id: "4",
    type: "collaboration",
    title: "Increase Team Communication",
    description: "Tasks with more comments are completed 23% faster. Encourage more collaboration.",
    action: "View communication tips",
    priority: "medium",
  },
]

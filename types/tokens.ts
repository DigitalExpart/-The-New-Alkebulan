export interface TokenBalance {
  current: number
  totalEarned: number
  totalSpent: number
  currencyEquivalent?: {
    amount: number
    currency: string
  }
}

export interface TokenSource {
  id: string
  name: string
  category: "learning" | "mentoring" | "projects" | "donations" | "referrals" | "content" | "community"
  tokensEarned: number
  percentage: number
  icon: string
  color: string
  description: string
}

export interface TokenTransaction {
  id: string
  date: string
  type: "earned" | "spent" | "donated" | "redeemed"
  amount: number
  source: string
  description: string
  category: string
  status: "completed" | "pending" | "failed"
  reference?: string
}

export interface TokenGrowthData {
  date: string
  tokens: number
  earned: number
  spent: number
}

export interface TokenGoal {
  id: string
  title: string
  description: string
  targetTokens: number
  currentTokens: number
  reward: string
  category: "badge" | "access" | "feature" | "milestone"
  icon: string
  isCompleted: boolean
  completedDate?: string
}

export interface TokenUse {
  id: string
  title: string
  description: string
  cost: number
  category: "education" | "mentorship" | "community" | "profile" | "access"
  icon: string
  available: boolean
  popular?: boolean
}

export interface TokenAnalytics {
  weeklyGrowth: number
  monthlyGrowth: number
  yearlyGrowth: number
  averageEarningsPerWeek: number
  topEarningSource: string
  streakDays: number
}

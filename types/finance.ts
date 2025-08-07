export interface FinanceOverview {
  walletBalance: {
    eur: number
    usd: number
    dmhTokens: number
  }
  totalInvested: number
  totalEarned: number
  pendingPayments: number
  monthlyGrowth: {
    invested: number
    earned: number
  }
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "invested" | "earned" | "withdrawn" | "spent" | "received"
  status: "completed" | "pending" | "failed"
  category: string
  reference?: string
}

export interface Investment {
  id: string
  projectTitle: string
  investedAmount: number
  currentValue: number
  returnPercentage: number
  projections: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
  status: "active" | "completed" | "pending"
  investmentDate: string
  category: string
}

export interface IncomeStream {
  id: string
  source: string
  monthlyAmount: number
  totalEarned: number
  percentage: number
  growth: number
  icon: string
}

export interface WalletConnection {
  id: string
  type: "crypto" | "bank" | "paypal"
  name: string
  address?: string
  accountNumber?: string
  isConnected: boolean
  balance?: number
  currency: string
}

export interface FinanceTip {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "investment" | "savings" | "spending" | "earning"
  actionable: boolean
}

export interface FinanceAnalytics {
  earningsOverTime: {
    month: string
    amount: number
  }[]
  incomeByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  investmentPerformance: {
    month: string
    value: number
  }[]
}

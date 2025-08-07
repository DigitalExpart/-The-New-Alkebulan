export type VerificationStatus = "verified" | "pending" | "not-started"

export interface VerificationMethod {
  id: string
  title: string
  description: string
  icon: string
  status: VerificationStatus
  lastUpdated?: string
  completedDate?: string
}

export interface UserVerification {
  userId: string
  securityScore: number
  methods: VerificationMethod[]
}

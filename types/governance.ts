export interface GovernanceStats {
  activeProposals: number
  approvedProposals: number
  votesThisMonth: number
  voterParticipationRate: number
  totalMembers: number
  averageVotingTime: string
}

export interface Proposal {
  id: string
  title: string
  description: string
  fullDescription: string
  type: "policy" | "funding" | "feature" | "rule-change" | "upgrade"
  creator: {
    id: string
    name: string
    avatar: string
    verified: boolean
    reputation: number
  }
  status: "active" | "passed" | "failed" | "pending"
  createdAt: string
  votingStartsAt: string
  votingEndsAt: string
  quorumRequired: number
  votes: {
    yes: number
    no: number
    abstain: number
    total: number
  }
  tags: string[]
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  discussion?: {
    id: string
    author: string
    content: string
    timestamp: string
  }[]
}

export interface CreateProposalData {
  title: string
  type: "policy" | "funding" | "feature" | "rule-change" | "upgrade"
  description: string
  fullDescription: string
  votingDuration: number
  quorumRequired: number
  attachments?: File[]
}

export interface VoteData {
  proposalId: string
  choice: "yes" | "no" | "abstain"
  reasoning?: string
  timestamp: string
  voterAddress: string
}

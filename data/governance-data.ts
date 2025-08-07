import type { GovernanceStats, Proposal } from "@/types/governance"

export const governanceStats: GovernanceStats = {
  activeProposals: 8,
  approvedProposals: 142,
  votesThisMonth: 1247,
  voterParticipationRate: 73.2,
  totalMembers: 15420,
  averageVotingTime: "4.2 days",
}

export const mockProposals: Proposal[] = [
  {
    id: "prop-001",
    title: "Implement Community Mentorship Program",
    description:
      "Establish a structured mentorship program connecting experienced diaspora entrepreneurs with newcomers seeking guidance in business development and cultural integration.",
    fullDescription: `## Overview
This proposal aims to create a comprehensive mentorship program that will connect experienced diaspora entrepreneurs and professionals with community members who are just starting their journey.

## Implementation Plan
1. **Mentor Application Process**: Establish criteria for mentor eligibility including experience, community standing, and availability
2. **Matching Algorithm**: Develop a system to match mentors and mentees based on industry, location, and specific needs
3. **Program Structure**: Create a 6-month program with monthly check-ins and quarterly reviews
4. **Resource Development**: Provide mentors with training materials and best practices

## Budget Requirements
- Platform development: $15,000
- Training materials: $5,000
- Program coordination: $10,000/year
- Total: $30,000 initial investment

## Expected Outcomes
- 200+ mentor-mentee pairs in first year
- 85% completion rate
- Increased business success rates among participants
- Stronger community bonds and knowledge transfer`,
    type: "feature",
    creator: {
      id: "user-001",
      name: "Amara Okafor",
      avatar: "/placeholder.svg?height=40&width=40&text=AO",
      verified: true,
      reputation: 95,
    },
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    votingStartsAt: "2024-01-16T00:00:00Z",
    votingEndsAt: "2024-01-23T23:59:59Z",
    quorumRequired: 500,
    votes: {
      yes: 342,
      no: 28,
      abstain: 15,
      total: 385,
    },
    tags: ["mentorship", "community", "business", "education"],
  },
  {
    id: "prop-002",
    title: "Allocate $50K for Small Business Grants",
    description:
      "Establish a grant program to provide micro-funding for diaspora-owned small businesses, with focus on women entrepreneurs and sustainable ventures.",
    fullDescription: `## Grant Program Overview
This proposal requests allocation of $50,000 from community treasury to establish a small business grant program specifically designed for diaspora entrepreneurs.

## Eligibility Criteria
- Must be verified community member for 6+ months
- Business must serve diaspora community or promote cultural exchange
- Priority given to women entrepreneurs and sustainable businesses
- Maximum grant amount: $2,500 per business

## Selection Process
1. Application review by community committee
2. Public presentation of top candidates
3. Community voting on final recipients
4. Quarterly reporting requirements for grant recipients

## Impact Metrics
- Number of businesses funded
- Job creation within community
- Revenue growth of funded businesses
- Community engagement and cultural preservation`,
    type: "funding",
    creator: {
      id: "user-002",
      name: "Kwame Asante",
      avatar: "/placeholder.svg?height=40&width=40&text=KA",
      verified: true,
      reputation: 88,
    },
    status: "active",
    createdAt: "2024-01-14T14:30:00Z",
    votingStartsAt: "2024-01-15T00:00:00Z",
    votingEndsAt: "2024-01-22T23:59:59Z",
    quorumRequired: 750,
    votes: {
      yes: 456,
      no: 89,
      abstain: 23,
      total: 568,
    },
    tags: ["funding", "grants", "small-business", "women-entrepreneurs"],
  },
  {
    id: "prop-003",
    title: "Update Community Guidelines for AI Content",
    description:
      "Revise community guidelines to address the use of AI-generated content, ensuring transparency while encouraging innovation in content creation.",
    fullDescription: `## Background
With the rapid advancement of AI technology, our community needs clear guidelines on the use of AI-generated content to maintain authenticity while embracing innovation.

## Proposed Changes
1. **Disclosure Requirements**: All AI-generated or AI-assisted content must be clearly labeled
2. **Quality Standards**: AI content must meet the same quality and accuracy standards as human-created content
3. **Attribution Rules**: Proper attribution for AI tools and training data sources
4. **Prohibited Uses**: Ban on AI content that impersonates real individuals or spreads misinformation

## Implementation Timeline
- Week 1-2: Community feedback and refinement
- Week 3: Final guideline publication
- Week 4: Education campaign and tool rollout
- Ongoing: Monitoring and enforcement

## Enforcement Mechanism
- Community reporting system
- Automated detection tools where possible
- Graduated response system (warning → temporary restriction → permanent ban)`,
    type: "policy",
    creator: {
      id: "user-003",
      name: "Fatima Al-Rashid",
      avatar: "/placeholder.svg?height=40&width=40&text=FR",
      verified: true,
      reputation: 92,
    },
    status: "active",
    createdAt: "2024-01-13T09:15:00Z",
    votingStartsAt: "2024-01-14T00:00:00Z",
    votingEndsAt: "2024-01-21T23:59:59Z",
    quorumRequired: 400,
    votes: {
      yes: 298,
      no: 156,
      abstain: 67,
      total: 521,
    },
    tags: ["policy", "ai", "content-guidelines", "transparency"],
  },
  {
    id: "prop-004",
    title: "Integrate Blockchain Identity Verification",
    description:
      "Implement blockchain-based identity verification system to enhance security, reduce fraud, and enable true decentralized governance participation.",
    fullDescription: `## Technical Overview
This proposal outlines the integration of a blockchain-based identity verification system that will enhance platform security while maintaining user privacy.

## Key Features
1. **Self-Sovereign Identity**: Users control their own identity data
2. **Zero-Knowledge Proofs**: Verify identity without exposing personal information
3. **Multi-Chain Support**: Compatible with Ethereum, Polygon, and other major chains
4. **Reputation Staking**: Users can stake tokens to build reputation and voting power

## Implementation Phases
**Phase 1** (Months 1-2): Core infrastructure development
**Phase 2** (Months 3-4): Integration with existing systems
**Phase 3** (Months 5-6): User migration and testing
**Phase 4** (Month 7): Full deployment and governance integration

## Benefits
- Enhanced security and fraud prevention
- True decentralized governance participation
- Improved trust and reputation systems
- Compliance with emerging digital identity standards

## Risks and Mitigation
- Technical complexity: Phased rollout with extensive testing
- User adoption: Comprehensive education and incentive programs
- Regulatory compliance: Legal review and adaptive implementation`,
    type: "upgrade",
    creator: {
      id: "user-004",
      name: "Chen Wei",
      avatar: "/placeholder.svg?height=40&width=40&text=CW",
      verified: true,
      reputation: 96,
    },
    status: "active",
    createdAt: "2024-01-12T16:45:00Z",
    votingStartsAt: "2024-01-13T00:00:00Z",
    votingEndsAt: "2024-01-27T23:59:59Z",
    quorumRequired: 1000,
    votes: {
      yes: 234,
      no: 178,
      abstain: 45,
      total: 457,
    },
    tags: ["blockchain", "identity", "security", "web3", "upgrade"],
  },
]

export const pastProposals: Proposal[] = [
  {
    id: "prop-past-001",
    title: "Launch Community Marketplace",
    description:
      "Create a dedicated marketplace for diaspora businesses to sell products and services within the community.",
    fullDescription: "Full implementation details for the community marketplace...",
    type: "feature",
    creator: {
      id: "user-005",
      name: "Maria Santos",
      avatar: "/placeholder.svg?height=40&width=40&text=MS",
      verified: true,
      reputation: 89,
    },
    status: "passed",
    createdAt: "2023-12-01T10:00:00Z",
    votingStartsAt: "2023-12-02T00:00:00Z",
    votingEndsAt: "2023-12-09T23:59:59Z",
    quorumRequired: 600,
    votes: {
      yes: 742,
      no: 156,
      abstain: 89,
      total: 987,
    },
    tags: ["marketplace", "business", "community"],
  },
  {
    id: "prop-past-002",
    title: "Establish Community Treasury",
    description:
      "Create a community-controlled treasury funded by platform fees to support community initiatives and development.",
    fullDescription: "Detailed treasury management and governance structure...",
    type: "funding",
    creator: {
      id: "user-006",
      name: "David Okonkwo",
      avatar: "/placeholder.svg?height=40&width=40&text=DO",
      verified: true,
      reputation: 94,
    },
    status: "passed",
    createdAt: "2023-11-15T14:30:00Z",
    votingStartsAt: "2023-11-16T00:00:00Z",
    votingEndsAt: "2023-11-23T23:59:59Z",
    quorumRequired: 800,
    votes: {
      yes: 1234,
      no: 234,
      abstain: 156,
      total: 1624,
    },
    tags: ["treasury", "funding", "governance"],
  },
  {
    id: "prop-past-003",
    title: "Implement Multi-Language Support",
    description:
      "Add support for 15 additional languages to make the platform accessible to more diaspora communities worldwide.",
    fullDescription: "Technical implementation plan for multi-language support...",
    type: "feature",
    creator: {
      id: "user-007",
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40&text=PS",
      verified: true,
      reputation: 91,
    },
    status: "failed",
    createdAt: "2023-10-20T11:15:00Z",
    votingStartsAt: "2023-10-21T00:00:00Z",
    votingEndsAt: "2023-10-28T23:59:59Z",
    quorumRequired: 500,
    votes: {
      yes: 234,
      no: 456,
      abstain: 78,
      total: 768,
    },
    tags: ["localization", "accessibility", "feature"],
  },
]

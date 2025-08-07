"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GovernanceOverview } from "@/components/governance/governance-overview"
import { ProposalsFeed } from "@/components/governance/proposals-feed"
import { governanceStats, mockProposals } from "@/data/governance-data"

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-[#142b20]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Governance Proposals</h1>
          <p className="text-gray-300">
            Participate in community decision-making by viewing, discussing, and voting on proposals.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a3326] border-gray-600">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="proposals"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-white"
            >
              All Proposals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <GovernanceOverview stats={governanceStats} />
          </TabsContent>

          <TabsContent value="proposals">
            <ProposalsFeed
              proposals={mockProposals}
              onViewDetails={(proposal) => console.log("View details:", proposal)}
              onVote={(proposalId) => console.log("Vote on:", proposalId)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

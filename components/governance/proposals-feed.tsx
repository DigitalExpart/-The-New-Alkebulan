"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import { ProposalCard } from "./proposal-card"
import type { Proposal } from "@/types/governance"

interface ProposalsFeedProps {
  proposals: Proposal[]
  onViewDetails: (proposal: Proposal) => void
  onVote?: (proposalId: string) => void
  onCreateProposal?: () => void
  showCreateButton?: boolean
}

export function ProposalsFeed({
  proposals,
  onViewDetails,
  onVote,
  onCreateProposal,
  showCreateButton = true,
}: ProposalsFeedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || proposal.status === selectedStatus
    const matchesType = selectedType === "all" || proposal.type === selectedType

    return matchesSearch && matchesStatus && matchesType
  })

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "passed", label: "Passed" },
    { value: "failed", label: "Failed" },
  ]

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "feature", label: "Feature" },
    { value: "funding", label: "Funding" },
    { value: "policy", label: "Policy" },
    { value: "upgrade", label: "Upgrade" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Proposals</h2>
          <p className="text-gray-300">
            {filteredProposals.length} of {proposals.length} proposals
          </p>
        </div>
        {showCreateButton && onCreateProposal && (
          <Button onClick={onCreateProposal} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-[#1a3326] border-gray-600">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#142b20] border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedStatus === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(option.value)}
                  className={
                    selectedStatus === option.value
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "border-gray-600 text-white hover:bg-[#1a3326]"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {typeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedType === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(option.value)}
                  className={
                    selectedType === option.value
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "border-gray-600 text-white hover:bg-[#1a3326]"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} onViewDetails={onViewDetails} onVote={onVote} />
          ))
        ) : (
          <Card className="bg-[#1a3326] border-gray-600">
            <CardContent className="text-center py-8">
              <p className="text-gray-300">No proposals found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedStatus("all")
                  setSelectedType("all")
                }}
                variant="outline"
                className="mt-4 border-gray-600 text-white hover:bg-[#1a3326]"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

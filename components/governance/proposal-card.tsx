"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Vote, Eye, CheckCircle, XCircle, Minus } from "lucide-react"
import type { Proposal } from "@/types/governance"

interface ProposalCardProps {
  proposal: Proposal
  onViewDetails: (proposal: Proposal) => void
  onVote?: (proposalId: string) => void
}

export function ProposalCard({ proposal, onViewDetails, onVote }: ProposalCardProps) {
  const totalVotes = proposal.votes.total
  const yesPercentage = totalVotes > 0 ? (proposal.votes.yes / totalVotes) * 100 : 0
  const noPercentage = totalVotes > 0 ? (proposal.votes.no / totalVotes) * 100 : 0

  const isActive = proposal.status === "active"
  const timeRemaining = isActive ? new Date(proposal.votingEndsAt).getTime() - Date.now() : 0
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow-500 text-black"
      case "passed":
        return "bg-green-600 text-white"
      case "failed":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-blue-600 text-white"
      case "funding":
        return "bg-green-600 text-white"
      case "policy":
        return "bg-purple-600 text-white"
      case "upgrade":
        return "bg-orange-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  return (
    <Card className="bg-[#1a3326] border-gray-600 hover:border-yellow-500 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={getTypeColor(proposal.type)}>
                {proposal.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-2 text-white">{proposal.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-gray-300">{proposal.description}</CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={proposal.creator.avatar || "/placeholder.svg"} alt={proposal.creator.name} />
            <AvatarFallback className="bg-yellow-500 text-black">
              {proposal.creator.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-white">{proposal.creator.name}</span>
              {proposal.creator.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
            </div>
            <div className="text-xs text-gray-400">Reputation: {proposal.creator.reputation}/100</div>
          </div>
          {isActive && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                {daysRemaining > 0 ? `${daysRemaining} days left` : "Ending soon"}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Voting Results */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-300">
              <Vote className="h-4 w-4" />
              Total Votes: {totalVotes.toLocaleString()}
            </span>
            <span className="text-gray-400">Quorum: {proposal.quorumRequired.toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-300">Yes ({proposal.votes.yes.toLocaleString()})</span>
              </div>
              <span className="font-medium text-white">{yesPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={yesPercentage} className="h-2 bg-gray-700" />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-gray-300">No ({proposal.votes.no.toLocaleString()})</span>
              </div>
              <span className="font-medium text-white">{noPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={noPercentage} className="h-2 bg-gray-700" />

            {proposal.votes.abstain > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-300">Abstain ({proposal.votes.abstain.toLocaleString()})</span>
                  </div>
                  <span className="font-medium text-white">
                    {((proposal.votes.abstain / totalVotes) * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {proposal.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(proposal)}
            className="flex-1 border-gray-600 text-white hover:bg-[#1a3326]"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {isActive && onVote && (
            <Button
              size="sm"
              onClick={() => onVote(proposal.id)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Vote className="h-4 w-4 mr-1" />
              Vote Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

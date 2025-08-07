"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Minus, Clock, Vote, FileText, Calendar } from "lucide-react"
import type { Proposal } from "@/types/governance"

interface ProposalDetailModalProps {
  proposal: Proposal | null
  isOpen: boolean
  onClose: () => void
  onVote: (proposalId: string, choice: "yes" | "no" | "abstain", reasoning?: string) => void
}

export function ProposalDetailModal({ proposal, isOpen, onClose, onVote }: ProposalDetailModalProps) {
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | "abstain" | null>(null)
  const [reasoning, setReasoning] = useState("")
  const [hasVoted, setHasVoted] = useState(false)

  if (!proposal) return null

  const totalVotes = proposal.votes.total
  const yesPercentage = totalVotes > 0 ? (proposal.votes.yes / totalVotes) * 100 : 0
  const noPercentage = totalVotes > 0 ? (proposal.votes.no / totalVotes) * 100 : 0
  const abstainPercentage = totalVotes > 0 ? (proposal.votes.abstain / totalVotes) * 100 : 0

  const isActive = proposal.status === "active"
  const timeRemaining = isActive ? new Date(proposal.votingEndsAt).getTime() - Date.now() : 0
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))

  const handleVote = () => {
    if (selectedVote && proposal) {
      onVote(proposal.id, selectedVote, reasoning)
      setHasVoted(true)
      setSelectedVote(null)
      setReasoning("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "funding":
        return "bg-yellow-100 text-yellow-800"
      case "feature":
        return "bg-blue-100 text-blue-800"
      case "policy":
        return "bg-purple-100 text-purple-800"
      case "rule-change":
        return "bg-orange-100 text-orange-800"
      case "upgrade":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
              <DialogTitle className="text-xl mb-2">{proposal.title}</DialogTitle>
              <DialogDescription className="text-base">{proposal.description}</DialogDescription>
            </div>
          </div>

          {/* Creator and Timeline */}
          <div className="flex items-center justify-between mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={proposal.creator.avatar || "/placeholder.svg"} alt={proposal.creator.name} />
                <AvatarFallback>
                  {proposal.creator.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{proposal.creator.name}</span>
                  {proposal.creator.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="text-sm text-muted-foreground">Reputation: {proposal.creator.reputation}/100</div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Created: {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
              {isActive && (
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Ending soon"}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Full Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Full Proposal
            </h3>
            <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg">
              <div className="whitespace-pre-wrap">{proposal.fullDescription}</div>
            </div>
          </div>

          {/* Voting Results */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Voting Results
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Total Votes: {totalVotes.toLocaleString()}</span>
                <span className="text-muted-foreground">
                  Quorum Required: {proposal.quorumRequired.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Yes</span>
                    </div>
                    <span className="font-medium">
                      {proposal.votes.yes.toLocaleString()} ({yesPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={yesPercentage} className="h-3" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>No</span>
                    </div>
                    <span className="font-medium">
                      {proposal.votes.no.toLocaleString()} ({noPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={noPercentage} className="h-3" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-gray-600" />
                      <span>Abstain</span>
                    </div>
                    <span className="font-medium">
                      {proposal.votes.abstain.toLocaleString()} ({abstainPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={abstainPercentage} className="h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Voting Interface */}
          {isActive && !hasVoted && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Cast Your Vote</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={selectedVote === "yes" ? "default" : "outline"}
                    onClick={() => setSelectedVote("yes")}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Yes
                  </Button>
                  <Button
                    variant={selectedVote === "no" ? "default" : "outline"}
                    onClick={() => setSelectedVote("no")}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    No
                  </Button>
                  <Button
                    variant={selectedVote === "abstain" ? "default" : "outline"}
                    onClick={() => setSelectedVote("abstain")}
                    className="flex items-center gap-2"
                  >
                    <Minus className="h-4 w-4" />
                    Abstain
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Reasoning (Optional)</label>
                  <Textarea
                    placeholder="Explain your vote to help the community understand your perspective..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleVote} disabled={!selectedVote} className="w-full">
                  Submit Vote
                </Button>
              </div>
            </div>
          )}

          {hasVoted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Vote submitted successfully!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Thank you for participating in community governance.</p>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {proposal.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

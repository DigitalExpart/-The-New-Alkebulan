import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Vote, TrendingUp, Clock, Plus } from "lucide-react"
import type { GovernanceStats } from "@/types/governance"

interface GovernanceOverviewProps {
  stats: GovernanceStats
}

export function GovernanceOverview({ stats }: GovernanceOverviewProps) {
  const statCards = [
    {
      title: "Active Proposals",
      value: stats.activeProposals,
      icon: Vote,
      description: "Currently open for voting",
    },
    {
      title: "Approved Proposals",
      value: stats.approvedProposals,
      icon: TrendingUp,
      description: "Successfully implemented",
    },
    {
      title: "Votes This Month",
      value: stats.votesThisMonth.toLocaleString(),
      icon: Users,
      description: "Community participation",
    },
    {
      title: "Avg. Voting Time",
      value: stats.averageVotingTime,
      icon: Clock,
      description: "Time to reach consensus",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-[#1a3326] border-gray-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Participation */}
      <Card className="bg-[#1a3326] border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Community Participation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Voter Participation Rate</span>
            <Badge variant="secondary" className="bg-yellow-500 text-black">
              {stats.voterParticipationRate}%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Total Community Members</span>
            <span className="text-white font-semibold">{stats.totalMembers.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.voterParticipationRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-[#1a3326] border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-[#1a3326] bg-transparent">
              View All Proposals
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-[#1a3326] bg-transparent">
              Voting History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

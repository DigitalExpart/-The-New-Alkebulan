"use client"

import type { FriendStats } from "@/types/friends"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Wifi, Link2, UserPlus } from "lucide-react"

interface FriendsStatsProps {
  stats: FriendStats
}

export function FriendsStats({ stats }: FriendsStatsProps) {
  const statItems = [
    {
      label: "Total Friends",
      value: stats.totalFriends,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Online Now",
      value: stats.onlineFriends,
      icon: Wifi,
      color: "text-green-600",
    },
    {
      label: "Mutual Connections",
      value: stats.mutualConnections,
      icon: Link2,
      color: "text-purple-600",
    },
    {
      label: "Recently Added",
      value: stats.recentlyAdded,
      icon: UserPlus,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

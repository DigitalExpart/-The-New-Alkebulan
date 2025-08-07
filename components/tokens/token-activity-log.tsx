"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpRight, ArrowDownRight, Heart, Gift } from "lucide-react"
import type { TokenTransaction } from "@/types/tokens"

interface TokenActivityLogProps {
  transactions: TokenTransaction[]
}

export function TokenActivityLog({ transactions }: TokenActivityLogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showAll, setShowAll] = useState(false)

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || transaction.type === filterType
    return matchesSearch && matchesFilter
  })

  const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "spent":
      case "redeemed":
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />
      case "donated":
        return <Heart className="h-4 w-4 text-red-600" />
      default:
        return <Gift className="h-4 w-4 text-purple-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
        return "text-green-600"
      case "spent":
      case "redeemed":
        return "text-blue-600"
      case "donated":
        return "text-red-600"
      default:
        return "text-purple-600"
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "earned":
        return "default"
      case "spent":
      case "redeemed":
        return "secondary"
      case "donated":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            Activity Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="spent">Spent</SelectItem>
                <SelectItem value="donated">Donated</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-4 block">🔍</span>
              <p>No transactions found matching your criteria.</p>
            </div>
          ) : (
            displayedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">{getTransactionIcon(transaction.type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{transaction.source}</h4>
                      <Badge variant={getBadgeVariant(transaction.type)} className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString()}
                  </div>
                  <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredTransactions.length > 5 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All ${filteredTransactions.length} Transactions`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

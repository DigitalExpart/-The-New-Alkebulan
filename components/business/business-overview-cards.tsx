"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Euro, ShoppingBag, Package, Star, Eye, ArrowRight } from "lucide-react"
import type { BusinessMetrics } from "@/types/business"

interface BusinessOverviewCardsProps {
  metrics: BusinessMetrics
}

export function BusinessOverviewCards({ metrics }: BusinessOverviewCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `€${(metrics.totalRevenue ?? 0).toLocaleString()}`,
      change: metrics.revenueChange ?? 0,
      icon: Euro,
      link: "/dashboard/finance",
      period: "This Month",
    },
    {
      title: "Orders & Bookings",
      value: (metrics.orders ?? 0).toLocaleString(),
      change: metrics.ordersChange ?? 0,
      icon: ShoppingBag,
      link: "/business/orders",
      period: "This Month",
    },
    {
      title: "Active Products",
      value: String(metrics.activeProducts ?? 0),
      change: metrics.productsChange ?? 0,
      icon: Package,
      link: "/business/products",
      period: "Live Now",
    },
    {
      title: "Customer Rating",
      value: (metrics.customerRating ?? 0).toFixed(1),
      change: metrics.ratingChange ?? 0,
      icon: Star,
      link: "/business/reviews",
      period: "Average",
    },
    {
      title: "Profile Visits",
      value: (metrics.visits ?? 0).toLocaleString(),
      change: metrics.visitsChange ?? 0,
      icon: Eye,
      link: "/business/analytics",
      period: "Last 7 Days",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.period}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  {card.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${card.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {card.change > 0 ? "+" : ""}
                    {card.change}%
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 mt-1">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

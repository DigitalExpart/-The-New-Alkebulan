"use client"

import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Traffic, sales, engagement (placeholder)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Daily Active Users", "Orders Today", "Revenue Today"].map((k) => (
              <Card key={k}>
                <CardHeader>
                  <CardTitle className="text-base">{k}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-16 flex items-center text-3xl font-bold">—</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}



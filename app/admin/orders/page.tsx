"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Package } from "lucide-react"

interface OrderLite { id: string; status?: string | null; total?: number | null }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderLite[]>([])

  const load = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from("orders")
        .select("id, status, total")
        .limit(20)
      setOrders(data || [])
    } catch {
      setOrders([])
    }
  }

  useEffect(() => { load() }, [])

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="text-muted-foreground">Review recent orders (placeholder)</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <CardTitle className="text-base">Order {o.id.slice(0, 8)}...</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary">{o.status || "unknown"}</Badge>
                  <span className="text-sm">${o.total ?? 0}</span>
                </CardContent>
              </Card>
            ))}
            {orders.length === 0 && (
              <p className="text-muted-foreground">No orders found or table missing.</p>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}



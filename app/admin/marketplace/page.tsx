"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, Package, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ItemLite { id: string; name?: string | null; status?: string | null }

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<ItemLite[]>([])

  const load = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from("marketplace_items")
        .select("id, name, status")
        .limit(20)
      setItems(data || [])
    } catch {
      setItems([])
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
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Marketplace Oversight</h1>
                <p className="text-muted-foreground">Review products and statuses</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          {items.length === 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>No items found or table missing — placeholder view.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <Card key={it.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="w-4 h-4" /> {it.name || "Unnamed Item"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary">{it.status || "unknown"}</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="destructive">Remove</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}



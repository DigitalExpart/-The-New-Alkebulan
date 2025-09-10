"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, Package, AlertCircle, Trash2, EyeOff, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ItemLite { id: string; name: string; status: string; price?: number | null }

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<ItemLite[]>([])
  const [error, setError] = useState<string | null>(null)

  const tryLoad = async (table: string, select: string) => {
    const res = await supabase!.from(table).select(select).limit(50)
    return res
  }

  const load = async () => {
    if (!supabase) return
    setError(null)
    try {
      // Prefer canonical products table
      let data: any[] | null = null
      let err: any = null

      let r = await tryLoad('products', 'id, name, status, sales_price, actual_price')
      if (!r.error && r.data) {
        data = r.data
      } else {
        err = r.error
      }

      if (!data || data.length === 0) {
        // Fallback to marketplace_items if project uses that
        const r2 = await tryLoad('marketplace_items', 'id, name, status, price')
        if (!r2.error && r2.data) {
          data = r2.data
        } else {
          err = err || r2.error
        }
      }

      if (!data || data.length === 0) {
        setItems([])
        if (err) setError(err.message)
        return
      }

      const mapped: ItemLite[] = data.map((row: any) => ({
        id: String(row.id),
        name: row.title || row.name || 'Unnamed Item',
        status: row.status || 'unknown',
        price: row.price ?? row.sales_price ?? row.actual_price ?? null,
      }))
      setItems(mapped)
    } catch (e: any) {
      setError(e?.message || 'Failed to load items')
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
              <span>{error ? `No items loaded: ${error}` : 'No products found. Add products to see them here.'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <Card key={it.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="w-4 h-4" /> {it.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{it.status}</Badge>
                    {it.price != null && <span className="text-xs text-muted-foreground">${it.price}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      // Approve -> set status to approved on either table
                      const up1 = await supabase!.from('products').update({ status: 'approved' }).eq('id', it.id)
                      const up2 = await supabase!.from('marketplace_items').update({ status: 'approved' }).eq('id', it.id)
                      if (up1.error && up2.error) {
                        console.error(up1.error || up2.error)
                      }
                      load()
                    }}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      const up1 = await supabase!.from('products').update({ status: 'rejected' }).eq('id', it.id)
                      const up2 = await supabase!.from('marketplace_items').update({ status: 'rejected' }).eq('id', it.id)
                      if (up1.error && up2.error) {
                        console.error(up1.error || up2.error)
                      }
                      load()
                    }}>Reject</Button>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      // Try both products and marketplace_items
                      const del1 = await supabase!.from('products').delete().eq('id', it.id)
                      const del2 = await supabase!.from('marketplace_items').delete().eq('id', it.id)
                      if (del1.error && del2.error) {
                        console.error(del1.error || del2.error)
                      }
                      load()
                    }}><Trash2 className="w-4 h-4" /></Button>
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



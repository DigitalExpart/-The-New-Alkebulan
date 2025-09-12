"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, Package, AlertCircle, Trash2, EyeOff, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ItemLite { id: string; name: string; status: string; price?: number | null }

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<ItemLite[]>([])
  const [error, setError] = useState<string | null>(null)

  const tryLoad = async (table: string, select: string) => {
    const res = await supabase!.from(table).select(select).limit(100) // Increase limit to see all products
    return res
  }

  const load = async () => {
    if (!supabase) return
    setError(null)
    try {
      // Prefer canonical products table
      let data: any[] | null = null
      let err: any = null

      let r = await tryLoad('products', 'id, name, status, sales_price, actual_price, created_at')
      if (!r.error && r.data) {
        data = r.data
        console.log('📦 Products loaded from products table:', data.length)
      } else {
        err = r.error
        console.log('❌ Error loading from products table:', err)
      }

      if (!data || data.length === 0) {
        // Fallback to marketplace_items if project uses that
        const r2 = await tryLoad('marketplace_items', 'id, name, status, price, created_at')
        if (!r2.error && r2.data) {
          data = r2.data
          console.log('📦 Products loaded from marketplace_items table:', data.length)
        } else {
          err = err || r2.error
          console.log('❌ Error loading from marketplace_items table:', r2.error)
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
        status: row.status || row.approval_status || 'active', // Handle different status column names
        price: row.price ?? row.sales_price ?? row.actual_price ?? null,
      }))
      
      console.log('📋 Mapped products for admin view:', mapped.length)
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
                      try {
                        // Approve -> set status to 'active' to make it live on website
                        const { data: productUpdate, error: productError } = await supabase!
                          .from('products')
                          .update({ status: 'active' })
                          .eq('id', it.id)
                          .select()

                        const { data: marketplaceUpdate, error: marketplaceError } = await supabase!
                          .from('marketplace_items')
                          .update({ status: 'active' })
                          .eq('id', it.id)
                          .select()

                        // If at least one update succeeded
                        if (productUpdate || marketplaceUpdate) {
                          console.log('✅ Product approved and made live:', it.name)
                          toast.success(`${it.name} is now live on the marketplace!`)
                          
                          // Log admin action
                          await supabase!.from('admin_actions').insert({
                            action_type: 'product_approve',
                            target_resource_type: 'product',
                            target_resource_id: it.id,
                            action_details: { product_name: it.name, new_status: 'active' }
                          })
                        } else {
                          console.error('Failed to approve product:', productError || marketplaceError)
                          toast.error('Failed to approve product')
                        }
                        
                        load() // Refresh the list
                      } catch (error) {
                        console.error('Error approving product:', error)
                        toast.error('Failed to approve product')
                      }
                    }}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        // Reject -> set status to 'rejected' to remove from website
                        const { data: productUpdate, error: productError } = await supabase!
                          .from('products')
                          .update({ status: 'rejected' })
                          .eq('id', it.id)
                          .select()

                        const { data: marketplaceUpdate, error: marketplaceError } = await supabase!
                          .from('marketplace_items')
                          .update({ status: 'rejected' })
                          .eq('id', it.id)
                          .select()

                        // If at least one update succeeded
                        if (productUpdate || marketplaceUpdate) {
                          console.log('❌ Product rejected and removed from website:', it.name)
                          toast.success(`${it.name} has been rejected and removed from marketplace`)
                          
                          // Log admin action
                          await supabase!.from('admin_actions').insert({
                            action_type: 'product_reject',
                            target_resource_type: 'product',
                            target_resource_id: it.id,
                            action_details: { product_name: it.name, new_status: 'rejected' }
                          })
                        } else {
                          console.error('Failed to reject product:', productError || marketplaceError)
                          toast.error('Failed to reject product')
                        }
                        
                        load() // Refresh the list
                      } catch (error) {
                        console.error('Error rejecting product:', error)
                        toast.error('Failed to reject product')
                      }
                    }}>Reject</Button>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      try {
                        if (!confirm(`Are you sure you want to delete "${it.name}"? This action cannot be undone.`)) {
                          return
                        }

                        // Try both products and marketplace_items
                        const { data: productDelete, error: productError } = await supabase!
                          .from('products')
                          .delete()
                          .eq('id', it.id)
                          .select()

                        const { data: marketplaceDelete, error: marketplaceError } = await supabase!
                          .from('marketplace_items')
                          .delete()
                          .eq('id', it.id)
                          .select()

                        // If at least one delete succeeded
                        if (productDelete || marketplaceDelete) {
                          console.log('🗑️ Product deleted:', it.name)
                          toast.success(`${it.name} has been permanently deleted`)
                          
                          // Log admin action
                          await supabase!.from('admin_actions').insert({
                            action_type: 'product_delete',
                            target_resource_type: 'product',
                            target_resource_id: it.id,
                            action_details: { product_name: it.name, action: 'permanent_delete' }
                          })
                        } else {
                          console.error('Failed to delete product:', productError || marketplaceError)
                          toast.error('Failed to delete product')
                        }
                        
                        load() // Refresh the list
                      } catch (error) {
                        console.error('Error deleting product:', error)
                        toast.error('Failed to delete product')
                      }
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



"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  ShoppingCart,
  CreditCard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Product {
  id: string
  name: string
  description?: string
  status: string
  sales_price?: number
  seller_name: string
  seller_email: string
  created_at: string
  moderation_status?: string
}

interface Transaction {
  id: string
  transaction_id: string
  user_email: string
  amount: number
  currency: string
  status: string
  transaction_type: string
  flagged: boolean
  created_at: string
}

interface SellerVerification {
  id: string
  user_email: string
  verification_status: string
  business_documents: any
  submitted_at: string
  verified_at?: string
}

export default function AdminCommercePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [verifications, setVerifications] = useState<SellerVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("products")

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          status,
          sales_price,
          user_id,
          created_at,
          profiles!products_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (productsError) {
        console.error('Error fetching products:', productsError)
        return
      }

      const mappedProducts: Product[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        status: product.status || 'active',
        sales_price: product.sales_price,
        seller_name: product.profiles ? `${product.profiles.first_name} ${product.profiles.last_name}` : 'Unknown',
        seller_email: product.profiles?.email || 'Unknown',
        created_at: product.created_at,
        moderation_status: 'approved' // Will be enhanced with actual moderation data
      }))

      setProducts(mappedProducts)
    } catch (error) {
      console.error('Error in fetchProducts:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transaction_monitoring')
        .select(`
          id,
          transaction_id,
          amount,
          currency,
          status,
          transaction_type,
          flagged,
          created_at,
          profiles!transaction_monitoring_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
        return
      }

      const mappedTransactions: Transaction[] = (transactionsData || []).map(transaction => ({
        id: transaction.id,
        transaction_id: transaction.transaction_id,
        user_email: transaction.profiles?.email || 'Unknown',
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        transaction_type: transaction.transaction_type,
        flagged: transaction.flagged,
        created_at: transaction.created_at
      }))

      setTransactions(mappedTransactions)
    } catch (error) {
      console.error('Error in fetchTransactions:', error)
    }
  }

  const fetchVerifications = async () => {
    try {
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('seller_verification')
        .select(`
          id,
          verification_status,
          business_documents,
          submitted_at,
          verified_at,
          profiles!seller_verification_user_id_fkey(email)
        `)
        .order('submitted_at', { ascending: false })

      if (verificationsError) {
        console.error('Error fetching verifications:', verificationsError)
        return
      }

      const mappedVerifications: SellerVerification[] = (verificationsData || []).map(verification => ({
        id: verification.id,
        user_email: verification.profiles?.email || 'Unknown',
        verification_status: verification.verification_status,
        business_documents: verification.business_documents,
        submitted_at: verification.submitted_at,
        verified_at: verification.verified_at
      }))

      setVerifications(mappedVerifications)
    } catch (error) {
      console.error('Error in fetchVerifications:', error)
    }
  }

  const handleProductAction = async (productId: string, action: string) => {
    try {
      let updateData: any = {}
      
      switch (action) {
        case 'approve':
          updateData = { status: 'active' }
          break
        case 'reject':
          updateData = { status: 'rejected' }
          break
        case 'flag':
          updateData = { status: 'flagged' }
          break
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)

      if (error) {
        console.error('Error updating product:', error)
        toast.error('Failed to update product')
        return
      }

      toast.success('Product updated successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error in handleProductAction:', error)
      toast.error('Failed to update product')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchTransactions()
    fetchVerifications()
    setLoading(false)
  }, [])

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
                <h1 className="text-2xl font-bold">Commerce Management</h1>
                <p className="text-muted-foreground">Manage products, transactions, and sellers</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { fetchProducts(); fetchTransactions(); fetchVerifications(); }}>
              Refresh
            </Button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
              <TabsTrigger value="sellers">Seller Verification ({verifications.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Moderation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            By {product.seller_name} ({product.seller_email})
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${product.sales_price} • {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleProductAction(product.id, 'approve')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleProductAction(product.id, 'reject')}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No products to moderate
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{transaction.transaction_id}</span>
                            <Badge variant={transaction.flagged ? 'destructive' : 'default'}>
                              {transaction.status}
                            </Badge>
                            {transaction.flagged && <Badge variant="destructive">Flagged</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.user_email} • {transaction.transaction_type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.amount} {transaction.currency} • {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions to monitor
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sellers">
              <Card>
                <CardHeader>
                  <CardTitle>Seller Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verifications.map(verification => (
                      <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{verification.user_email}</span>
                            <Badge variant={verification.verification_status === 'verified' ? 'default' : 'secondary'}>
                              {verification.verification_status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(verification.submitted_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                    {verifications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No verification requests
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Commerce Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{products.length}</div>
                      <div className="text-sm text-muted-foreground">Total Products</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</div>
                      <div className="text-sm text-muted-foreground">Active Products</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{transactions.length}</div>
                      <div className="text-sm text-muted-foreground">Transactions</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{verifications.filter(v => v.verification_status === 'verified').length}</div>
                      <div className="text-sm text-muted-foreground">Verified Sellers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}

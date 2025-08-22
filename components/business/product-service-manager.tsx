"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, Loader2, RefreshCw, Package } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  actual_price: number
  sales_price?: number
  status: string
  description?: string
  additional_description?: string
  inventory: number
  has_variants: boolean
  created_at: string
  updated_at: string
}

export function ProductServiceManager() {
  const router = useRouter()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [productImages, setProductImages] = useState<Record<string, string[]>>({})

  // Fetch products from backend
  useEffect(() => {
    if (user?.id) {
      fetchProducts()
      fetchCategories()
    }
  }, [user?.id])

  const fetchProducts = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Fetch user's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        toast.error('Failed to fetch products')
      } else {
        setProducts(productsData || [])
        
        // Fetch images for all products
        if (productsData && productsData.length > 0) {
          const productIds = productsData.map(p => p.id)
          console.log('🔍 Fetching images for product IDs:', productIds)
          
          try {
            const { data: imagesData, error: imagesError } = await supabase
              .from('product_images')
              .select('product_id, image_url') // Changed from file_path to image_url
              .in('product_id', productIds)
              .order('created_at', { ascending: false })
            
            console.log('🖼️ Images query result:', { imagesData, imagesError })
            
            if (imagesError) {
              console.error('Error fetching product images:', imagesError)
              // Don't fail the whole request, just log the error
            } else {
              // Group images by product_id
              const imagesByProduct: Record<string, string[]> = {}
              imagesData?.forEach(img => {
                if (!imagesByProduct[img.product_id]) {
                  imagesByProduct[img.product_id] = []
                }
                // Get the full URL for the image
                const imageUrl = supabase.storage
                  .from('product-media')
                  .getPublicUrl(img.image_url).data.publicUrl // Changed from file_path to image_url
                imagesByProduct[img.product_id].push(imageUrl)
              })
              setProductImages(imagesByProduct)
              console.log('🖼️ Product images loaded:', imagesByProduct)
            }
          } catch (imageError) {
            console.error('Exception while fetching images:', imageError)
            // Don't fail the whole request, just log the error
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Fetch categories and subcategories for filtering
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('name')
        .order('name')

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('product_subcategories')
        .select('name')
        .order('name')

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData.map(cat => cat.name))
      }

      if (!subcategoriesError && subcategoriesData) {
        setSubcategories(subcategoriesData.map(sub => sub.name))
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const refreshProducts = async () => {
    setRefreshing(true)
    await fetchProducts()
    setRefreshing(false)
    toast.success('Products refreshed')
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      // Delete product variants first
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)

      // Delete product images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)

      // Delete product videos
      await supabase
        .from('product_videos')
        .delete()
        .eq('product_id', productId)

      // Delete product inventory
      await supabase
        .from('product_inventory')
        .delete()
        .eq('product_id', productId)

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        toast.error('Failed to delete product')
        return
      }

      toast.success('Product deleted successfully')
      fetchProducts() // Refresh the list
    } catch (err) {
      console.error('Error deleting product:', err)
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    const matchesCategory = categoryFilter === "all" || 
                           product.category === categoryFilter || 
                           product.subcategory === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getProductImage = (product: Product) => {
    const productId = product.id
    const images = productImages[productId]
    
    if (images && images.length > 0) {
      // Return the first image URL
      return images[0]
    }
    
    // Fallback to placeholder if no images
    return "/placeholder.svg?height=200&width=200"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Products & Services</h2>
            <p className="text-muted-foreground">Manage your marketplace offerings</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products & Services</h2>
          <p className="text-muted-foreground">
            Manage your marketplace offerings ({products.length} products)
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshProducts}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button onClick={() => router.push('/business/add-product')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory} value={subcategory}>
                {subcategory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                </div>
                {product.inventory <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    {product.additional_description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {product.additional_description}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {product.sales_price ? formatCurrency(product.sales_price) : formatCurrency(product.actual_price)}
                      </span>
                      {product.sales_price && product.sales_price < product.actual_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.actual_price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{product.category} • {product.subcategory}</span>
                      <span>Stock: {product.inventory}</span>
                    </div>

                    {product.has_variants && (
                      <Badge variant="secondary" className="text-xs">
                        Has Variants
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/marketplace/product/${product.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/business/edit-product/${product.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {formatTimeAgo(product.created_at)}
                    {product.updated_at !== product.created_at && (
                      <span className="block">Updated: {formatTimeAgo(product.updated_at)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No products match your current filters. Try adjusting your search criteria.'
                : 'You haven\'t added any products yet. Start building your marketplace presence!'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => router.push('/business/add-product')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

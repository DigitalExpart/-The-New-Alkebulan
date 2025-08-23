"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"
import { useCart } from "@/components/commerce/cart-context"
import { useWishlist } from "@/components/commerce/wishlist-context"

interface Product {
  id: string
  name: string
  description: string
  actual_price: number
  sales_price?: number
  category: string
  subcategory: string
  status: string
  inventory: number
  has_variants: boolean
  user_id: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  type: string
  description: string
  product_count: number
}

interface Subcategory {
  id: string
  name: string
  category_id: string
  product_count: number
}

interface Seller {
  id: string
  first_name: string
  last_name: string
  business_name?: string
  location?: string
  product_count: number
  rating: number
  total_sales: number
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    activeProducts: 0,
    verifiedSellers: 0,
    totalSales: 0,
    growthRate: 0
  })
  const [productImages, setProductImages] = useState<Record<string, string[]>>({})
  const { addItem } = useCart()
  const { has: hasWish, toggle: toggleWish } = useWishlist()

  // Fetch live data from backend
  useEffect(() => {
    fetchMarketplaceData()
  }, [])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Debug: First check if products table exists and has any data
      console.log('🔍 Fetching marketplace data...')
      
      // Test connection first
      console.log('🔌 Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      console.log('🔌 Connection test result:', { testData, testError })
      
      // Fetch ALL products first (for debugging)
      const { data: allProductsData, error: allProductsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('📊 All products data:', allProductsData)
      console.log('❌ All products error:', allProductsError)
      
      // Fetch active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
      
      console.log('✅ Active products data:', productsData)
      console.log('❌ Active products error:', productsError)
      
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
            // Some environments may not have created_at on product_images; avoid ordering by it
            const { data: imagesData, error: imagesError } = await supabase
              .from('product_images')
              .select('product_id, image_url')
              .in('product_id', productIds)
            
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
      
      // Also fetch draft products to see if that's the issue
      const { data: draftProductsData, error: draftProductsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
      
      console.log('📝 Draft products data:', draftProductsData)
      console.log('❌ Draft products error:', draftProductsError)
      
      // Fetch categories with product counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .order('name')
      
      console.log('🏷️ Categories data:', categoriesData)
      console.log('❌ Categories error:', categoriesError)
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
      } else {
        setCategories(categoriesData || [])
      }
      
      // Fetch subcategories with product counts
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('product_subcategories')
        .select('*')
        .order('name')
      
      console.log('📂 Subcategories data:', subcategoriesData)
      console.log('❌ Subcategories error:', subcategoriesError)
      
      if (subcategoriesError) {
        console.error('Error fetching subcategories:', subcategoriesError)
      } else {
        setSubcategories(subcategoriesData || [])
      }
      
      // Fetch top sellers (users with most products)
      const { data: sellersData, error: sellersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, business_name, location, business_enabled')
        .eq('business_enabled', true)
        .limit(6)
      
      console.log('👥 Sellers data:', sellersData)
      console.log('❌ Sellers error:', sellersError)
      
      if (sellersError) {
        console.error('Error fetching sellers:', sellersError)
      } else {
        // Calculate product counts for sellers
        const sellersWithCounts = await Promise.all(
          (sellersData || []).map(async (seller) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', seller.id)
              .eq('status', 'active')
            
            return {
              ...seller,
              product_count: count || 0,
              total_sales: 0, // Will be calculated when orders table is available
              rating: 4.5 // Mock rating for now
            }
          })
        )
        
        setSellers(sellersWithCounts)
      }
      
      // Calculate stats
      const activeProducts = productsData?.length || 0
      const verifiedSellers = sellersData?.length || 0
      const totalSales = 0 // Will be calculated when orders table is available
      const growthRate = 15 // Mock growth rate for now
      
      console.log('📈 Stats calculated:', { activeProducts, verifiedSellers, totalSales, growthRate })
      
      setStats({
        activeProducts,
        verifiedSellers,
        totalSales,
        growthRate
      })
      
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
      toast.error('Failed to fetch marketplace data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchMarketplaceData()
    setRefreshing(false)
    toast.success('Marketplace data refreshed')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getProductImage = (product: Product) => {
    const productId = product.id
    const images = productImages[productId]
    
    if (images && images.length > 0) {
      // Return the first image URL
      return images[0]
    }
    
    // Fallback to placeholder if no images
    return "/placeholder.svg?height=250&width=250"
  }

  const getProductBadge = (product: Product) => {
    if (product.sales_price && product.sales_price < product.actual_price) {
      return "Sale"
    }
    if (product.has_variants) {
      return "Variants"
    }
    if (product.inventory <= 5) {
      return "Low Stock"
    }
    return "New"
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
              alt="The New Alkebulan Logo"
              className="h-16 w-16 animate-spin"
            />
            <p className="text-muted-foreground mt-3">Loading marketplace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover authentic products from African entrepreneurs and artisans worldwide
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeProducts}+</p>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.verifiedSellers}+</p>
                  <p className="text-sm text-muted-foreground">Verified Sellers</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">€{stats.totalSales.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">+{stats.growthRate}%</p>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, sellers, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted bg-transparent"
                  onClick={refreshData}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-card border-border">
            <TabsTrigger
              value="products"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Products ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger
              value="sellers"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Top Sellers ({sellers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Products'}
              </h2>
              
              {/* Debug section removed for production */}
              
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="bg-card border-border hover:border-primary transition-colors group">
                      <div className="relative">
                        <Link href={`/marketplace/product/${product.id}`} className="block">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-t-lg cursor-pointer group-hover:opacity-95 transition-opacity"
                          />
                        </Link>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-primary-foreground">{getProductBadge(product)}</Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-background/80 border-border" onClick={() => toggleWish({ id: product.id, name: product.name, price: product.sales_price ?? product.actual_price, imageUrl: getProductImage(product) })}>
                            <Heart className={`h-4 w-4 ${hasWish(product.id) ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
                          </Button>
                        </div>
                        {product.inventory <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground line-clamp-2 text-base">{product.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {product.category} • {product.subcategory}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-primary">
                                {product.sales_price ? formatCurrency(product.sales_price) : formatCurrency(product.actual_price)}
                              </span>
                              {product.sales_price && product.sales_price < product.actual_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.actual_price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Star className="mr-1 h-4 w-4 text-primary fill-current" />
                              4.5 (0)
                            </div>
                            <span className="text-muted-foreground">
                              Stock: {product.inventory}
                            </span>
                          </div>
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={product.inventory <= 0}
                            onClick={() => addItem({ id: product.id, name: product.name, price: product.sales_price ?? product.actual_price, imageUrl: getProductImage(product) })}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
                          </Button>
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
                      {searchQuery 
                        ? `No products match your search for "${searchQuery}". Try different keywords or browse all categories.`
                        : 'No products available at the moment. Check back soon!'}
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-card border-border hover:border-primary transition-colors group cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/10 rounded-t-lg flex items-center justify-center">
                        <Package className="w-16 h-16 text-primary/60" />
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-foreground">
                          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                          <p className="text-sm opacity-90">{category.type} products</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Browse Category
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Top Sellers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sellers.map((seller) => (
                  <Card key={seller.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 rounded-full mx-auto bg-primary/20 flex items-center justify-center">
                          <Users className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {seller.business_name || `${seller.first_name} ${seller.last_name}`}
                          </h3>
                          <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {seller.location}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{seller.product_count}</div>
                            <div className="text-muted-foreground">Products</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-primary">€{seller.total_sales.toLocaleString()}</div>
                            <div className="text-muted-foreground">Sales</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <Star className="mr-1 h-4 w-4 text-primary fill-current" />
                          <span className="text-sm text-foreground">{seller.rating}</span>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Visit Store
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="bg-card border-border mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Start Selling Today</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of entrepreneurs selling authentic African products to a global community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/business/add-product" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  List Your Product
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

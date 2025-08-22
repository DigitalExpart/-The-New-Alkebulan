"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, MapPin, Star, ShoppingCart, Heart } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productImages, setProductImages] = useState<string[]>([])

  const productId = params.id as string

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Fetch product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('status', 'active')
        .single()
      
      if (productError) {
        console.error('Error fetching product:', productError)
        toast.error('Failed to fetch product')
        router.push('/marketplace')
        return
      }
      
      if (!productData) {
        toast.error('Product not found')
        router.push('/marketplace')
        return
      }
      
      setProduct(productData)
      
      // Fetch product images
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      
      if (!imagesError && imagesData) {
        const imageUrls = imagesData.map(img => {
          return supabase.storage
            .from('product-media')
            .getPublicUrl(img.image_url).data.publicUrl
        })
        setProductImages(imageUrls)
      }
      
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product')
      router.push('/marketplace')
    } finally {
      setLoading(false)
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

  const getProductImage = () => {
    if (productImages.length > 0) {
      return productImages[0]
    }
    return "/placeholder.svg?height=400&width=400"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={getProductImage()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Package className="h-4 w-4" />
                <span>{product.category} • {product.subcategory}</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.sales_price ? formatCurrency(product.sales_price) : formatCurrency(product.actual_price)}
                </span>
                {product.sales_price && product.sales_price < product.actual_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.actual_price)}
                  </span>
                )}
                {product.sales_price && product.sales_price < product.actual_price && (
                  <Badge className="bg-green-100 text-green-800">
                    Save {((product.actual_price - product.sales_price) / product.actual_price * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              {product.additional_description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Additional Details</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.additional_description}
                  </p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">SKU</span>
                <p className="font-medium">{product.sku || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Stock</span>
                <p className="font-medium">{product.inventory || 'Unlimited'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={`${
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </Badge>
              </div>
              {product.has_variants && (
                <div>
                  <span className="text-sm text-muted-foreground">Variants</span>
                  <p className="font-medium">Available</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Seller Info */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {product.user_id?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">Seller</p>
                  <p className="text-sm text-muted-foreground">Member since {new Date(product.created_at).getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

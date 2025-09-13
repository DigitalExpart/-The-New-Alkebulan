"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Package, MapPin, Star, ShoppingCart, Heart } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface ProductVariant {
  id: string
  variant_type: string
  variant_value: string
  variant_display_name?: string
  additional_price: number
  inventory: number
  is_available: boolean
  hex_color?: string
  image_url?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productImages, setProductImages] = useState<string[]>([])
  const [productVariants, setProductVariants] = useState<Record<string, ProductVariant[]>>({})
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [selectedInventory, setSelectedInventory] = useState<number>(0)

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
        .order('sort_order', { ascending: true })
      
      if (!imagesError && imagesData) {
        const imageUrls = imagesData.map(img => {
          return supabase.storage
            .from('post-media') // Use post-media bucket
            .getPublicUrl(img.image_url).data.publicUrl
        })
        setProductImages(imageUrls)
      }

      // Fetch product variants if product has variants
      if (productData.has_variants) {
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .eq('is_available', true)
          .order('variant_type', { ascending: true })
          .order('sort_order', { ascending: true })

        if (!variantsError && variantsData) {
          // Group variants by type
          const variantsByType: Record<string, ProductVariant[]> = {}
          variantsData.forEach(variant => {
            if (!variantsByType[variant.variant_type]) {
              variantsByType[variant.variant_type] = []
            }
            variantsByType[variant.variant_type].push(variant)
          })
          setProductVariants(variantsByType)

          // Initialize selected variants and calculate initial price
          const initialSelected: Record<string, string> = {}
          let totalAdditionalPrice = 0
          Object.keys(variantsByType).forEach(type => {
            if (variantsByType[type].length > 0) {
              const firstVariant = variantsByType[type][0]
              initialSelected[type] = firstVariant.variant_value
              totalAdditionalPrice += firstVariant.additional_price
            }
          })
          setSelectedVariants(initialSelected)
          setSelectedPrice(productData.sales_price || productData.actual_price + totalAdditionalPrice)
          setSelectedInventory(productData.inventory || 0)
        }
      } else {
        // No variants, use base product price
        setSelectedPrice(productData.sales_price || productData.actual_price)
        setSelectedInventory(productData.inventory || 0)
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

  const handleVariantChange = (variantType: string, variantValue: string) => {
    const newSelected = { ...selectedVariants, [variantType]: variantValue }
    setSelectedVariants(newSelected)

    // Calculate new price based on selected variants
    let totalAdditionalPrice = 0
    let minInventory = product.inventory || 0

    Object.keys(newSelected).forEach(type => {
      const selectedValue = newSelected[type]
      const variant = productVariants[type]?.find(v => v.variant_value === selectedValue)
      if (variant) {
        totalAdditionalPrice += variant.additional_price
        // Use the minimum inventory across all selected variants
        if (variant.inventory < minInventory) {
          minInventory = variant.inventory
        }
      }
    })

    const basePrice = product.sales_price || product.actual_price
    setSelectedPrice(basePrice + totalAdditionalPrice)
    setSelectedInventory(minInventory)
  }

  const getSelectedVariantInfo = () => {
    const selectedInfo = Object.keys(selectedVariants).map(type => {
      const value = selectedVariants[type]
      const variant = productVariants[type]?.find(v => v.variant_value === value)
      return {
        type,
        value,
        display: variant?.variant_display_name || value,
        price: variant?.additional_price || 0
      }
    })
    return selectedInfo
  }

  const handleAddToCart = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to add items to cart')
        router.push('/auth/signin')
        return
      }

      // Prepare cart item data
      const cartItemData = {
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
        price: selectedPrice,
        variant_selections: Object.keys(selectedVariants).length > 0 ? selectedVariants : null,
        variant_info: Object.keys(selectedVariants).length > 0 ? getSelectedVariantInfo() : null
      }

      // Insert into cart
      const { error } = await supabase
        .from('cart_items')
        .insert(cartItemData)

      if (error) {
        console.error('Error adding to cart:', error)
        toast.error('Failed to add item to cart')
        return
      }

      toast.success('Item added to cart successfully!')
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
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
                  {formatCurrency(selectedPrice)}
                </span>
                {product.sales_price && product.sales_price < product.actual_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.actual_price)}
                  </span>
                )}
                {product.sales_price && product.sales_price < product.actual_price && (
                  <Badge className="bg-green-100 text-green-800">
                    Save {((product.actual_price - selectedPrice) / product.actual_price * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
              {Object.keys(selectedVariants).length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Price includes selected variants
                </div>
              )}
            </div>

            {/* Variant Selection */}
            {product.has_variants && Object.keys(productVariants).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Options</h3>
                
                {Object.entries(productVariants).map(([variantType, variants]) => (
                  <div key={variantType} className="space-y-2">
                    <Label className="text-sm font-medium capitalize">
                      {variantType === 'number' ? 'Model/Number' : `${variantType}${variantType === 'weight' ? ' (kg)' : ''}`}
                    </Label>
                    
                    {variantType === 'color' ? (
                      // Color selector with color swatches
                      <div className="flex flex-wrap gap-2">
                        {variants.map(variant => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => handleVariantChange(variantType, variant.variant_value)}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                              selectedVariants[variantType] === variant.variant_value
                                ? 'border-primary ring-2 ring-primary/20 scale-110'
                                : 'border-muted-foreground/30 hover:border-primary/50'
                            }`}
                            style={{ 
                              backgroundColor: variant.hex_color || '#ccc',
                            }}
                            title={`${variant.variant_display_name || variant.variant_value}${variant.additional_price > 0 ? ` (+$${variant.additional_price})` : ''}`}
                          >
                            {selectedVariants[variantType] === variant.variant_value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      // Dropdown selector for other variant types
                      <Select
                        value={selectedVariants[variantType] || ''}
                        onValueChange={(value) => handleVariantChange(variantType, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${variantType}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map(variant => (
                            <SelectItem key={variant.id} value={variant.variant_value}>
                              <div className="flex justify-between items-center w-full">
                                <span>{variant.variant_display_name || variant.variant_value}</span>
                                {variant.additional_price > 0 && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    +${variant.additional_price}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {/* Show selected variant info */}
                    {selectedVariants[variantType] && (
                      <div className="text-xs text-muted-foreground">
                        Selected: {selectedVariants[variantType]}
                        {(() => {
                          const variant = variants.find(v => v.variant_value === selectedVariants[variantType])
                          return variant?.additional_price > 0 ? ` (+$${variant.additional_price})` : ''
                        })()}
                      </div>
                    )}
                  </div>
                ))}

                {/* Selected variants summary */}
                {Object.keys(selectedVariants).length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Your Selection:</div>
                    <div className="text-sm text-muted-foreground">
                      {getSelectedVariantInfo().map(info => 
                        `${info.type}: ${info.display}${info.price > 0 ? ` (+$${info.price})` : ''}`
                      ).join(' • ')}
                    </div>
                    <div className="text-sm font-medium mt-1">
                      Total: {formatCurrency(selectedPrice)}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                <p className="font-medium">{selectedInventory || product.inventory || 'Unlimited'}</p>
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
              <Button 
                size="lg" 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={selectedInventory === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedInventory === 0 ? 'Out of Stock' : 'Add to Cart'}
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

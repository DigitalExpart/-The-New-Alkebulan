import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ProductImageGallery } from "@/components/product/product-image-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"

import { sampleProduct, sampleReviews, relatedProducts } from "@/data/product-details"

import { Button } from "@/components/ui/button"

interface ProductPageProps {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  // ────────────────────────────────────────────────────────────
  // NOTE: In a real application you would fetch the product by ID.
  // For now we only have a single sample product with id === 1.
  // ────────────────────────────────────────────────────────────
  const productId = Number(params.id)
  if (productId !== sampleProduct.id) {
    notFound()
  }

  const product = sampleProduct
  const reviews = sampleReviews

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/marketplace">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12">
          <ProductImageGallery images={product.images} productTitle={product.title} />
          <ProductInfo product={product} />
        </div>

        {/* Product Tabs */}
        <div className="mb-12">
          <ProductTabs product={product} reviews={reviews} />
        </div>

        {/* Related Products */}
        <div className="space-y-12">
          <RelatedProducts products={relatedProducts} title="More from this seller" />
          <RelatedProducts products={relatedProducts} title="You might also like" />
        </div>
      </div>
    </div>
  )
}

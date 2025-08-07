"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, Share2, ShoppingCart, Zap, MapPin, Clock, TrendingUp } from "lucide-react"
import type { Product } from "@/types/product"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const getStockBadge = () => {
    switch (product.stock.status) {
      case "in-stock":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            In Stock
          </Badge>
        )
      case "limited-stock":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Limited Stock
          </Badge>
        )
      case "out-of-stock":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Out of Stock
          </Badge>
        )
    }
  }

  const getShippingIcon = () => {
    switch (product.shipping.type) {
      case "instant":
        return <Zap className="h-4 w-4" />
      case "express":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Category and Stock */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">{product.category}</Badge>
        {getStockBadge()}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-muted-foreground text-lg">{product.shortDescription}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <span className="font-medium">{product.rating}</span>
        <span className="text-muted-foreground">({product.reviews} reviews)</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold">${product.price}</span>
        {product.originalPrice && (
          <>
            <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
            <Badge variant="destructive">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          </>
        )}
      </div>

      {/* Shipping */}
      <div className="flex items-center gap-2 text-sm">
        {getShippingIcon()}
        <span>{product.shipping.estimate}</span>
        {product.shipping.cost === 0 && (
          <Badge variant="secondary" className="ml-2">
            Free
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button size="lg" className="flex-1">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-transparent">
            Buy Now
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className={isFavorited ? "text-red-500 border-red-200" : ""}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            {isFavorited ? "Favorited" : "Add to Favorites"}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Separator />

      {/* Creator Info */}
      <div className="space-y-4">
        <h3 className="font-semibold">About the Creator</h3>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={product.creator.avatar || "/placeholder.svg"} alt={product.creator.name} />
            <AvatarFallback>
              {product.creator.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium">{product.creator.name}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{product.creator.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{product.creator.rating} rating</span>
              </div>
              {product.creator.totalSales && <span>{product.creator.totalSales.toLocaleString()} sales</span>}
            </div>

            {product.creator.responseTime && (
              <p className="text-sm text-muted-foreground">{product.creator.responseTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <h3 className="font-semibold">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Star, Eye } from "lucide-react"
import type { Product } from "@/types/product"
import Link from "next/link"

interface RelatedProductsProps {
  products: Product[]
  title: string
}

export function RelatedProducts({ products, title }: RelatedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage >= products.length ? 0 : prev + itemsPerPage))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - itemsPerPage < 0 ? Math.max(0, products.length - itemsPerPage) : prev - itemsPerPage,
    )
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex + itemsPerPage >= products.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <div key={product.id} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Link href={`/marketplace/${product.id}`}>
                      <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4 mr-2" />
                        Quick View
                      </Button>
                    </Link>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>

                    <h3 className="font-medium line-clamp-2 text-sm">{product.title}</h3>

                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={product.creator.avatar || "/placeholder.svg"} alt={product.creator.name} />
                        <AvatarFallback className="text-xs">
                          {product.creator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">{product.creator.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Star, ThumbsUp, ChevronDown, CheckCircle, MessageCircle } from "lucide-react"
import type { Product, ProductReview } from "@/types/product"

interface ProductTabsProps {
  product: Product
  reviews: ProductReview[]
}

export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => Math.floor(r.rating) === rating).length,
    percentage: (reviews.filter((r) => Math.floor(r.rating) === rating).length / reviews.length) * 100,
  }))

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        <TabsTrigger value="qa">Q&A</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {product.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            {product.specifications ? (
              <div className="space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          {/* Review Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{product.rating}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">Based on {reviews.length} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.userAvatar || "/placeholder.svg"} alt={review.userName} />
                          <AvatarFallback>
                            {review.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.userName}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>

                    {/* Seller Reply */}
                    {review.reply && (
                      <>
                        <Separator />
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{review.reply.author}</span>
                            <Badge variant="outline" className="text-xs">
                              Seller
                            </Badge>
                            <span className="text-xs text-muted-foreground">{review.reply.date}</span>
                          </div>
                          <p className="text-sm">{review.reply.message}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Show More Reviews */}
          {reviews.length > 3 && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setShowAllReviews(!showAllReviews)}>
                {showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="qa" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent>
            {product.faqs && product.faqs.length > 0 ? (
              <div className="space-y-4">
                {product.faqs.map((faq, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium">{faq.question}</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 border-l-2 border-muted ml-4">
                      <p className="text-muted-foreground mb-2">{faq.answer}</p>
                      <span className="text-xs text-muted-foreground">Answered on {faq.date}</span>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

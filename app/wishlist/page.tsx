"use client"

import { useWishlist } from "@/components/commerce/wishlist-context"
import { useCart } from "@/components/commerce/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WishlistPage() {
  const { items, remove } = useWishlist()
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Saved Items</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No saved items yet.</p>
            <Link href="/marketplace" className="underline">Browse the marketplace</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="bg-card border-border">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => addItem({ id: item.id, name: item.name, price: item.price || 0, imageUrl: item.imageUrl })}
                  >
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={() => remove(item.id)}>Remove</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    { label: "Active Products", value: "5,000+", icon: Package },
    { label: "Verified Sellers", value: "1,200+", icon: Users },
    { label: "Total Sales", value: "€2.5M", icon: DollarSign },
    { label: "Growth Rate", value: "+25%", icon: TrendingUp },
  ]

  const categories = [
    { name: "Fashion & Clothing", count: 1250, image: "/placeholder.svg?height=200&width=300" },
    { name: "Art & Crafts", count: 890, image: "/placeholder.svg?height=200&width=300" },
    { name: "Food & Beverages", count: 650, image: "/placeholder.svg?height=200&width=300" },
    { name: "Beauty & Wellness", count: 420, image: "/placeholder.svg?height=200&width=300" },
    { name: "Books & Media", count: 380, image: "/placeholder.svg?height=200&width=300" },
    { name: "Home & Decor", count: 320, image: "/placeholder.svg?height=200&width=300" },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "Handwoven Kente Cloth",
      seller: "Akosua Textiles",
      price: "€89.99",
      originalPrice: "€120.00",
      rating: 4.8,
      reviews: 124,
      location: "Ghana",
      image: "/placeholder.svg?height=250&width=250",
      badge: "Bestseller",
      inStock: true,
    },
    {
      id: 2,
      name: "African Shea Butter Set",
      seller: "Natural Beauty Co.",
      price: "€34.99",
      originalPrice: null,
      rating: 4.9,
      reviews: 89,
      location: "Burkina Faso",
      image: "/placeholder.svg?height=250&width=250",
      badge: "New",
      inStock: true,
    },
    {
      id: 3,
      name: "Wooden Djembe Drum",
      seller: "Rhythm Makers",
      price: "€156.00",
      originalPrice: "€180.00",
      rating: 4.7,
      reviews: 67,
      location: "Mali",
      image: "/placeholder.svg?height=250&width=250",
      badge: "Sale",
      inStock: true,
    },
    {
      id: 4,
      name: "Ethiopian Coffee Beans",
      seller: "Highland Roasters",
      price: "€24.99",
      originalPrice: null,
      rating: 4.6,
      reviews: 156,
      location: "Ethiopia",
      image: "/placeholder.svg?height=250&width=250",
      badge: "Organic",
      inStock: false,
    },
  ]

  const topSellers = [
    {
      name: "Amara's Boutique",
      products: 45,
      rating: 4.9,
      sales: "€25,000",
      location: "Nigeria",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Kwame's Crafts",
      products: 32,
      rating: 4.8,
      sales: "€18,500",
      location: "Ghana",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Zara's Wellness",
      products: 28,
      rating: 4.7,
      sales: "€15,200",
      location: "Kenya",
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

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
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
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
                <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/marketplace/upload" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Sell Product
                  </Link>
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
              Products
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="sellers"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Top Sellers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Featured Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="bg-card border-border hover:border-primary transition-colors group">
                    <div className="relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-primary text-primary-foreground">{product.badge}</Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-background/80 border-border">
                          <Heart className="h-4 w-4 text-foreground" />
                        </Button>
                      </div>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-foreground line-clamp-2 text-base">{product.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {product.location}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-primary">{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Star className="mr-1 h-4 w-4 text-primary fill-current" />
                            {product.rating} ({product.reviews})
                          </div>
                          <span className="text-muted-foreground">by {product.seller}</span>
                        </div>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <Card
                    key={index}
                    className="bg-card border-border hover:border-primary transition-colors group cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                          <p className="text-sm opacity-90">{category.count} products</p>
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
                {topSellers.map((seller, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <img
                          src={seller.image || "/placeholder.svg"}
                          alt={seller.name}
                          className="w-20 h-20 rounded-full mx-auto object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-foreground">{seller.name}</h3>
                          <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {seller.location}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{seller.products}</div>
                            <div className="text-muted-foreground">Products</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-primary">{seller.sales}</div>
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
                <Link href="/marketplace/upload" className="flex items-center">
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

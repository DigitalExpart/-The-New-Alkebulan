import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Product Details Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-full" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>

            <Skeleton className="h-5 w-48" />

            <div className="space-y-3">
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Products Skeleton */}
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <Card key={j}>
                      <Skeleton className="aspect-square w-full" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-20" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

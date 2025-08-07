import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function JusticeLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>

        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="w-8 h-8" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

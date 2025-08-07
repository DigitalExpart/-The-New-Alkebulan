import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyTokensLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
              <Skeleton className="h-12 w-64 bg-white/20" />
            </div>
            <Skeleton className="h-8 w-96 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-4xl mx-auto mb-8 bg-white/20" />

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
                  <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Balance Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Welcome Message Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center p-4 bg-white/50 rounded-lg">
                    <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-5 w-24 mx-auto mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 flex-1" />
              ))}
            </div>

            {/* Content Area Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-16 mx-auto mb-2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

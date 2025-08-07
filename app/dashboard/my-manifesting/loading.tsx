import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyManifestingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Progress Overview Skeleton */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-4" />
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-3 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Skeletons */}
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card
              key={i}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Coming Soon Sections Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

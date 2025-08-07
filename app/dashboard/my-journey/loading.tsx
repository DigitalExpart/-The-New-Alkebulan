import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyJourneyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Skeleton className="h-16 w-80 mx-auto bg-white/20" />
            <Skeleton className="h-8 w-96 mx-auto bg-white/20" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto bg-white/20" />
            <div className="flex items-center justify-center gap-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-16 mx-auto bg-white/20" />
                <Skeleton className="h-4 w-20 bg-white/20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-16 mx-auto bg-white/20" />
                <Skeleton className="h-4 w-20 bg-white/20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24 mx-auto bg-white/20" />
                <Skeleton className="h-4 w-20 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Card Skeleton */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="grid grid-cols-5 gap-4 pt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="text-center space-y-2">
                    <Skeleton className="w-8 h-8 rounded-full mx-auto" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Cards Skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-6 w-64" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Final Insights Card Skeleton */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <Skeleton className="h-20 w-full" />
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

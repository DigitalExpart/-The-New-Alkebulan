import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"

export default function NumerologyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-6 w-32 mb-6 bg-white/20" />
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-8 w-8" />
                  <Skeleton className="h-10 w-80 bg-white/20" />
                </div>
                <Skeleton className="h-5 w-64 mb-4 bg-white/20" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-24 bg-white/20" />
                  <Skeleton className="h-6 w-28 bg-white/20" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Tabs Skeleton */}
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 bg-white/80" />
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-gray-900/80">
                <CardHeader className="text-center">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

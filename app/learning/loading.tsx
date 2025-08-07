import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"

export default function LearningHubLoading() {
  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-green-900 border-b border-green-200 dark:border-green-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-green-600" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-6 w-96" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="bg-white dark:bg-green-900 border-b border-green-200 dark:border-green-700">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar Skeleton */}
          <div className="w-full lg:w-80 bg-white dark:bg-green-900 border-r border-green-200 dark:border-green-700 p-4 space-y-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area Skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-green-800 rounded-lg border border-green-200 dark:border-green-700 overflow-hidden"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

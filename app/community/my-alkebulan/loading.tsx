import { Skeleton } from "@/components/ui/skeleton"

export default function MyAlkebulanLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950 dark:via-orange-950 dark:to-red-950">
      <div className="pt-16">
        {/* Hero Section Skeleton */}
        <section className="relative min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-6" />
            <Skeleton className="h-16 w-96 mx-auto mb-4" />
            <Skeleton className="h-8 w-80 mx-auto mb-8" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </section>

        {/* Content Sections Skeleton */}
        <div className="space-y-16 py-16">
          {[1, 2, 3, 4].map((section) => (
            <section key={section} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                  <div key={card} className="bg-white/80 rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

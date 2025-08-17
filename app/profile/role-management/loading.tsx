export default function RoleManagementLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-56 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-72 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Info Card Skeleton */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Role Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                  <div>
                    <div className="h-6 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Section Skeleton */}
        <div className="bg-card rounded-lg border p-6 mt-8">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-16 bg-muted rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-5 w-16 bg-muted rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

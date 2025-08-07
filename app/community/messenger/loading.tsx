import { Skeleton } from "@/components/ui/skeleton"

export default function MessengerLoading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation List Skeleton */}
        <div className="w-80 border-r border-border bg-card p-4">
          <div className="mb-4">
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Conversation Items */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-4 border-b border-border">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window Skeleton */}
        <div className="flex-1 bg-background">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-4">
            <div className="text-center">
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-[#142b20]">
      <div className="flex h-screen">
        {/* Conversation List Skeleton */}
        <div className="w-80 border-r border-gray-700 bg-[#1a3326] p-4">
          <Skeleton className="h-6 w-24 mb-4 bg-gray-600" />
          <Skeleton className="h-10 w-full mb-4 bg-gray-600" />

          {/* Conversation Items */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-4 border-b border-gray-700">
              <Skeleton className="h-12 w-12 rounded-full bg-gray-600" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2 bg-gray-600" />
                <Skeleton className="h-3 w-48 bg-gray-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window Skeleton */}
        <div className="flex-1 bg-[#142b20]">
          <div className="p-4 border-b border-gray-700 bg-[#1a3326]">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-600" />
              <div>
                <Skeleton className="h-4 w-32 mb-1 bg-gray-600" />
                <Skeleton className="h-3 w-20 bg-gray-600" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="text-center">
              <Skeleton className="h-6 w-48 mx-auto mb-2 bg-gray-600" />
              <Skeleton className="h-4 w-64 mx-auto bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

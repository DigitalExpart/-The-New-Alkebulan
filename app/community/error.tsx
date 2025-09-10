"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("Community page error:", error)
  }, [error])

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-semibold">Unable to load Community</h2>
        <p className="text-muted-foreground text-sm">Please try again. If the problem persists, reload the page.</p>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    </div>
  )
}



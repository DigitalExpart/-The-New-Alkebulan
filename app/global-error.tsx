"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("Global application error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">An unexpected error occurred. You can try again.</p>
            {error?.digest && (
              <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}



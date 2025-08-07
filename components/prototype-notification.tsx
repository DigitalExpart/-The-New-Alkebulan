"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Rocket, TrendingUp } from "lucide-react"
import Link from "next/link"

export function PrototypeNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if notification was previously dismissed
    const dismissed = localStorage.getItem("prototype-notification-dismissed")
    if (!dismissed) {
      // Show notification after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("prototype-notification-dismissed", "true")
  }

  if (!isClient || !isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4">
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-500">
        <CardContent className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Header with Icons */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary" />
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">Live Prototype</h3>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-3 mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website is a <span className="font-semibold text-foreground">live prototype</span> of what we are
              building.
            </p>

            <p className="text-sm text-foreground font-medium leading-relaxed">
              Be part of the journey. Join us in creating a digital home for the Alkebulan community.
            </p>

            <p className="text-sm text-foreground font-semibold leading-relaxed">
              Invest in <span className="text-primary">The New Alkebulan</span> and empower our community for
              generations to come.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
            >
              <Link href="/funding">Invest Now</Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Later
            </Button>
          </div>

          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-t-lg" />
        </CardContent>
      </Card>
    </div>
  )
}

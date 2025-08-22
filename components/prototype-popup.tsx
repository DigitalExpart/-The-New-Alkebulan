"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, TrendingUp, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PrototypePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Always show popup after 2 seconds on every page load, regardless of previous dismissals
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    // Don't store dismissal state - let it show again on next page load
  }

  if (!isVisible) return null

  // Calculate sheen position based on scroll
  const shineOffset = (scrollY * 0.3) % 150
  const shinePosition = -80 + shineOffset

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <Card className="relative overflow-hidden border border-border/50 shadow-2xl backdrop-blur-md dark:bg-card/95 hover:shadow-3xl transition-all duration-300 bg-[#07370d]">
        {/* Base gradient shine */}
        <div className="absolute inset-0 bg-gradient-to-bl from-white/8 via-transparent to-transparent pointer-events-none" />

        {/* Animated diagonal sheen */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `linear-gradient(135deg, 
              transparent ${shinePosition}%, 
              rgba(255,255,255,0.05) ${shinePosition + 15}%, 
              rgba(255,255,255,0.2) ${shinePosition + 25}%, 
              rgba(255,255,255,0.05) ${shinePosition + 35}%, 
              transparent ${shinePosition + 50}%
            )`,
            transition: "background 0.1s ease-out",
          }}
        />

        {/* Silver highlight streak */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `linear-gradient(135deg, 
              transparent ${shinePosition + 5}%, 
              rgba(192,192,192,0.1) ${shinePosition + 20}%, 
              rgba(255,255,255,0.3) ${shinePosition + 25}%, 
              rgba(192,192,192,0.1) ${shinePosition + 30}%, 
              transparent ${shinePosition + 45}%
            )`,
            transition: "background 0.1s ease-out",
          }}
        />

        <CardContent className="relative p-5 z-10">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-7 w-7 p-0 hover:bg-muted/50 rounded-full z-20"
            onClick={handleDismiss}
            aria-label="Dismiss popup"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>

          <div className="space-y-4 pr-8">
            {/* Header with badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full dark:bg-gradient-to-br dark:from-primary/20 dark:to-primary/10 bg-dark-border flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                Live Prototype
              </Badge>
            </div>

            {/* Main content */}
            <div className="space-y-3">
              <h3 className="font-bold text-base leading-tight dark:text-foreground text-white">🚀 Building the Future Together</h3>

              <div className="space-y-2 text-sm dark:text-muted-foreground leading-relaxed text-white">
                <p>
                  This website is a <span className="font-semibold dark:text-foreground text-white">live prototype</span> of what we are
                  building.
                </p>
                <p className="dark:text-foreground text-white font-medium">
                  Be part of the journey. Join us in creating a digital home for the Alkebulan community.
                </p>
                <p className="dark:text-foreground text-white font-semibold">
                  Invest in The New Alkebulan and empower our community for generations to come.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs dark:text-muted-foreground pt-2 text-white">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>2.1k+ interested</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>Early access</span>
              </div>
            </div>

            {/* CTA Button - Yellow theme color with black text */}
            <div className="relative z-20">
              <Button
                asChild
                size="lg"
                className="w-full relative z-30 bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                <Link href="/funding" className="relative z-40 flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-black" />
                  Invest Now
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

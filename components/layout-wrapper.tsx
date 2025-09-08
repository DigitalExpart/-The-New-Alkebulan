"use client"

import React, { useState } from "react"
import { Menu, X, Home, Users, UserPlus, Building2, Globe, MessageCircle, Calendar, Store, Sparkles, ClipboardList, TrendingUp, Map, BookOpen, Coins, BarChart3, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { usePathname } from "next/navigation"
interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Check which section we're in
  const isCommunityPage = pathname?.startsWith('/community') || pathname === '/' || pathname === '/messages'
  const isMarketplacePage = pathname?.startsWith('/marketplace')
  const isGrowthPage = pathname?.startsWith('/growth') || pathname?.startsWith('/dashboard/my-manifesting')
  const isInvestingPage = pathname?.startsWith('/investing') || pathname?.startsWith('/funding') || pathname?.startsWith('/dashboard/investments')

  // Community navigation items
  const communityNavItems = [
    { title: "Feed", href: "/", icon: Home },
    { title: "Social Feed", href: "/community", icon: Users },
    { title: "My Friends", href: "/community/my-friends", icon: UserPlus },
    { title: "My Communities", href: "/community/my-communities", icon: Building2 },
    { title: "My Alkebulan", href: "/community/my-alkebulan", icon: Globe },
    { title: "Messenger", href: "/messages", icon: MessageCircle },
    { title: "Events", href: "/community/events", icon: Calendar }
  ]

  // Marketplace navigation items
  const marketplaceNavItems = [
    { title: "Browse Products", href: "/marketplace", icon: Store },
    { title: "All Companies", href: "/marketplace/companies", icon: Building2 }
  ]

  // Growth navigation items
  const growthNavItems = [
    { title: "Daily Planner", href: "/growth/daily-planner", icon: ClipboardList },
    { title: "Progress", href: "/growth/progress", icon: TrendingUp },
    { title: "Journey", href: "/growth/journey", icon: Map },
    { title: "Learning Hub", href: "/growth/learning-hub", icon: BookOpen },
    { title: "Mentorship", href: "/growth/mentorship", icon: Users },
    { title: "The Manifest Lab", href: "/dashboard/my-manifesting", icon: Sparkles }
  ]

  // Investing navigation items
  const investingNavItems = [
    { title: "Funding", href: "/funding", icon: Coins },
    { title: "Investor Dashboard", href: "/investing/my-investments", icon: BarChart3 },
    { title: "My Investments", href: "/dashboard/investments", icon: BarChart3 },
    { title: "More Projects", href: "/investing/more-projects", icon: FolderOpen }
  ]

  // Get current navigation items based on page type
  const getCurrentNavItems = () => {
    if (isCommunityPage) return communityNavItems
    if (isMarketplacePage) return marketplaceNavItems
    if (isGrowthPage) return growthNavItems
    if (isInvestingPage) return investingNavItems
    return []
  }

  const currentNavItems = getCurrentNavItems()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-80' : 'ml-0'
      }`}>
        {/* Header */}
        <Header />
        
        {/* Fixed section below header */}
        <div className="w-full h-16 bg-background border-b border-border sticky top-16 z-30">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Left side - Sidebar toggle */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hover:bg-accent"
                >
                  {sidebarOpen ? (
                    <X className="h-6 w-6 text-foreground" />
                  ) : (
                    <Menu className="h-6 w-6 text-foreground" />
                  )}
                </Button>
              </div>

              {/* Center - Section navigation items */}
              {currentNavItems.length > 0 && (
                <div className="flex items-center space-x-4">
                  {currentNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`text-sm font-medium transition-colors px-3 py-2 rounded-md flex items-center ${
                          isActive 
                            ? 'text-primary bg-primary/10' 
                            : 'text-foreground hover:text-primary hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </a>
                    )
                  })}
                </div>
              )}

              {/* Right side - Empty for now */}
              <div></div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

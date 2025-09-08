"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Menu, 
  Home,
  Users, 
  Store, 
  TrendingUp, 
  Sparkles
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserAvatarFixed } from "@/components/user-avatar-fixed"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const getDisplayName = () => {
    if (!user) return 'User'
    return (user as any)?.user_metadata?.full_name?.split(' ')[0] || 
           profile?.first_name || 
           user?.email?.split('@')[0] || 
           'User'
  }

  const navigationItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/"
    },
    {
      title: "Community",
      href: "/community",
      icon: Users,
      isActive: pathname?.startsWith('/community') || pathname === '/messages'
    },
    {
      title: "Marketplace",
      href: "/marketplace",
      icon: Store,
      isActive: pathname?.startsWith('/marketplace')
    },
    {
      title: "Growth",
      href: "/growth/daily-planner",
      icon: Sparkles,
      isActive: pathname?.startsWith('/growth') || pathname?.startsWith('/dashboard/my-manifesting')
    },
    {
      title: "Investing",
      href: "/funding",
      icon: TrendingUp,
      isActive: pathname?.startsWith('/investing') || pathname?.startsWith('/funding') || pathname?.startsWith('/dashboard/investments')
    }
  ]

  return (
    <>
      {/* Floating hamburger menu button when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 bg-background border border-border hover:bg-accent shadow-lg"
        >
          <Menu className="h-10 w-10 text-foreground" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 bg-background border-r border-border transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">

          {/* User Profile Section */}
          {user && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <UserAvatarFixed 
                  imageUrl={profile?.avatar_url}
                  size="sm"
                  fallbackName={getDisplayName()}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start h-10 px-3",
                    item.isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-3 h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          </ScrollArea>

        </div>
      </div>
    </>
  )
}

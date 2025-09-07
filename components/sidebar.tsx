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
  Sparkles,
  FolderOpen,
  BookOpen,
  BarChart3,
  Coins,
  Calendar,
  Target,
  Building2,
  Globe,
  UserPlus,
  MessageCircle,
  MapPin,
  Ribbon,
  ClipboardList,
  Scale,
  Map,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserAvatarFixed } from "@/components/user-avatar-fixed"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  
  const [expandedSections, setExpandedSections] = useState({
    community: false,
    marketplace: false,
    growth: false,
    investing: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getDisplayName = () => {
    if (!user) return 'User'
    return (user as any)?.user_metadata?.full_name?.split(' ')[0] || 
           profile?.first_name || 
           user?.email?.split('@')[0] || 
           'User'
  }

  const navigationItems = [
    {
      title: "Feed",
      href: "/",
      icon: Home,
      isActive: pathname === "/"
    },
    {
      title: "Community",
      icon: Users,
      children: [
        { title: "Social Feed", href: "/community", icon: Users },
        { title: "My Friends", href: "/community/my-friends", icon: UserPlus },
        { title: "My Communities", href: "/community/my-communities", icon: Building2 },
        { title: "My Alkebulan", href: "/community/my-alkebulan", icon: Globe },
        { title: "Messenger", href: "/messages", icon: MessageCircle },
        { title: "Events", href: "/community/events", icon: Calendar }
      ]
    },
    {
      title: "Marketplace",
      icon: Store,
      children: [
        { title: "Browse Products", href: "/marketplace", icon: Store },
        { title: "All Companies", href: "/marketplace/companies", icon: Building2 }
      ]
    },
    {
      title: "Growth",
      icon: Sparkles,
      children: [
        { title: "Daily Planner", href: "/growth/daily-planner", icon: ClipboardList },
        { title: "Progress", href: "/growth/progress", icon: TrendingUp },
        { title: "Journey", href: "/growth/journey", icon: Map },
        { title: "Learning Hub", href: "/growth/learning-hub", icon: BookOpen },
        { title: "Mentorship", href: "/growth/mentorship", icon: Users },
        { title: "The Manifest Lab", href: "/dashboard/my-manifesting", icon: Sparkles }
      ]
    },
    {
      title: "Investing",
      icon: TrendingUp,
      children: [
        { title: "Funding", href: "/funding", icon: Coins },
        { title: "Investor Dashboard", href: "/investing/my-investments", icon: BarChart3 },
        { title: "My Investments", href: "/dashboard/investments", icon: BarChart3 },
        { title: "More Projects", href: "/investing/more-projects", icon: FolderOpen }
      ]
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
                <div key={item.title}>
                  {item.children ? (
                    <Collapsible 
                      open={expandedSections[item.title.toLowerCase() as keyof typeof expandedSections]}
                      onOpenChange={() => toggleSection(item.title.toLowerCase() as keyof typeof expandedSections)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-10 px-3"
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          <span className="flex-1 text-left">{item.title}</span>
                          {expandedSections[item.title.toLowerCase() as keyof typeof expandedSections] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-6">
                        {item.children.map((child) => (
                          <Button
                            key={child.href}
                            variant="ghost"
                            asChild
                            className={cn(
                              "w-full justify-start h-9 px-3",
                              pathname === child.href && "bg-accent text-accent-foreground"
                            )}
                          >
                            <Link href={child.href}>
                              <child.icon className="mr-3 h-4 w-4" />
                              <span className="text-sm">{child.title}</span>
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Button
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
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

        </div>
      </div>
    </>
  )
}

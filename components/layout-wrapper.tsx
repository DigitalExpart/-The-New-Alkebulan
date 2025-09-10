'use client'

import React, { useState, useEffect } from "react"
import { 
  Menu, X, Users, UserPlus, Building2, Globe, MessageCircle, 
  Calendar, Store, Sparkles, ClipboardList, TrendingUp, Map, 
  BookOpen, Coins, BarChart3, FolderOpen, Search, ChevronDown, 
  Heart, Monitor, UserCheck, Shield, ShoppingCart, CheckCircle, 
  LogOut, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useMessageNotifications } from "@/hooks/use-message-notifications"
import { UserAvatarFixed } from "@/components/user-avatar-fixed"
import { ThemeToggleDropdownItems } from "@/components/theme-toggle"
import { CartDropdown } from "@/components/commerce/cart-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { DesktopSidebar } from "./desktop-sidebar"
import { Sidebar } from "./sidebar"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    postTitle: true,
    comments: false
  })

  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { unreadCount: messageUnreadCount } = useMessageNotifications()
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    setDesktopSidebarOpen(false)
  }

  const toggleDesktopSidebar = () => {
  setDesktopSidebarOpen(!desktopSidebarOpen)
  setSidebarOpen(false)
}

  // Check which section we're in
  const isHomePage = pathname === '/'
  const isCommunityPage = pathname?.startsWith('/community') || pathname?.startsWith('/communities') || pathname === '/messages'
  const isMarketplacePage = pathname?.startsWith('/marketplace')
  const isGrowthPage = pathname?.startsWith('/growth') || pathname?.startsWith('/dashboard/my-manifesting')
  const isInvestingPage = pathname?.startsWith('/investing') || pathname?.startsWith('/funding') || pathname?.startsWith('/dashboard/investments')

  // Community navigation items
  const communityNavItems = [
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
    if (isHomePage) return []
    if (isCommunityPage) return communityNavItems
    if (isMarketplacePage) return marketplaceNavItems
    if (isGrowthPage) return growthNavItems
    if (isInvestingPage) return investingNavItems
    return []
  }

  const currentNavItems = getCurrentNavItems()

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCategoryDropdownOpen) {
        const target = event.target as Element
        if (!target.closest('.category-dropdown')) {
          setIsCategoryDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCategoryDropdownOpen])

  // Search functionality with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await performSearch(searchQuery, selectedCategory, searchFilters)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, selectedCategory, searchFilters])

  // Search function - pulls live data from backend
  const performSearch = async (query: string, category: string, filters: any) => {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        category: category.toLowerCase(),
        postTitle: filters.postTitle.toString(),
        comments: filters.comments.toString()
      })

      const response = await fetch(`/api/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Search API error:', error)
      
      // Fallback to mock data if API fails
      return performMockSearch(query, category, filters)
    }
  }

  // Mock search function for demo purposes
  const performMockSearch = async (query: string, category: string, filters: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockResults = [
      {
        id: 1,
        type: 'post',
        title: `Post about ${query}`,
        content: `This is a post discussing ${query} and related topics...`,
        author: 'John Doe',
        date: new Date().toLocaleDateString()
      },
      {
        id: 2,
        type: 'community',
        name: `${query} Community`,
        description: `A community for people interested in ${query}`,
        members: 42
      },
      {
        id: 3,
        type: 'user',
        name: `User ${query}`,
        title: `Expert in ${query}`,
        location: 'New York, USA'
      }
    ];
    
    return mockResults.filter(result => 
      result.type === category.toLowerCase() || category === 'All'
    );
  }

  const getDisplayName = () => {
    if (!user) return 'User'
    return (user as any)?.user_metadata?.full_name?.split(' ')[0] || 
           profile?.first_name || 
           user?.email?.split('@')[0] || 
           'User'
  }

  const isAdmin = Boolean(
    profile?.is_admin === true ||
    profile?.role === 'admin' ||
    (Array.isArray(profile?.selected_roles) && profile.selected_roles.includes('admin'))
  )

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const handleAccountTypeSwitch = async (newRole: 'buyer' | 'business') => {
    if (!user || !profile) return
    
    try {
      // Check if the target role is actually enabled in Role Management
      if (newRole === 'business' && !profile?.business_enabled) {
        alert('Business mode is not enabled. Please activate it in Role Management first.')
        return
      }
      
      if (newRole === 'buyer' && !profile?.buyer_enabled) {
        alert('Buyer mode is not enabled. Please activate it in Role Management first.')
        return
      }
      
      // Only update account_type, don't change the enabled status
      const updateData = {
        account_type: newRole,
        updated_at: new Date().toISOString()
      }
      
      // Update the profile in Supabase
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        console.error('Error updating account type:', response.statusText)
        alert(`Failed to switch to ${newRole} mode: ${response.statusText}`)
        return
      }
      
      alert(`Switched to ${newRole} mode successfully!`)
      
      // Navigate to appropriate dashboard based on role
      if (newRole === 'business') {
        window.location.href = '/business/dashboard'
      } else if (newRole === 'buyer') {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Error switching account type:', error)
      alert('An unexpected error occurred while switching account type.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/*Mobile  Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Desktop Sidebar */}
      { desktopSidebarOpen && <DesktopSidebar isOpen={desktopSidebarOpen} onToggle={toggleDesktopSidebar} profile={profile} user={user} /> }
      
      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
  sidebarOpen || desktopSidebarOpen ? 'md:ml-64' : 'ml-0'
    }`}>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Left side - Logo */}
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <div className="flex items-center space-x-3 ml-12 md:ml-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
                      alt="The New Alkebulan Logo"
                      width={40}
                      height={40}
                      className="rounded-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-amber-400 max-sm:text-xs sm:text-base md:text-lg font-semibold">
                      The New
                    </p>
                    <p className="text-amber-400 max-sm:text-sm sm:text-lg md:text-2xl font-extrabold">
                      Alkebulan
                    </p>
                  </div>
                </div>
              </div>

              {/* Center - Navigation Links (Desktop) */}
              <nav className="flex items-center space-x-8  md:visible max-md:hidden">
                <a 
                  href="/community" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="max-md:text-xs md:text-sm lg:text-xs xl:text-base">Social Feeds</span>
                </a>
                <a 
                  href="/marketplace" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center"
                >
                  <Store className="h-4 w-4 mr-2" />
                  <span className="max-md:text-xs md:text-sm lg:text-xs xl:text-base">Browse Products</span>
                </a>
                <a 
                  href="/communities" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="max-md:text-xs md:text-sm lg:text-xs xl:text-base">Communities</span>
                </a>
                
              </nav>

              {/* Right side - Actions */}
              <div className="flex items-center max-md:gap-0 md:gap-2">
                {/* Search icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent max-md:w-8 max-md:h-8 md:h-10 max-md w h md:w-10"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5 text-foreground" />
                </Button>
                
                {/* Message icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent relative max-md:w-8 max-md:h-8 md:h-10max-md w h md: w-10"
                  asChild
                >
                  <a href="/messages">
                    <MessageCircle className="max-md:w-3 max-md:h-3 md:h-5 max-md w h md:w-5 text-foreground" />
                    {messageUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                      </span>
                    )}
                  </a>
                </Button>
                
                {/* Cart */}
                <CartDropdown />
                
                {/* Notifications */}
                {user && <NotificationsDropdown />}

                {/* Profile / User Menu */}
                {user ? (
                  <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
                        <UserAvatarFixed 
                          imageUrl={profile?.avatar_url}
                          size="sm"
                          fallbackName={getDisplayName()}
                        />
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>

                    {/* Profile dropdown content */}
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground">
                            {getDisplayName()}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Saved Items */}
                      <DropdownMenuItem asChild>
                        <a href="/wishlist" className="cursor-pointer flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span>Saved Items</span>
                        </a>
                      </DropdownMenuItem>
                      
                      {/* Dashboard */}
                      <DropdownMenuItem asChild>
                        <a href="/dashboard" className="cursor-pointer flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          <span>Dashboard</span>
                        </a>
                      </DropdownMenuItem>
                      
                      {/* Profile */}
                      <DropdownMenuItem asChild>
                        <a href="/profile" className="cursor-pointer flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          <span>Profile</span>
                        </a>
                      </DropdownMenuItem>
                      
                      {/* Edit Profile */}
                      <DropdownMenuItem asChild>
                        <a href="/profile/edit" className="cursor-pointer flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </a>
                      </DropdownMenuItem>
                      
                      {/* Role Management */}
                      <DropdownMenuItem asChild>
                        <a href="/profile/role-management" className="cursor-pointer flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Role Management</span>
                        </a>
                      </DropdownMenuItem>
                      
                      {/* Admin Console */}
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <a href="/admin" className="cursor-pointer flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Admin Console</span>
                          </a>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Account Roles Section */}
                      <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                        Account Roles
                      </DropdownMenuLabel>
                      
                      {/* Buyer Mode */}
                      <DropdownMenuItem 
                        className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'buyer' ? 'text-primary font-medium' : ''}`}
                        onClick={() => handleAccountTypeSwitch('buyer')}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buyer Mode</span>
                        {profile?.account_type === 'buyer' && <CheckCircle className="w-4 ml-auto text-primary" />}
                      </DropdownMenuItem>
                      
                      {/* Business Mode */}
                      <DropdownMenuItem 
                        className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'business' ? 'text-primary font-medium' : ''}`}
                        onClick={() => handleAccountTypeSwitch('business')}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Business Mode</span>
                        {profile?.account_type === 'business' && <CheckCircle className="w-4 ml-auto text-primary" />}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Theme Settings */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            <span>Theme</span>
                          </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          <ThemeToggleDropdownItems />
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Sign Out */}
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="cursor-pointer flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/auth/signin">Sign In</a>
                    </Button>
                    <Button size="sm" asChild>
                      <a href="/auth/signup">Sign Up</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Popup Modal */}
          {isSearchOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
              <div className="fixed left-1/2 top-20 w-full max-w-lg transform -translate-x-1/2">
                <div className="bg-background border border-border rounded-lg shadow-lg p-4 mx-4" onClick={(e) => e.stopPropagation()}>
                  {/* Search Input Bar with Category Dropdown */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      {/* Search Input */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search for anything..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-10 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Category Dropdown */}
                      <div className="relative category-dropdown">
                        <button
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="flex items-center gap-2 px-3 py-3 bg-muted border border-border rounded-lg hover:bg-accent transition-colors text-xs font-medium"
                        >
                          <span>{selectedCategory}</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isCategoryDropdownOpen && (
                          <div className="absolute top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                            {[
                              { name: "All", icon: Search },
                              { name: "Communities", icon: Users },
                              { name: "Companies", icon: Building2 },
                              { name: "Products", icon: Store },
                              { name: "Friends", icon: UserPlus },
                              { name: "Post", icon: FileText }
                            ].map((category) => (
                              <button
                                key={category.name}
                                onClick={() => {
                                  setSelectedCategory(category.name)
                                  setIsCategoryDropdownOpen(false)
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent transition-colors ${
                                  selectedCategory === category.name ? 'bg-accent text-accent-foreground' : 'text-foreground'
                                }`}
                              >
                                <category.icon className="h-3 w-3" />
                                <span>{category.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search Filters */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">Search in:</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-xs">
                          <input 
                            type="checkbox" 
                            checked={searchFilters.postTitle}
                            onChange={(e) => setSearchFilters(prev => ({ ...prev, postTitle: e.target.checked }))}
                            className="rounded" 
                          />
                          Post Title & Content
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input 
                            type="checkbox" 
                            checked={searchFilters.comments}
                            onChange={(e) => setSearchFilters(prev => ({ ...prev, comments: e.target.checked }))}
                            className="rounded" 
                          />
                          Comments
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Search Content */}
                  {!searchQuery ? (
                    <div className="text-center py-6">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-base font-semibold mb-1">Search for anything</h3>
                      <p className="text-muted-foreground mb-2 text-sm">Try searching for keywords in posts</p>
                      <p className="text-xs text-muted-foreground">
                        Tip: Quick-launch search with ⌘ + K (Mac) or Ctrl + K (Windows/Linux)
                      </p>
                    </div>
                  ) : isSearching ? (
                    <div className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground text-sm">Searching...</p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-4 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {searchResults.map((result) => (
                          <div key={result.id} className="p-3 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            {result.type === 'post' && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">{result.title}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{result.content}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>By {result.author}</span>
                                  <span>•</span>
                                  <span>{result.date}</span>
                                </div>
                              </div>
                            )}
                            {result.type === 'community' && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">{result.name}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{result.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{result.members} members</span>
                                </div>
                              </div>
                            )}
                            {result.type === 'company' && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">{result.name}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{result.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{result.industry}</span>
                                </div>
                              </div>
                            )}
                            {result.type === 'product' && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">{result.name}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{result.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{result.price}</span>
                                </div>
                              </div>
                            )}
                            {result.type === 'user' && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">{result.name}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{result.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{result.location}</span>
                                </div>
                              </div>
                            )}
                            {result.type === 'comment' && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">{result.title}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{result.content}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>By {result.author}</span>
                                  <span>•</span>
                                  <span>{result.date}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-center text-muted-foreground text-sm">
                        No results found for "{searchQuery}"
                      </p>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="flex justify-end mt-3">
                    <Button variant="outline" size="sm" onClick={() => setIsSearchOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
        
        {/* Fixed section below header */}
        <div className="w-full h-16 bg-background border-b border-border sticky top-16 z-30 max-md:hidden md:visible">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Left side - Sidebar toggle */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDesktopSidebar}
                  className="hover:bg-accent"
                >
                  {desktopSidebarOpen ? (
                    <X className="h-6 w-6 text-foreground" />
                  ) : (
                    <Menu className="h-6 w-6 text-foreground" />
                  )}
                </Button>
              </div>
              {/* Center - Empty space */}
              <div></div>
              {/* Right side - Section navigation items */}
              {currentNavItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  {currentNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`text-xs font-medium transition-colors px-2 py-1.5 rounded-md flex items-center ${
                          isActive 
                            ? 'text-primary bg-primary/10' 
                            : 'text-foreground hover:text-black hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-3 w-3 mr-1.5" />
                        {item.title}
                      </a>
                    )
                  })}
                </div>
              )}

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
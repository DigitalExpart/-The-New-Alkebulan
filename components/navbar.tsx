"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  X,
  ShoppingCart,
  Users,
  Briefcase,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Sprout,
  FolderOpen,
  BookOpen,
  UserCheck,
  BarChart3,
  Coins,
  Calendar,
  Target,
  Sparkles,
  Building2,
  Upload,
  Globe,
  UserPlus,
  MessageCircle,
  Monitor,
  MapPin,
  Ribbon,
  ClipboardList,
  Scale,
  Map,
  Settings,
  LogOut,
  Store,
  Search,
  ChevronDown,
  CheckCircle,
  Bell,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatarFixed } from "@/components/user-avatar-fixed"
import { AnimatedSearch } from "@/components/animated-search"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Navbar() {
  const { user, profile, signOut, loading, refreshProfile, forceRefreshProfile } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false)
  const [isInvestingOpen, setIsInvestingOpen] = useState(false)

  // Helper function to get first name from full name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return 'User'
    return fullName.split(' ')[0]
  }

  // Get the best available name for display
  const getDisplayName = () => {
    return getFirstName((user as any)?.user_metadata?.full_name || profile?.first_name || user?.email?.split('@')[0])
  }

  // Debug: Log authentication state
  useEffect(() => {
    console.log('Navbar - User state:', !!user, user?.id, user?.email, loading)
    console.log('Navbar - Profile state:', profile)
    console.log('Navbar - Profile roles:', {
      buyer_enabled: profile?.buyer_enabled,
      business_enabled: profile?.business_enabled
    })
    console.log('Navbar - Supabase configured:', isSupabaseConfigured())
  }, [user, loading, profile])

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAccountTypeSwitch = async (accountType: 'buyer' | 'business') => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: accountType })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating account type:', error)
        return
      }

      // Refresh profile data
      await forceRefreshProfile()
      } catch (error) {
      console.error('Error in handleAccountTypeSwitch:', error)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 2) {
      performSearch(query)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      // Mock search results - replace with actual search logic
      const mockResults = [
        { id: '1', type: 'community', name: 'African Heritage', description: 'Celebrating African culture and traditions', category: 'Culture' },
        { id: '2', type: 'project', name: 'Sustainable Farming Initiative', description: 'Promoting sustainable agricultural practices', category: 'Agriculture' },
        { id: '3', type: 'event', name: 'Diaspora Business Summit', description: 'Annual business networking event', category: 'Business' },
        { id: '4', type: 'user', name: 'Sarah Johnson', description: 'Business consultant specializing in African markets', category: 'Professional' },
      ].filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(mockResults)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  const handleSearchResultClick = (result: any) => {
        setShowSearchResults(false)
    setSearchQuery('')
    
    // Navigate based on result type
    switch (result.type) {
      case 'community':
        router.push(`/communities/${result.id}`)
        break
      case 'project':
        router.push(`/investing/more-projects`)
        break
      case 'event':
        router.push('/growth')
        break
      case 'user':
        router.push(`/profile/${result.id}`)
        break
      default:
        break
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">The New Alkebulan</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Community Dropdown */}
            <div className="relative">
              <Collapsible open={isCommunityOpen} onOpenChange={setIsCommunityOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200">
                    <Users className="h-5 w-5" />
                    <span>Community</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCommunityOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/community" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Social Feed
                    </Link>
                    <Link href="/community/my-friends" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      My Friends
                    </Link>
                    <Link href="/community/my-communities" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      My Communities
                    </Link>
                    <Link href="/communities/my-community" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      My Alkebulan
                    </Link>
                    <Link href="/messages" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Messenger
                    </Link>
                    <Link href="/growth" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Events
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Marketplace Dropdown */}
            <div className="relative">
              <Collapsible open={isMarketplaceOpen} onOpenChange={setIsMarketplaceOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200">
                    <Store className="h-5 w-5" />
                    <span>Marketplace</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMarketplaceOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/marketplace" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Browse Products
                    </Link>
                    <Link href="/marketplace/companies" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      All Companies
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Growth */}
            <Link href="/growth" className="text-foreground hover:text-primary transition-colors duration-200">
              <Zap className="h-5 w-5 inline mr-2" />
              Growth
            </Link>

            {/* Investing Dropdown */}
            <div className="relative">
              <Collapsible open={isInvestingOpen} onOpenChange={setIsInvestingOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200">
                    <TrendingUp className="h-5 w-5" />
                    <span>Investing</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isInvestingOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/investing/alkebulan" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Investing Alkebulan
                    </Link>
                    <Link href="/investing/my-investments" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      My Investments
                    </Link>
                    <Link href="/investing/more-projects" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      More Projects
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              </div>
          </div>

          {/* Right Side - Search, User Menu, Notifications */}
          <div className="flex items-center space-x-4">
          {/* Search Bar */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-64 pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                />
              </form>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {result.type === 'community' && <Users className="h-4 w-4 text-primary" />}
                          {result.type === 'project' && <FolderOpen className="h-4 w-4 text-primary" />}
                          {result.type === 'event' && <Calendar className="h-4 w-4 text-primary" />}
                          {result.type === 'user' && <UserCheck className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{result.name}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                              {result.type}
                            </span>
                            {result.category && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                {result.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

            {/* Search Button for Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors duration-200"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
                    <UserAvatarFixed 
                      imageUrl={profile?.avatar_url}
                      size="sm"
                      fallbackName={getDisplayName()}
                    />
                    <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-black" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {profile?.first_name || (user as any)?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit" className="cursor-pointer flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/role-management" className="cursor-pointer flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Role Management
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Account Type Switcher */}
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                    Account Roles
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'buyer' ? 'text-primary font-medium' : ''}`}
                    onClick={() => handleAccountTypeSwitch('buyer')}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Buyer Mode</span>
                    {profile?.account_type === 'buyer' && <CheckCircle className="w-4 w-4 ml-auto text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'business' ? 'text-primary font-medium' : ''}`}
                    onClick={() => handleAccountTypeSwitch('business')}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Business Mode</span>
                    {profile?.account_type === 'business' && <CheckCircle className="w-4 w-4 ml-auto text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Theme</span>
                    <div className="ml-auto">
                      <ThemeToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/notifications/settings" className="cursor-pointer flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notification Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="text-foreground border-border hover:bg-accent hover:text-accent-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Notifications */}
            {user && (
              <NotificationsDropdown />
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4 search-container">
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                />
              </form>
              
              {/* Mobile Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {result.type === 'community' && <Users className="h-4 w-4 text-primary" />}
                          {result.type === 'project' && <FolderOpen className="h-4 w-4 text-primary" />}
                          {result.type === 'event' && <Calendar className="h-4 w-4 text-primary" />}
                          {result.type === 'user' && <UserCheck className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{result.name}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                              {result.type}
                            </span>
                            {result.category && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                {result.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
                <Menu className="h-6 w-6" />
                <span>Menu</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {/* Community Section */}
              <Collapsible open={isCommunityOpen} onOpenChange={setIsCommunityOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full p-3 text-left bg-accent rounded-lg">
                    <span className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Community</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCommunityOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-2 space-y-1">
                  <Link href="/community" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    Social Feed
                  </Link>
                  <Link href="/community/my-friends" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    My Friends
                  </Link>
                  <Link href="/community/my-communities" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    My Communities
                  </Link>
                  <Link href="/communities/my-community" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    My Alkebulan
              </Link>
                  <Link href="/messages" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    Messenger
              </Link>
                  <Link href="/growth" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                Events
              </Link>
                </CollapsibleContent>
              </Collapsible>

              {/* Marketplace Section */}
              <Collapsible open={isMarketplaceOpen} onOpenChange={setIsMarketplaceOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full p-3 text-left bg-accent rounded-lg">
                    <span className="flex items-center space-x-2">
                      <Store className="h-5 w-5" />
                      <span>Marketplace</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMarketplaceOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-2 space-y-1">
                  <Link href="/marketplace" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    Browse Products
                  </Link>
                  <Link href="/marketplace/companies" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    All Companies
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              {/* Growth */}
              <Link href="/growth" className="flex items-center space-x-2 p-3 text-foreground hover:bg-accent rounded-lg transition-colors duration-200">
                <Zap className="h-5 w-5" />
                <span>Growth</span>
              </Link>

              {/* Investing Section */}
              <Collapsible open={isInvestingOpen} onOpenChange={setIsInvestingOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full p-3 text-left bg-accent rounded-lg">
                    <span className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Investing</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isInvestingOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-2 space-y-1">
                  <Link href="/investing/alkebulan" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    Investing Alkebulan
                  </Link>
                  <Link href="/investing/my-investments" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    My Investments
                  </Link>
                  <Link href="/investing/more-projects" className="block p-2 text-sm text-foreground hover:bg-accent rounded">
                    More Projects
              </Link>
                </CollapsibleContent>
              </Collapsible>
            </CollapsibleContent>
          </Collapsible>
            </div>
      </div>
    </nav>
  )
}

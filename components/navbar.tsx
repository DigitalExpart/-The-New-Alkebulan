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

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // setIsLogoAnimating(true) // This state was removed, so this line is removed
    setTimeout(() => {
      // setIsLogoAnimating(false) // This state was removed, so this line is removed
      // Navigate to home after animation
      window.location.href = "/"
    }, 2500)
  }

  // Enhanced live search functionality with debouncing
  const handleSearch = async (query: string) => {
    if (!query.trim() || !supabase) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      // Search across multiple tables
      const results = []
      
      // Search communities
      const { data: communities } = await supabase
        .from('communities')
        .select('id, name, description, category')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5)

      if (communities) {
        results.push(...communities.map(c => ({ ...c, type: 'community', url: `/communities/${c.id}` })))
      }

      // Search projects (if you have a projects table)
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, description, category')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5)

        if (projects) {
          results.push(...projects.map(p => ({ ...p, type: 'project', url: `/projects/${p.id}` })))
        }
      } catch (error) {
        // Projects table might not exist yet
        console.log('Projects table not available')
      }

      // Search events (if you have an events table)
      try {
        const { data: events } = await supabase
          .from('events')
          .select('id, name, description, category')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5)

        if (events) {
          results.push(...events.map(e => ({ ...e, type: 'event', url: `/events/${e.id}` })))
        }
      } catch (error) {
        // Events table might not exist yet
        console.log('Events table not available')
      }

      // Search users/profiles
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, bio, occupation')
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,bio.ilike.%${query}%,occupation.ilike.%${query}%`)
          .limit(3)

        if (profiles) {
          results.push(...profiles.map(p => ({ 
            ...p, 
            type: 'user', 
            name: `${p.first_name} ${p.last_name}`.trim() || 'Unknown User',
            description: p.bio || p.occupation || 'User Profile',
            url: `/profile/${p.id}` 
          })))
        }
      } catch (error) {
        console.log('Profiles table not available')
      }

      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Clear previous timeout
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout)
    }
    
    if (query.trim()) {
      // Debounce search by 300ms
      (window as any).searchTimeout = setTimeout(() => {
        handleSearch(query)
      }, 300)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSearchResultClick = (result: any) => {
    setSearchQuery('')
    setShowSearchResults(false)
    setSearchResults([])
    router.push(result.url)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page or perform search
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearchResults(false)
      setSearchResults([])
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAccountTypeSwitch = async (newRole: 'buyer' | 'business') => {
    if (!user || !profile || !supabase) {
      console.log('Missing required data:', { user: !!user, profile: !!profile, supabase: !!supabase })
      return
    }
    
    console.log('=== ROLE SWITCH DEBUG ===')
    console.log('Attempting to switch active role to:', newRole)
    console.log('User ID:', user.id)
    console.log('Current profile:', profile)
    console.log('Current buyer_enabled:', profile?.buyer_enabled)
    console.log('Current business_enabled:', profile?.business_enabled)
    
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
        account_type: newRole, // Only change the active role, not the enabled status
        updated_at: new Date().toISOString()
      }
      
      console.log('Update data to be sent:', updateData)
      
      // Update the profile in Supabase - try by user_id first, then by id
      let { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
      
      // If not found by user_id, try by id
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found by user_id, trying by id...')
        const { data: dataById, error: errorById } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
          .select()
        
        if (errorById) {
          console.error('Error updating profile by id:', errorById)
          error = errorById
        } else {
          data = dataById
          error = null
        }
      }

      if (error) {
        console.error('Error updating account type:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        alert(`Failed to switch to ${newRole} mode: ${error.message}`)
        return
      }

      console.log('Account type updated successfully:', data)
      console.log('Updated profile data:', data)
      
      // Show success message
      alert(`Switched to ${newRole} mode successfully!`)
      
      // Refresh the profile data
      console.log('🔄 Refreshing profile after role switch...')
      await forceRefreshProfile()
      console.log('✅ Profile refreshed after role switch')
      
      // Navigate to appropriate dashboard based on role
      if (newRole === 'business') {
        // Redirect to business dashboard for business activities
        window.location.href = '/business/dashboard'
      } else if (newRole === 'buyer') {
        // Redirect to main dashboard for buyer activities
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Error switching account type:', error)
      alert('An unexpected error occurred while switching account type.')
    }
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false); // Close dropdown on sign out
  };

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

          {/* Navigation Links - Moved to center */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Community Dropdown */}
            <DropdownMenu open={isCommunityOpen} onOpenChange={setIsCommunityOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 font-medium">
                  <span>Community</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/community" className="cursor-pointer flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Social Feed
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/my-friends" className="cursor-pointer flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    My Friends
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/my-communities" className="cursor-pointer flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    My Communities
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/my-alkebulan" className="cursor-pointer flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    My Alkebulan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="cursor-pointer flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Messenger
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community/events" className="cursor-pointer flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Events
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marketplace Dropdown */}
            <DropdownMenu open={isMarketplaceOpen} onOpenChange={setIsMarketplaceOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 font-medium">
                  <span>Marketplace</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/marketplace" className="cursor-pointer flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Browse Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/marketplace/companies" className="cursor-pointer flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    All Companies
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/learning"
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Growth
            </Link>
            <Link
              href="/projects"
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Projects
            </Link>
          </div>

          {/* Right Side - Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Moved to right side and made shorter */}
            <div className="hidden md:block search-container">
              <div className="relative">
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

            {/* Theme Toggle */}
            <ThemeToggle />
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
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <div className="flex flex-col space-y-2 pt-4">
              <Collapsible open={isCommunityOpen} onOpenChange={setIsCommunityOpen} className="w-full">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 rounded-lg text-foreground hover:bg-accent font-medium">
                  Communities
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCommunityOpen ? 'rotate-180' : 'rotate-0'}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pl-4 pt-2">
                  <Link href="/community" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <Users className="h-4 w-4" /> Social Feed
                  </Link>
                  <Link href="/community/my-friends" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <UserPlus className="h-4 w-4" /> My Friends
                  </Link>
                  <Link href="/community/my-communities" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <Building2 className="h-4 w-4" /> My Communities
                  </Link>
                  <Link href="/community/my-alkebulan" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <Globe className="h-4 w-4" /> My Alkebulan
                  </Link>
                  <Link href="/messages" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <MessageCircle className="h-4 w-4" /> Messenger
                  </Link>
                  <Link href="/community/events" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <Calendar className="h-4 w-4" /> Events
                  </Link>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={isMarketplaceOpen} onOpenChange={setIsMarketplaceOpen} className="w-full">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 rounded-lg text-foreground hover:bg-accent font-medium">
                  Marketplace
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMarketplaceOpen ? 'rotate-180' : 'rotate-0'}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pl-4 pt-2">
                  <Link href="/marketplace" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <Store className="h-4 w-4" /> Browse Products
                  </Link>
                  <Link href="/marketplace/companies" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                    <Building2 className="h-4 w-4" /> All Companies
                  </Link>
                </CollapsibleContent>
              </Collapsible>
              <Link href="/learning" className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                Growth
              </Link>
              <Link href="/projects" className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-2 rounded-lg hover:bg-accent">
                Projects
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  StoreIcon,
  BookIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggleDropdownItems } from "@/components/theme-toggle"
import { UserAvatarFixed } from "@/components/user-avatar-fixed"
import { AnimatedSearch } from "@/components/animated-search"
import { CartDropdown } from "@/components/commerce/cart-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { useAuth } from "@/hooks/use-auth"
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
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, profile, signOut, loading, refreshProfile, forceRefreshProfile } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false)
  const [isInvestingOpen, setIsInvestingOpen] = useState(false)
  const [isGrowthOpen, setIsGrowthOpen] = useState(false)

  // === USER MENU STATES (separate for desktop & mobile to avoid duplicate conflicts) ===
  const [isUserMenuOpenDesktop, setIsUserMenuOpenDesktop] = useState(false)
  const [isUserMenuOpenMobile, setIsUserMenuOpenMobile] = useState(false)

  // mobile nav
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Mobile Devices collapsible states (mobile-only)
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false)
  const [mobileMarketplaceOpen, setMobileMarketplaceOpen] = useState(false)
  const [mobileInvestingOpen, setMobileInvestingOpen] = useState(false)
  const [mobileGrowthOpen, setMobileGrowthOpen] = useState(false)

  const mobileSearchRef = useRef<HTMLDivElement | null>(null)
  const [mobileSearchHeight, setMobileSearchHeight] = useState(0)

  // only one dropdown allowed at a time, closes any other dropdown
  const handleMobileToggle = (section: 'community' | 'marketplace' | 'investing' | 'growth') => (open: boolean) => {
    if (!open) {
      setMobileCommunityOpen(false)
      setMobileMarketplaceOpen(false)
      setMobileInvestingOpen(false)
      setMobileGrowthOpen(false)
      return
    }

    setMobileCommunityOpen(section === 'community')
    setMobileMarketplaceOpen(section === 'marketplace')
    setMobileInvestingOpen(section === 'investing')
    setMobileGrowthOpen(section === 'growth')
  }

  const HEADER_HEIGHT_PX = 64


  useEffect(() => {
    function measure() {
      if (mobileSearchRef.current) {
        const h = Math.ceil(mobileSearchRef.current.getBoundingClientRect().height)
        setMobileSearchHeight(h)
      } else {
        setMobileSearchHeight(0)
      }
    }

    measure()

    let t: number | undefined
    function onResize() {
      window.clearTimeout(t)
      t = window.setTimeout(measure, 120)
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.clearTimeout(t)
    }
  }, [isSearchOpen])

  // Prevent background scroll when mobile nav open (optional)
  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileNavOpen])

  // Helper function to get first name from full name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return 'User'
    return fullName.split(' ')[0]
  }

  // Get the best available name for display
  const getDisplayName = () => {
    return getFirstName((user as any)?.user_metadata?.full_name || profile?.first_name || user?.email?.split('@')[0])
  }

  const isAdmin = Boolean(
    profile?.is_admin === true ||
    profile?.role === 'admin' ||
    (Array.isArray(profile?.selected_roles) && profile.selected_roles.includes('admin'))
  )

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

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setTimeout(() => {
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
      const results: any[] = []
      
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
    
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout)
    }
    
    if (query.trim()) {
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
    
    try {
      if (newRole === 'business' && !profile?.business_enabled) {
        alert('Business mode is not enabled. Please activate it in Role Management first.')
        return
      }
      
      if (newRole === 'buyer' && !profile?.buyer_enabled) {
        alert('Buyer mode is not enabled. Please activate it in Role Management first.')
        return
      }
      
      const updateData = {
        account_type: newRole,
        updated_at: new Date().toISOString()
      }
      
      let { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
      
      if (error && error.code === 'PGRST116') {
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
        alert(`Failed to switch to ${newRole} mode: ${error.message}`)
        return
      }

      alert(`Switched to ${newRole} mode successfully!`)
      await forceRefreshProfile()

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

  const handleSignOut = async () => {
    await signOut()
    // close both user menus
    setIsUserMenuOpenDesktop(false)
    setIsUserMenuOpenMobile(false)
  }

  // Helper to close mobile nav when navigating
  const closeMobileNav = () => {
    setIsMobileNavOpen(false)
    setMobileCommunityOpen(false)
    setMobileMarketplaceOpen(false)
    setMobileInvestingOpen(false)
    setMobileGrowthOpen(false)
    // close mobile menu if open
    setIsUserMenuOpenMobile(false)
  }

  return (
    <nav className="hidden lg:block dark:bg-background border-b border-border transition-all duration-300 py-2 bg-[#07370d] overflow-y-visible">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 -gap-2">
          {/* Logo and Brand */}
        <div className="flex items-center gap-1">
          <button
              className="md:hidden p-1 rounded-md hover:bg-accent transition-colors duration-150"
              onClick={() => {
                
                setIsMobileNavOpen(!isMobileNavOpen)
                
                if (!isMobileNavOpen) {
                  setIsUserMenuOpenDesktop(false)
                  setIsUserMenuOpenMobile(false)
                }
              }}
              aria-label="Open mobile menu"
            >
              {isMobileNavOpen ? <X className="w-8 h-8 text-white hover:text-black" /> : <Menu className="w-8 h-8 text-white hover:text-black" />}
            </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 md:gap-3"
            >
              <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent rounded-full flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
                  alt="The New Alkebulan Logo"
                  width={60}
                  height={60}
                  className="rounded-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-amber-400 max-sm:text-xs sm:text-base md:text-lg font-semibold">
    The New
  </span>
                <span className="text-amber-400 max-sm:text-base sm:text-xl md:text-2xl font-extrabold">
    Alkebulan
  </span>
              </div>
            </button>
          </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Community Dropdown */}
            <DropdownMenu open={isCommunityOpen} onOpenChange={setIsCommunityOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 font-medium text-white">
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
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 font-medium text-white">
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

            {/* Growth Dropdown */}
              <DropdownMenu open={isGrowthOpen} onOpenChange={setIsGrowthOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 font-medium text-white">
                  <span>Growth</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/growth/daily-planner" className="cursor-pointer flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Daily Planner
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/growth/progress" className="cursor-pointer flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progress
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/growth/journey" className="cursor-pointer flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Journey
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/growth/learning-hub" className="cursor-pointer flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Learning Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/growth/mentorship" className="cursor-pointer flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Mentorship
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/my-manifesting" className="cursor-pointer flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    The Manifest Lab
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Investing Dropdown */}
            <DropdownMenu open={isInvestingOpen} onOpenChange={setIsInvestingOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 font-medium text-white">
                  <span>Investing</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/funding" className="cursor-pointer flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Funding
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/investing/my-investments" className="cursor-pointer flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Investor Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/investments" className="cursor-pointer flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    My Investments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/investing/more-projects" className="cursor-pointer flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    More Projects
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side - Search and User Menu */}
          <div className="flex items-center md:space-x-4 space-x-1">
            {/* Desktop Search Bar */}
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
              
                {/* Desktop Search Results */}
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

        <div className="flex items-center">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors duration-200 dark:hover:bg-accent rounded-xl"
            >
              <Search className="h-5 w-5 text-white"/>
            </button>

            {/* Desktop Profile */}
            {user ? (
              <div className="hidden md:flex">
                <DropdownMenu
                  open={isUserMenuOpenDesktop}
                  onOpenChange={(open) => {
                    setIsUserMenuOpenDesktop(open)
                    if (open) setIsUserMenuOpenMobile(false)
                  }}
                >
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

                  {/* Profile dropdown content */}
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
                      <Link href="/wishlist" className="cursor-pointer flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Saved Items
                      </Link>
                    </DropdownMenuItem>
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
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                      Account Roles
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'buyer' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleAccountTypeSwitch('buyer')}
                    >
                      <ShoppingCart className="w-4 h-4 text-white hover:text-black" />
                      <span>Buyer Mode</span>
                      {profile?.account_type === 'buyer' && <CheckCircle className="w-4 ml-auto text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'business' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleAccountTypeSwitch('business')}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Business Mode</span>
                      {profile?.account_type === 'business' && <CheckCircle className="w-4 ml-auto text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
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

            {/* Cart (visible to all) */}
            <CartDropdown />

            {/* Notifications Bell (last) */}
            {user && <NotificationsDropdown />}

            {/* Mobile Profile */}
            {user ? (
              <div className="flex md:hidden items-center">
                <DropdownMenu
                  open={isUserMenuOpenMobile}
                  onOpenChange={(open) => {
                    setIsUserMenuOpenMobile(open)
                    if (open) setIsUserMenuOpenDesktop(false)
                  }}
                >
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

                  {/* Profile dropdown content */}
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
                      <Link href="/wishlist" className="cursor-pointer flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Saved Items
                      </Link>
                    </DropdownMenuItem>
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
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                      Account Roles
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'buyer' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleAccountTypeSwitch('buyer')}
                    >
                      <ShoppingCart className="w-4 h-4 text-white hover:text-black" />
                      <span>Buyer Mode</span>
                      {profile?.account_type === 'buyer' && <CheckCircle className="w-4 ml-auto text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`cursor-pointer flex items-center gap-2 ${profile?.account_type === 'business' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleAccountTypeSwitch('business')}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Business Mode</span>
                      {profile?.account_type === 'business' && <CheckCircle className="w-4 ml-auto text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (measured via ref) */}
        {isSearchOpen && (
          <div ref={mobileSearchRef} className="md:hidden pb-4 search-container">
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

        {/* === MOBILE NAV PANEL === */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0, y: isSearchOpen ? mobileSearchHeight : 0 }}
                animate={{ opacity: 0.45, y: isSearchOpen ? mobileSearchHeight : 0 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{
                  opacity: { duration: 0.18 },
                  y: { type: "spring", stiffness: 220, damping: 26 }
                }}
                className="fixed left-0 right-0 z-30 md:hidden bg-black/60 mt-4"
                onClick={closeMobileNav}
                aria-hidden="true"
                style={{ top: `${HEADER_HEIGHT_PX}px`, bottom: 0 }}
              />

              {/* Side Bar */}
              <motion.div
                key="mobile-sidebar"
                initial={{ x: '-100%', y: isSearchOpen ? mobileSearchHeight : 0 }}
                animate={{ x: 0, y: isSearchOpen ? mobileSearchHeight : 0 }}
                exit={{ x: '-100%', y: isSearchOpen ? mobileSearchHeight : 0 }}
                transition={{
                  x: { type: "tween", duration: 0.22 },
                  y: { type: "spring", stiffness: 220, damping: 26 }
                }}
                className="fixed left-0 md:hidden w-3/4 max-w-xs bg-[#0c1d14] shadow-xl overflow-y-auto z-40 mt-4"
                style={{ top: `${HEADER_HEIGHT_PX}px`, bottom: 0 }}
                aria-label="Mobile navigation"
              >
                {/* Nav content only */}
                <div className="flex flex-col px-2 pt-4 pb-6 space-y-2 text-sm">
                  {/* Community collapsible */}
                  <Collapsible open={mobileCommunityOpen} onOpenChange={handleMobileToggle('community')} className="w-full">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-foreground hover:bg-accent hover:text-black font-medium text-white">
                      <div className="flex items-center gap-3 md:gap-2">
                        <Users className="w-4 h-4" />
                        <span>Communities</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileCommunityOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pl-4 pt-2">
                      <Link href="/community" onClick={closeMobileNav} className="block px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Social Feed</div>
                      </Link>
                      <Link href="/community/my-friends" onClick={closeMobileNav} className="block px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <div className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> My Friends</div>
                      </Link>
                      <Link href="/community/my-communities" onClick={closeMobileNav} className="block px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> My Communities</div>
                      </Link>
                      <Link href="/community/my-alkebulan" onClick={closeMobileNav} className="block px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> My Alkebulan</div>
                      </Link>
                      <Link href="/messages" onClick={closeMobileNav} className="block px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Messenger</div>
                      </Link>
                      <Link href="/community/events" onClick={closeMobileNav} className="block px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Events</div>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Marketplace collapsible */}
                  <Collapsible open={mobileMarketplaceOpen} onOpenChange={handleMobileToggle('marketplace')} className="w-full">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-foreground hover:bg-accent font-medium hover:text-black text-white">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>Marketplace</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileMarketplaceOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pl-4 pt-2">
                      <Link href="/marketplace" onClick={closeMobileNav} className="px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white flex gap-3 items-center">
                      <Store className="w-4 h-4"/>
                        Browse Products
                      </Link>
                      <Link href="/marketplace/companies" onClick={closeMobileNav} className="px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white flex gap-3 items-center">
                      <Building2 className="w-4 h-4" />
                        All Companies
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Growth collapsible */}
                  <Collapsible open={mobileGrowthOpen} onOpenChange={handleMobileToggle('growth')} className="w-full">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-foreground hover:bg-accent font-medium hover:text-black text-white">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Growth</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileGrowthOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pl-4 pt-2">
                      <Link href="/growth/daily-planner" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                        <ClipboardList className="w-4 h-4" />
                        Daily Planner
                      </Link>

                      <Link href="/growth/progress" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <TrendingUp className="w-4 h-4" />
                      Progress
                      </Link>
                      <Link href="/growth/journey" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <Map className="w-4 h-4" />
                      Journey
                      </Link>
                      <Link href="/growth/learning" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <BookOpen className="w-4 h-4" />
                      Learning Hub
                      </Link>
                      <Link href="/growth/mentorship" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <Users className="w-4 h-4" />
                      Mentorship
                      </Link>
                      <Link href="/growth/mentorship" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <Sparkles className="w-4 h-4" />
                      Manifest Lab
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Investing collapsible */}
                  <Collapsible open={mobileInvestingOpen} onOpenChange={handleMobileToggle('investing')} className="w-full">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-foreground hover:bg-accent font-medium hover:text-black text-white">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Investing</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileInvestingOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pl-4 pt-2">
                      <Link href="/funding" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <Coins className="w-4 h-4" />
                      Funding
                      </Link>
                      <Link href="/investing/my-investments" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <BarChart3 className="w-4 h-4" />
                      Investor Dashboard
                      </Link>
                      <Link href="/investing/my-investments" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <BarChart3 className="w-4 h-4" />
                      My Investments
                      </Link>
                      <Link href="/investing/more-projects" onClick={closeMobileNav} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                      <FolderOpen className="w-4 h-4" />
                      More Projects
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Optional quick links */}
                  <div className="pt-2 border-t border-border mt-2">
                    <Link onClick={closeMobileNav} href="/learning" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                    <BookIcon className="w-4 h-4"/>
                    Learning</Link>
                    <Link onClick={closeMobileNav} href="/marketplace" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-black text-white">
                    <StoreIcon className="w-4 h-4"/>
                    Marketplace</Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </nav>
  )
}

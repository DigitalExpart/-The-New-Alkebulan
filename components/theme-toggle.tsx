"use client"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Get the actual theme being displayed (system resolves to light/dark)
  const currentTheme = resolvedTheme || theme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200"
        >
          {currentTheme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300 text-white" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="cursor-pointer flex items-center gap-2 hover:bg-accent"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="cursor-pointer flex items-center gap-2 hover:bg-accent"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="cursor-pointer flex items-center gap-2 hover:bg-accent"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// New simplified component for use within other dropdown menus
export function ThemeToggleDropdownItems() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <DropdownMenuItem 
        onClick={() => setTheme("light")} 
        className="cursor-pointer flex items-center gap-2 hover:bg-accent"
      >
        <Sun className="h-4 w-4" />
        <span>Light Theme</span>
        {theme === "light" && <span className="ml-auto text-xs text-primary">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => setTheme("dark")} 
        className="cursor-pointer flex items-center gap-2 hover:bg-accent"
      >
        <Moon className="h-4 w-4" />
        <span>Dark Theme</span>
        {theme === "dark" && <span className="ml-auto text-xs text-primary">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => setTheme("system")} 
        className="cursor-pointer flex items-center gap-2 hover:bg-accent"
      >
        <Monitor className="h-4 w-4" />
        <span>System Theme</span>
        {theme === "system" && <span className="ml-auto text-xs text-primary">✓</span>}
      </DropdownMenuItem>
    </>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AnimatedSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function AnimatedSearch({ onSearch, placeholder = "Search...", className }: AnimatedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setQuery("")
      setIsExpanded(false)
    }
  }

  const handleClose = () => {
    setQuery("")
    setIsExpanded(false)
  }

  return (
    <div className={cn("relative", className)}>
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-[hsl(var(--navbar-text))] hover:bg-[hsl(var(--navbar-hover))] p-2"
        >
          <Search className="w-4 h-4" />
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-64 pr-8 text-sm"
              onBlur={() => {
                if (!query.trim()) {
                  setIsExpanded(false)
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

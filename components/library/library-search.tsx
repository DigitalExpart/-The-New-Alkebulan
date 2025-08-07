"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface LibrarySearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder?: string
}

export function LibrarySearch({ searchQuery, onSearchChange, placeholder = "Search library..." }: LibrarySearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localQuery)
  }

  const handleClear = () => {
    setLocalQuery("")
    onSearchChange("")
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-10 pr-20 bg-white dark:bg-green-800 border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400"
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700"
        >
          Search
        </Button>
      </div>
    </form>
  )
}

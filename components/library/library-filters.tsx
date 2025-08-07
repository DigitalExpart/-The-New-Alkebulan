"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X, Filter } from "lucide-react"
import { format } from "date-fns"
import type { LibraryFilters, Topic, FileType, DateRange, SortOption } from "@/types/library"
import { topicLabels, fileTypeLabels } from "@/data/library-content"
import { cn } from "@/lib/utils"

interface LibraryFiltersProps {
  filters: LibraryFilters
  onFiltersChange: (filters: LibraryFilters) => void
  resultCount: number
  isLoading: boolean
}

export function LibraryFiltersComponent({ filters, onFiltersChange, resultCount, isLoading }: LibraryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTopicChange = (topic: Topic, checked: boolean) => {
    const newTopics = checked ? [...filters.topics, topic] : filters.topics.filter((t) => t !== topic)

    onFiltersChange({ ...filters, topics: newTopics })
  }

  const handleFileTypeChange = (fileType: FileType, checked: boolean) => {
    const newFileTypes = checked ? [...filters.fileTypes, fileType] : filters.fileTypes.filter((ft) => ft !== fileType)

    onFiltersChange({ ...filters, fileTypes: newFileTypes })
  }

  const handleDateRangeChange = (dateRange: DateRange) => {
    onFiltersChange({
      ...filters,
      dateRange,
      customDateStart: undefined,
      customDateEnd: undefined,
    })
  }

  const handleCustomDateChange = (start?: Date, end?: Date) => {
    onFiltersChange({
      ...filters,
      dateRange: "custom",
      customDateStart: start,
      customDateEnd: end,
    })
  }

  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      topics: [],
      fileTypes: [],
      dateRange: "this-month",
      sortBy: "most-popular",
      searchQuery: filters.searchQuery,
    })
  }

  const getActiveFilterCount = () => {
    return filters.topics.length + filters.fileTypes.length + (filters.dateRange !== "this-month" ? 1 : 0)
  }

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-green-900 border-r border-green-200 dark:border-green-700">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 border-b border-green-200 dark:border-green-700">
        <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </span>
        </Button>
      </div>

      {/* Filter Content */}
      <div className={cn("p-4 space-y-6", "lg:block", isOpen ? "block" : "hidden lg:block")}>
        {/* Results Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600 dark:text-green-400">
            {isLoading ? "Loading..." : `${resultCount} results`}
          </span>
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-green-600 hover:text-green-700">
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                  {topicLabels[topic]}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleTopicChange(topic, false)} />
                </Badge>
              ))}
              {filters.fileTypes.map((fileType) => (
                <Badge key={fileType} variant="secondary" className="flex items-center gap-1">
                  {fileTypeLabels[fileType]}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFileTypeChange(fileType, false)} />
                </Badge>
              ))}
              {filters.dateRange !== "this-month" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.dateRange === "custom" ? "Custom Date" : filters.dateRange}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateRangeChange("this-month")} />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most-popular">Most Popular</SelectItem>
              <SelectItem value="most-views">Most Views</SelectItem>
              <SelectItem value="best-reviewed">Best Reviewed</SelectItem>
              <SelectItem value="seen-before">Seen Before</SelectItem>
              <SelectItem value="not-seen-before">Not Seen Before</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topics Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Filter by Topic</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(topicLabels).map(([topic, label]) => (
              <div key={topic} className="flex items-center space-x-2">
                <Checkbox
                  id={topic}
                  checked={filters.topics.includes(topic as Topic)}
                  onCheckedChange={(checked) => handleTopicChange(topic as Topic, checked as boolean)}
                />
                <Label htmlFor={topic} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* File Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Filter by File Type</Label>
          <div className="space-y-2">
            {Object.entries(fileTypeLabels).map(([fileType, label]) => (
              <div key={fileType} className="flex items-center space-x-2">
                <Checkbox
                  id={fileType}
                  checked={filters.fileTypes.includes(fileType as FileType)}
                  onCheckedChange={(checked) => handleFileTypeChange(fileType as FileType, checked as boolean)}
                />
                <Label htmlFor={fileType} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Filter by Date Range</Label>
          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {filters.dateRange === "custom" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.customDateStart && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.customDateStart ? format(filters.customDateStart, "PPP") : <span>Start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.customDateStart}
                      onSelect={(date) => handleCustomDateChange(date, filters.customDateEnd)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.customDateEnd && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.customDateEnd ? format(filters.customDateEnd, "PPP") : <span>End date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.customDateEnd}
                      onSelect={(date) => handleCustomDateChange(filters.customDateStart, date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

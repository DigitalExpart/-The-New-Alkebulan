"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

export function ThemePreview() {
  const { theme } = useTheme()
  const [testValue, setTestValue] = useState("")

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Theme Preview</h1>
            <p className="text-muted-foreground mt-2">
              Test all UI components in different themes. Current theme: <Badge variant="outline">{theme}</Badge>
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Showcase - Matching the image colors */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette - Matching Image Design</CardTitle>
            <CardDescription>Dark forest green background with white text and gold accents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-background border-2 border-border rounded flex items-center justify-center">
                  <span className="text-xs font-medium">Background</span>
                </div>
                <p className="text-xs text-center">Dark Forest Green</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-foreground rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-background">Foreground</span>
                </div>
                <p className="text-xs text-center">White Text</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-[hsl(var(--accent))] rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-[hsl(var(--accent-foreground))]">Accent</span>
                </div>
                <p className="text-xs text-center">Gold Yellow</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-secondary rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-secondary-foreground">Secondary</span>
                </div>
                <p className="text-xs text-center">Dark Green</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Style - Horizontal Layout</CardTitle>
            <CardDescription>Matching the horizontal navigation from the image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-[hsl(var(--navbar-bg))] p-4 rounded-lg">
              <div className="flex flex-wrap gap-6 text-sm">
                <span className="text-[hsl(var(--navbar-text))]">Growth</span>
                <span className="text-[hsl(var(--navbar-text))]">Community</span>
                <span className="text-[hsl(var(--navbar-text))]">Marketplace</span>
                <span className="text-[hsl(var(--navbar-text))]">Finance</span>
                <span className="text-[hsl(var(--navbar-text))]">Projects</span>
                <span className="text-[hsl(var(--navbar-text))]">Business</span>
                <span className="text-[hsl(var(--navbar-accent))] font-semibold">Governance</span>
                <span className="text-[hsl(var(--navbar-text))]">Health</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Card</CardTitle>
              <CardDescription>This is a basic card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card content goes here. This demonstrates how text appears in the current theme.
              </p>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Testing form inputs and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Test Input</Label>
                <Input
                  id="test-input"
                  placeholder="Enter some text..."
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="test-switch" />
                <Label htmlFor="test-switch">Enable notifications</Label>
              </div>
            </CardContent>
          </Card>

          {/* Buttons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles with gold accents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90">
                Gold Accent Button
              </Button>
              <Button variant="secondary" className="w-full">
                Secondary Button
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
              >
                Gold Outline Button
              </Button>
              <Button variant="ghost" className="w-full">
                Ghost Button
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section Style</CardTitle>
            <CardDescription>Large text layout matching the image design</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 space-y-6">
              <h2 className="text-4xl font-bold">True ownership</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your Alkebulan name code is 100% yours. No intermediaries, no bureaucracy. It's your property -
                uncensored and irrevocable.
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90">
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Information */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
            <CardDescription>Details about the current color scheme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Design Inspiration:</h4>
                <p className="text-sm text-muted-foreground">
                  Based on the provided image with dark forest green background, white text, and gold yellow accents
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Color Values:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Background: hsl(120 100% 8%) - Very dark forest green</li>
                  <li>Text: hsl(0 0% 98%) - Pure white</li>
                  <li>Accent: hsl(45 100% 60%) - Gold yellow</li>
                  <li>Navigation: Horizontal layout with gold highlights</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Current Active Theme:</h4>
                <Badge variant="outline" className="capitalize">
                  {theme}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

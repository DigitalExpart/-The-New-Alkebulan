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

export default function ThemeTestPage() {
  const { theme, resolvedTheme } = useTheme()
  const [testValue, setTestValue] = useState("")

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Theme Test Page</h1>
            <p className="text-muted-foreground mt-2">
              Test all UI components in different themes. Current theme: <Badge variant="outline">{theme}</Badge>
              {theme === "system" && (
                <span className="ml-2 text-sm text-muted-foreground">
                  (Resolved: {resolvedTheme})
                </span>
              )}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>
              See how colors change between light and dark themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-background border border-border rounded-lg"></div>
                <p className="text-sm font-medium">Background</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-card border border-border rounded-lg"></div>
                <p className="text-sm font-medium">Card</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">Primary</span>
                </div>
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-secondary-foreground font-bold">Secondary</span>
                </div>
                <p className="text-sm font-medium">Secondary</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>
              Test form components in different themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different button variants and states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards and Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Card</CardTitle>
              <CardDescription>
                This is a sample card with some content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This card demonstrates how content looks in different themes.
                The background, text, and border colors will change automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>
                More content to test theme switching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="default">Default Badge</Badge>
                <Badge variant="secondary">Secondary Badge</Badge>
                <Badge variant="outline">Outline Badge</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theme Information */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
            <CardDescription>
              Current theme settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Current Theme:</strong> {theme}</p>
              <p><strong>Resolved Theme:</strong> {resolvedTheme}</p>
              <p><strong>Storage Key:</strong> the-new-alkebulan-theme</p>
              <p><strong>System Theme Enabled:</strong> Yes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

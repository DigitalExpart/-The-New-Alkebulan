"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Key, Bot, Globe, Shield } from "lucide-react"
import { useAIAssistant } from "./ai-assistant-provider"

export function AISettingsDialog() {
  const { apiKey, provider, language, isEnabled, setApiKey, setProvider, setLanguage, setIsEnabled } = useAIAssistant()
  const [tempApiKey, setTempApiKey] = useState(apiKey || "")
  const [tempProvider, setTempProvider] = useState<"openai" | "mistral" | "">(provider || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    if (tempApiKey) {
      setApiKey(tempApiKey)
    }
    if (tempProvider) {
      setProvider(tempProvider as "openai" | "mistral")
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI assistant with your preferred provider and API key for enhanced functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable/Disable AI */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant Status
              </CardTitle>
              <CardDescription>Enable or disable the AI assistant functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="ai-enabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
                <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Configuration
              </CardTitle>
              <CardDescription>Choose your AI provider and enter your API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">AI Provider</Label>
                <Select value={tempProvider} onValueChange={(value) => setTempProvider(value as "openai" | "mistral")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored locally and never shared. It's only used to communicate with your chosen AI
                  provider.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language Preferences
              </CardTitle>
              <CardDescription>Set your preferred language for AI responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="language">Response Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          {tempProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {tempProvider === "openai" ? "OpenAI" : "Mistral AI"} Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tempProvider === "openai" ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Features:</strong> Chat, content summarization, image analysis, recommendations
                    </p>
                    <p>
                      <strong>Models:</strong> GPT-4 for text, GPT-4 Vision for image analysis
                    </p>
                    <p>
                      <strong>Get API Key:</strong>{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Features:</strong> Chat, content summarization, recommendations
                    </p>
                    <p>
                      <strong>Models:</strong> Mistral Large for text generation
                    </p>
                    <p>
                      <strong>Get API Key:</strong>{" "}
                      <a
                        href="https://console.mistral.ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Mistral AI Console
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      <em>Note: Image analysis not available with Mistral AI</em>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

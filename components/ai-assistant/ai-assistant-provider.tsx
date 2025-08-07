"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AIAssistantContextType {
  isEnabled: boolean
  apiKey: string | null
  provider: "openai" | "mistral" | null
  language: string
  setApiKey: (key: string) => void
  setProvider: (provider: "openai" | "mistral") => void
  setLanguage: (language: string) => void
  setIsEnabled: (enabled: boolean) => void
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [provider, setProvider] = useState<"openai" | "mistral" | null>(null)
  const [language, setLanguage] = useState("en")

  return (
    <AIAssistantContext.Provider
      value={{
        isEnabled,
        apiKey,
        provider,
        language,
        setApiKey,
        setProvider,
        setLanguage,
        setIsEnabled,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider")
  }
  return context
}

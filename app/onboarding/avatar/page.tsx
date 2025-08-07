"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AvatarSelection } from "@/components/avatar/avatar-selection"
import type { AvatarOption, AvatarCustomization } from "@/types/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AvatarDisplay } from "@/components/avatar/avatar-display"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

export default function AvatarOnboardingPage() {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [customization, setCustomization] = useState<AvatarCustomization | null>(null)

  const handleAvatarSelect = (avatar: AvatarOption, customizationData?: AvatarCustomization) => {
    setSelectedAvatar(avatar)
    if (customizationData) {
      setCustomization(customizationData)
    }
  }

  const handleContinue = () => {
    if (selectedAvatar) {
      // Save avatar to user profile (implement your save logic here)
      console.log("Saving avatar:", selectedAvatar, customization)

      // Navigate to next onboarding step or dashboard
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Welcome to Diaspora Market Hub!</h1>
          <p className="text-lg text-gray-600">Let's create your avatar to represent you in our community</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm text-gray-600">Profile Info</span>
            </div>
            <div className="w-8 h-0.5 bg-green-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-green-800">Choose Avatar</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Preferences</span>
            </div>
          </div>
        </div>

        {/* Avatar Selection */}
        <AvatarSelection onAvatarSelect={handleAvatarSelect} selectedAvatarId={selectedAvatar?.id} />

        {/* Selected Avatar Preview */}
        {selectedAvatar && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <AvatarDisplay avatar={selectedAvatar} size="lg" />
                  <div>
                    <h3 className="font-semibold text-green-800">Your Selected Avatar: {selectedAvatar.name}</h3>
                    <p className="text-sm text-gray-600">
                      From {selectedAvatar.region} • {selectedAvatar.gender}
                    </p>
                    {customization && <p className="text-xs text-green-600 mt-1">✨ Customized</p>}
                  </div>
                </div>
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedAvatar} className="bg-green-600 hover:bg-green-700">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AvatarOption, AvatarCustomization } from "@/types/avatar"
import { AVATAR_PRESETS } from "@/data/avatar-presets"
import { AvatarDisplay } from "./avatar-display"
import { AvatarCustomizationModal } from "./avatar-customization-modal"
import { Upload, Palette } from "lucide-react"

interface AvatarSelectionProps {
  onAvatarSelect: (avatar: AvatarOption, customization?: AvatarCustomization) => void
  selectedAvatarId?: string
}

export function AvatarSelection({ onAvatarSelect, selectedAvatarId }: AvatarSelectionProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false)

  const handleAvatarClick = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar)
    onAvatarSelect(avatar)
  }

  const handleCustomize = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar)
    setIsCustomizationOpen(true)
  }

  const handleCustomizationSave = (customization: AvatarCustomization) => {
    if (selectedAvatar) {
      const customizedAvatar = { ...selectedAvatar, ...customization }
      onAvatarSelect(customizedAvatar, customization)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-800 text-center">Choose Your Avatar</CardTitle>
          <p className="text-center text-gray-600">
            Select an avatar that represents you, then customize it to make it uniquely yours
          </p>
        </CardHeader>
        <CardContent>
          {/* Avatar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {AVATAR_PRESETS.map((avatar) => (
              <div key={avatar.id} className="text-center space-y-2">
                <button
                  onClick={() => handleAvatarClick(avatar)}
                  className={`relative group transition-all duration-200 ${
                    selectedAvatarId === avatar.id
                      ? "ring-4 ring-green-500 ring-offset-2 rounded-full"
                      : "hover:scale-105"
                  }`}
                >
                  <AvatarDisplay avatar={avatar} size="lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                <div>
                  <p className="font-medium text-sm text-green-800">{avatar.name}</p>
                  <p className="text-xs text-gray-500">{avatar.region}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {avatar.gender}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleCustomize(avatar)} className="w-full text-xs">
                  Customize
                </Button>
              </div>
            ))}
          </div>

          {/* Upload Option */}
          <div className="border-t pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Upload Your Own</h3>
                <p className="text-sm text-gray-600">Prefer to use your own image? Upload a photo instead</p>
              </div>
              <Button variant="outline" className="mt-2 bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Modal */}
      {selectedAvatar && (
        <AvatarCustomizationModal
          isOpen={isCustomizationOpen}
          onClose={() => setIsCustomizationOpen(false)}
          selectedAvatar={selectedAvatar}
          onSave={handleCustomizationSave}
        />
      )}
    </div>
  )
}

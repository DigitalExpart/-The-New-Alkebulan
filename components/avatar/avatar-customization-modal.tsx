"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type AvatarOption,
  type AvatarCustomization,
  SKIN_TONES,
  HAIRSTYLES,
  EXPRESSIONS,
  BACKGROUNDS,
} from "@/types/avatar"
import { AvatarDisplay } from "./avatar-display"
import { Palette, Scissors, Smile, ImageIcon } from "lucide-react"

interface AvatarCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedAvatar: AvatarOption
  onSave: (customization: AvatarCustomization) => void
}

export function AvatarCustomizationModal({ isOpen, onClose, selectedAvatar, onSave }: AvatarCustomizationModalProps) {
  const [customization, setCustomization] = useState<AvatarCustomization>({
    skinTone: selectedAvatar.skinTone,
    hairstyle: selectedAvatar.hairstyle,
    expression: selectedAvatar.expression,
    background: selectedAvatar.background,
  })

  const previewAvatar: AvatarOption = {
    ...selectedAvatar,
    ...customization,
  }

  const handleSave = () => {
    onSave(customization)
    onClose()
  }

  const handleReset = () => {
    setCustomization({
      skinTone: selectedAvatar.skinTone,
      hairstyle: selectedAvatar.hairstyle,
      expression: selectedAvatar.expression,
      background: selectedAvatar.background,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800">Customize Your Avatar</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-50 p-8 rounded-lg">
              <AvatarDisplay avatar={previewAvatar} size="xl" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-green-800">{selectedAvatar.name}</h3>
              <p className="text-sm text-gray-600">{selectedAvatar.region}</p>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <Tabs defaultValue="skin" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="skin" className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  Skin
                </TabsTrigger>
                <TabsTrigger value="hair" className="flex items-center gap-1">
                  <Scissors className="w-4 h-4" />
                  Hair
                </TabsTrigger>
                <TabsTrigger value="expression" className="flex items-center gap-1">
                  <Smile className="w-4 h-4" />
                  Face
                </TabsTrigger>
                <TabsTrigger value="background" className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Background
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skin" className="space-y-3">
                <h4 className="font-medium text-green-800">Choose Skin Tone</h4>
                <div className="grid grid-cols-3 gap-2">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setCustomization((prev) => ({ ...prev, skinTone: tone.id }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        customization.skinTone === tone.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full mx-auto mb-1" style={{ backgroundColor: tone.color }}></div>
                      <p className="text-xs text-center">{tone.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hair" className="space-y-3">
                <h4 className="font-medium text-green-800">Choose Hairstyle</h4>
                <div className="grid grid-cols-2 gap-2">
                  {HAIRSTYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCustomization((prev) => ({ ...prev, hairstyle: style.id }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        customization.hairstyle === style.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <p className="font-medium text-sm">{style.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {style.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expression" className="space-y-3">
                <h4 className="font-medium text-green-800">Choose Expression</h4>
                <div className="grid grid-cols-2 gap-2">
                  {EXPRESSIONS.map((expr) => (
                    <button
                      key={expr.id}
                      onClick={() => setCustomization((prev) => ({ ...prev, expression: expr.id }))}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        customization.expression === expr.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{expr.emoji}</div>
                      <p className="text-sm font-medium">{expr.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-3">
                <h4 className="font-medium text-green-800">Choose Background</h4>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setCustomization((prev) => ({ ...prev, background: bg.id }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        customization.background === bg.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="w-full h-8 rounded mb-2" style={{ background: bg.color }}></div>
                      <p className="text-xs text-center">{bg.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Save Avatar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

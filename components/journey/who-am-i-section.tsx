"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Edit3, Save, Camera } from "lucide-react"

interface WhoAmISectionProps {
  reflection: string
  lifeVision: string
  avatarImage?: string
  onSave: (data: { reflection: string; lifeVision: string; avatarImage?: string }) => void
}

export function WhoAmISection({ reflection, lifeVision, avatarImage, onSave }: WhoAmISectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localReflection, setLocalReflection] = useState(reflection)
  const [localLifeVision, setLocalLifeVision] = useState(lifeVision)
  const [localAvatarImage, setLocalAvatarImage] = useState(avatarImage)

  useEffect(() => {
    setLocalReflection(reflection)
    setLocalLifeVision(lifeVision)
    setLocalAvatarImage(avatarImage)
  }, [reflection, lifeVision, avatarImage])

  const handleSave = () => {
    onSave({
      reflection: localReflection,
      lifeVision: localLifeVision,
      avatarImage: localAvatarImage,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalReflection(reflection)
    setLocalLifeVision(lifeVision)
    setLocalAvatarImage(avatarImage)
    setIsEditing(false)
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-amber-900 dark:text-amber-100">Who Am I</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-amber-200 dark:border-amber-700">
              <AvatarImage src={localAvatarImage || "/placeholder.svg"} alt="Personal Avatar" />
              <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 text-2xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-600"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
            Your symbolic representation or personal image
          </p>
        </div>

        {/* Self Reflection */}
        <div className="space-y-3">
          <Label htmlFor="reflection" className="text-amber-800 dark:text-amber-200 font-medium">
            Self Reflection
          </Label>
          {isEditing ? (
            <Textarea
              id="reflection"
              value={localReflection}
              onChange={(e) => setLocalReflection(e.target.value)}
              placeholder="Who are you at your core? What defines you? What are your deepest truths about yourself?"
              className="min-h-[120px] bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-amber-700 focus:border-amber-400 dark:focus:border-amber-500"
            />
          ) : (
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200 dark:border-amber-700 min-h-[120px]">
              {reflection ? (
                <p className="text-amber-900 dark:text-amber-100 leading-relaxed">{reflection}</p>
              ) : (
                <p className="text-amber-600 dark:text-amber-400 italic">Click edit to share your self-reflection...</p>
              )}
            </div>
          )}
        </div>

        {/* Life Vision */}
        <div className="space-y-3">
          <Label htmlFor="lifeVision" className="text-amber-800 dark:text-amber-200 font-medium">
            Life Vision & Purpose
          </Label>
          {isEditing ? (
            <Textarea
              id="lifeVision"
              value={localLifeVision}
              onChange={(e) => setLocalLifeVision(e.target.value)}
              placeholder="What is your vision for your life? What purpose drives you? What legacy do you want to create?"
              className="min-h-[120px] bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-amber-700 focus:border-amber-400 dark:focus:border-amber-500"
            />
          ) : (
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200 dark:border-amber-700 min-h-[120px]">
              {lifeVision ? (
                <p className="text-amber-900 dark:text-amber-100 leading-relaxed">{lifeVision}</p>
              ) : (
                <p className="text-amber-600 dark:text-amber-400 italic">Click edit to define your life vision...</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-950 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

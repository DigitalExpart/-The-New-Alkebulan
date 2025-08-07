"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Crown, Shield, Edit3, Save, Info } from "lucide-react"
import { sovereigntyPrinciples } from "@/data/journey-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SovereigntySectionProps {
  reflection: string
  isDeclaredSovereign: boolean
  declarationDate?: Date
  onSave: (data: { reflection: string; isDeclaredSovereign: boolean; declarationDate?: Date }) => void
}

export function SovereigntySection({
  reflection,
  isDeclaredSovereign,
  declarationDate,
  onSave,
}: SovereigntySectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localReflection, setLocalReflection] = useState(reflection)
  const [localIsDeclared, setLocalIsDeclared] = useState(isDeclaredSovereign)

  const handleSave = () => {
    const newDeclarationDate = localIsDeclared && !isDeclaredSovereign ? new Date() : declarationDate
    onSave({
      reflection: localReflection,
      isDeclaredSovereign: localIsDeclared,
      declarationDate: newDeclarationDate,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalReflection(reflection)
    setLocalIsDeclared(isDeclaredSovereign)
    setIsEditing(false)
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-purple-900 dark:text-purple-100">Sovereign Being</CardTitle>
              {isDeclaredSovereign && declarationDate && (
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Declared: {declarationDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Understanding Sovereignty
                  </DialogTitle>
                  <DialogDescription>
                    Personal sovereignty is about recognizing your inherent authority over your own life.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {sovereigntyPrinciples.map((principle) => (
                    <div key={principle.id} className="flex gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <span className="text-2xl">{principle.icon}</span>
                      <div>
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">{principle.title}</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{principle.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sovereignty Declaration */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="sovereignty-declaration"
              checked={localIsDeclared}
              onCheckedChange={(checked) => setLocalIsDeclared(!!checked)}
              disabled={!isEditing}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Label
              htmlFor="sovereignty-declaration"
              className="text-purple-800 dark:text-purple-200 font-medium cursor-pointer"
            >
              I declare myself a sovereign being
            </Label>
          </div>

          {isDeclaredSovereign && (
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Shield className="h-3 w-3 mr-1" />
                Sovereign Being
              </Badge>
              {declarationDate && (
                <span className="text-sm text-purple-600 dark:text-purple-400">
                  Since {declarationDate.toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
            By declaring sovereignty, you acknowledge your complete authority over your own life, choices, and destiny.
            This is a symbolic recognition of your inherent freedom and responsibility.
          </p>
        </div>

        {/* Personal Reflection on Sovereignty */}
        <div className="space-y-3">
          <Label htmlFor="sovereignty-reflection" className="text-purple-800 dark:text-purple-200 font-medium">
            What does sovereignty mean to you?
          </Label>
          {isEditing ? (
            <Textarea
              id="sovereignty-reflection"
              value={localReflection}
              onChange={(e) => setLocalReflection(e.target.value)}
              placeholder="Reflect on what personal sovereignty means in your life. How do you exercise your authority? What freedoms are most important to you?"
              className="min-h-[120px] bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
            />
          ) : (
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200 dark:border-purple-700 min-h-[120px]">
              {reflection ? (
                <p className="text-purple-900 dark:text-purple-100 leading-relaxed">{reflection}</p>
              ) : (
                <p className="text-purple-600 dark:text-purple-400 italic">
                  Click edit to reflect on what sovereignty means to you...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

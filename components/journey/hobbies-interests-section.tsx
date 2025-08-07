"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Plus, X, Edit3, Save } from "lucide-react"
import { hobbyCategories } from "@/data/journey-data"

interface HobbiesInterestsSectionProps {
  selectedHobbies: string[]
  customHobbies: string[]
  onSave: (data: { selected: string[]; custom: string[] }) => void
}

export function HobbiesInterestsSection({ selectedHobbies, customHobbies, onSave }: HobbiesInterestsSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localSelected, setLocalSelected] = useState<string[]>(selectedHobbies)
  const [localCustom, setLocalCustom] = useState<string[]>(customHobbies)
  const [newCustomHobby, setNewCustomHobby] = useState("")

  const handleToggleHobby = (hobby: string) => {
    if (localSelected.includes(hobby)) {
      setLocalSelected(localSelected.filter((h) => h !== hobby))
    } else {
      setLocalSelected([...localSelected, hobby])
    }
  }

  const handleAddCustomHobby = () => {
    if (newCustomHobby.trim() && !localCustom.includes(newCustomHobby.trim())) {
      setLocalCustom([...localCustom, newCustomHobby.trim()])
      setNewCustomHobby("")
    }
  }

  const handleRemoveCustomHobby = (hobby: string) => {
    setLocalCustom(localCustom.filter((h) => h !== hobby))
  }

  const handleSave = () => {
    onSave({
      selected: localSelected,
      custom: localCustom,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalSelected(selectedHobbies)
    setLocalCustom(customHobbies)
    setNewCustomHobby("")
    setIsEditing(false)
  }

  const allHobbies = [...localSelected, ...localCustom]

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-green-900 dark:text-green-100">Hobbies & Interests</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Hobbies Display */}
        {!isEditing && allHobbies.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-green-800 dark:text-green-200 font-medium">Your Interests</h4>
            <div className="flex flex-wrap gap-2">
              {allHobbies.map((hobby, index) => (
                <Badge
                  key={index}
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1"
                >
                  {hobby}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Editing Mode */}
        {isEditing && (
          <Tabs defaultValue={hobbyCategories[0].id} className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
              {hobbyCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs p-2">
                  <span className="mr-1">{category.icon}</span>
                  <span className="hidden sm:inline">{category.name.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {hobbyCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-green-800 dark:text-green-200 font-semibold">{category.name}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {category.hobbies.map((hobby) => (
                    <Button
                      key={hobby}
                      variant={localSelected.includes(hobby) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleHobby(hobby)}
                      className={`justify-start text-left h-auto py-2 px-3 ${
                        localSelected.includes(hobby)
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-950"
                      }`}
                    >
                      {hobby}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Custom Hobbies */}
        {isEditing && (
          <div className="space-y-4">
            <h4 className="text-green-800 dark:text-green-200 font-medium">Add Custom Interests</h4>
            <div className="flex gap-2">
              <Input
                value={newCustomHobby}
                onChange={(e) => setNewCustomHobby(e.target.value)}
                placeholder="Enter a custom hobby or interest..."
                className="flex-1 bg-white/50 dark:bg-gray-800/50 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomHobby()}
              />
              <Button
                onClick={handleAddCustomHobby}
                disabled={!newCustomHobby.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display Custom Hobbies */}
            {localCustom.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-green-700 dark:text-green-300">Your Custom Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {localCustom.map((hobby, index) => (
                    <Badge
                      key={index}
                      className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 flex items-center gap-2"
                    >
                      {hobby}
                      <button
                        onClick={() => handleRemoveCustomHobby(hobby)}
                        className="hover:bg-green-300 dark:hover:bg-green-700 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No hobbies selected yet */}
        {!isEditing && allHobbies.length === 0 && (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 dark:text-green-400">
              Click edit to select your hobbies and interests. This helps us understand what brings you joy and
              fulfillment.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Interests
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-950 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

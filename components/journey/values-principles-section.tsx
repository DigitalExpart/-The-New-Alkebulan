"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { ViewIcon as Values, GripVertical, Plus, X, Edit3, Save, Star } from "lucide-react"
import { coreValues } from "@/data/journey-data"
import type { CoreValue } from "@/types/journey"

interface ValuesPrinciplesSectionProps {
  selectedValues: CoreValue[]
  rankedValues: string[]
  customValues: string[]
  reflection: string
  onSave: (data: {
    selected: CoreValue[]
    ranked: string[]
    customValues: string[]
    reflection: string
  }) => void
}

export function ValuesPrinciplesSection({
  selectedValues,
  rankedValues,
  customValues,
  reflection,
  onSave,
}: ValuesPrinciplesSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localSelected, setLocalSelected] = useState<CoreValue[]>(selectedValues)
  const [localRanked, setLocalRanked] = useState<string[]>(rankedValues)
  const [localCustom, setLocalCustom] = useState<string[]>(customValues)
  const [localReflection, setLocalReflection] = useState(reflection)
  const [newCustomValue, setNewCustomValue] = useState("")

  const valuesByCategory = coreValues.reduce(
    (acc, value) => {
      if (!acc[value.category]) {
        acc[value.category] = []
      }
      acc[value.category].push(value)
      return acc
    },
    {} as Record<string, CoreValue[]>,
  )

  const handleToggleValue = (value: CoreValue) => {
    if (localSelected.find((v) => v.id === value.id)) {
      setLocalSelected(localSelected.filter((v) => v.id !== value.id))
      setLocalRanked(localRanked.filter((id) => id !== value.id))
    } else {
      setLocalSelected([...localSelected, value])
    }
  }

  const handleAddCustomValue = () => {
    if (newCustomValue.trim() && !localCustom.includes(newCustomValue.trim())) {
      setLocalCustom([...localCustom, newCustomValue.trim()])
      setNewCustomValue("")
    }
  }

  const handleRemoveCustomValue = (value: string) => {
    setLocalCustom(localCustom.filter((v) => v !== value))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(localRanked)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLocalRanked(items)
  }

  const handleAddToRanking = (valueId: string) => {
    if (!localRanked.includes(valueId)) {
      setLocalRanked([...localRanked, valueId])
    }
  }

  const handleRemoveFromRanking = (valueId: string) => {
    setLocalRanked(localRanked.filter((id) => id !== valueId))
  }

  const handleSave = () => {
    onSave({
      selected: localSelected,
      ranked: localRanked,
      customValues: localCustom,
      reflection: localReflection,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalSelected(selectedValues)
    setLocalRanked(rankedValues)
    setLocalCustom(customValues)
    setLocalReflection(reflection)
    setNewCustomValue("")
    setIsEditing(false)
  }

  const getValueById = (id: string) => {
    return (
      localSelected.find((v) => v.id === id) || {
        id,
        name: localCustom.find((c) => c === id) || id,
        icon: "⭐",
        description: "Custom value",
      }
    )
  }

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-full">
              <Values className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <CardTitle className="text-rose-900 dark:text-rose-100">Values & Principles</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-900"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Mode */}
        {!isEditing && (
          <div className="space-y-6">
            {/* Top 5 Values */}
            {localRanked.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-rose-800 dark:text-rose-200 font-medium">My Top Values</h4>
                </div>
                <div className="space-y-2">
                  {localRanked.slice(0, 5).map((valueId, index) => {
                    const value = getValueById(valueId)
                    return (
                      <div
                        key={valueId}
                        className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-rose-200 dark:border-rose-700"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full text-rose-600 dark:text-rose-400 font-bold">
                          {index + 1}
                        </div>
                        <span className="text-2xl">{value.icon}</span>
                        <div>
                          <h5 className="font-medium text-rose-900 dark:text-rose-100">{value.name}</h5>
                          {value.description && (
                            <p className="text-sm text-rose-700 dark:text-rose-300">{value.description}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Selected Values */}
            {localSelected.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-rose-800 dark:text-rose-200 font-medium">All My Values</h4>
                <div className="flex flex-wrap gap-2">
                  {localSelected.map((value) => (
                    <Badge
                      key={value.id}
                      className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 px-3 py-1 flex items-center gap-1"
                    >
                      <span>{value.icon}</span>
                      {value.name}
                    </Badge>
                  ))}
                  {localCustom.map((value) => (
                    <Badge
                      key={value}
                      className="bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-200 px-3 py-1 flex items-center gap-1"
                    >
                      <span>⭐</span>
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reflection */}
            {reflection && (
              <div className="space-y-3">
                <h4 className="text-rose-800 dark:text-rose-200 font-medium">My Reflection on Values</h4>
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-rose-200 dark:border-rose-700">
                  <p className="text-rose-900 dark:text-rose-100 leading-relaxed">{reflection}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editing Mode */}
        {isEditing && (
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="select">Select Values</TabsTrigger>
              <TabsTrigger value="rank">Rank Top 5</TabsTrigger>
              <TabsTrigger value="reflect">Reflect</TabsTrigger>
            </TabsList>

            {/* Select Values Tab */}
            <TabsContent value="select" className="space-y-4">
              <div className="space-y-4">
                {Object.entries(valuesByCategory).map(([category, values]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-rose-800 dark:text-rose-200 font-medium capitalize">
                      {category.replace("-", " ")} Values
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {values.map((value) => (
                        <Button
                          key={value.id}
                          variant={localSelected.find((v) => v.id === value.id) ? "default" : "outline"}
                          onClick={() => handleToggleValue(value)}
                          className={`justify-start text-left h-auto py-3 px-4 ${
                            localSelected.find((v) => v.id === value.id)
                              ? "bg-rose-600 hover:bg-rose-700 text-white"
                              : "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-950"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{value.icon}</span>
                            <div>
                              <div className="font-medium">{value.name}</div>
                              <div className="text-xs opacity-80">{value.description}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom Values */}
                <div className="space-y-3">
                  <h4 className="text-rose-800 dark:text-rose-200 font-medium">Add Custom Values</h4>
                  <div className="flex gap-2">
                    <Input
                      value={newCustomValue}
                      onChange={(e) => setNewCustomValue(e.target.value)}
                      placeholder="Enter a custom value..."
                      className="flex-1 bg-white/50 dark:bg-gray-800/50 border-rose-200 dark:border-rose-700 focus:border-rose-400 dark:focus:border-rose-500"
                      onKeyPress={(e) => e.key === "Enter" && handleAddCustomValue()}
                    />
                    <Button
                      onClick={handleAddCustomValue}
                      disabled={!newCustomValue.trim()}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {localCustom.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {localCustom.map((value) => (
                        <Badge
                          key={value}
                          className="bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-200 px-3 py-1 flex items-center gap-2"
                        >
                          ⭐ {value}
                          <button
                            onClick={() => handleRemoveCustomValue(value)}
                            className="hover:bg-rose-300 dark:hover:bg-rose-700 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Rank Values Tab */}
            <TabsContent value="rank" className="space-y-4">
              <div className="space-y-4">
                <p className="text-rose-700 dark:text-rose-300 text-sm">
                  Drag and drop to rank your top 5 most important values in order of priority.
                </p>

                {/* Available Values to Add */}
                <div className="space-y-3">
                  <h4 className="text-rose-800 dark:text-rose-200 font-medium">Available Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...localSelected,
                      ...localCustom.map((c) => ({ id: c, name: c, icon: "⭐", description: "Custom value" })),
                    ]
                      .filter((value) => !localRanked.includes(value.id))
                      .map((value) => (
                        <Button
                          key={value.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToRanking(value.id)}
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-950"
                        >
                          <span className="mr-1">{value.icon}</span>
                          {value.name}
                          <Plus className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Ranked Values */}
                {localRanked.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-rose-800 dark:text-rose-200 font-medium">Your Top Values (Drag to Reorder)</h4>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="ranked-values">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {localRanked.map((valueId, index) => {
                              const value = getValueById(valueId)
                              return (
                                <Draggable key={valueId} draggableId={valueId} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-rose-200 dark:border-rose-700"
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full text-rose-600 dark:text-rose-400 font-bold">
                                        {index + 1}
                                      </div>
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-rose-400" />
                                      </div>
                                      <span className="text-xl">{value.icon}</span>
                                      <div className="flex-1">
                                        <span className="font-medium text-rose-900 dark:text-rose-100">
                                          {value.name}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveFromRanking(valueId)}
                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Reflect Tab */}
            <TabsContent value="reflect" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="values-reflection" className="text-rose-800 dark:text-rose-200 font-medium">
                  Reflect on Your Values
                </Label>
                <Textarea
                  id="values-reflection"
                  value={localReflection}
                  onChange={(e) => setLocalReflection(e.target.value)}
                  placeholder="How do these values show up in your daily life? Which ones do you want to strengthen? How do they guide your decisions?"
                  className="min-h-[150px] bg-white/50 dark:bg-gray-800/50 border-rose-200 dark:border-rose-700 focus:border-rose-400 dark:focus:border-rose-500"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* No values selected yet */}
        {!isEditing && localSelected.length === 0 && localCustom.length === 0 && (
          <div className="text-center py-8">
            <Values className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <p className="text-rose-600 dark:text-rose-400">
              Click edit to select and rank your core values. Understanding your values helps guide important life
              decisions.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Values
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-950 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

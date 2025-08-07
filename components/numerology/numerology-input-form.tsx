"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, User, Sparkles } from "lucide-react"

interface NumerologyInputFormProps {
  onCalculate: (data: { fullName: string; birthDate: Date }) => void
  initialData?: { fullName: string; birthDate: Date }
}

export function NumerologyInputForm({ onCalculate, initialData }: NumerologyInputFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "")
  const [birthDate, setBirthDate] = useState(
    initialData?.birthDate ? initialData.birthDate.toISOString().split("T")[0] : "",
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fullName && birthDate) {
      onCalculate({
        fullName: fullName.trim(),
        birthDate: new Date(birthDate),
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">Discover Your Numbers</CardTitle>
        </div>
        <p className="text-purple-700 dark:text-purple-300">
          Enter your birth information to unlock the mysteries of your numerological profile
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <User className="h-4 w-4" />
              Full Name at Birth
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your complete birth name"
              className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
              required
            />
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Use the name exactly as it appears on your birth certificate
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Calendar className="h-4 w-4" />
              Date of Birth
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3"
            disabled={!fullName || !birthDate}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Calculate My Numbers
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

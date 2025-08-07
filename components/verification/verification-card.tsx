"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, MapPin, Scan, CheckCircle, Clock, Circle, ArrowRight } from "lucide-react"
import type { VerificationMethod } from "@/types/verification"

interface VerificationCardProps {
  method: VerificationMethod
  baseUrl: string
}

export function VerificationCard({ method, baseUrl }: VerificationCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = () => {
    switch (method.icon) {
      case "shield":
        return <Shield className="h-6 w-6" />
      case "calendar":
        return <Calendar className="h-6 w-6" />
      case "map-pin":
        return <MapPin className="h-6 w-6" />
      case "scan-face":
        return <Scan className="h-6 w-6" />
      default:
        return <Shield className="h-6 w-6" />
    }
  }

  const getStatusIcon = () => {
    switch (method.status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "not-started":
        return <Circle className="h-5 w-5 text-gray-400" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (method.status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        )
      case "not-started":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Not Started
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Not Started
          </Badge>
        )
    }
  }

  const getCardGradient = () => {
    switch (method.status) {
      case "verified":
        return "from-green-50 to-white dark:from-green-950/20 dark:to-gray-950"
      case "pending":
        return "from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-950"
      case "not-started":
        return "from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-950"
      default:
        return "from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-950"
    }
  }

  const getIconBackground = () => {
    switch (method.status) {
      case "verified":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      case "not-started":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <Link href={`${baseUrl}/${method.id}`}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`overflow-hidden border-2 ${
            method.status === "verified"
              ? "border-green-200 dark:border-green-800"
              : method.status === "pending"
                ? "border-amber-200 dark:border-amber-800"
                : "border-gray-200 dark:border-gray-800"
          } hover:shadow-md transition-all duration-300`}
        >
          <div className={`bg-gradient-to-b ${getCardGradient()} p-6`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`rounded-full p-3 ${getIconBackground()}`}>{getIcon()}</div>

              <div className="space-y-2">
                <h3 className="font-semibold">{method.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
              </div>

              <div className="flex items-center justify-between w-full mt-2">
                <div className="flex items-center gap-1.5">
                  {getStatusIcon()}
                  <span className="text-sm font-medium">
                    {method.status === "verified"
                      ? "Verified"
                      : method.status === "pending"
                        ? "Pending"
                        : "Not Started"}
                  </span>
                </div>

                <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}

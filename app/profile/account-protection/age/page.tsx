import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Upload } from "lucide-react"

export const metadata: Metadata = {
  title: "Age Verification | Diaspora Market Hub",
  description: "Confirm you meet the minimum age requirements",
}

export default function AgeVerificationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {/* Header with breadcrumbs */}
        <div className="flex flex-col gap-1">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Profile
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link
                    href="/profile/account-protection"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Account Protection
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">Age Verification</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Back Button */}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile/account-protection" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Account Protection
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Age Verification</CardTitle>
              <CardDescription>Confirm you meet the minimum age requirements</CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Pending
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 dark:bg-amber-800 p-3 mb-4">
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-amber-700 dark:text-amber-400">Verification In Progress</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                  Your age verification is being processed. This usually takes 1-2 business days.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Submitted Document</h3>
                  <p className="text-sm text-gray-500">Birth Certificate</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-medium">Submission Date</h3>
                    <p className="text-sm text-gray-500">July 20, 2023</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Under Review
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Update Document
            </Button>
            <Button variant="ghost" className="w-full sm:w-auto">
              Check Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

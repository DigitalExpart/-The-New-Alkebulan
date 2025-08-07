import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, FileText, Upload } from "lucide-react"

export const metadata: Metadata = {
  title: "Document Verification | Diaspora Market Hub",
  description: "Verify your identity with a government-issued ID",
}

export default function DocumentVerificationPage() {
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
                  <span className="text-sm font-medium text-gray-500">Document Verification</span>
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
              <CardTitle className="text-xl">Document Verification</CardTitle>
              <CardDescription>Verify your identity with a government-issued ID</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Verified
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 dark:bg-green-800 p-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-green-700 dark:text-green-400">Verification Complete</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                  Your document has been verified successfully. Your identity is confirmed.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Verified Document</h3>
                  <p className="text-sm text-gray-500">Driver's License</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-medium">Verification Date</h3>
                    <p className="text-sm text-gray-500">July 15, 2023</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Valid
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
              View Verification History
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

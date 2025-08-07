import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Upload, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const metadata: Metadata = {
  title: "Address Verification | Diaspora Market Hub",
  description: "Verify your current residential address",
}

export default function AddressVerificationPage() {
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
                  <span className="text-sm font-medium text-gray-500">Address Verification</span>
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
              <CardTitle className="text-xl">Address Verification</CardTitle>
              <CardDescription>Verify your current residential address</CardDescription>
            </div>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
              Not Started
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                  <MapPin className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Address Verification Required</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                  Please provide your current residential address and upload a proof of address document.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" placeholder="123 Main Street" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input id="address2" placeholder="Apt, Suite, Unit, etc." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Select>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="al">Alabama</SelectItem>
                      <SelectItem value="ak">Alaska</SelectItem>
                      <SelectItem value="az">Arizona</SelectItem>
                      <SelectItem value="ga">Georgia</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="ca">California</SelectItem>
                      {/* More states would be listed here */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input id="zip" placeholder="ZIP/Postal Code" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    {/* More countries would be listed here */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Upload Proof of Address</h3>
                  <p className="text-sm text-gray-500">
                    Utility bill, bank statement, or government document (less than 3 months old)
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Drag and drop your document here, or click to browse</p>
                  <Button variant="outline" size="sm">
                    Browse Files
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (max 5MB)</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto">Submit for Verification</Button>
            <Button variant="ghost" className="w-full sm:w-auto">
              Save as Draft
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

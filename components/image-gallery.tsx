"use client"
import { imageRequirements, imageSummary } from "@/data/image-requirements"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, Info } from "lucide-react"

export function ImageGallery() {
  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Image Requirements for Diaspora Market Hub</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{imageSummary.totalImages}</div>
              <div className="text-sm text-muted-foreground">Total Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{imageSummary.highPriority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{imageSummary.mediumPriority}</div>
              <div className="text-sm text-muted-foreground">Medium Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{imageSummary.lowPriority}</div>
              <div className="text-sm text-muted-foreground">Low Priority</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imageRequirements.map((requirement) => (
          <Card key={requirement.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{requirement.location}</CardTitle>
                  <CardDescription className="mt-1">{requirement.purpose}</CardDescription>
                </div>
                <Badge className={priorityColors[requirement.priority]}>{requirement.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm">{requirement.dimensions}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Description:</h4>
                  <p className="text-sm text-muted-foreground">{requirement.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Suggested Query:</h4>
                  <p className="text-xs text-muted-foreground italic">"{requirement.suggestedQuery}"</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">ID: {requirement.id}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

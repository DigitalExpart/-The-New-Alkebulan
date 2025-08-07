"use client"

import { useState, useRef, useEffect } from "react"
import type { DevelopmentArea } from "@/types/personal-development"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PentagonViewProps {
  areas: DevelopmentArea[]
  focusArea?: string
}

export function PentagonView({ areas, focusArea }: PentagonViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 })

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement
        if (container) {
          const size = Math.min(container.clientWidth - 40, 400)
          setDimensions({ width: size, height: size })
        }
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const { width, height } = dimensions
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) / 2 - 60

  // Calculate pentagon points
  const getPolygonPoints = (radius: number) => {
    const points = []
    const angleStep = (2 * Math.PI) / areas.length
    const startAngle = -Math.PI / 2 // Start from top

    for (let i = 0; i < areas.length; i++) {
      const angle = startAngle + i * angleStep
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      points.push({ x, y, angle })
    }
    return points
  }

  // Generate grid lines (concentric pentagons)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const gridLines = gridLevels.map((level) => {
    const points = getPolygonPoints(maxRadius * level)
    return points.map((p) => `${p.x},${p.y}`).join(" ")
  })

  // Generate axis lines
  const axisPoints = getPolygonPoints(maxRadius)

  // Generate data polygon
  const dataPoints = getPolygonPoints(maxRadius).map((point, index) => {
    const area = areas[index]
    const level = area.level / area.maxLevel
    return {
      x: centerX + (point.x - centerX) * level,
      y: centerY + (point.y - centerY) * level,
      area,
    }
  })
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ")

  // Generate label positions
  const labelPoints = getPolygonPoints(maxRadius + 30)

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Chart */}
          <div className="relative w-full flex justify-center">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="overflow-visible"
            >
              {/* Grid lines */}
              {gridLines.map((points, index) => (
                <polygon
                  key={`grid-${index}`}
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity={0.1}
                />
              ))}

              {/* Axis lines */}
              {axisPoints.map((point, index) => (
                <line
                  key={`axis-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity={0.2}
                />
              ))}

              {/* Data area */}
              <polygon points={dataPolygon} fill="url(#gradient)" stroke="#8B5CF6" strokeWidth="2" opacity={0.7} />

              {/* Data points */}
              {dataPoints.map((point, index) => {
                const area = point.area
                const isFocusArea = focusArea === area.id
                const isHovered = hoveredArea === area.id

                return (
                  <TooltipProvider key={`point-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={isFocusArea ? 8 : isHovered ? 6 : 4}
                          fill={area.color}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredArea(area.id)}
                          onMouseLeave={() => setHoveredArea(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{area.name}</p>
                          <p className="text-sm">
                            Level {area.level} of {area.maxLevel}
                          </p>
                          <p className="text-xs italic mt-1">"{area.motivationalQuote}"</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}

              {/* Labels */}
              {labelPoints.map((point, index) => {
                const area = areas[index]
                const isFocusArea = focusArea === area.id

                return (
                  <g key={`label-${index}`}>
                    <text
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-sm font-medium ${isFocusArea ? "fill-primary" : "fill-current"}`}
                      onMouseEnter={() => setHoveredArea(area.id)}
                      onMouseLeave={() => setHoveredArea(null)}
                    >
                      {area.name}
                    </text>
                    <text
                      x={point.x}
                      y={point.y + 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      Level {area.level}
                    </text>
                  </g>
                )
              })}

              {/* Gradient definition */}
              <defs>
                <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
            {areas.map((area) => {
              const isFocusArea = focusArea === area.id
              const progressPercentage = (area.level / area.maxLevel) * 100

              return (
                <div
                  key={area.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isFocusArea ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                  onMouseEnter={() => setHoveredArea(area.id)}
                  onMouseLeave={() => setHoveredArea(null)}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">{area.name}</span>
                      {isFocusArea && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Focus
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(progressPercentage)}% • Level {area.level}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getAlternativesByCategory } from '@/services/alternativesService'

interface BetterAlternativesProps {
  brand: string
}

/**
 * BetterAlternatives suggests independent competitor alternatives for PE-owned brands
 * with category matching and direct links
 */
export function BetterAlternatives({ brand }: BetterAlternativesProps) {
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!brand) {
      setAlternatives([])
      return
    }

    setIsLoading(true)
    try {
      const alts = getAlternativesByCategory(brand)
      setAlternatives(alts)
    } catch (error) {
      console.error('Error fetching alternatives:', error)
      setAlternatives([])
    } finally {
      setIsLoading(false)
    }
  }, [brand])

  if (!alternatives || alternatives.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Better Alternatives</CardTitle>
        <CardDescription>Independent competitors in the same category</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Finding alternatives...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 border border-border/50 rounded-lg hover:border-border bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {alt.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {alt.description}
                    </p>
                    {alt.category && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alt.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {alt.website && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-shrink-0"
                          >
                            <a
                              href={alt.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-underline"
                            >
                              Visit
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Visit {alt.name} website
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { VerdictCard } from '@/components/VerdictCard'
import { OwnershipTree } from '@/components/OwnershipTree'
import { BetterAlternatives } from '@/components/BetterAlternatives'
import { HollowOutIndex } from '@/components/HollowOutIndex'

interface ResultsPageProps {
  result?: {
    chain: any[]
    source: string
    confidence: number
  }
  brandName?: string
  error?: string
}

export function ResultsPage({ result, brandName, error }: ResultsPageProps) {
  if (error) {
    return (
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-3xl mx-auto">
          <Alert variant="destructive">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 4v2M9 3h6M5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"
              />
            </svg>
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </section>
    )
  }

  if (!result) {
    return null
  }

  const ultimateParent = result.chain[result.chain.length - 1]

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-muted/30">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Brand Info Header */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            {brandName}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="w-fit cursor-help">
                    Source: {result.source}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Data source for this ownership information
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="w-fit cursor-help">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Confidence level of the data accuracy
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Ownership Chain Display */}
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                  {result.chain.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-muted rounded-md whitespace-nowrap">
                        {item.label}
                        {item.confidence && item.confidence < 1 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        )}
                      </span>
                      {idx < result.chain.length - 1 && (
                        <span className="text-primary font-bold mx-1">←</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verdict Card - Color coded based on ownership type */}
        {result.chain.length > 0 && (
          <VerdictCard
            ultimateParent={ultimateParent}
            acquisitionYear={ultimateParent.acquisitionYear}
            brandData={result.chain[0]}
          />
        )}

        {/* Ownership Tree Visualization */}
        <OwnershipTree chain={result.chain} source={result.source} />

        {/* Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HollowOutIndex brand={brandName} />
          <BetterAlternatives brand={brandName} />
        </div>
      </div>
    </section>
  )
}

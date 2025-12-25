'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateHollowOutIndex, getRiskAssessment } from '@/services/hollowOutIndexService'

interface HollowOutIndexProps {
  brand: string
}

/**
 * HollowOutIndex displays sentiment analysis showing quality degradation trends
 * for PE-owned brands with responsive design and dark theme support
 */
export function HollowOutIndex({ brand }: HollowOutIndexProps) {
  const [indexData, setIndexData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!brand) {
      setIndexData(null)
      return
    }

    setIsLoading(true)
    try {
      const data = calculateHollowOutIndex(brand)
      setIndexData(data)
    } catch (error) {
      console.error('Error calculating Hollow-Out Index:', error)
      setIndexData(null)
    } finally {
      setIsLoading(false)
    }
  }, [brand])

  if (!indexData) {
    return null
  }

  const riskAssessment = getRiskAssessment(indexData.status)

  const getRiskBadgeVariant = () => {
    switch (indexData.status) {
      case 'insufficient_data':
        return 'outline'
      case 'low':
        return 'success'
      case 'moderate':
        return 'warning'
      case 'high':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <CardTitle>Hollow-Out Index</CardTitle>
            <CardDescription>Quality degradation trends analysis</CardDescription>
          </div>
          <Badge variant={getRiskBadgeVariant() as any} className="flex-shrink-0 w-fit">
            {indexData.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Analyzing sentiment data...</p>
          </div>
        ) : indexData.status === 'insufficient_data' ? (
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              Insufficient public sentiment data available for comprehensive analysis.
            </p>
          </div>
        ) : (
          <>
            {/* Risk Score */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50 cursor-help">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                      Hollowing-Out Risk
                    </p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              indexData.riskScore <= 33
                                ? 'bg-green-600'
                                : indexData.riskScore <= 66
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                            }`}
                            style={{ width: `${indexData.riskScore}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold text-foreground tabular-nums">
                        {indexData.riskScore.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Risk assessment based on public sentiment and quality indicators
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Sentiment Trend */}
            {indexData.sentimentTrend && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border/50 cursor-help">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                        Sentiment Trend
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {indexData.sentimentTrend > 0 ? '📈 Improving' : '📉 Declining'}
                        </span>
                        <span className={`text-sm font-semibold ${indexData.sentimentTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {indexData.sentimentTrend > 0 ? '+' : ''}{indexData.sentimentTrend.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Year-over-year change in public sentiment
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Risk Description */}
            <div className="p-4 bg-background/50 dark:bg-background rounded-lg border border-border/50">
              <p className="text-sm text-foreground">{riskAssessment.description}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface VerdictCardProps {
  ultimateParent: any
  acquisitionYear?: number
  brandData?: any
}

/**
 * VerdictCard displays ownership status with color-coded variants
 * - Green (success): Independent company
 * - Yellow (warning): Recent acquisition (< 5 years)
 * - Red (destructive): PE-owned or acquired long ago
 */
export function VerdictCard({
  ultimateParent,
  acquisitionYear,
  brandData,
}: VerdictCardProps) {
  const getVerdictStatus = () => {
    // Check if PE-owned
    if (ultimateParent.type === 'Private Equity' || ultimateParent.isPEOwned) {
      return {
        variant: 'destructive' as const,
        status: 'PE-Owned',
        description: 'Owned by a private equity firm',
        bgClass: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
      }
    }

    // Check if recently acquired
    if (acquisitionYear) {
      const currentYear = new Date().getFullYear()
      const yearsSinceAcquisition = currentYear - acquisitionYear
      if (yearsSinceAcquisition < 5) {
        return {
          variant: 'warning' as const,
          status: 'Recently Acquired',
          description: `Acquired in ${acquisitionYear}`,
          bgClass: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
        }
      }
    }

    // Independent company
    return {
      variant: 'success' as const,
      status: 'Independent',
      description: 'Independently owned company',
      bgClass: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    }
  }

  const verdict = getVerdictStatus()

  return (
    <Card
      className={cn(
        'border-2 transition-all duration-300',
        verdict.bgClass,
        {
          'border-red-300 dark:border-red-700': verdict.variant === 'destructive',
          'border-yellow-300 dark:border-yellow-700': verdict.variant === 'warning',
          'border-green-300 dark:border-green-700': verdict.variant === 'success',
        }
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{verdict.status}</CardTitle>
            <CardDescription className="text-base">{verdict.description}</CardDescription>
          </div>
          <Badge variant={verdict.variant} className="w-fit flex-shrink-0">
            {verdict.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ownership Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 bg-background/50 dark:bg-background rounded-lg cursor-help border border-border/50">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                    Ultimate Parent
                  </p>
                  <p className="font-semibold text-foreground">
                    {ultimateParent.label}
                  </p>
                  {ultimateParent.country && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {ultimateParent.country}
                    </p>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                The top-level company in the ownership chain
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {acquisitionYear && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 bg-background/50 dark:bg-background rounded-lg cursor-help border border-border/50">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Acquisition Year
                    </p>
                    <p className="font-semibold text-foreground">
                      {acquisitionYear}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Year the brand was acquired by its parent company
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Verdict Explanation */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-foreground">
            {verdict.variant === 'destructive' && (
              <>
                <strong>What this means:</strong> This brand is owned by a private equity firm, which may impact pricing, quality, and innovation.
              </>
            )}
            {verdict.variant === 'warning' && (
              <>
                <strong>What this means:</strong> This brand was recently acquired, which may lead to changes in operations or strategy.
              </>
            )}
            {verdict.variant === 'success' && (
              <>
                <strong>What this means:</strong> This brand is independently owned, likely maintaining its original mission and values.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Brand Ownership Chain Search
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Discover the complete ownership structure of any brand
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

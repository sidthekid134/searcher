'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSearchHistory } from '@/services/searchHistoryService'
import { useEffect } from 'react'

interface SearchInterfaceProps {
  onSearch: (brandName: string) => void
  isLoading: boolean
}

export function SearchInterface({ onSearch, isLoading }: SearchInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [trendingBrands, setTrendingBrands] = useState<string[]>([])

  useEffect(() => {
    const history = getSearchHistory()
    setTrendingBrands(history.slice(0, 5))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm)
      setSearchTerm('')
    }
  }

  const handleTrendingClick = (brand: string) => {
    onSearch(brand)
  }

  return (
    <section className="w-full bg-gradient-to-b from-background to-muted/20 py-8 sm:py-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Box - Centered on desktop, full-width on mobile */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Search for a brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-12 text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Brand search input"
            />
            <Button
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className="sm:w-32 h-12 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Searching
                </span>
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </div>

        {/* Trending Suggestions */}
        {trendingBrands.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Trending Searches
            </label>
            <div className="flex flex-wrap gap-2">
              {trendingBrands.map((brand) => (
                <Button
                  key={brand}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTrendingClick(brand)}
                  disabled={isLoading}
                  className="h-9 px-4 text-xs sm:text-sm border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

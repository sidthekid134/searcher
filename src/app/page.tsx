'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { SearchInterface } from '@/components/SearchInterface'
import { ResultsPage } from '@/components/ResultsPage'
import { Footer } from '@/components/Footer'
import { getOwnershipChain } from '@/services/ownershipChainService'
import { addSearchToHistory } from '@/services/searchHistoryService'

interface ChainResult {
  chain: any[]
  source: string
  confidence: number
  error?: string
}

export default function Home() {
  const [result, setResult] = useState<ChainResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSearchBrand, setLastSearchBrand] = useState('')

  const handleSearch = async (brandName: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setLastSearchBrand(brandName)

    try {
      addSearchToHistory(brandName)
      const chainResult = await getOwnershipChain(brandName)

      if (chainResult.error && chainResult.chain.length === 0) {
        setError(chainResult.error)
        setResult(null)
      } else {
        setResult(chainResult)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve ownership information')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground dark:bg-slate-950">
      <Header />
      <main className="flex-1 w-full">
        <SearchInterface onSearch={handleSearch} isLoading={isLoading} />
        {error && <ResultsPage error={error} />}
        {result && result.chain.length > 0 && (
          <ResultsPage result={result} brandName={lastSearchBrand} />
        )}
        {!result && !error && !isLoading && (
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="bg-card rounded-lg shadow-lg p-8 sm:p-12 text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                Search for a brand to see its ownership structure
              </h2>
              <p className="text-muted-foreground">
                Try: WhatsApp, YouTube, Instagram, Slack, GitHub, or any other brand
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

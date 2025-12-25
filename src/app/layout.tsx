import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/app/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Brand Ownership Chain Search',
  description: 'Discover the complete ownership structure of any brand',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

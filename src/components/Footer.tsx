export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/50 text-muted-foreground">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm">
        <p>Data sources: Wikidata (with fallback to local database)</p>
        <p className="mt-1">API timeout: 5 seconds | Max chain depth: 10 levels</p>
      </div>
    </footer>
  )
}

import { Navbar } from "@/components/navbar-feed"

export default function FeedPage() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  )
}

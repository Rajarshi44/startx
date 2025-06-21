import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="relative z-10 border-b border-amber-500/20 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-light tracking-tight text-white animate-fade-in">Founder Dashboard</h1>
            <p className="text-gray-400 font-light tracking-wide animate-fade-in-delay">
              Build your startup from idea to investment
            </p>
          </div>
          <Badge className="px-4 py-2 rounded-full font-light tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 animate-glow">
            Founder Journey
          </Badge>
        </div>
      </div>
    </header>
  )
}

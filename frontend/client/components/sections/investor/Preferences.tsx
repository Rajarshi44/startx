import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Preferences() {
  const sectors = ["AI/ML", "FinTech", "HealthTech", "Climate Tech", "Web3", "EdTech"]
  const stages = ["Pre-Seed", "Seed", "Series A", "Series B"]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
        Investment Preferences
      </h2>

      <Card
        className="backdrop-blur-sm border"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderColor: "rgba(255, 203, 116, 0.2)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "#ffcb74" }}>Preferred Sectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => (
              <Badge
                key={sector}
                className="cursor-pointer bg-[#ffcb74]/20 text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                {sector}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card
        className="backdrop-blur-sm border"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderColor: "rgba(255, 203, 116, 0.2)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "#ffcb74" }}>Investment Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => (
              <Badge
                key={stage}
                className="cursor-pointer bg-[#ffcb74]/20 text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                {stage}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

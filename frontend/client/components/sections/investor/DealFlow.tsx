import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default function DealFlow() {
  const deals = [
    {
      id: 1,
      company: "FlowAI",
      sector: "AI/ML",
      stage: "Series A",
      valuation: "$15M",
      description: "AI-powered workflow automation for enterprises",
      match: 95,
      status: "Hot",
    },
    {
      id: 2,
      company: "GreenTech Solutions",
      sector: "Climate Tech",
      stage: "Seed",
      valuation: "$5M",
      description: "Carbon capture technology for industrial applications",
      match: 87,
      status: "New",
    },
    {
      id: 3,
      company: "HealthSync",
      sector: "HealthTech",
      stage: "Pre-Seed",
      valuation: "$2M",
      description: "Telemedicine platform for rural healthcare",
      match: 78,
      status: "Review",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
          Deal Flow
        </h2>
        <Button className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300">
          View All Deals
        </Button>
      </div>

      <div className="grid gap-6">
        {deals.map((deal) => (
          <Card
            key={deal.id}
            className="backdrop-blur-sm border hover:border-opacity-60 transition-all duration-300"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 203, 116, 0.2)",
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl" style={{ color: "#f6f6f6" }}>
                    {deal.company}
                  </CardTitle>
                  <p className="text-gray-300 mt-1">{deal.description}</p>
                </div>
                <Badge
                  className={`${
                    deal.status === "Hot"
                      ? "bg-red-500/20 text-red-400"
                      : deal.status === "New"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {deal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Sector</p>
                  <p className="font-medium" style={{ color: "#ffcb74" }}>
                    {deal.sector}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Stage</p>
                  <p className="font-medium text-gray-200">{deal.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Valuation</p>
                  <p className="font-medium text-gray-200">{deal.valuation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Match</p>
                  <p className="font-medium" style={{ color: "#4ade80" }}>
                    {deal.match}%
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="text-white hover:opacity-90 transition-all duration-300"
                  style={{ backgroundColor: "#111111" }}
                >
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

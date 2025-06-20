import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

export default function Portfolio() {
  const investments = [
    {
      company: "TechFlow",
      invested: "$500K",
      currentValue: "$1.2M",
      change: "+140%",
      status: "Growing",
      positive: true,
    },
    {
      company: "DataSync",
      invested: "$250K",
      currentValue: "$180K",
      change: "-28%",
      status: "Struggling",
      positive: false,
    },
    {
      company: "CloudBase",
      invested: "$750K",
      currentValue: "$950K",
      change: "+27%",
      status: "Stable",
      positive: true,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
        Portfolio Overview
      </h2>

      <div className="grid gap-6">
        {investments.map((investment, index) => (
          <Card
            key={index}
            className="backdrop-blur-sm border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 203, 116, 0.2)",
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl" style={{ color: "#f6f6f6" }}>
                  {investment.company}
                </CardTitle>
                <Badge
                  className={`${investment.positive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {investment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Invested</p>
                  <p className="font-medium text-gray-200">{investment.invested}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Value</p>
                  <p className="font-medium text-gray-200">{investment.currentValue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Change</p>
                  <div className="flex items-center">
                    {investment.positive ? (
                      <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
                    )}
                    <p className="font-medium" style={{ color: investment.positive ? "#4ade80" : "#ef4444" }}>
                      {investment.change}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

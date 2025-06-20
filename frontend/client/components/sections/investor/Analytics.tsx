import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
        Investment Analytics
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className="backdrop-blur-sm border"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(255, 203, 116, 0.2)",
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: "#ffcb74" }}>Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-200">$2.33M</div>
            <p className="text-sm text-green-400">+15.2% from last month</p>
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
            <CardTitle style={{ color: "#ffcb74" }}>Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-200">12</div>
            <p className="text-sm text-gray-400">Across 8 sectors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

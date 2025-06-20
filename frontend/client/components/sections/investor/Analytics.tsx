import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Analytics() {
  const industryData = [
    { industry: "SaaS", percentage: 40, color: "bg-blue-500" },
    { industry: "FinTech", percentage: 25, color: "bg-green-500" },
    { industry: "HealthTech", percentage: 20, color: "bg-purple-500" },
    { industry: "AI/ML", percentage: 15, color: "bg-orange-500" },
  ]
  const stageData = [
    { stage: "Seed", percentage: 50, color: "bg-teal-500" },
    { stage: "Series A", percentage: 30, color: "bg-indigo-500" },
    { stage: "Series B", percentage: 20, color: "bg-pink-500" },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Investment Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Industry Distribution</h4>
            <div className="space-y-2">
              {industryData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-sm flex-1">{item.industry}</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Stage Distribution</h4>
            <div className="space-y-2">
              {stageData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-sm flex-1">{item.stage}</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
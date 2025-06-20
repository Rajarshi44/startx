import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Portfolio() {
  const companies = [
    {
      name: "DataFlow Pro",
      investment: "$250K",
      currentValue: "$800K",
      multiple: "3.2x",
      status: "Growing",
      lastUpdate: "Q4 2024",
    },
    {
      name: "MedTech Solutions",
      investment: "$150K",
      currentValue: "$450K",
      multiple: "3.0x",
      status: "Stable",
      lastUpdate: "Q3 2024",
    },
    {
      name: "EcoLogistics",
      investment: "$200K",
      currentValue: "$180K",
      multiple: "0.9x",
      status: "Challenged",
      lastUpdate: "Q4 2024",
    },
  ]
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">$2.5M</div>
              <div className="text-sm text-gray-600">Total Invested</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">3.2x</div>
              <div className="text-sm text-gray-600">Avg Multiple</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Exits</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {companies.map((company, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">{company.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Invested: {company.investment}</span>
                    <span>•</span>
                    <span>Current: {company.currentValue}</span>
                    <span>•</span>
                    <span>Updated: {company.lastUpdate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold mb-1 ${
                      Number.parseFloat(company.multiple) > 1 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {company.multiple}
                  </div>
                  <Badge
                    className={`text-xs ${
                      company.status === "Growing"
                        ? "bg-green-100 text-green-700"
                        : company.status === "Stable"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {company.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
} 
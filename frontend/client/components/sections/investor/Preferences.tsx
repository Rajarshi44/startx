import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Preferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Investment Preferences
        </CardTitle>
        <CardDescription>Set your investment criteria to receive better deal flow matches</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Industries</label>
            <Input placeholder="e.g., SaaS, FinTech, AI/ML" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Investment Range</label>
            <Input placeholder="e.g., $50K - $500K" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Stages</label>
            <Input placeholder="e.g., Seed, Series A" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Geographic Focus</label>
            <Input placeholder="e.g., US, Europe, Global" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Minimum Traction Requirements</label>
          <Input placeholder="e.g., $100K ARR, 1000+ users" />
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">Update Preferences</Button>
      </CardContent>
    </Card>
  )
} 
import { OracleDashboard } from '@/components/oracle/OracleDashboard'

export default function OraclePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <OracleDashboard />
    </div>
  )
}

export const metadata = {
  title: 'Oracle Dashboard | Hack4Bengal',
  description: 'Monitor and control the DealFlow Oracle blockchain sync service',
} 
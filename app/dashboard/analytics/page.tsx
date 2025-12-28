"use client"

import { cn } from "@/lib/utils"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Wallet, CreditCard, DollarSign, TrendingUp } from "lucide-react"
import { useAppointments } from "@/hooks/use-appointments"
import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export default function AnalyticsPage() {
  const { appointments } = useAppointments()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [activeRange, setActiveRange] = useState("All Time")

  const stats = useMemo(() => {
    const totalClients = appointments.length
    const cashApts = appointments.filter((a) => a.paymentMethod === "Cash")
    const cardApts = appointments.filter((a) => a.paymentMethod === "Card")

    const totalRevenue = appointments.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100
      return acc + (a.amount - discountAmount)
    }, 0)
    const cashRevenue = cashApts.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100
      return acc + (a.amount - discountAmount)
    }, 0)
    const cardRevenue = cardApts.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100
      return acc + (a.amount - discountAmount)
    }, 0)

    return {
      totalClients,
      cashCount: cashApts.length,
      cardCount: cardApts.length,
      totalRevenue,
      cashRevenue,
      cardRevenue,
    }
  }, [appointments])

  const serviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    appointments.forEach((a) => {
      counts[a.service] = (counts[a.service] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [appointments])

  const paymentDistribution = useMemo(() => {
    return [
      { name: "Cash", value: stats.cashCount },
      { name: "Card", value: stats.cardCount },
    ]
  }, [stats])

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  const filterPresets = ["All Time", "Today", "Last 7 Days", "Last 30 Days", "Last 3 Months", "Last Year"]

  return (
    <DashboardShell title="Analytics Overview" description="Comprehensive insights into your salon practice">
      <div className="space-y-8">
        {/* Filter Section */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Filter by Date Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 rounded-lg border-muted-foreground/20 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-11 rounded-lg border-muted-foreground/20 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterPresets.map((range) => (
                <Button
                  key={range}
                  variant={activeRange === range ? "default" : "outline"}
                  className={cn(
                    "h-10 px-6 rounded-lg transition-all",
                    activeRange === range
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setActiveRange(range)}
                >
                  {range}
                </Button>
              ))}
              <Button
                variant="destructive"
                className="h-10 px-8 rounded-lg bg-red-500 hover:bg-red-600 ml-auto"
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                  setActiveRange("All Time")
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Updated currency from USD to ₹ (Rupees) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Clients" value={stats.totalClients} icon={Users} color="blue" />
          <StatCard title="Cash Clients" value={stats.cashCount} icon={Wallet} color="orange" />
          <StatCard title="Card Clients" value={stats.cardCount} icon={CreditCard} color="purple" />
          <StatCard
            title="Total Collection"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard title="Cash Collection" value={`₹${stats.cashRevenue.toFixed(2)}`} icon={Wallet} color="orange" />
          <StatCard title="Card Collection" value={`₹${stats.cardRevenue.toFixed(2)}`} icon={TrendingUp} color="blue" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Service Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: { title: string; value: string | number; icon: any; color: string }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
  }

  const iconColorMap = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    green: "text-emerald-500",
  }

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-2xl", colorMap[color as keyof typeof colorMap])}>
          <Icon className={cn("h-6 w-6", iconColorMap[color as keyof typeof iconColorMap])} />
        </div>
      </CardContent>
    </Card>
  )
}

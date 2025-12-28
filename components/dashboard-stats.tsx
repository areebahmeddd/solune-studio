"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"
import { useAppointments } from "@/hooks/use-appointments"
import { useMemo } from "react"

export function DashboardStats() {
  const { appointments } = useAppointments()

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const todayAppointments = appointments.filter((apt) => apt.date === today)

    const todayRevenue = todayAppointments.reduce((sum, apt) => {
      return sum + (apt.amount - apt.discount)
    }, 0)

    const totalClients = new Set(appointments.map((apt) => apt.phone)).size

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthStr = lastMonth.toISOString().split("T")[0].substring(0, 7)
    const thisMonthStr = new Date().toISOString().split("T")[0].substring(0, 7)

    const thisMonthAppointments = appointments.filter((apt) => apt.date.startsWith(thisMonthStr))
    const lastMonthAppointments = appointments.filter((apt) => apt.date.startsWith(lastMonthStr))

    const growth =
      lastMonthAppointments.length > 0
        ? ((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100
        : 0

    return {
      todayAppointments: todayAppointments.length,
      todayRevenue,
      totalClients,
      growth: growth.toFixed(1),
    }
  }, [appointments])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayAppointments}</div>
          <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">After discounts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground mt-1">Unique phone numbers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.growth > 0 ? "+" : ""}
            {stats.growth}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Compared to last month</p>
        </CardContent>
      </Card>
    </div>
  )
}

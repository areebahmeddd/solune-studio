"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { isToday, isWithinInterval, subDays } from "date-fns";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";

export function DashboardStats({
  dateFilter = "today",
}: {
  dateFilter?: "all" | "today" | "7days" | "30days";
}) {
  const { appointments } = useAppointments();

  const stats = useMemo(() => {
    const now = new Date();

    let filtered = appointments;
    switch (dateFilter) {
      case "today":
        filtered = appointments.filter((apt) => isToday(new Date(apt.date)));
        break;
      case "7days":
        filtered = appointments.filter((apt) =>
          isWithinInterval(new Date(apt.date), {
            start: subDays(now, 7),
            end: now,
          }),
        );
        break;
      case "30days":
        filtered = appointments.filter((apt) =>
          isWithinInterval(new Date(apt.date), {
            start: subDays(now, 30),
            end: now,
          }),
        );
        break;
      default:
        filtered = appointments;
    }

    const appointmentsCount = filtered.length;

    const revenue = filtered.reduce((sum, apt) => {
      const discountAmount = (apt.amount * apt.discount) / 100;
      return sum + (apt.amount - discountAmount);
    }, 0);

    const totalClients = new Set(filtered.map((apt) => apt.phone)).size;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split("T")[0].substring(0, 7);
    const thisMonthStr = new Date().toISOString().split("T")[0].substring(0, 7);

    const thisMonthAppointments = appointments.filter((apt) =>
      apt.date.startsWith(thisMonthStr),
    );
    const lastMonthAppointments = appointments.filter((apt) =>
      apt.date.startsWith(lastMonthStr),
    );

    const growth =
      lastMonthAppointments.length > 0
        ? ((thisMonthAppointments.length - lastMonthAppointments.length) /
            lastMonthAppointments.length) *
          100
        : 0;

    return {
      appointmentsCount,
      revenue,
      totalClients,
      growth: growth.toFixed(2),
    };
  }, [appointments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {dateFilter === "today"
              ? "Today's Sales"
              : dateFilter === "7days"
                ? "Last 7 Days Sales"
                : dateFilter === "30days"
                  ? "Last 30 Days Sales"
                  : "Total Sales"}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.appointmentsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {dateFilter === "today"
              ? "Recorded for today"
              : dateFilter === "7days"
                ? "Sales in last 7 days"
                : dateFilter === "30days"
                  ? "Sales in last 30 days"
                  : "All time sales"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {dateFilter === "today"
              ? "Today's Revenue"
              : dateFilter === "7days"
                ? "Last 7 Days Revenue"
                : dateFilter === "30days"
                  ? "Last 30 Days Revenue"
                  : "Total Revenue"}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.revenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">After discounts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {dateFilter === "today"
              ? "Today's Clients"
              : dateFilter === "7days"
                ? "Clients (Last 7 Days)"
                : dateFilter === "30days"
                  ? "Clients (Last 30 Days)"
                  : "Total Clients"}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Unique phone numbers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Growth
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {parseFloat(stats.growth) > 0 ? "+" : ""}
            {stats.growth}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Compared to last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import {
  endOfMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { Calendar, DollarSign, Users } from "lucide-react";
import { useMemo } from "react";

export function DashboardStats({
  dateFilter = "today",
}: {
  dateFilter?: "all" | "today" | "7days" | "thisMonth" | "lastMonth";
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
      case "thisMonth":
        filtered = appointments.filter((apt) =>
          isWithinInterval(new Date(apt.date), {
            start: startOfMonth(now),
            end: endOfMonth(now),
          }),
        );
        break;
      case "lastMonth": {
        const lastMonth = subMonths(now, 1);
        filtered = appointments.filter((apt) =>
          isWithinInterval(new Date(apt.date), {
            start: startOfMonth(lastMonth),
            end: endOfMonth(lastMonth),
          }),
        );
        break;
      }
      default:
        filtered = appointments;
    }

    const appointmentsCount = filtered.length;

    const revenue = filtered.reduce((sum, apt) => {
      const discountAmount = (apt.amount * apt.discount) / 100;
      return sum + (apt.amount - discountAmount);
    }, 0);

    const totalClients = new Set(filtered.map((apt) => apt.phone)).size;

    return {
      appointmentsCount,
      revenue,
      totalClients,
    };
  }, [appointments, dateFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Today's";
      case "7days":
        return "Last 7 Days";
      case "thisMonth":
        return "This Month";
      case "lastMonth":
        return "Last Month";
      default:
        return "Total";
    }
  };

  const getFilterDescription = () => {
    switch (dateFilter) {
      case "today":
        return "Recorded for today";
      case "7days":
        return "Sales in last 7 days";
      case "thisMonth":
        return "Sales this calendar month";
      case "lastMonth":
        return "Sales last calendar month";
      default:
        return "All time sales";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {getFilterLabel()} Sales
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.appointmentsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {getFilterDescription()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {getFilterLabel()} Revenue
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
            {getFilterLabel()} Clients
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
    </div>
  );
}

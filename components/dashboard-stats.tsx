"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { Calendar, DollarSign, Users } from "lucide-react";
import { useMemo } from "react";

type DateRange = { from?: Date; to?: Date };

export function DashboardStats({
  dateFilter = "today",
  customDateRange,
}: {
  dateFilter?: "all" | "today" | "7days" | "thisMonth" | "lastMonth";
  customDateRange?: DateRange;
}) {
  const { appointments } = useAppointments();

  const stats = useMemo(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    let filtered = appointments;

    if (customDateRange?.from) {
      const fromStr = format(customDateRange.from, "yyyy-MM-dd");
      const toStr = customDateRange.to
        ? format(customDateRange.to, "yyyy-MM-dd")
        : fromStr;
      filtered = appointments.filter(
        (apt) => apt.date >= fromStr && apt.date <= toStr,
      );
    } else {
      switch (dateFilter) {
        case "today":
          filtered = appointments.filter((apt) => apt.date === today);
          break;
        case "7days": {
          const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd");
          filtered = appointments.filter(
            (apt) => apt.date >= sevenDaysAgo && apt.date <= today,
          );
          break;
        }
        case "thisMonth": {
          const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
          const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
          filtered = appointments.filter(
            (apt) => apt.date >= monthStart && apt.date <= monthEnd,
          );
          break;
        }
        case "lastMonth": {
          const lastMonth = subMonths(now, 1);
          const monthStart = format(startOfMonth(lastMonth), "yyyy-MM-dd");
          const monthEnd = format(endOfMonth(lastMonth), "yyyy-MM-dd");
          filtered = appointments.filter(
            (apt) => apt.date >= monthStart && apt.date <= monthEnd,
          );
          break;
        }
        default:
          filtered = appointments;
      }
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
  }, [appointments, dateFilter, customDateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getFilterLabel = () => {
    if (customDateRange?.from) {
      return "Custom Range";
    }
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
    if (customDateRange?.from) {
      if (customDateRange.to) {
        return `${format(customDateRange.from, "MMM dd")} - ${format(customDateRange.to, "MMM dd, yyyy")}`;
      }
      return format(customDateRange.from, "MMM dd, yyyy");
    }
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

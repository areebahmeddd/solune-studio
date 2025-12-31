"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import {
  CalendarDays,
  CalendarIcon,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";

type DateRange = { from?: Date; to?: Date };

export default function AnalyticsPage() {
  useEffect(() => {
    document.title = "Solune Studio - Analytics";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const { appointments } = useAppointments();
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [filterType, setFilterType] = useState<
    "all" | "today" | "7days" | "30days" | "3months" | "year" | "custom"
  >("today");

  useEffect(() => {
    if (!loading && !user) {
      const isSigningOut = sessionStorage.getItem("signing-out");
      if (!isSigningOut) {
        toast.error("Please sign in to access this page");
      } else {
        sessionStorage.removeItem("signing-out");
      }
      router.push("/signin");
    }
  }, [user, loading, router]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    if (filterType === "custom" && date?.from) {
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        if (date.to && date.from) {
          return isWithinInterval(aptDate, { start: date.from, end: date.to });
        }
        if (date.from) {
          return aptDate.toDateString() === date.from.toDateString();
        }
        return true;
      });
    }

    switch (filterType) {
      case "today":
        return appointments.filter((apt) => apt.date === today);
      case "7days":
        const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= sevenDaysAgo && apt.date <= today,
        );
      case "30days":
        const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= thirtyDaysAgo && apt.date <= today,
        );
      case "3months":
        const threeMonthsAgo = format(subMonths(now, 3), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= threeMonthsAgo && apt.date <= today,
        );
      case "year":
        const oneYearAgo = format(subYears(now, 1), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= oneYearAgo && apt.date <= today,
        );
      case "all":
      default:
        return appointments;
    }
  }, [appointments, date, filterType]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const dataSource = filteredAppointments;

    const appointmentsCount = dataSource.length;
    const clientsCount = new Set(dataSource.map((a) => a.phone)).size;

    const salesTotal = dataSource.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100;
      return acc + (a.amount - discountAmount);
    }, 0);

    let monthlyCollection = 0;
    let monthlyLabel = format(now, "MMMM yyyy");

    if (filterType === "custom" && date?.from) {
      monthlyCollection = salesTotal;
      if (date.to && date.from) {
        monthlyLabel = `${format(date.from, "MMM dd, yyyy")} - ${format(date.to, "MMM dd, yyyy")}`;
      } else {
        monthlyLabel = format(date.from, "MMM dd, yyyy");
      }
    } else {
      const monthlyAppointments = appointments.filter((a) => {
        const date = new Date(a.date);
        return date >= monthStart && date <= monthEnd;
      });
      monthlyCollection = monthlyAppointments.reduce((acc, a) => {
        const discountAmount = (a.amount * a.discount) / 100;
        return acc + (a.amount - discountAmount);
      }, 0);
    }

    const cashApts = dataSource.filter((a) => a.paymentMethod === "Cash");
    const upiApts = dataSource.filter((a) => a.paymentMethod === "UPI");
    const cardApts = dataSource.filter(
      (a) =>
        a.paymentMethod === "Card" ||
        a.paymentMethod === "Credit Card" ||
        a.paymentMethod === "Debit Card",
    );

    const cashRevenue = cashApts.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100;
      return acc + (a.amount - discountAmount);
    }, 0);
    const upiRevenue = upiApts.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100;
      return acc + (a.amount - discountAmount);
    }, 0);
    const cardRevenue = cardApts.reduce((acc, a) => {
      const discountAmount = (a.amount * a.discount) / 100;
      return acc + (a.amount - discountAmount);
    }, 0);

    return {
      appointmentsCount,
      clientsCount,
      salesTotal,
      monthlyCollection,
      monthlyLabel,
      cashRevenue,
      upiRevenue,
      cardRevenue,
      totalRevenue: salesTotal,
      cashCount: cashApts.length,
      upiCount: upiApts.length,
      cardCount: cardApts.length,
    };
  }, [filteredAppointments, filterType, date, appointments]);

  const serviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAppointments.forEach((a) => {
      if (a.services && a.services.length > 0) {
        a.services.forEach((service: any) => {
          counts[service.name] = (counts[service.name] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredAppointments]);

  const paymentDistribution = useMemo(() => {
    return [
      { name: "Cash", value: stats.cashRevenue },
      { name: "UPI", value: stats.upiRevenue },
      { name: "Card", value: stats.cardRevenue },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const COLORS = [
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
  ];

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your salon business
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal h-10",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(newDate) => {
                    const rangeDate = newDate as DateRange | undefined;
                    setDate(rangeDate);
                    if (rangeDate?.from) {
                      setFilterType("custom");
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {date && filterType === "custom" && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  setDate(undefined);
                  setFilterType("all");
                }}
                title="Clear date range"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("all");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            All Time
          </Button>
          <Button
            variant={filterType === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("today");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            Today
          </Button>
          <Button
            variant={filterType === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("7days");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            Last 7 Days
          </Button>
          <Button
            variant={filterType === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("30days");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            Last 30 Days
          </Button>
          <Button
            variant={filterType === "3months" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("3months");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            Last 3 Months
          </Button>
          <Button
            variant={filterType === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("year");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            Last Year
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {filterType === "today"
                  ? "Today's Appointments"
                  : filterType === "7days"
                    ? "Last 7 Days Appointments"
                    : filterType === "30days"
                      ? "Last 30 Days Appointments"
                      : filterType === "3months"
                        ? "Last 3 Months Appointments"
                        : filterType === "year"
                          ? "Last Year Appointments"
                          : "Total Appointments"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.appointmentsCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {filterType === "today"
                  ? "Scheduled for today"
                  : filterType === "7days"
                    ? "Appointments in last 7 days"
                    : filterType === "30days"
                      ? "Appointments in last 30 days"
                      : filterType === "3months"
                        ? "Appointments in last 3 months"
                        : filterType === "year"
                          ? "Appointments in last year"
                          : "All time appointments"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {filterType === "today"
                  ? "Today's Sales"
                  : filterType === "7days"
                    ? "Sales (Last 7 Days)"
                    : filterType === "30days"
                      ? "Sales (Last 30 Days)"
                      : filterType === "3months"
                        ? "Sales (Last 3 Months)"
                        : filterType === "year"
                          ? "Sales (Last Year)"
                          : "Total Revenue"}
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.salesTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filterType === "today"
                  ? "Revenue generated today"
                  : filterType === "7days"
                    ? "Revenue in last 7 days"
                    : filterType === "30days"
                      ? "Revenue in last 30 days"
                      : filterType === "3months"
                        ? "Revenue in last 3 months"
                        : filterType === "year"
                          ? "Revenue in last year"
                          : "All time revenue"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {filterType === "custom"
                  ? "Selected Period"
                  : "Monthly Collection"}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthlyCollection)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyLabel}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cash Collection
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.cashRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.cashCount} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                UPI Collection
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.upiRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.upiCount} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Card Collection
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.cardRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.cardCount} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>
                Popular services by booking count
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(2)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Revenue split by payment type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${formatCurrency(value)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#a855f7" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

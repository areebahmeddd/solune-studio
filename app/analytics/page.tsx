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
    "all" | "today" | "7days" | "thisMonth" | "lastMonth" | "year" | "custom"
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
      const fromStr = format(date.from, "yyyy-MM-dd");
      const toStr = date.to ? format(date.to, "yyyy-MM-dd") : fromStr;
      return appointments.filter(
        (apt) => apt.date >= fromStr && apt.date <= toStr,
      );
    }

    switch (filterType) {
      case "today":
        return appointments.filter((apt) => apt.date === today);
      case "7days":
        const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= sevenDaysAgo && apt.date <= today,
        );
      case "thisMonth":
        const thisMonthStart = format(startOfMonth(now), "yyyy-MM-dd");
        const thisMonthEnd = format(endOfMonth(now), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= thisMonthStart && apt.date <= thisMonthEnd,
        );
      case "lastMonth":
        const lastMonthDate = subMonths(now, 1);
        const lastMonthStart = format(
          startOfMonth(lastMonthDate),
          "yyyy-MM-dd",
        );
        const lastMonthEnd = format(endOfMonth(lastMonthDate), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= lastMonthStart && apt.date <= lastMonthEnd,
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

    let monthlyCollection = salesTotal;
    let monthlyLabel = "";

    if (filterType === "custom" && date?.from) {
      if (date.to && date.from) {
        monthlyLabel = `${format(date.from, "MMM dd, yyyy")} - ${format(date.to, "MMM dd, yyyy")}`;
      } else {
        monthlyLabel = format(date.from, "MMM dd, yyyy");
      }
    } else if (filterType === "today") {
      monthlyLabel = "Today";
    } else if (filterType === "7days") {
      monthlyLabel = "Last 7 Days";
    } else if (filterType === "thisMonth") {
      monthlyLabel = "This Month";
    } else if (filterType === "lastMonth") {
      monthlyLabel = "Last Month";
    } else if (filterType === "year") {
      monthlyLabel = "Last Year";
    } else {
      monthlyLabel = "All Time";
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

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    if (sorted.length <= 10) {
      return sorted;
    }

    const top10 = sorted.slice(0, 10);
    const others = sorted.slice(10).reduce((sum, item) => sum + item.value, 0);

    return [...top10, { name: "Others", value: others }];
  }, [filteredAppointments]);

  const paymentDistribution = useMemo(() => {
    return [
      { name: "Cash", value: stats.cashRevenue },
      { name: "UPI", value: stats.upiRevenue },
      { name: "Card", value: stats.cardRevenue },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const stylistPerformance = useMemo(() => {
    const stylistData: Record<
      string,
      {
        revenue: number;
        appointments: Set<string>;
        servicesPerformed: number;
        serviceBreakdown: Record<string, number>;
      }
    > = {};

    filteredAppointments.forEach((apt) => {
      const discountAmount = (apt.amount * apt.discount) / 100;
      const finalAmount = apt.amount - discountAmount;

      if (apt.services && apt.services.length > 0) {
        const stylistsInAppointment = new Map<string, number>();

        apt.services.forEach((service: any) => {
          const stylistName = service.stylist || apt.stylist || "No stylist";
          stylistsInAppointment.set(
            stylistName,
            (stylistsInAppointment.get(stylistName) || 0) + 1,
          );
        });

        stylistsInAppointment.forEach((serviceCount, stylistName) => {
          if (!stylistData[stylistName]) {
            stylistData[stylistName] = {
              revenue: 0,
              appointments: new Set(),
              servicesPerformed: 0,
              serviceBreakdown: {},
            };
          }

          stylistData[stylistName].appointments.add(apt.id);

          const revenueShare = finalAmount / stylistsInAppointment.size;
          stylistData[stylistName].revenue += revenueShare;

          apt.services.forEach((service: any) => {
            if (
              (service.stylist || apt.stylist || "No stylist") === stylistName
            ) {
              stylistData[stylistName].servicesPerformed += 1;
              stylistData[stylistName].serviceBreakdown[service.name] =
                (stylistData[stylistName].serviceBreakdown[service.name] || 0) +
                1;
            }
          });
        });
      } else if (apt.stylist) {
        const stylistName = apt.stylist;
        if (!stylistData[stylistName]) {
          stylistData[stylistName] = {
            revenue: 0,
            appointments: new Set(),
            servicesPerformed: 1,
            serviceBreakdown: {},
          };
        } else {
          stylistData[stylistName].servicesPerformed += 1;
        }
        stylistData[stylistName].appointments.add(apt.id);
        stylistData[stylistName].revenue += finalAmount;
      }
    });

    return Object.entries(stylistData)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        appointments: data.appointments.size,
        servicesPerformed: data.servicesPerformed,
        services: data.serviceBreakdown,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .filter((s) => s.name !== "No stylist");
  }, [filteredAppointments]);

  const stylistRevenueData = useMemo(() => {
    return stylistPerformance.map((s) => ({
      name: s.name,
      value: s.revenue,
    }));
  }, [stylistPerformance]);

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
            variant={filterType === "thisMonth" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("thisMonth");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            This Month
          </Button>
          <Button
            variant={filterType === "lastMonth" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("lastMonth");
              setDate(undefined);
            }}
            className="min-w-[100px]"
          >
            Last Month
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={filterType === "custom" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "min-w-[180px] justify-start text-left font-normal h-9",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "MMM dd, y")} -{" "}
                      {format(date.to, "MMM dd, y")}
                    </>
                  ) : (
                    format(date.from, "MMM dd, y")
                  )
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
              className="h-9 w-9"
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {filterType === "today"
                  ? "Today's Appointments"
                  : filterType === "7days"
                    ? "Last 7 Days Appointments"
                    : filterType === "thisMonth"
                      ? "This Month Appointments"
                      : filterType === "lastMonth"
                        ? "Last Month Appointments"
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
                    : filterType === "thisMonth"
                      ? "Appointments this month"
                      : filterType === "lastMonth"
                        ? "Appointments last month"
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
                    : filterType === "thisMonth"
                      ? "Sales (This Month)"
                      : filterType === "lastMonth"
                        ? "Sales (Last Month)"
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
                    : filterType === "thisMonth"
                      ? "Revenue this month"
                      : filterType === "lastMonth"
                        ? "Revenue last month"
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
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stylist Performance</CardTitle>
            <CardDescription>
              Revenue and services performed by each stylist
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stylistPerformance.length > 0 ? (
              <div className="space-y-6">
                {stylistPerformance.map((stylist, idx) => {
                  const percentage =
                    (stylist.revenue / stats.totalRevenue) * 100;
                  const topServices = Object.entries(stylist.services)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3);

                  return (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h4 className="font-semibold text-base">
                              {stylist.name}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {stylist.appointments} appointment
                              {stylist.appointments !== 1 ? "s" : ""} ·{" "}
                              {stylist.servicesPerformed} service
                              {stylist.servicesPerformed !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {topServices.map(([service, count], serviceIdx) => (
                              <span
                                key={serviceIdx}
                                className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md"
                              >
                                {service} ({count})
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold">
                            {formatCurrency(stylist.revenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No stylist data available
              </div>
            )}
          </CardContent>
        </Card>

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
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => {
                      const pct = (percent ?? 0) * 100;
                      return `${pct.toFixed(1)}%`;
                    }}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
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
                    label={({ percent }) =>
                      `${((percent ?? 0) * 100).toFixed(1)}%`
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
                    formatter={(value: number | undefined) =>
                      value !== undefined ? formatCurrency(value) : ""
                    }
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

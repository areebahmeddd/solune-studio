"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppointments } from "@/hooks/use-appointments";
import { cn } from "@/lib/utils";
import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { CalendarIcon, Edit, Filter, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

type DateRange = { from?: Date; to?: Date };

interface AppointmentsListProps {
  onEdit?: (appointment: any) => void;
  onDelete?: (appointment: any) => void;
  dateFilter?: "all" | "today" | "7days" | "thisMonth" | "lastMonth";
  onFilterChange?: (
    value: "all" | "today" | "7days" | "thisMonth" | "lastMonth",
  ) => void;
  customDateRange?: DateRange;
  onCustomDateRangeChange?: (range: DateRange | undefined) => void;
}

export function AppointmentsList({
  onEdit,
  onDelete,
  dateFilter,
  onFilterChange,
  customDateRange: externalCustomDateRange,
  onCustomDateRangeChange,
}: AppointmentsListProps = {}) {
  const { appointments } = useAppointments();
  const [search, setSearch] = useState("");
  const [localDateFilter, setLocalDateFilter] = useState<
    "all" | "today" | "7days" | "thisMonth" | "lastMonth"
  >(dateFilter ?? "today");
  const [localCustomDateRange, setLocalCustomDateRange] = useState<
    DateRange | undefined
  >(undefined);

  useEffect(() => {
    if (dateFilter !== undefined) {
      setLocalDateFilter(dateFilter);
    }
  }, [dateFilter]);

  const effectiveDateFilter = dateFilter ?? localDateFilter;
  const customDateRange =
    externalCustomDateRange !== undefined
      ? externalCustomDateRange
      : localCustomDateRange;

  const setCustomDateRange = (range: DateRange | undefined) => {
    if (onCustomDateRangeChange) {
      onCustomDateRangeChange(range);
    } else {
      setLocalCustomDateRange(range);
    }
  };

  const getFilteredByDate = () => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    if (customDateRange?.from) {
      const fromStr = format(customDateRange.from, "yyyy-MM-dd");
      const toStr = customDateRange.to
        ? format(customDateRange.to, "yyyy-MM-dd")
        : fromStr;
      return appointments.filter(
        (apt) => apt.date >= fromStr && apt.date <= toStr,
      );
    }

    switch (effectiveDateFilter) {
      case "today":
        return appointments.filter((apt) => apt.date === today);
      case "7days": {
        const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= sevenDaysAgo && apt.date <= today,
        );
      }
      case "thisMonth": {
        const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
        const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= monthStart && apt.date <= monthEnd,
        );
      }
      case "lastMonth": {
        const lastMonth = subMonths(now, 1);
        const monthStart = format(startOfMonth(lastMonth), "yyyy-MM-dd");
        const monthEnd = format(endOfMonth(lastMonth), "yyyy-MM-dd");
        return appointments.filter(
          (apt) => apt.date >= monthStart && apt.date <= monthEnd,
        );
      }
      default:
        return appointments;
    }
  };

  const dateFilteredAppointments = getFilteredByDate();

  const filteredAppointments = dateFilteredAppointments
    .filter(
      (app) =>
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        (app.services &&
          app.services.some((s: any) =>
            s.name.toLowerCase().includes(search.toLowerCase()),
          )) ||
        app.stylist.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sales Records</CardTitle>
            <CardDescription>
              {filteredAppointments.length} sales found
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal h-10",
                    !customDateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange?.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "LLL dd, y")} -{" "}
                        {format(customDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={customDateRange?.from}
                  selected={customDateRange}
                  onSelect={(newDate) => {
                    const rangeDate = newDate as DateRange | undefined;
                    setCustomDateRange(rangeDate);
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {customDateRange && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setCustomDateRange(undefined)}
                title="Clear date range"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Select
              value={effectiveDateFilter}
              onValueChange={(v) =>
                onFilterChange
                  ? onFilterChange(v as any)
                  : setLocalDateFilter(v as any)
              }
            >
              <SelectTrigger className="w-[165px] h-10">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, service..."
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[150px]">Client</TableHead>
              <TableHead className="w-[180px]">Service</TableHead>
              <TableHead className="w-[140px]">Stylist</TableHead>
              <TableHead className="w-[100px]">Payment</TableHead>
              <TableHead className="w-[120px]">Amount</TableHead>
              <TableHead className="w-[100px]">Discount</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment, index) => {
                const discountAmount =
                  (appointment.amount * appointment.discount) / 100;
                const finalAmount = appointment.amount - discountAmount;

                return (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {appointment.services &&
                        appointment.services.length > 0 ? (
                          appointment.services.map(
                            (service: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {service.name}
                              </Badge>
                            ),
                          )
                        ) : (
                          <Badge variant="secondary">No services</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(() => {
                        if (
                          appointment.services &&
                          appointment.services.length > 0
                        ) {
                          const stylists = Array.from(
                            new Set(
                              appointment.services
                                .map((s: any) => s.stylist)
                                .filter(Boolean),
                            ),
                          );
                          if (stylists.length > 0) {
                            return stylists.join(", ");
                          }
                        }
                        return appointment.stylist || "No stylist";
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          appointment.paymentMethod === "Cash"
                            ? "bg-green-50 text-green-700 ring-green-700/10 border-green-200"
                            : appointment.paymentMethod === "Card"
                              ? "bg-blue-50 text-blue-700 ring-blue-700/10 border-blue-200"
                              : appointment.paymentMethod === "UPI"
                                ? "bg-purple-50 text-purple-700 ring-purple-700/10 border-purple-200"
                                : "bg-gray-50 text-gray-700 ring-gray-700/10 border-gray-200"
                        }
                      >
                        {appointment.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(appointment.amount)}</TableCell>
                    <TableCell>
                      {appointment.discount > 0 ? (
                        <span className="text-orange-600 font-medium">
                          {appointment.discount}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(finalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit?.(appointment)}
                          title="Edit sale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete?.(appointment)}
                          title="Delete sale"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

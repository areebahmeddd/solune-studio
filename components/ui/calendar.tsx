"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  numberOfMonths?: number;
  defaultMonth?: Date;
  initialFocus?: boolean;
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  numberOfMonths = 1,
  defaultMonth,
  initialFocus,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    defaultMonth ||
      (selected instanceof Date ? selected : selected?.from) ||
      new Date(),
  );
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isInRange = (date: Date, range?: { from?: Date; to?: Date }) => {
    if (!range || !range.from) return false;
    if (!range.to) return isSameDay(date, range.from);
    const dateTime = date.getTime();
    return dateTime >= range.from.getTime() && dateTime <= range.to.getTime();
  };

  const isRangeStart = (date: Date, range?: { from?: Date; to?: Date }) => {
    return range?.from && isSameDay(date, range.from);
  };

  const isRangeEnd = (date: Date, range?: { from?: Date; to?: Date }) => {
    return range?.to && isSameDay(date, range.to);
  };

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return;

    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      const rangeSelected = selected as { from?: Date; to?: Date } | undefined;
      if (!rangeSelected?.from || (rangeSelected.from && rangeSelected.to)) {
        onSelect?.({ from: date, to: undefined });
      } else {
        if (date < rangeSelected.from) {
          onSelect?.({ from: date, to: rangeSelected.from });
        } else {
          onSelect?.({ from: rangeSelected.from, to: date });
        }
      }
    }
  };

  const renderMonth = (monthOffset: number) => {
    const displayDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + monthOffset,
      1,
    );
    const daysInMonth = getDaysInMonth(displayDate);
    const firstDay = getFirstDayOfMonth(displayDate);
    const monthName = displayDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(displayDate.getFullYear(), displayDate.getMonth(), day),
      );
    }

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div key={monthOffset} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          {monthOffset === 0 && (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {monthOffset > 0 && <div className="h-7 w-7" />}

          <h2 className="text-sm font-medium">{monthName}</h2>

          {monthOffset === numberOfMonths - 1 && (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {monthOffset < numberOfMonths - 1 && <div className="h-7 w-7" />}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <th
                  key={day}
                  className="text-muted-foreground w-9 text-[0.8rem] font-normal"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <td key={dayIndex} className="p-0" />;
                  }

                  const isSelected =
                    mode === "single"
                      ? selected instanceof Date && isSameDay(date, selected)
                      : isInRange(
                          date,
                          selected as { from?: Date; to?: Date } | undefined,
                        );

                  const isToday = isSameDay(date, today);
                  const isDisabled = disabled ? disabled(date) : false;

                  const isStart =
                    mode === "range" &&
                    isRangeStart(
                      date,
                      selected as { from?: Date; to?: Date } | undefined,
                    );
                  const isEnd =
                    mode === "range" &&
                    isRangeEnd(
                      date,
                      selected as { from?: Date; to?: Date } | undefined,
                    );
                  const isMiddle =
                    mode === "range" && isSelected && !isStart && !isEnd;

                  return (
                    <td key={dayIndex} className="p-0 text-center">
                      <button
                        type="button"
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => setHoveredDate(date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        disabled={isDisabled}
                        className={cn(
                          "h-9 w-9 rounded-md text-sm font-normal transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                          isToday && !isSelected && "bg-accent font-semibold",
                          isSelected &&
                            !isMiddle &&
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                          isMiddle && "bg-accent text-accent-foreground",
                          isStart && "rounded-l-md",
                          isEnd && "rounded-r-md",
                          !isSelected && !isToday && "text-foreground",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={cn("p-3", className)}>
      <div
        className={cn(
          "flex gap-4",
          numberOfMonths > 1 && "flex-col sm:flex-row",
        )}
      >
        {Array.from({ length: numberOfMonths }).map((_, i) => renderMonth(i))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/hooks/use-auth";
import { useExpenses } from "@/hooks/use-expenses";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import {
  CalendarIcon,
  Download,
  Edit,
  Filter,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DateRange = { from?: Date; to?: Date };

export default function ExpensesPage() {
  useEffect(() => {
    document.title = "Solune Studio - Expenses";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deletingExpense, setDeletingExpense] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "7days" | "30days"
  >("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    undefined,
  );

  const [formData, setFormData] = useState({
    item: "",
    amount: 0,
    date: new Date(),
  });

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

  const resetForm = () => {
    setFormData({
      item: "",
      amount: 0,
      date: new Date(),
    });
  };

  const handleAdd = async () => {
    if (!formData.item || formData.amount <= 0) {
      toast.error("Please enter expense item and valid amount");
      return;
    }

    await addExpense({
      item: formData.item,
      amount: formData.amount,
      date: format(formData.date, "yyyy-MM-dd"),
      timestamp: new Date().toISOString(),
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      item: expense.item,
      amount: expense.amount,
      date: new Date(expense.date),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.item || formData.amount <= 0) {
      toast.error("Please enter expense item and valid amount");
      return;
    }

    await updateExpense(editingExpense.id, {
      item: formData.item,
      amount: formData.amount,
      date: format(formData.date, "yyyy-MM-dd"),
      timestamp: editingExpense.timestamp,
    });

    setIsEditModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const handleDelete = (expense: any) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingExpense) {
      await deleteExpense(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
    }
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    if (customDateRange?.from) {
      const fromStr = format(customDateRange.from, "yyyy-MM-dd");
      const toStr = customDateRange.to
        ? format(customDateRange.to, "yyyy-MM-dd")
        : fromStr;
      return expenses.filter((exp) => exp.date >= fromStr && exp.date <= toStr);
    }

    switch (dateFilter) {
      case "today":
        return expenses.filter((exp) => exp.date === today);
      case "7days":
        const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd");
        return expenses.filter(
          (exp) => exp.date >= sevenDaysAgo && exp.date <= today,
        );
      case "30days":
        const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd");
        return expenses.filter(
          (exp) => exp.date >= thirtyDaysAgo && exp.date <= today,
        );
      default:
        return expenses;
    }
  }, [expenses, dateFilter, customDateRange]);

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Date", "Item", "Amount"];

    const csvData = filteredExpenses.map((exp) => {
      return [
        format(new Date(exp.date), "dd/MM/yyyy"),
        exp.item,
        exp.amount.toFixed(2),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `expenses-report-${format(new Date(), "dd-MM-yyyy")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Expenses report exported successfully");
  };

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your business expenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredExpenses.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredExpenses.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredExpenses.length > 0
                  ? formatCurrency(totalExpenses / filteredExpenses.length)
                  : formatCurrency(0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expense Records</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} expenses found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal h-10 w-[200px]",
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
                  <PopoverContent className="w-auto p-0" align="end">
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
                  value={dateFilter}
                  onValueChange={(v: any) => setDateFilter(v)}
                >
                  <SelectTrigger className="w-[165px] h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead className="w-auto">Item</TableHead>
                  <TableHead className="w-[150px] text-right">Amount</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense, index) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {format(new Date(expense.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.item}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(expense)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Record a new business expense</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item Name</Label>
              <Input
                id="item"
                placeholder="Enter item name"
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      const selectedDate = date as Date | undefined;
                      selectedDate &&
                        setFormData({ ...formData, date: selectedDate });
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update expense details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item">Item Name</Label>
              <Input
                id="edit-item"
                placeholder="Enter item name"
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !formData.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date instanceof Date) {
                        setFormData({ ...formData, date });
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

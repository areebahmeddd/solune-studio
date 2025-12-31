"use client";

import { AppointmentForm } from "@/components/appointment-form";
import { AppointmentsList } from "@/components/appointments-list";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardStats } from "@/components/dashboard-stats";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AppointmentsPage() {
  useEffect(() => {
    document.title = "Solune Studio - Appointments";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const { appointments, deleteAppointment } = useAppointments();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "7days" | "30days"
  >("today");

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDelete = (appointment: any) => {
    setDeletingAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingAppointment) {
      await deleteAppointment(deletingAppointment.id);
      setIsDeleteModalOpen(false);
      setDeletingAppointment(null);
    }
  };

  const exportToCSV = () => {
    if (appointments.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Client Name",
      "Phone",
      "Services",
      "Stylist",
      "Payment Method",
      "Amount",
      "Discount %",
      "Final Amount",
    ];

    const csvData = appointments.map((apt) => {
      const discountAmount = (apt.amount * apt.discount) / 100;
      const finalAmount = apt.amount - discountAmount;
      const serviceNames =
        apt.services && apt.services.length > 0
          ? apt.services.map((s: any) => s.name).join("; ")
          : "No services";
      return [
        format(new Date(apt.date), "dd/MM/yyyy"),
        apt.name,
        `+91${apt.phone}`,
        serviceNames,
        apt.stylist,
        apt.paymentMethod,
        apt.amount.toFixed(2),
        apt.discount,
        finalAmount.toFixed(2),
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
      `sales-report-${format(new Date(), "dd-MM-yyyy")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sales report exported successfully");
  };

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

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your salon appointments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={appointments.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </div>
        </div>

        <DashboardStats dateFilter={dateFilter} />
        <AppointmentsList
          dateFilter={dateFilter}
          onFilterChange={setDateFilter}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            appointment={editingAppointment}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
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

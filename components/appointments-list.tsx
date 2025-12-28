"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, Trash2, Edit2, Calendar, ChevronDown } from "lucide-react"
import { useAppointments } from "@/hooks/use-appointments"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AppointmentsList() {
  const { appointments, deleteAppointment } = useAppointments()
  const [search, setSearch] = useState("")

  const filteredAppointments = appointments.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.service.toLowerCase().includes(search.toLowerCase()) ||
      app.stylist.toLowerCase().includes(search.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-card border rounded-xl p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, services, or stylists..."
            className="pl-9 border-none bg-transparent focus-visible:ring-0 text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border-l pl-4">
          <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-foreground">
            Today
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Sales Records</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{filteredAppointments.length} sales found</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-12 font-semibold">ID</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Visit Date</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Client Name</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Service</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Stylist</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Method</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Amount</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Discount</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Total</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Calendar className="h-10 w-10 mb-4 opacity-20" />
                      <p className="font-medium">No records matching your search</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment, index) => {
                  const discountAmount = (appointment.amount * appointment.discount) / 100
                  const finalAmount = appointment.amount - discountAmount

                  return (
                    <TableRow key={appointment.id} className="group transition-colors hover:bg-muted/20">
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(appointment.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold">{appointment.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal bg-secondary/50 hover:bg-secondary/50">
                          {appointment.service}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{appointment.stylist}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-3 py-0 font-medium text-[10px] uppercase tracking-wider",
                            appointment.paymentMethod === "Cash"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20",
                          )}
                        >
                          {appointment.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(appointment.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {appointment.discount > 0 ? (
                          <span className="text-orange-600 font-medium">
                            {appointment.discount}% (-{formatCurrency(discountAmount)})
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(finalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

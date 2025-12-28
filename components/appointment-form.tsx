"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2, X } from "lucide-react"
import { useAppointments } from "@/hooks/use-appointments"

const SERVICES = [
  { name: "Haircut", price: 500 },
  { name: "Hair Color", price: 2000 },
  { name: "Highlights", price: 3500 },
  { name: "Blowout", price: 800 },
  { name: "Hair Treatment", price: 1500 },
  { name: "Manicure", price: 600 },
  { name: "Pedicure", price: 800 },
  { name: "Facial", price: 1200 },
  { name: "Makeup", price: 2500 },
]

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI", "Other"]
const STYLISTS = ["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Jessica Martinez"]

interface AppointmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const { addAppointment } = useAppointments()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    discount: 0,
    paymentMethod: "Cash",
    stylist: STYLISTS[0],
  })

  const finalAmount = useMemo(() => {
    const discountAmount = (formData.amount * formData.discount) / 100
    return formData.amount - discountAmount
  }, [formData.amount, formData.discount])

  const handleServiceChange = (serviceName: string) => {
    const service = SERVICES.find((s) => s.name === serviceName)
    setFormData({
      ...formData,
      service: serviceName,
      amount: service?.price || 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addAppointment({
        ...formData,
        timestamp: new Date().toISOString(),
      })
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error adding sale:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-bold">Add New Sale</h2>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-slate-50 border-slate-300 h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
            >
              <SelectTrigger className="bg-slate-50 border-slate-300 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Client Name</Label>
            <Input
              placeholder="Enter client name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-slate-300 h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Phone Number</Label>
            <Input
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border-slate-300 h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Service</Label>
            <Select value={formData.service} onValueChange={handleServiceChange}>
              <SelectTrigger className="border-slate-300 h-11">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name} (₹{s.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Stylist</Label>
            <Select value={formData.stylist} onValueChange={(v) => setFormData({ ...formData, stylist: v })}>
              <SelectTrigger className="border-slate-300 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLISTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Amount (₹)</Label>
            <Input
              type="number"
              value={formData.amount || ""}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="border-slate-300 h-11"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Discount (%)</Label>
            <Input
              type="number"
              value={formData.discount || ""}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
              className="border-slate-300 h-11"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-900 font-bold text-lg">Final Amount (₹)</span>
          <span className="text-blue-900 font-extrabold text-2xl">{finalAmount.toFixed(2)}</span>
        </div>
      </form>

      <div className="flex items-center gap-3 p-6 border-t bg-slate-50/50">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 border-slate-300 font-semibold bg-transparent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Sale
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Plus, Download } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { AppointmentForm } from "@/components/appointment-form"
import { AppointmentsList } from "@/components/appointments-list"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell
      title="Sales Records"
      description="Manage your salon sales efficiently"
      actions={
        <>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 px-4 rounded-lg shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Sales
          </Button>
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white gap-2 h-9 px-4 rounded-lg shadow-sm border-none"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <AppointmentsList />
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[800px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <AppointmentForm onSuccess={() => setIsAddModalOpen(false)} onCancel={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

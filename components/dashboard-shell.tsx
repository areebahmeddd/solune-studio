"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Scissors, LogOut, LayoutDashboard, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface DashboardShellProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

export function DashboardShell({ children, title, description, actions }: DashboardShellProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ]

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-all duration-300">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center gap-3 border-b px-6", isCollapsed && "justify-center px-0")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-sm font-bold tracking-tight whitespace-nowrap">SalonSync</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                Management System
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isCollapsed && "justify-center px-0 h-10 w-10 mx-auto",
              )}
              title={isCollapsed ? item.label : ""}
            >
              <span className="shrink-0">
                {typeof item.icon === "string" ? <BarChart3 className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t p-4 space-y-4">
          {!isCollapsed && (
            <div className="flex flex-col px-2">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.email?.split("@")[0] || "Stylist"}
              </p>
              <p className="text-[10px] text-muted-foreground">{format(new Date(), "EEEE, MMM d, yyyy")}</p>
            </div>
          )}
          <Button
            onClick={handleSignOut}
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 text-muted-foreground hover:text-foreground border-border bg-transparent",
              isCollapsed && "justify-center p-0 h-10 w-10 mx-auto",
            )}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Button>

          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-foreground z-50"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300 ease-in-out", isCollapsed ? "ml-[80px]" : "ml-64")}>
        <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </header>

        <div className="px-8 pb-12">{children}</div>
      </main>
    </div>
  )
}

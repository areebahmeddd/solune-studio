"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-collapsed");
      return savedState === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const handleSignOut = async () => {
    try {
      sessionStorage.setItem("signing-out", "true");
      await signOut();
      router.push("/signin");
    } catch (error) {
      sessionStorage.removeItem("signing-out");
      toast.error("Failed to sign out");
    }
  };

  const navItems = [
    { label: "Sales", icon: Receipt, href: "/sales" },
    { label: "Expenses", icon: Wallet, href: "/expenses" },
    { label: "Inventory", icon: Package, href: "/inventory" },
    { label: "Promotions", icon: Megaphone, href: "/promotions" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex h-screen">
      <aside
        className={cn(
          "border-r bg-card flex flex-col transition-all duration-300 relative",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className={cn("p-6", isCollapsed && "p-4")}>
          <div className="flex items-center gap-2">
            <div className="flex items-center shrink-0">
              <Image
                src="/icons/logo.svg"
                alt="Solune"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-sm">Solune Studio</h2>
                <p className="text-xs text-muted-foreground">
                  Management System
                </p>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full gap-2",
                  pathname === item.href && "bg-secondary",
                  isCollapsed ? "justify-center px-2" : "justify-start",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className={cn("p-4", isCollapsed && "px-2")}>
          {!isCollapsed ? (
            <div className="rounded-xl border bg-background/50 backdrop-blur-sm shadow-sm p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-xs">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="w-full justify-center px-2 h-8"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card shadow-md hover:bg-accent flex items-center justify-center z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}

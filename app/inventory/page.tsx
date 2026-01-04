"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function InventoryPage() {
  useEffect(() => {
    document.title = "Solune Studio - Inventory";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your salon products and supplies
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-center">Coming Soon</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </DashboardShell>
  );
}

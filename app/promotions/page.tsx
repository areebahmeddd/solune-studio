"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import {
  DollarSign,
  Download,
  Filter,
  MessageCircle,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function PromotionsPage() {
  useEffect(() => {
    document.title = "Solune Studio - Promotions";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const { appointments } = useAppointments();

  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState<
    "all" | "high-visits" | "high-spend"
  >("all");
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    new Set(),
  );
  const [isBulkSend, setIsBulkSend] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

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

  const clientsData = useMemo(() => {
    const clientMap = new Map();

    appointments.forEach((apt) => {
      const phone = apt.phone;
      if (!clientMap.has(phone)) {
        clientMap.set(phone, {
          name: apt.name,
          phone: phone,
          visits: 0,
          totalSpent: 0,
          lastVisit: apt.date,
        });
      }
      const client = clientMap.get(phone);
      client.visits += 1;
      const finalAmount = apt.amount - (apt.amount * apt.discount) / 100;
      client.totalSpent += finalAmount;
      if (new Date(apt.date) > new Date(client.lastVisit)) {
        client.lastVisit = apt.date;
      }
    });

    return Array.from(clientMap.values()).sort(
      (a, b) =>
        new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime(),
    );
  }, [appointments]);

  const filteredClients = useMemo(() => {
    let filtered = clientsData;

    switch (clientFilter) {
      case "high-visits":
        filtered = [...filtered].sort((a, b) => b.visits - a.visits);
        break;
      case "high-spend":
        filtered = [...filtered].sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      default:
        break;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.phone.includes(query),
      );
    }

    return filtered;
  }, [clientsData, searchQuery, clientFilter]);

  const toggleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map((c) => c.phone)));
    }
  };

  const toggleSelectClient = (phone: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedClients(newSelected);
  };

  const handleSendBulkMessage = () => {
    if (selectedClients.size === 0) {
      toast.error("Please select at least one client");
      return;
    }
    setIsBulkSend(true);
    setIsWhatsAppModalOpen(true);
  };

  const handleSendMessage = (client: any) => {
    setSelectedClient(client);
    setIsBulkSend(false);
    setIsWhatsAppModalOpen(true);
  };

  const confirmSendMessage = async () => {
    if (!customMessage) {
      toast.error("Please enter a message");
      return;
    }

    const recipients = isBulkSend
      ? Array.from(selectedClients)
          .map((phone) => {
            const client = clientsData.find((c) => c.phone === phone);
            return client
              ? { phone: client.phone, message: customMessage }
              : null;
          })
          .filter(Boolean)
      : [{ phone: selectedClient.phone, message: customMessage }];

    try {
      const loadingToast = toast.loading(
        `Sending message${recipients.length > 1 ? "s" : ""}...`,
      );

      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
        }),
      });

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok || !data.success) {
        toast.error(data.error || "Failed to send messages");
        return;
      }

      if (data.summary) {
        const { succeeded, failed, total } = data.summary;
        if (failed === 0) {
          toast.success(
            `Successfully sent ${succeeded} message${succeeded > 1 ? "s" : ""}!`,
          );
        } else {
          toast.warning(
            `Sent ${succeeded}/${total} messages. ${failed} failed.`,
          );
        }
      } else {
        toast.success("Message sent successfully!");
      }

      setSelectedClients(new Set());
      setIsWhatsAppModalOpen(false);
      setSelectedClient(null);
      setIsBulkSend(false);
      setCustomMessage("");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const exportToCSV = () => {
    if (filteredClients.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Client Name",
      "Phone Number",
      "Total Visits",
      "Total Spend",
    ];

    const csvData = filteredClients.map((client) => [
      client.name,
      client.phone,
      client.visits,
      client.totalSpent.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `client-promotions-${format(new Date(), "dd-MM-yyyy")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Client data exported successfully");
  };

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
            <p className="text-muted-foreground">
              Manage client communications and promotional messages
            </p>
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredClients.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  clientsData.reduce((sum, c) => sum + c.totalSpent, 0),
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Revenue/Client
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientsData.length > 0
                  ? formatCurrency(
                      clientsData.reduce((sum, c) => sum + c.totalSpent, 0) /
                        clientsData.length,
                    )
                  : formatCurrency(0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Client Directory</CardTitle>
                {selectedClients.size > 0 && (
                  <p className="text-sm text-primary font-medium mt-1">
                    {selectedClients.size} selected
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {selectedClients.size > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSendBulkMessage}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send to {selectedClients.size} client
                    {selectedClients.size > 1 ? "s" : ""}
                  </Button>
                )}
                <Select
                  value={clientFilter}
                  onValueChange={(v: any) => setClientFilter(v)}
                >
                  <SelectTrigger className="w-[165px] h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="high-visits">High Visits</SelectItem>
                    <SelectItem value="high-spend">High Spend</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone..."
                    className="pl-8 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedClients.size === filteredClients.length &&
                        filteredClients.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-[200px]">Client Name</TableHead>
                  <TableHead className="w-[180px]">Phone Number</TableHead>
                  <TableHead className="w-[120px]">Last Visit</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Total Visits
                  </TableHead>
                  <TableHead className="w-[140px] text-right">
                    Total Spent
                  </TableHead>
                  <TableHead className="w-[140px] text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client, index) => (
                    <TableRow key={client.phone}>
                      <TableCell>
                        <Checkbox
                          checked={selectedClients.has(client.phone)}
                          onCheckedChange={() =>
                            toggleSelectClient(client.phone)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          +91 {client.phone}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(client.lastVisit), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {client.visits}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(client.totalSpent)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(client)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              {isBulkSend
                ? `Send a promotional message to ${selectedClients.size} selected client${selectedClients.size > 1 ? "s" : ""}`
                : `Send a promotional message to ${selectedClient?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Recipient{isBulkSend && selectedClients.size > 1 ? "s" : ""}
              </Label>
              {isBulkSend ? (
                <div className="rounded-md border p-3 text-sm bg-muted">
                  {selectedClients.size} client
                  {selectedClients.size > 1 ? "s" : ""} selected
                </div>
              ) : (
                <Input
                  value={
                    selectedClient
                      ? `${selectedClient.name} (+91 ${selectedClient.phone})`
                      : ""
                  }
                  disabled
                  className="font-medium"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                placeholder="Type your message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWhatsAppModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

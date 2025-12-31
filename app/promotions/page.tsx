"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Filter, MessageCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MESSAGE_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Offer",
    message:
      "Welcome to our salon! Enjoy 20% off on your next visit. Book now!",
  },
  {
    id: "birthday",
    name: "Birthday Wishes",
    message:
      "Happy Birthday! 🎉 Get 30% off on all services today. Treat yourself!",
  },
  {
    id: "reminder",
    name: "Appointment Reminder",
    message:
      "It's been a while! Come visit us and get 15% off on your next service.",
  },
  {
    id: "custom",
    name: "Custom Message",
    message: "",
  },
];

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
  const [messageTemplate, setMessageTemplate] = useState("welcome");
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

  const confirmSendMessage = () => {
    const template = MESSAGE_TEMPLATES.find((t) => t.id === messageTemplate);
    const message =
      messageTemplate === "custom" ? customMessage : template?.message;

    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    if (isBulkSend) {
      toast.success(
        `WhatsApp message would be sent to ${selectedClients.size} client(s)`,
      );
      setSelectedClients(new Set());
    } else {
      toast.success(
        `WhatsApp message would be sent to ${selectedClient.name} at ${selectedClient.phone}`,
      );
    }

    setIsWhatsAppModalOpen(false);
    setSelectedClient(null);
    setIsBulkSend(false);
    setMessageTemplate("welcome");
    setCustomMessage("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage client communications and promotional messages
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Revenue/Client
              </CardTitle>
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
                <CardDescription>
                  {filteredClients.length} clients in database
                  {selectedClients.size > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      • {selectedClients.size} selected
                    </span>
                  )}
                </CardDescription>
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
              <Label htmlFor="template">Message Template</Label>
              <Select
                value={messageTemplate}
                onValueChange={setMessageTemplate}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message Preview</Label>
              {messageTemplate === "custom" ? (
                <Input
                  id="message"
                  placeholder="Type your custom message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              ) : (
                <div className="rounded-md border p-3 text-sm bg-muted">
                  {
                    MESSAGE_TEMPLATES.find((t) => t.id === messageTemplate)
                      ?.message
                  }
                </div>
              )}
            </div>
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200">
              Note: This is a placeholder feature. No actual WhatsApp messages
              will be sent.
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

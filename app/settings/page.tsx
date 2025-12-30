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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useServices } from "@/hooks/use-services";
import { useStylists } from "@/hooks/use-stylists";
import { Edit, Filter, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Solune Studio - Settings";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const { services, addService, updateService, deleteService } = useServices();

  const { stylists, addStylist, updateStylist, deleteStylist } = useStylists();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingService, setDeletingService] = useState<any>(null);

  const [isAddStylistModalOpen, setIsAddStylistModalOpen] = useState(false);
  const [isEditStylistModalOpen, setIsEditStylistModalOpen] = useState(false);
  const [isDeleteStylistModalOpen, setIsDeleteStylistModalOpen] =
    useState(false);
  const [editingStylist, setEditingStylist] = useState<any>(null);
  const [deletingStylist, setDeletingStylist] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "men" as "men" | "women",
    price: 0,
  });

  const [stylistFormData, setStylistFormData] = useState({
    name: "",
    gender: "male" as "male" | "female",
  });

  const [serviceFilter, setServiceFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [stylistFilter, setStylistFilter] = useState<"all" | "male" | "female">(
    "all",
  );

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to access this page");
      router.push("/signin");
    }
  }, [user, loading, router]);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "men",
      price: 0,
    });
  };

  const resetStylistForm = () => {
    setStylistFormData({
      name: "",
      gender: "male",
    });
  };

  const handleAdd = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error("Please enter service name and valid price");
      return;
    }

    await addService({
      name: formData.name,
      category: formData.category,
      price: formData.price,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      price: service.price,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error("Please enter service name and valid price");
      return;
    }

    await updateService(editingService.id, {
      name: formData.name,
      category: formData.category,
      price: formData.price,
    });

    setIsEditModalOpen(false);
    setEditingService(null);
    resetForm();
  };

  const handleDelete = (service: any) => {
    setDeletingService(service);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingService) {
      await deleteService(deletingService.id);
      setIsDeleteModalOpen(false);
      setDeletingService(null);
    }
  };

  const handleAddStylist = async () => {
    if (!stylistFormData.name) {
      toast.error("Please enter stylist name");
      return;
    }

    await addStylist({
      name: stylistFormData.name,
      gender: stylistFormData.gender,
    });

    setIsAddStylistModalOpen(false);
    resetStylistForm();
  };

  const handleEditStylist = (stylist: any) => {
    setEditingStylist(stylist);
    setStylistFormData({
      name: stylist.name,
      gender: stylist.gender,
    });
    setIsEditStylistModalOpen(true);
  };

  const handleUpdateStylist = async () => {
    if (!stylistFormData.name) {
      toast.error("Please enter stylist name");
      return;
    }

    await updateStylist(editingStylist.id, {
      name: stylistFormData.name,
      gender: stylistFormData.gender,
    });

    setIsEditStylistModalOpen(false);
    setEditingStylist(null);
    resetStylistForm();
  };

  const handleDeleteStylist = (stylist: any) => {
    setDeletingStylist(stylist);
    setIsDeleteStylistModalOpen(true);
  };

  const confirmDeleteStylist = async () => {
    if (deletingStylist) {
      await deleteStylist(deletingStylist.id);
      setIsDeleteStylistModalOpen(false);
      setDeletingStylist(null);
    }
  };

  const menServices = services
    .filter((s) => s.category === "men")
    .sort((a, b) => a.name.localeCompare(b.name));
  const womenServices = services
    .filter((s) => s.category === "women")
    .sort((a, b) => a.name.localeCompare(b.name));

  const filterServicesByPrice = (serviceList: any[]) => {
    switch (serviceFilter) {
      case "low":
        return serviceList.filter((s) => s.price < 500);
      case "medium":
        return serviceList.filter((s) => s.price >= 500 && s.price < 1000);
      case "high":
        return serviceList.filter((s) => s.price >= 1000);
      default:
        return serviceList;
    }
  };

  const sortedServices = filterServicesByPrice(
    [...services].sort((a, b) => a.name.localeCompare(b.name)),
  );
  const filteredMenServices = filterServicesByPrice(menServices);
  const filteredWomenServices = filterServicesByPrice(womenServices);

  const filteredStylists =
    stylistFilter === "all"
      ? [...stylists].sort((a, b) => a.name.localeCompare(b.name))
      : [...stylists]
          .filter((s) => s.gender === stylistFilter)
          .sort((a, b) => a.name.localeCompare(b.name));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const ServiceTable = ({ services: serviceList }: { services: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="w-auto">Service Name</TableHead>
          <TableHead className="w-[150px] text-right">Price</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {serviceList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No services available
            </TableCell>
          </TableRow>
        ) : (
          serviceList.map((service, index) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(service.price)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(service)}
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
  );

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your salon services and prices
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Men's Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menServices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Women's Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{womenServices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stylists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stylists.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>
                Organize services by category and manage pricing
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={serviceFilter}
                onValueChange={(v: any) => setServiceFilter(v)}
              >
                <SelectTrigger className="w-[195px] h-10">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Budget (&lt;₹500)</SelectItem>
                  <SelectItem value="medium">Medium (₹500-999)</SelectItem>
                  <SelectItem value="high">Premium (₹1K+)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Services</TabsTrigger>
                <TabsTrigger value="men">Men's Services</TabsTrigger>
                <TabsTrigger value="women">Women's Services</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                <ServiceTable services={sortedServices} />
              </TabsContent>
              <TabsContent value="men" className="space-y-4">
                <ServiceTable services={filteredMenServices} />
              </TabsContent>
              <TabsContent value="women" className="space-y-4">
                <ServiceTable services={filteredWomenServices} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stylist Management</CardTitle>
              <CardDescription>Manage your salon's stylists</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={stylistFilter}
                onValueChange={(v: any) => setStylistFilter(v)}
              >
                <SelectTrigger className="w-[165px] h-10">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stylists</SelectItem>
                  <SelectItem value="male">Male Stylists</SelectItem>
                  <SelectItem value="female">Female Stylists</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddStylistModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stylist
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Stylist Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStylists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No stylists available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStylists.map((stylist, index) => (
                    <TableRow key={stylist.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {stylist.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize ${
                            stylist.gender === "female"
                              ? "bg-pink-50 text-pink-700 ring-pink-700/10"
                              : "bg-blue-50 text-blue-700 ring-blue-700/10"
                          }`}
                        >
                          {stylist.gender}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditStylist(stylist)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteStylist(stylist)}
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
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new salon service with pricing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    category: v as "men" | "women",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men's Services</SelectItem>
                  <SelectItem value="women">Women's Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and pricing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Service Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    category: v as "men" | "women",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men's Services</SelectItem>
                  <SelectItem value="women">Women's Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                placeholder="0"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot
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

      <Dialog
        open={isAddStylistModalOpen}
        onOpenChange={setIsAddStylistModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stylist</DialogTitle>
            <DialogDescription>
              Add a new stylist to your salon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stylist-name">Stylist Name</Label>
              <Input
                id="stylist-name"
                placeholder="Enter stylist name"
                value={stylistFormData.name}
                onChange={(e) =>
                  setStylistFormData({
                    ...stylistFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={stylistFormData.gender}
                onValueChange={(v) =>
                  setStylistFormData({
                    ...stylistFormData,
                    gender: v as "male" | "female",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddStylistModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStylist}>Add Stylist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditStylistModalOpen}
        onOpenChange={setIsEditStylistModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stylist</DialogTitle>
            <DialogDescription>Update stylist details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stylist-name">Stylist Name</Label>
              <Input
                id="edit-stylist-name"
                placeholder="Enter stylist name"
                value={stylistFormData.name}
                onChange={(e) =>
                  setStylistFormData({
                    ...stylistFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select
                value={stylistFormData.gender}
                onValueChange={(v) =>
                  setStylistFormData({
                    ...stylistFormData,
                    gender: v as "male" | "female",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditStylistModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStylist}>Update Stylist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteStylistModalOpen}
        onOpenChange={setIsDeleteStylistModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Stylist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this stylist? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteStylistModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteStylist}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

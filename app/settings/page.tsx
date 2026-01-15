"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useServiceGroups } from "@/hooks/use-service-groups";
import { useServices } from "@/hooks/use-services";
import { useStylists } from "@/hooks/use-stylists";
import {
  Edit,
  Filter,
  Folder,
  Layers,
  Loader2,
  Plus,
  Scissors,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Solune Studio - Settings";
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();
  const { services, addService, updateService, deleteService } = useServices();
  const {
    serviceGroups,
    addServiceGroup,
    updateServiceGroup,
    deleteServiceGroup,
  } = useServiceGroups();

  const { stylists, addStylist, updateStylist, deleteStylist } = useStylists();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingService, setDeletingService] = useState<any>(null);

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [deletingGroup, setDeletingGroup] = useState<any>(null);

  const [isAddStylistModalOpen, setIsAddStylistModalOpen] = useState(false);
  const [isEditStylistModalOpen, setIsEditStylistModalOpen] = useState(false);
  const [isDeleteStylistModalOpen, setIsDeleteStylistModalOpen] =
    useState(false);
  const [editingStylist, setEditingStylist] = useState<any>(null);
  const [deletingStylist, setDeletingStylist] = useState<any>(null);

  const [isAddingService, setIsAddingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [isDeletingService, setIsDeletingService] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isAddingStylist, setIsAddingStylist] = useState(false);
  const [isUpdatingStylist, setIsUpdatingStylist] = useState(false);
  const [isDeletingStylist, setIsDeletingStylist] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "both" as "men" | "women" | "both",
    price: 0,
    groupId: "",
  });

  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    category: "both" as "men" | "women" | "both",
    price: 0,
    groupId: "",
  });

  const [groupFormData, setGroupFormData] = useState({
    name: "",
    category: "both" as "men" | "women" | "both",
    order: 0,
  });

  const [originalGroupFormData, setOriginalGroupFormData] = useState({
    name: "",
    category: "both" as "men" | "women" | "both",
    order: 0,
  });

  const [stylistFormData, setStylistFormData] = useState({
    name: "",
    gender: "male" as "male" | "female",
  });

  const [originalStylistFormData, setOriginalStylistFormData] = useState({
    name: "",
    gender: "male" as "male" | "female",
  });

  const [serviceFilter, setServiceFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [groupFilter, setGroupFilter] = useState<
    "all" | "men" | "women" | "both"
  >("all");
  const [stylistFilter, setStylistFilter] = useState<"all" | "male" | "female">(
    "all",
  );

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

  const resetForm = () => {
    setFormData({
      name: "",
      category: "both",
      price: 0,
      groupId: "",
    });
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: "",
      category: "both",
      order: serviceGroups.length,
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

    const serviceData: any = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
    };

    if (formData.groupId) {
      serviceData.groupId = formData.groupId;
    }

    setIsAddingService(true);
    try {
      await addService(serviceData);
      toast.success("Service added successfully");
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to add service");
    } finally {
      setIsAddingService(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    const data = {
      name: service.name,
      category: service.category,
      price: service.price,
      groupId: service.groupId || "",
    };
    setFormData(data);
    setOriginalFormData(data);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error("Please enter service name and valid price");
      return;
    }

    const serviceData: any = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
    };

    if (formData.groupId) {
      serviceData.groupId = formData.groupId;
    }

    setIsUpdatingService(true);
    try {
      await updateService(editingService.id, serviceData);
      toast.success("Service updated successfully");
      setIsEditModalOpen(false);
      setEditingService(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to update service");
    } finally {
      setIsUpdatingService(false);
    }
  };

  const handleDelete = (service: any) => {
    setDeletingService(service);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingService) {
      setIsDeletingService(true);
      try {
        await deleteService(deletingService.id);
        toast.success("Service deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingService(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete service");
      } finally {
        setIsDeletingService(false);
      }
    }
  };

  const handleAddStylist = async () => {
    if (!stylistFormData.name) {
      toast.error("Please enter stylist name");
      return;
    }

    setIsAddingStylist(true);
    try {
      await addStylist({
        name: stylistFormData.name,
        gender: stylistFormData.gender,
      });
      toast.success("Stylist added successfully");
      setIsAddStylistModalOpen(false);
      resetStylistForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to add stylist");
    } finally {
      setIsAddingStylist(false);
    }
  };

  const handleEditStylist = (stylist: any) => {
    setEditingStylist(stylist);
    const data = {
      name: stylist.name,
      gender: stylist.gender,
    };
    setStylistFormData(data);
    setOriginalStylistFormData(data);
    setIsEditStylistModalOpen(true);
  };

  const handleUpdateStylist = async () => {
    if (!stylistFormData.name) {
      toast.error("Please enter stylist name");
      return;
    }

    setIsUpdatingStylist(true);
    try {
      await updateStylist(editingStylist.id, {
        name: stylistFormData.name,
        gender: stylistFormData.gender,
      });
      toast.success("Stylist updated successfully");
      setIsEditStylistModalOpen(false);
      setEditingStylist(null);
      resetStylistForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to update stylist");
    } finally {
      setIsUpdatingStylist(false);
    }
  };

  const handleDeleteStylist = (stylist: any) => {
    setDeletingStylist(stylist);
    setIsDeleteStylistModalOpen(true);
  };

  const confirmDeleteStylist = async () => {
    if (deletingStylist) {
      setIsDeletingStylist(true);
      try {
        await deleteStylist(deletingStylist.id);
        toast.success("Stylist deleted successfully");
        setIsDeleteStylistModalOpen(false);
        setDeletingStylist(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete stylist");
      } finally {
        setIsDeletingStylist(false);
      }
    }
  };

  const handleAddGroup = async () => {
    if (!groupFormData.name) {
      toast.error("Please enter service group name");
      return;
    }

    setIsAddingGroup(true);
    try {
      await addServiceGroup({
        name: groupFormData.name,
        category: groupFormData.category,
        order: groupFormData.order,
      });
      toast.success("Service group added successfully");
      setIsAddGroupModalOpen(false);
      resetGroupForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to add service group");
    } finally {
      setIsAddingGroup(false);
    }
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    const data = {
      name: group.name,
      category: group.category,
      order: group.order,
    };
    setGroupFormData(data);
    setOriginalGroupFormData(data);
    setIsEditGroupModalOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!groupFormData.name) {
      toast.error("Please enter service group name");
      return;
    }

    setIsUpdatingGroup(true);
    try {
      await updateServiceGroup(editingGroup.id, {
        name: groupFormData.name,
        category: groupFormData.category,
        order: groupFormData.order,
      });
      toast.success("Service group updated successfully");
      setIsEditGroupModalOpen(false);
      setEditingGroup(null);
      resetGroupForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to update service group");
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleDeleteGroup = (group: any) => {
    setDeletingGroup(group);
    setIsDeleteGroupModalOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (deletingGroup) {
      setIsDeletingGroup(true);
      try {
        await deleteServiceGroup(deletingGroup.id);
        toast.success("Service group deleted successfully");
        setIsDeleteGroupModalOpen(false);
        setDeletingGroup(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete service group");
      } finally {
        setIsDeletingGroup(false);
      }
    }
  };

  const menServices = services
    .filter((s) => s.category === "men")
    .sort((a, b) => a.name.localeCompare(b.name));
  const womenServices = services
    .filter((s) => s.category === "women")
    .sort((a, b) => a.name.localeCompare(b.name));

  const hasServiceFormChanged = useMemo(() => {
    if (!originalFormData.name) return false;
    return (
      formData.name !== originalFormData.name ||
      formData.category !== originalFormData.category ||
      formData.price !== originalFormData.price ||
      formData.groupId !== originalFormData.groupId
    );
  }, [formData, originalFormData]);

  const isServiceFormValid = useMemo(() => {
    return formData.name.trim().length > 0 && formData.price > 0;
  }, [formData.name, formData.price]);

  const hasStylistFormChanged = useMemo(() => {
    if (!originalStylistFormData.name) return false;
    return (
      stylistFormData.name !== originalStylistFormData.name ||
      stylistFormData.gender !== originalStylistFormData.gender
    );
  }, [stylistFormData, originalStylistFormData]);

  const isStylistFormValid = useMemo(() => {
    return stylistFormData.name.trim().length > 0;
  }, [stylistFormData.name]);

  const hasGroupFormChanged = useMemo(() => {
    if (!originalGroupFormData.name) return false;
    return (
      groupFormData.name !== originalGroupFormData.name ||
      groupFormData.category !== originalGroupFormData.category ||
      groupFormData.order !== originalGroupFormData.order
    );
  }, [groupFormData, originalGroupFormData]);

  const isGroupFormValid = useMemo(() => {
    return groupFormData.name.trim().length > 0;
  }, [groupFormData.name]);

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

  const filteredServiceGroups =
    groupFilter === "all"
      ? [...serviceGroups].sort((a, b) => a.order - b.order)
      : [...serviceGroups]
          .filter((g) => g.category === groupFilter || g.category === "both")
          .sort((a, b) => a.order - b.order);

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
          <TableHead className="w-[180px]">Group</TableHead>
          <TableHead className="w-[150px] text-right">Price</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {serviceList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No services available
            </TableCell>
          </TableRow>
        ) : (
          serviceList.map((service, index) => {
            const group = serviceGroups.find((g) => g.id === service.groupId);
            return (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>
                  {group ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-muted">
                      <Folder className="h-3 w-3" />
                      {group.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
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
            );
          })
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

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Service Groups
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceGroups.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Services
              </CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Men's Services
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menServices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Women's Services
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{womenServices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stylists
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stylists.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups">
              <Folder className="mr-2 h-4 w-4" />
              Service Groups
            </TabsTrigger>
            <TabsTrigger value="services">
              <Layers className="mr-2 h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="stylists">
              <Scissors className="mr-2 h-4 w-4" />
              Stylists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Groups</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={groupFilter}
                      onValueChange={(v: any) => setGroupFilter(v)}
                    >
                      <SelectTrigger className="w-[180px] h-10">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="men">Men Only</SelectItem>
                        <SelectItem value="women">Women Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsAddGroupModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Group
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Group Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServiceGroups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No service groups available
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServiceGroups.map((group, index) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{group.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize ${
                                group.category === "both"
                                  ? "bg-purple-50 text-purple-700 ring-purple-700/10"
                                  : group.category === "women"
                                    ? "bg-pink-50 text-pink-700 ring-pink-700/10"
                                    : "bg-blue-50 text-blue-700 ring-blue-700/10"
                              }`}
                            >
                              {group.category === "both"
                                ? "All"
                                : group.category === "men"
                                  ? "Men"
                                  : "Women"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditGroup(group)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteGroup(group)}
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
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Services</CardTitle>
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
                        <SelectItem value="medium">
                          Medium (₹500-999)
                        </SelectItem>
                        <SelectItem value="high">Premium (₹1K+)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </div>
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
          </TabsContent>

          <TabsContent value="stylists" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Stylists</CardTitle>
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
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          if (!isAddingService) {
            setIsAddModalOpen(open);
            if (!open) resetForm();
          }
        }}
      >
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
              <Label htmlFor="group">Service Group</Label>
              <Select
                value={formData.groupId || "unassigned"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    groupId: v === "unassigned" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {serviceGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    category: v as "men" | "women" | "both",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">All Services</SelectItem>
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
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isAddingService}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAddingService || !isServiceFormValid}
            >
              {isAddingService && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAddingService ? "Adding..." : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!isUpdatingService) {
            setIsEditModalOpen(open);
            if (!open) {
              setEditingService(null);
              resetForm();
            }
          }
        }}
      >
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
              <Label htmlFor="edit-group">Service Group</Label>
              <Select
                value={formData.groupId || "unassigned"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    groupId: v === "unassigned" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {serviceGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    category: v as "men" | "women" | "both",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">All Services</SelectItem>
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
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdatingService}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdatingService || !hasServiceFormChanged}
            >
              {isUpdatingService && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUpdatingService ? "Updating..." : "Update Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!isDeletingService) {
            setIsDeleteModalOpen(open);
            if (!open) setDeletingService(null);
          }
        }}
      >
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
              disabled={isDeletingService}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingService}
            >
              {isDeletingService && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isDeletingService ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddStylistModalOpen}
        onOpenChange={(open) => {
          if (!isAddingStylist) {
            setIsAddStylistModalOpen(open);
            if (!open) resetStylistForm();
          }
        }}
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
              disabled={isAddingStylist}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStylist}
              disabled={isAddingStylist || !isStylistFormValid}
            >
              {isAddingStylist && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAddingStylist ? "Adding..." : "Add Stylist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditStylistModalOpen}
        onOpenChange={(open) => {
          if (!isUpdatingStylist) {
            setIsEditStylistModalOpen(open);
            if (!open) {
              setEditingStylist(null);
              resetStylistForm();
            }
          }
        }}
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
              disabled={isUpdatingStylist}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStylist}
              disabled={isUpdatingStylist || !hasStylistFormChanged}
            >
              {isUpdatingStylist && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUpdatingStylist ? "Updating..." : "Update Stylist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteStylistModalOpen}
        onOpenChange={(open) => {
          if (!isDeletingStylist) {
            setIsDeleteStylistModalOpen(open);
            if (!open) setDeletingStylist(null);
          }
        }}
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
              disabled={isDeletingStylist}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteStylist}
              disabled={isDeletingStylist}
            >
              {isDeletingStylist && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isDeletingStylist ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddGroupModalOpen}
        onOpenChange={(open) => {
          if (!isAddingGroup) {
            setIsAddGroupModalOpen(open);
            if (!open) resetGroupForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize your services
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Hair Spa, Hair Treatment"
                value={groupFormData.name}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-category">Category</Label>
              <Select
                value={groupFormData.category}
                onValueChange={(v) =>
                  setGroupFormData({
                    ...groupFormData,
                    category: v as "men" | "women" | "both",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">All Services</SelectItem>
                  <SelectItem value="men">Men's Services</SelectItem>
                  <SelectItem value="women">Women's Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddGroupModalOpen(false)}
              disabled={isAddingGroup}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGroup}
              disabled={isAddingGroup || !isGroupFormValid}
            >
              {isAddingGroup && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAddingGroup ? "Adding..." : "Add Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditGroupModalOpen}
        onOpenChange={(open) => {
          if (!isUpdatingGroup) {
            setIsEditGroupModalOpen(open);
            if (!open) {
              setEditingGroup(null);
              resetGroupForm();
            }
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service Group</DialogTitle>
            <DialogDescription>Update service group details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                placeholder="e.g., Hair Spa, Hair Treatment"
                value={groupFormData.name}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-category">Category</Label>
              <Select
                value={groupFormData.category}
                onValueChange={(v) =>
                  setGroupFormData({
                    ...groupFormData,
                    category: v as "men" | "women" | "both",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">All Services</SelectItem>
                  <SelectItem value="men">Men's Services</SelectItem>
                  <SelectItem value="women">Women's Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditGroupModalOpen(false)}
              disabled={isUpdatingGroup}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateGroup}
              disabled={isUpdatingGroup || !hasGroupFormChanged}
            >
              {isUpdatingGroup && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUpdatingGroup ? "Updating..." : "Update Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteGroupModalOpen}
        onOpenChange={(open) => {
          if (!isDeletingGroup) {
            setIsDeleteGroupModalOpen(open);
            if (!open) setDeletingGroup(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? Services in this group
              will not be deleted, but will become unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteGroupModalOpen(false)}
              disabled={isDeletingGroup}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteGroup}
              disabled={isDeletingGroup}
            >
              {isDeletingGroup && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isDeletingGroup ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppointments } from "@/hooks/use-appointments";
import { useServiceGroups } from "@/hooks/use-service-groups";
import { useServices } from "@/hooks/use-services";
import { useStylists } from "@/hooks/use-stylists";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PAYMENT_METHODS = ["Cash", "Card", "UPI"];

interface AppointmentFormProps {
  onSuccess?: () => void;
  appointment?: any;
}

export function AppointmentForm({
  onSuccess,
  appointment,
}: AppointmentFormProps) {
  const { addAppointment, updateAppointment } = useAppointments();
  const { services } = useServices();
  const { serviceGroups } = useServiceGroups();
  const { stylists } = useStylists();
  const [loading, setLoading] = useState(false);

  const sortedServices = [...services].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sortedStylists = [...stylists].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const groupedServices = serviceGroups.map((group) => ({
    group,
    services: sortedServices.filter((s) => s.groupId === group.id),
  }));

  const ungroupedServices = sortedServices.filter((s) => !s.groupId);

  const [formData, setFormData] = useState({
    name: appointment?.name || "",
    phone: appointment?.phone || "",
    services: appointment?.services || [],
    date: appointment?.date ? new Date(appointment.date) : new Date(),
    amount: appointment?.amount || 0,
    discount: appointment?.discount || 0,
    paymentMethod: appointment?.paymentMethod || "",
    stylist: appointment?.stylist || "",
  });
  const [selectedService, setSelectedService] = useState("");
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(
    null,
  );
  const [editingPrice, setEditingPrice] = useState("");
  const [editingStylistIndex, setEditingStylistIndex] = useState<number | null>(
    null,
  );
  const [editingStylist, setEditingStylist] = useState("");

  const handleAddService = () => {
    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }
    const service = sortedServices.find((s) => s.id === selectedService);
    if (!service) return;

    let matchingGenderStylist;

    if (service.category === "both") {
      matchingGenderStylist = sortedStylists[0];
    } else {
      matchingGenderStylist = sortedStylists.find(
        (s) =>
          (service.category === "men" && s.gender === "male") ||
          (service.category === "women" && s.gender === "female"),
      );
    }

    const selectedStylist = matchingGenderStylist
      ? matchingGenderStylist.name
      : "";

    const newServices = [
      ...formData.services,
      {
        name: service.name,
        price: service.price,
        stylist: selectedStylist,
        category: service.category,
        groupId: service.groupId,
      },
    ];
    const newAmount = newServices.reduce((sum, s) => sum + s.price, 0);

    setFormData({
      ...formData,
      services: newServices,
      amount: newAmount,
      stylist: selectedStylist,
    });
    setSelectedService("");
  };

  const handleRemoveService = (index: number) => {
    const newServices = formData.services.filter(
      (_: any, i: number) => i !== index,
    );
    const newAmount = newServices.reduce(
      (sum: number, s: any) => sum + s.price,
      0,
    );

    setFormData({
      ...formData,
      services: newServices,
      amount: newAmount,
    });
  };

  const handleEditService = (index: number) => {
    setEditingServiceIndex(index);
    setEditingPrice(formData.services[index].price.toString());
  };

  const handleEditStylist = (index: number) => {
    setEditingStylistIndex(index);
    setEditingStylist(formData.services[index].stylist || "");
  };

  const handleSaveStylist = (index: number) => {
    if (!editingStylist) {
      toast.error("Please select a stylist");
      return;
    }

    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], stylist: editingStylist };

    setFormData({
      ...formData,
      services: newServices,
    });
    setEditingStylistIndex(null);
    setEditingStylist("");
  };

  const handleSaveEditedPrice = (index: number) => {
    const newPrice = parseFloat(editingPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], price: newPrice };
    const newAmount = newServices.reduce(
      (sum: number, s: any) => sum + s.price,
      0,
    );

    setFormData({
      ...formData,
      services: newServices,
      amount: newAmount,
    });
    setEditingServiceIndex(null);
    setEditingPrice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.services.length === 0) {
      toast.error("Please add at least one service");
      return;
    }

    const servicesWithoutStylist = formData.services.filter(
      (s: any) => !s.stylist,
    );
    if (servicesWithoutStylist.length > 0) {
      toast.error("Please ensure all services have a stylist assigned");
      return;
    }

    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      if (appointment?.id) {
        await updateAppointment(appointment.id, {
          ...formData,
          date: format(formData.date, "yyyy-MM-dd"),
          timestamp: appointment.timestamp,
        });
      } else {
        await addAppointment({
          ...formData,
          date: format(formData.date, "yyyy-MM-dd"),
          timestamp: new Date().toISOString(),
        });
      }
      onSuccess?.();
      if (!appointment?.id) {
        setFormData({
          name: "",
          phone: "",
          services: [],
          date: new Date(),
          amount: 0,
          discount: 0,
          paymentMethod: "",
          stylist: "",
        });
        setSelectedService("");
      }
    } catch (error) {
      toast.error(
        appointment?.id
          ? "Failed to update sale. Please try again."
          : "Failed to add sale. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const NON_DISCOUNTABLE_GROUPS = ["nails", "threading"];

  const hasNonDiscountableService = formData.services.some((service: any) => {
    if (!service.groupId) return false;
    const group = serviceGroups.find((g) => g.id === service.groupId);
    return (
      group && NON_DISCOUNTABLE_GROUPS.includes(group.name.toLowerCase().trim())
    );
  });

  const discountableAmount = formData.services.reduce(
    (sum: number, service: any) => {
      if (!service.groupId) return sum + service.price;
      const group = serviceGroups.find((g) => g.id === service.groupId);
      if (
        group &&
        NON_DISCOUNTABLE_GROUPS.includes(group.name.toLowerCase().trim())
      ) {
        return sum;
      }
      return sum + service.price;
    },
    0,
  );

  const nonDiscountableAmount = formData.amount - discountableAmount;

  const discountAmount = (discountableAmount * formData.discount) / 100;
  const finalAmount = formData.amount - discountAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Client Information</CardTitle>
          <CardDescription className="text-xs">
            Enter the customer details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Client Name
              </Label>
              <Input
                id="name"
                placeholder="Enter client name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">
                Phone Number
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  placeholder="98765 43210"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  required
                  minLength={10}
                  maxLength={10}
                  className="h-10 pl-12"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Service Details</CardTitle>
          <CardDescription className="text-xs">
            Add services and select stylist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm">
              Add Service
            </Label>
            <div className="flex gap-2">
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {groupedServices.map(({ group, services: groupServices }) =>
                    groupServices.length > 0 ? (
                      <div key={group.id}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {group.name}
                        </div>
                        {groupServices.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="pl-6">
                            {s.name}
                          </SelectItem>
                        ))}
                      </div>
                    ) : null,
                  )}
                  {ungroupedServices.length > 0 && (
                    <>
                      {groupedServices.some(
                        ({ services: gs }) => gs.length > 0,
                      ) && <div className="h-px bg-border my-1" />}
                      {ungroupedServices.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={handleAddService}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {formData.services.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Selected Services</Label>
              <div className="space-y-2">
                {formData.services.map((service: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{service.name}</p>
                          {service.category && (
                            <span
                              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${
                                service.category === "women"
                                  ? "bg-pink-50 text-pink-700 ring-pink-700/10"
                                  : service.category === "men"
                                    ? "bg-blue-50 text-blue-700 ring-blue-700/10"
                                    : "bg-purple-50 text-purple-700 ring-purple-700/10"
                              }`}
                            >
                              {service.category === "both"
                                ? "all"
                                : service.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {editingServiceIndex === index ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                ₹
                              </span>
                              <Input
                                type="number"
                                value={editingPrice}
                                onChange={(e) =>
                                  setEditingPrice(e.target.value)
                                }
                                className="h-7 w-24 text-xs"
                                autoFocus
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="h-7 text-xs"
                                onClick={() => handleSaveEditedPrice(index)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              ₹{service.price}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          {editingStylistIndex === index ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={editingStylist}
                                onValueChange={setEditingStylist}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs">
                                  <SelectValue placeholder="Select stylist" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sortedStylists.map((s) => (
                                    <SelectItem key={s.id} value={s.name}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="h-7 text-xs"
                                onClick={() => handleSaveStylist(index)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {service.stylist ||
                                formData.stylist ||
                                "No stylist"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingServiceIndex !== index &&
                        editingStylistIndex !== index && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              handleEditService(index);
                              handleEditStylist(index);
                            }}
                            title="Edit service"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveService(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date instanceof Date) {
                        setFormData({ ...formData, date });
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment" className="text-sm">
                Payment Method
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v) =>
                  setFormData({ ...formData, paymentMethod: v })
                }
                required
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select payment method" />
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
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Information</CardTitle>
          <CardDescription className="text-xs">
            Enter amount and discount details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                placeholder="0.00"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-sm">
                Discount (%)
                {hasNonDiscountableService && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (Not applied to Nails/Threading)
                  </span>
                )}
              </Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, discount: Number(e.target.value) })
                }
                placeholder="0"
                min="0"
                max="100"
                className="h-10"
                disabled={discountableAmount === 0}
              />
              {discountableAmount === 0 && formData.services.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  No discount available for selected services
                </p>
              )}
            </div>
          </div>

          <Separator />

          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6">
              {hasNonDiscountableService && formData.discount > 0 && (
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discountable services</span>
                    <span>₹{discountableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Non-discountable (Nails/Threading)</span>
                    <span>₹{nonDiscountableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount ({formData.discount}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Final Amount</span>
                <span className="text-2xl font-bold">
                  ₹{finalAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading
          ? appointment?.id
            ? "Updating..."
            : "Adding..."
          : appointment?.id
            ? "Update Sale"
            : "Add Sale"}
      </Button>
    </form>
  );
}

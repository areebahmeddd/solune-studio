import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NON_DISCOUNTABLE_GROUPS = ["nails", "threading", "packages (combos)", "packages", "combos"];

export function hasNonDiscountableService(
  services: any[],
  serviceGroups: any[],
): boolean {
  return services.some((service: any) => {
    if (!service.groupId) return false;
    const group = serviceGroups.find((g) => g.id === service.groupId);
    return (
      group && NON_DISCOUNTABLE_GROUPS.includes(group.name.toLowerCase().trim())
    );
  });
}

export function calculateDiscountableAmount(
  services: any[],
  serviceGroups: any[],
): number {
  return services.reduce((sum: number, service: any) => {
    if (!service.groupId) return sum + service.price;
    const group = serviceGroups.find((g) => g.id === service.groupId);
    if (
      group &&
      NON_DISCOUNTABLE_GROUPS.includes(group.name.toLowerCase().trim())
    ) {
      return sum;
    }
    return sum + service.price;
  }, 0);
}

export function calculateFinalAmount(
  services: any[],
  totalAmount: number,
  discountPercent: number,
  serviceGroups: any[],
): number {
  const discountableAmount = calculateDiscountableAmount(
    services,
    serviceGroups,
  );
  const discountAmount = (discountableAmount * discountPercent) / 100;
  return totalAmount - discountAmount;
}

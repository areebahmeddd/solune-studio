export type UserRole = "admin" | "owner" | "tax" | "unknown";

export interface RolePermissions {
  canEdit: boolean;
  canViewFixedExpenses: boolean;
  canAddFixedExpenses: boolean;
  canEditSettings: boolean;
  canEditAnalytics: boolean;
  canEditPromotions: boolean;
}

const ROLE_EMAILS = {
  admin: "admin@gmail.com",
  owner: "owner@gmail.com",
  tax: "tax@gmail.com",
} as const;

export function getUserRole(email: string | null | undefined): UserRole {
  if (!email) return "unknown";

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === ROLE_EMAILS.admin) return "admin";
  if (normalizedEmail === ROLE_EMAILS.owner) return "owner";
  if (normalizedEmail === ROLE_EMAILS.tax) return "tax";

  return "unknown";
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case "admin":
      return {
        canEdit: true,
        canViewFixedExpenses: false,
        canAddFixedExpenses: false,
        canEditSettings: false,
        canEditAnalytics: false,
        canEditPromotions: false,
      };
    case "owner":
      return {
        canEdit: true,
        canViewFixedExpenses: true,
        canAddFixedExpenses: true,
        canEditSettings: true,
        canEditAnalytics: true,
        canEditPromotions: true,
      };
    case "tax":
      return {
        canEdit: false,
        canViewFixedExpenses: true,
        canAddFixedExpenses: false,
        canEditSettings: false,
        canEditAnalytics: false,
        canEditPromotions: false,
      };
    default:
      return {
        canEdit: false,
        canViewFixedExpenses: false,
        canAddFixedExpenses: false,
        canEditSettings: false,
        canEditAnalytics: false,
        canEditPromotions: false,
      };
  }
}

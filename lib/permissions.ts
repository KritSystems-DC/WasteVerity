import { UserRole } from "@prisma/client";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  businessId?: string;
}

export function canCreateBusiness(user: UserSession): boolean {
  return true;
}

export function canManageBusiness(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "OWNER" && user.businessId === businessId) return true;
  return false;
}

export function canViewBusiness(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.businessId === businessId) return true;
  return false;
}

export function canManageStaff(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "OWNER" && user.businessId === businessId) return true;
  return false;
}

export function canEditStockItem(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.businessId === businessId && user.role !== "STAFF") return true;
  return false;
}

export function canDeleteStockItem(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.businessId === businessId && user.role === "OWNER") return true;
  return false;
}

export function canManageReorders(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.businessId === businessId && user.role !== "STAFF") return true;
  return false;
}

export function canApproveStaffRequest(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.businessId === businessId && user.role !== "STAFF") return true;
  return false;
}

export function canViewBillingAndSettings(user: UserSession, businessId: string): boolean {
  if (user.role === "ADMIN") return true;
  if (user.businessId === businessId && user.role === "OWNER") return true;
  return false;
}

export function canAccessAdminDashboard(user: UserSession): boolean {
  return user.role === "ADMIN";
}

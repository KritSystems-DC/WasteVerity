import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined, currency: string = "GBP"): string {
  if (amount === undefined || amount === null) return "£0.00";
  
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbols: { [key: string]: string } = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    JPY: "¥",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${num.toFixed(2)}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatQuantity(quantity: number, unit: string = "item"): string {
  return `${quantity} ${unit}${quantity !== 1 ? "s" : ""}`;
}

export function isExpiringSoon(expiryDate: Date | null | undefined, daysThreshold: number = 30): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays > 0;
}

export function isExpired(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return false;
  return new Date() > expiryDate;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(",");
  const dataRows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function calculateLowStockPercentage(current: number, minimum: number): number {
  if (minimum === 0) return 0;
  return Math.round((current / minimum) * 100);
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: "password", message: "Password must contain an uppercase letter" });
  }
  if (!/[a-z]/.test(password)) {
    errors.push({ field: "password", message: "Password must contain a lowercase letter" });
  }
  if (!/[0-9]/.test(password)) {
    errors.push({ field: "password", message: "Password must contain a number" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateBusinessName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: "businessName", message: "Business name is required" });
  }
  if (name.length > 100) {
    errors.push({ field: "businessName", message: "Business name must be less than 100 characters" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateStockItem(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: "name", message: "Item name is required" });
  }

  if (data.minimumQuantity < 0) {
    errors.push({ field: "minimumQuantity", message: "Minimum quantity cannot be negative" });
  }

  if (data.costPerUnit < 0) {
    errors.push({ field: "costPerUnit", message: "Cost per unit cannot be negative" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSupplier(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: "name", message: "Supplier name is required" });
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

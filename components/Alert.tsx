import React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, type = "info", ...props }, ref) => {
    const typeClasses = {
      info: "bg-blue-50 border-blue-200 text-blue-800",
      success: "bg-green-50 border-green-200 text-green-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: "bg-red-50 border-red-200 text-red-800",
    };

    const icons = {
      info: "ℹ️",
      success: "✓",
      warning: "⚠️",
      error: "✕",
    };

    return (
      <div
        ref={ref}
        className={cn("border rounded-lg p-4 flex items-start gap-3", typeClasses[type], className)}
        {...props}
      >
        <span className="text-lg flex-shrink-0">{icons[type]}</span>
        <div className="flex-1">{props.children}</div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

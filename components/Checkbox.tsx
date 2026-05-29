import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer",
            className
          )}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 cursor-pointer">{label}</label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

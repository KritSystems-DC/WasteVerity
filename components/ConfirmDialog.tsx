import React from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>
          <div className="border-t border-gray-200 p-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button
              variant={isDestructive ? "danger" : "primary"}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  visible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className="flex items-center gap-3 bg-[#46A400] text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px]">
        <svg
          className="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-[#46A400] rounded p-0.5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

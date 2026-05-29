"use client";

import { useFormStatus } from "react-dom";
import { RefreshCw, Truck, Camera } from "lucide-react";

interface SubmitButtonProps {
  text: string;
  iconName: "truck" | "camera";
  className?: string;
}

export function SubmitButton({ text, iconName, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full inline-flex items-center justify-center rounded-xl font-bold gap-2 text-sm px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none h-9 ${className || ""}`}
    >
      {pending ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : iconName === "truck" ? (
        <Truck className="h-4 w-4" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
      {pending ? "Memproses..." : text}
    </button>
  );
}
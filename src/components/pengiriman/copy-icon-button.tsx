"use client"; // 👈 Wajib agar onClick bisa berjalan aman

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // Reset ikon setelah 1.5 detik
    } catch (err) {
      console.error("Gagal menyalin resi:", err);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 transition-colors"
      onClick={handleCopy}
      title={copied ? "Tersalin!" : "Salin Resi"}
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500 animate-in fade-in zoom-in-50" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground hover:text-slate-900 dark:hover:text-white" />
      )}
    </Button>
  );
}
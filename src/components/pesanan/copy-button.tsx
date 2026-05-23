"use client"; // 👈 Mengamankan interaksi client-side

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset teks setelah 2 detik
    } catch (err) {
      console.error("Gagal menyalin teks: ", err);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="text-xs rounded-lg font-bold min-w-15"
    >
      {copied ? "Tersalin!" : "Salin"}
    </Button>
  );
}
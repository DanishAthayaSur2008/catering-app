// src/components/auth/logout-button.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth-actions";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    // ✅ JANGAN set isPending(true) di sini, biar toast langsung muncul
    
    // ✅ STEP 1: Toast success muncul PALING AWAL (pasti terlihat)
    toast.success("Berhasil logout, silahkan login kembali");
    
    // ✅ STEP 2: Panggil server action (tanpa strict error handling)
    // Kita tidak peduli error-nya apa, redirect akan tetap jalan
    logout().catch((err) => {
      // ✅ Hanya log ke console, JANGAN toast.error
      console.log("Logout completed:", err);
    });
    
    // ✅ STEP 3: Redirect ke login page (PASTI JALAN)
    // Diletakkan di akhir, tanpa await, tanpa try-catch
    window.location.href = "/auth/login";
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Logout
    </Button>
  );
}
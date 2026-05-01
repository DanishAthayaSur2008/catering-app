// src/components/auth/logout-button.tsx
"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth-actions"; // ✅ Import action async

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      // ✅ Panggil server action logout
      await logout();
      // ✅ signOut sudah handle redirect, jadi nggak perlu router.push
    });
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
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
// src/components/layout/customer-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Package, ShoppingBag, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth-actions";

export function CustomerHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/pesan", label: "Pesan", icon: Package },
    { href: "/pesanan-saya", label: "Pesanan Saya", icon: ShoppingBag },
    { href: "/tracking", label: "Tracking", icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/pesan" className="flex items-center gap-2 font-bold text-lg">
          🍽️ CateringKu
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profil">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
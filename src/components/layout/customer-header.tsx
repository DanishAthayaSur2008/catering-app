// src/components/layout/customer-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Package, ShoppingBag, Truck, User, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

export function CustomerHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/menu", label: "Menu", icon: UtensilsCrossed, color: "text-orange-500" },
    { href: "/pesan", label: "Pesan Menu", icon: Package, color: "text-orange-500" },
    { href: "/pesanan-saya", label: "Pesanan Saya", icon: ShoppingBag, color: "text-blue-500" },
    { href: "/tracking", label: "Lacak Kiriman", icon: Truck, color: "text-indigo-500" },
  ];

  return (
    <header className="sticky top-0 z-100 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          
          {/* 🍽️ Logo Area */}
          <Link 
            href="/menu" 
            className="flex items-center gap-2 group transition-all"
          >
            <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-200">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 italic">
              Catering<span className="text-orange-500">Pro.</span>
            </span>
          </Link>

          {/* 🧭 Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300",
                    isActive 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? item.color : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 👤 User Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pelanggan</span>
                <span className="text-sm font-bold text-slate-700">Halo, User!</span>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="rounded-xl hover:bg-slate-100 h-11 w-11"
            >
              <Link href="/profil">
                <User className="h-5 w-5 text-slate-600" />
              </Link>
            </Button>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 h-11 w-11 transition-colors"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

        </div>
      </div>

      {/* 📱 Mobile Navigation (Bottom Bar Style) */}
      <div className="md:hidden border-t bg-white/95 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-50 px-4 py-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? item.color : "text-slate-400"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive ? "bg-slate-50" : ""
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
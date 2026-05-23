// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROLE_PERMISSIONS, MENU_OPTIONS } from "@/types/enums";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  FileBarChart,
  CreditCard,
  ChefHat, // ✅ Import ChefHat untuk menggantikan emoji biasa
} from "lucide-react";
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/auth/logout-button";

type RoleType = keyof typeof ROLE_PERMISSIONS;

interface SidebarProps {
  userRole: string | undefined;
  currentPath: string;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    value: MENU_OPTIONS.DASHBOARD,
    path: "/dashboard",
  },
  {
    icon: Users,
    label: "Pelanggan",
    value: MENU_OPTIONS.PELANGGAN,
    path: "/pelanggan",
  },
  {
    icon: Package,
    label: "Paket Katering",
    value: MENU_OPTIONS.PAKET,
    path: "/paket",
  },
  {
    icon: ShoppingCart,
    label: "Pesanan",
    value: MENU_OPTIONS.PESANAN,
    path: "/pesanan",
  },
  {
    icon: Truck,
    label: "Pengiriman",
    value: MENU_OPTIONS.PENGIRIMAN,
    path: "/pengiriman",
  },
  {
    icon: CreditCard,
    label: "Metode Pembayaran",
    value: MENU_OPTIONS.PAYMENT_METHODS,
    path: "/payment-methods",
  },
  {
    icon: FileBarChart,
    label: "Laporan",
    value: MENU_OPTIONS.LAPORAN,
    path: "/laporan",
  },
];

export function Sidebar({ userRole, currentPath }: SidebarProps) {
  const { data: session } = useSession();
  
  
  const allowedMenus = userRole 
    ? ROLE_PERMISSIONS[userRole as RoleType] || [] 
    : [];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col sticky top-0">
      
      {/* 🍽️ Logo Section - Sekarang diselaraskan dengan gaya visual halaman pelanggan */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <div className="h-10 w-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
          <ChefHat className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h1 suppressHydrationWarning className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 italic">
            Catering<span className="text-orange-500">Pro.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!allowedMenus.includes(item.value)) return null;

          const isActive =
            currentPath === item.path ||
            currentPath?.startsWith(item.path + "/");

          return (
            <Link key={item.value} href={item.path}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-400">User Login</span>
            <span className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">
              {session?.user?.name || "User"}
            </span>
          </div>
          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
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
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/auth/logout-button";

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
    icon: FileBarChart,
    label: "Laporan",
    value: MENU_OPTIONS.LAPORAN,
    path: "/laporan",
  },
];

export function Sidebar({ userRole, currentPath }: SidebarProps) {
  const { data: session } = useSession();
  const allowedMenus = userRole ? ROLE_PERMISSIONS[userRole] || [] : [];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          🍽️ CateringPro
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Management System
        </p>
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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

      {/* Logout */}
      <div className="flex items-center gap-2">
        <span>Halo, {session?.user?.name}</span>
        <LogoutButton /> {/* ✅ Tombol logout yang berfungsi */}
      </div>
    </aside>
  );
}

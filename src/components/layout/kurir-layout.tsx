// src/components/layout/kurir-layout.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Truck, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/app/actions/auth-actions";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KurirLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export function KurirLayout({ children, userName = "Kurir" }: KurirLayoutProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const initial = userName.charAt(0).toUpperCase();

  const navItems = [
    { 
      href: "/kurir", 
      label: "Dashboard", 
      icon: LayoutDashboard, 
      active: pathname === "/kurir" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col antialiased">
      {/* --- HEADER (STICKY FIXED) --- */}
      <header className="sticky top-0 z-40 w-full h-16 border-b bg-white/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center justify-between w-full max-w-384 mx-auto">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 rounded-xl">
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white">
                <div className="px-6 py-8 border-b bg-slate-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">{userName}</p>
                      <p className="text-xs text-slate-500">Petugas Kurir</p>
                    </div>
                  </div>
                </div>
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.href}
                        variant={item.active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-11 rounded-xl transition-all",
                          item.active ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-slate-600"
                        )}
                        asChild
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link href={item.href}>
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      onClick={async () => {
                        setSheetOpen(false);
                        await logout();
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Keluar Aplikasi</span>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo Brand */}
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
              <Truck className="h-4 w-4 text-primary" />
              <span className="font-extrabold text-xs text-slate-900 tracking-wider xs:inline">
                KURIR PANEL
              </span>
            </div>
          </div>

          {/* User Profile Info & Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 leading-none mb-1">{userName}</span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 shadow-sm">
               <UserCircle className="h-5 w-5 text-slate-500" />
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
            <form action={logout} className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                type="submit"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* --- CONTENT CONTAINER WRAPPER (TRUE WIDE VISUAL) --- */}
      <div className="flex flex-1 w-full max-w-384 mx-auto px-4 md:px-8">
        
        {/* --- DESKTOP SIDEBAR (STICKY PERFECT) --- */}
        <aside className="hidden md:flex w-64 border-r bg-white flex-col py-6 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto select-none">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">
                Main Menu
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant={item.active ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11 rounded-xl transition-all",
                        item.active 
                          ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/25" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
          
          {/* Bottom Info Card */}
          <div className="mt-auto bg-slate-50 rounded-2xl p-4 border border-slate-200/50 shadow-sm">
             <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Shift Kerja</p>
             <p className="text-sm font-bold text-slate-700 italic">Pagi - Reguler</p>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA (STRETCHED & RESPONSIVE) --- */}
        <main className="flex-1 py-6 md:py-8 md:pl-8 pb-28 md:pb-8 w-full overflow-x-hidden">
           {children}
        </main>
      </div>

      {/* --- MOBILE BOTTOM NAV (GLASSMORPHISM ERGONOMIC) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white/90 backdrop-blur-xl px-6 pt-3 pb-5 flex justify-around items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 group transition-all",
                item.active ? "text-primary" : "text-slate-400"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                item.active ? "bg-primary/10" : "group-hover:bg-slate-100"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider scale-95">
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Quick Logout di Mobile Bottom Bar */}
        <button
          onClick={async () => await logout()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 active:text-red-600 transition-colors"
        >
          <div className="p-2 rounded-xl hover:bg-red-50">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider scale-95">Keluar</span>
        </button>
      </nav>
    </div>
  );
}
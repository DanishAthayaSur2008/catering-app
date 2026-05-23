// src/app/kurir/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KurirLayout } from "@/components/layout/kurir-layout";
import { KurirDashboard } from "@/components/dashboard/kurir-dashboard";
import { Suspense } from "react";

// Komponen Loading Skeleton saat data dimuat
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Header Welcome */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200 rounded-md" />
        <div className="h-4 w-64 bg-slate-100 rounded-md" />
      </div>
      
      {/* Skeleton Grid Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-100 rounded-xl border border-slate-200/60 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
            </div>
            <div className="h-4 w-full bg-slate-200/70 rounded" />
            <div className="h-4 w-3/4 bg-slate-200/70 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function KurirPage() {
  const session = await auth();
  
  // Ambil level user dan ubah ke huruf kecil untuk validasi aman (Case-Insensitive)
  const userLevel = session?.user?.level?.toLowerCase();

  // Proteksi Halaman: Jika belum login, ATAU levelnya bukan kurir/kuri, langsung tendang ke login
  if (!session || (userLevel !== "kurir" && userLevel !== "kuri")) {
    redirect("/auth/login");
  }

  const userName = session.user?.name || "Kurir";

  return (
    <KurirLayout userName={userName}>
      {/* Pembungkus Layout Utama dengan Grid & Padding yang Proporsional */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
        <Suspense fallback={<DashboardSkeleton />}>
          <KurirDashboard />
        </Suspense>
      </main>
    </KurirLayout>
  );
}
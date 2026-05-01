// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { PelangganDashboard } from "@/components/dashboard/pelanggan-dashboard";
import { KurirDashboard } from "@/components/dashboard/kurir-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  switch (session.user.level) {
    case "admin":
    case "owner":
      return <AdminDashboard />;
    case "pelanggan":
      return <PelangganDashboard />;
    case "kurir":
    case "kuri":
      return <KurirDashboard />;
    default:
      redirect("/auth/login");
  }
}
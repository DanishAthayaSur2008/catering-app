// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"; // Existing
import { CustomerDashboard } from "@/components/dashboard-customer/customer-dashboard"; // ✅ NEW

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const userId = Number(session.user.id);

  // ✅ ROLE: Pelanggan → render customer dashboard
  if (session.user.level === "pelanggan") {
    // Fetch customer-specific data
    const [activeOrders, pendingDelivery, completedOrders, recentOrders] = await Promise.all([
      prisma.pemesanan.count({
        where: { 
          idPelanggan: userId, 
          statusPesanan: { notIn: ["Selesai", "Dibatalkan"] } 
        }
      }),
      prisma.pemesanan.count({
        where: { 
          idPelanggan: userId, 
          statusPesanan: "Menunggu_Kurir" 
        }
      }),
      prisma.pemesanan.count({
        where: { 
          idPelanggan: userId, 
          statusPesanan: "Selesai" 
        }
      }),
      prisma.pemesanan.findMany({
        where: { idPelanggan: userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          statusPesanan: true,
          totalHarga: true,
          createdAt: true,
        },
      }),
    ]);

    return (
      <CustomerDashboard
        stats={{
          activeOrders,
          pendingDelivery,
          completedOrders,
        }}
        recentOrders={recentOrders.map((o) => ({
          id: o.id,
          status: o.statusPesanan,
          total: o.totalHarga,
          date: new Date(o.createdAt).toLocaleDateString("id-ID"),
        }))}
      />
    );
  }

  // ✅ ROLE: Admin/Owner → render admin dashboard (existing)
  if (session.user.level === "admin" || session.user.level === "owner") {
    return <AdminDashboard />;
  }

  // ✅ ROLE: Kurir → redirect to pengiriman
  if (session.user.level === "kurir" || session.user.level === "kuri") {
    redirect("/pengiriman");
  }

  redirect("/auth/login");
}
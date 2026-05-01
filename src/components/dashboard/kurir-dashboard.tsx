// src/components/dashboard/kurir-dashboard.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export async function KurirDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const assignedToday = await prisma.pengiriman.count({
    where: { kurirId: Number(session.user.id), statusKirim: { not: "Tiba_Ditujuan" } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Kurir</h2>
          <p className="text-muted-foreground">Kelola tugas pengiriman & update status real-time.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/pengiriman">Lihat Semua Tugas</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tugas Hari Ini</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{assignedToday}</div><p className="text-xs text-muted-foreground">Perlu diselesaikan</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Menunggu Pickup</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">2</div><p className="text-xs text-muted-foreground">Siap diambil</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Selesai Hari Ini</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">4</div><p className="text-xs text-muted-foreground">Terkirim tepat waktu</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Rute Pengiriman Terdekat</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Kelola & update status pengiriman di halaman <Link href="/pengiriman" className="text-primary hover:underline">Pengiriman</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
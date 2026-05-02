// src/app/tracking/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_PESANAN } from "@/types/enums";

export default async function TrackingPage({ searchParams }: { searchParams: { id?: string } }) {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") redirect("/auth/login");

  const customerId = Number(session.user.id);

  if (searchParams?.id) {
    const pesanan = await prisma.pemesanan.findFirst({
      where: { 
        id: parseInt(searchParams.id), 
        idPelanggan: customerId 
      },
      include: { 
        pengiriman: true, 
        detailPemesanans: { include: { paket: true } } 
      }
    });

    if (!pesanan) notFound();

    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <main className="container py-6 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Tracking Pesanan #{pesanan.id}</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Status Pengiriman</span>
                <Badge>
                  {/* Langsung akses saja karena schema sudah sinkron */}
                  {pesanan.pengiriman?.statusKirim?.replace(/_/g, " ") || "Menunggu Kurir"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Pesanan Diterima</p>
                    <p className="text-sm text-muted-foreground">{formatDate(pesanan.createdAt)}</p>
                  </div>
                </div>
                
                {pesanan.pengiriman?.estimasiTiba && (
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Estimasi Tiba</p>
                      <p className="text-sm text-muted-foreground">{formatDate(pesanan.pengiriman.estimasiTiba)}</p>
                    </div>
                  </div>
                )}

                {pesanan.pengiriman?.aktualTiba && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Tiba di Tujuan</p>
                      <p className="text-sm text-muted-foreground">{formatDate(pesanan.pengiriman.aktualTiba)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pesananAktif = await prisma.pemesanan.findMany({
    where: { 
      idPelanggan: customerId, 
      statusPesanan: { 
        notIn: [STATUS_PESANAN.DIBATALKAN, STATUS_PESANAN.SELESAI] 
      } 
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Tracking Pengiriman</h1>
        {pesananAktif.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Tidak ada pengiriman aktif.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {pesananAktif.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pesanan #{p.id}</p>
                    <p className="text-sm text-muted-foreground">{p.statusPesanan.replace(/_/g, " ")}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/tracking?id=${p.id}`}>Lacak</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
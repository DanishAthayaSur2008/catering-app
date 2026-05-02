// src/app/pesanan-saya/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { cancelPesanan } from "@/app/actions/customer-pesanan-actions"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, getStatusPesananColor, getStatusPembayaranColor } from "@/lib/utils";
import { Trash2, Truck, ShoppingBag } from "lucide-react"; // Hapus CreditCard karena tidak dipakai
import { STATUS_PESANAN } from "@/types/enums";
// Hapus revalidatePath dari sini karena sudah ada di dalam file action

export default async function PesananSayaPage() {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") redirect("/auth/login");

  const pesanan = await prisma.pemesanan.findMany({
    where: { idPelanggan: Number(session.user.id) },
    include: { 
      detailPemesanans: { 
        include: { paket: true } 
      },
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <main className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pesanan Saya</h1>
            <p className="text-muted-foreground">Kelola & pantau pesanan katering Anda.</p>
          </div>
          <Button asChild>
            <a href="/pesan">+ Pesan Baru</a>
          </Button>
        </div>
        
        {pesanan.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Pesanan</h3>
              <p className="text-muted-foreground mb-4">Yuk pesan katering pertama Anda!</p>
              <Button asChild>
                <a href="/pesan">Mulai Pesan</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pesanan.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-muted-foreground">#{p.id}</p>
                      {p.statusPembayaran && (
                        <Badge variant="outline" className={getStatusPembayaranColor(p.statusPembayaran)}>
                          {p.statusPembayaran.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">Pesanan {formatDate(p.tanggalAcara)}</CardTitle>
                    <CardDescription>Dibuat {formatDate(p.createdAt)}</CardDescription>
                  </div>
                  <Badge className={getStatusPesananColor(p.statusPesanan)}>
                    {p.statusPesanan.replace(/_/g, " ")}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Item Pesanan:</p>
                    {/* Menggunakan tipe data dari item p langsung agar tidak kena error 'any' */}
                    {p.detailPemesanans.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.paket.namaPaket}</span>
                        <span className="text-muted-foreground">×{item.jumlah} • {formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatRupiah(p.totalHarga)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.statusPesanan === STATUS_PESANAN.MENUNGGU_KONFIRMASI && (
                      <form action={async () => {
                        "use server";
                        await cancelPesanan(p.id);
                      }}>
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Batalkan Pesanan
                        </Button>
                      </form>
                    )}
                    
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/tracking?id=${p.id}`}>
                        <Truck className="mr-2 h-4 w-4" /> Lacak / Detail
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
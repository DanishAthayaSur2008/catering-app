import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, CheckCircle, Truck, Phone, Package, RefreshCw, Navigation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateStatusKirim, uploadBuktiFoto } from "@/app/actions/pengiriman-actions";
import { SubmitButton } from "./submit-button"; // 👈 Import dari file atas

function getStatusKirimColor(status: string): string {
  const colors: Record<string, string> = {
    "Belum_Dikirim": "bg-amber-100 text-amber-700 border-amber-200",
    "Sedang_Dikirim": "bg-blue-100 text-blue-700 border-blue-200",
    "Tiba_Ditujuan": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return colors[status] || "bg-slate-100 text-slate-700";
}

export async function KurirDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
        <Truck className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Sesi berakhir. Silakan login kembali.</p>
      </div>
    );
  }

  const kurirId = Number(session.user.id);
  if (Number.isNaN(kurirId)) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
        <p className="font-bold">Akses Ditolak</p>
        <p className="text-sm">ID Kurir tidak terdeteksi secara valid.</p>
      </div>
    );
  }

  let dashboardData;
  try {
    const [assignedToday, waitingPickup, completedToday, activeDeliveries] = await Promise.all([
      prisma.pengiriman.count({
        where: { kurirId, statusKirim: { not: "Tiba_Ditujuan" } }
      }),
      prisma.pengiriman.count({
        where: { kurirId, statusKirim: "Belum_Dikirim" }
      }),
      prisma.pengiriman.count({
        where: { 
          kurirId, 
          statusKirim: "Tiba_Ditujuan",
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.pengiriman.findMany({
        where: { 
          kurirId, 
          statusKirim: { in: ["Belum_Dikirim", "Sedang_Dikirim"] }
        },
        include: {
          pemesanan: {
            include: {
              pelanggan: true,
              detailPemesanans: { include: { paket: true } }
            }
          }
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    dashboardData = { assignedToday, waitingPickup, completedToday, activeDeliveries };
  } catch (error) {
    console.error("Database Error:", error);
    return (
      <div className="p-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-red-50 mb-4">
          <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
        </div>
        <p className="text-slate-600 font-medium">Gagal memuat data pengiriman</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/kurir">Coba Segarkan Halaman</Link>
        </Button>
      </div>
    );
  }

  const { assignedToday, waitingPickup, completedToday, activeDeliveries } = dashboardData;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ringkasan Tugas</h2>
          <p className="text-sm text-slate-500 font-medium">Pantau kirimanmu hari ini</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">
          <Link href="/kurir" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Update Data
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tugas</p>
                <h3 className="text-3xl font-black text-slate-900">{assignedToday}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Siap Ambil</p>
                <h3 className="text-3xl font-black text-slate-900">{waitingPickup}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Selesai</p>
                <h3 className="text-3xl font-black text-emerald-600">{completedToday}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-2 italic">Tugas Hari Ini</p>
          </CardContent>
        </Card>
      </div>

      {/* List Antrean Tugas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-slate-800">Daftar Antrean Kiriman</h3>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="inline-flex p-6 rounded-full bg-slate-50 mb-4 text-slate-300">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Semua Tugas Beres!</h4>
            <p className="text-slate-500 max-w-xs mx-auto">Tidak ada pengiriman aktif saat ini. Waktunya istirahat sejenak.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeDeliveries.map((pengiriman) => (
              <Card key={pengiriman.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Info Utama */}
                    <div className="flex-1 p-5 md:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn("px-3 py-1 rounded-full font-bold border-2 uppercase text-[10px]", getStatusKirimColor(pengiriman.statusKirim))}>
                          {pengiriman.statusKirim.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs font-black text-slate-300 tracking-tighter">ID #{pengiriman.pemesanan?.id || "---"}</span>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight">
                          {pengiriman.pemesanan?.pelanggan?.namaPelanggan || "Tanpa Nama"}
                        </h4>
                        <div className="flex items-start gap-2 mt-2 group">
                          <div className="mt-1 p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {pengiriman.alamatTujuan || pengiriman.pemesanan?.pelanggan?.alamat1 || "Alamat tidak lengkap"}
                          </p>
                        </div>
                      </div>

                      {/* Detail Item */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {pengiriman.pemesanan?.detailPemesanans?.map((d) => (
                          <div key={d.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                            <Package className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">
                               {d.paket?.namaPaket} <span className="text-primary">x{d.jumlah}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-50/50 md:w-64 border-t md:border-t-0 md:border-l border-slate-100 p-5 flex flex-col justify-center gap-3">
                      {pengiriman.pemesanan?.pelanggan?.noTelp && (
                        <Button asChild variant="outline" size="sm" className="w-full rounded-xl font-bold gap-2 border-slate-200">
                          <a href={`tel:${pengiriman.pemesanan.pelanggan.noTelp}`}>
                            <Phone className="h-4 w-4 text-emerald-500" />
                            Hubungi
                          </a>
                        </Button>
                      )}

                      {/* Tombol Mulai Kirim */}
                      {pengiriman.statusKirim === "Belum_Dikirim" && (
                        <form className="w-full" action={async () => {
                          "use server";
                          await updateStatusKirim(pengiriman.id, "Sedang_Dikirim");
                        }}>
                          <SubmitButton 
                            text="Mulai Kirim" 
                            iconName="truck" 
                            className="shadow-lg shadow-primary/20" 
                          />
                        </form>
                      )}

                      {/* Tombol Upload Bukti */}
                      {pengiriman.statusKirim === "Sedang_Dikirim" && (
                        <div className="space-y-2 w-full">
                          <form className="w-full space-y-2" action={async (formData: FormData) => {
                            "use server";
                            await uploadBuktiFoto(formData);
                          }}>
                            <input type="hidden" name="idPengiriman" value={pengiriman.id} />
                            <Input
                              type="file"
                              name="buktiFoto"
                              accept="image/*"
                              required
                              className="text-xs bg-white rounded-xl cursor-pointer"
                            />
                            <SubmitButton 
                              text="Upload Bukti" 
                              iconName="camera" 
                              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" 
                            />
                          </form>
                          <p className="text-[10px] text-muted-foreground text-center">
                            📋 Setelah upload, admin akan approve untuk menandai selesai.
                          </p>
                        </div>
                      )}

                      {/* Indikator: Menunggu Approval */}
                      {pengiriman.buktiFoto && pengiriman.statusKirim === "Sedang_Dikirim" && (
                        <Badge variant="outline" className="w-full justify-center text-amber-600 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Menunggu Approval Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
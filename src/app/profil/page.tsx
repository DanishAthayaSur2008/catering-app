// src/app/profil/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Phone, MapPin, Map, UserCircle, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerHeader } from "@/components/layout/customer-header";
import { getMyProfile } from "@/app/actions/profile-actions";
import { Avatar } from "@/components/profil/avatar";
import { EditProfileDialog } from "@/components/profil/edit-profile-dialog";

// ✅ HELPER: Convert Buffer (Bytes dari Prisma) ke Base64 Data URL
function bufferToBase64(buffer: Buffer | Uint8Array | string | null, mimeType = "image/jpeg"): string | null {
  if (!buffer) return null;
  
  // Kalau sudah string (URL atau Base64), return langsung
  if (typeof buffer === "string") return buffer;
  
  // Kalau Buffer atau Uint8Array, convert ke Base64
  try {
    const base64 = Buffer.isBuffer(buffer) 
      ? buffer.toString("base64")
      : Buffer.from(buffer).toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user || session.user.level !== "pelanggan") {
    redirect("/dashboard");
  }

  const pelanggan = await getMyProfile();
  if (!pelanggan) {
    redirect("/auth/login");
  }

  // ✅ Convert foto Buffer ke Base64 sebelum pass ke client component
  const serializedPelanggan = {
    ...pelanggan,
    foto: bufferToBase64(pelanggan.foto as Buffer | Uint8Array | string | null),
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <CustomerHeader />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* 👤 Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <UserCircle className="w-3 h-3" />
              Akun Pelanggan
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Profil <span className="text-teal-600">Saya</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              Kelola informasi pribadi dan alamat pengiriman Anda untuk pengalaman pesan yang lebih cepat.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* 🪪 Main Profile Info (Kiri/Besar) */}
          <div className="md:col-span-8 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Header Profil (Gradient) */}
                <div className="h-32 bg-linear-to-r from-teal-500 to-emerald-400 relative">
                  {/* ✅ Pass serialized data (Base64 string) */}
                  <div className="absolute top-4 right-4">
                    <EditProfileDialog profile={serializedPelanggan} />
                  </div>
                </div>
                
                <div className="px-8 pb-8">
                  {/* ✅ Gunakan Komponen Avatar kustom kita */}
                  <div className="relative -mt-12 mb-4 flex items-end gap-4">
                    <Avatar 
                      fotoBuffer={pelanggan.foto as Buffer | null} 
                      namaPelanggan={pelanggan.namaPelanggan} 
                      className="h-24 w-24 border-4 border-white shadow-lg bg-white"
                    />
                    <div className="mb-2">
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">{pelanggan.namaPelanggan}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pelanggan.email}</p>
                    </div>
                  </div>

                  {/* Data Profil */}
                  <div className="grid sm:grid-cols-2 gap-6 mt-8">
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nomor Telepon</span>
                      </div>
                      <p className="font-bold text-slate-800">{pelanggan.noTelp || "Belum ditambahkan"}</p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Alamat Utama</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-relaxed">{pelanggan.alamat1 || "Belum ditambahkan"}</p>
                    </div>

                    {(pelanggan.address2 || pelanggan.address3) && (
                      <div className="sm:col-span-2 space-y-4 pt-4 border-t border-slate-100 mt-2">
                        {pelanggan.address2 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Map className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Alamat Tambahan 1</span>
                            </div>
                            <p className="font-bold text-slate-700 text-sm">{pelanggan.address2}</p>
                          </div>
                        )}
                        {pelanggan.address3 && (
                          <div className="space-y-1.5 mt-3">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Map className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Alamat Tambahan 2</span>
                            </div>
                            <p className="font-bold text-slate-700 text-sm">{pelanggan.address3}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🛍️ Quick Actions / Activity (Kanan/Kecil) */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-black text-slate-800">Aktivitas & Pesanan</h3>
              </div>
              <CardContent className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-orange-50 p-6 rounded-full relative">
                  <ShoppingBag className="h-10 w-10 text-orange-500" />
                  <div className="absolute top-2 right-2 h-4 w-4 bg-orange-400 rounded-full animate-ping opacity-75" />
                  <div className="absolute top-2 right-2 h-4 w-4 bg-orange-500 rounded-full border-2 border-white" />
                </div>
                
                <div>
                  <p className="font-black text-slate-900 text-lg">Siap pesan katering?</p>
                  <p className="text-sm font-medium text-slate-500 mt-2 px-2">
                    Jelajahi menu favorit kami atau pantau pesanan Anda yang sedang berjalan.
                  </p>
                </div>
                
                <div className="w-full space-y-3 mt-4">
                  <Button asChild className="w-full rounded-xl h-12 font-bold shadow-lg shadow-orange-200 bg-orange-500 hover:bg-orange-600 border-none">
                    <Link href="/pesan">
                      Buat Pesanan Baru
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-xl h-12 font-bold border-2 text-slate-600 gap-2 hover:bg-slate-50">
                    <Link href="/pesanan-saya">
                      <History className="h-4 w-4" /> Riwayat Pesanan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
// src/app/paket/page.tsx
import { getPakets } from "@/app/actions/paket-actions";
import { PaketFormDialog } from "@/components/paket/paket-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Image as ImageIcon, Filter, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { KATEGORI_PAKET } from "@/lib/validations/paket";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { auth } from "@/lib/auth";

// ✅ HELPER: Convert Buffer (Bytes dari Prisma) ke Base64 Data URL
// Ini WAJIB karena Next.js RSC nggak bisa kirim Uint8Array/Buffer ke Client Component
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

interface PaketPageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>;
}

export default async function PaketPage({ searchParams }: PaketPageProps) {
  const session = await auth();
  const params = await searchParams;
  const search = params?.q || "";
  const kategori = params?.kategori || "all";

  const pakets = await getPakets(search, kategori);

  // ✅ Convert semua foto Buffer ke Base64 string sebelum render
  const paketsWithPhotos = pakets.map((p) => ({
    ...p,
    foto: bufferToBase64(p.foto as Buffer | Uint8Array | string | null),
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar - Menggunakan role dari session */}
      <Sidebar userRole={session?.user?.level} currentPath="/paket" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Sekarang mengirim session.user agar dropdown profil muncul */}
        <Header user={session?.user} />

        {/* Main Content - Tengah */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Title & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Paket Katering</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <UtensilsCrossed className="h-4 w-4" />
                  Kelola menu, kategori, dan harga paket katering Anda.
                </p>
              </div>
              <PaketFormDialog mode="create" />
            </div>

            {/* Filters Section */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <form className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama paket atau menu..."
                      className="pl-10 bg-slate-50/50 dark:bg-slate-800"
                      defaultValue={search}
                      name="q"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select name="kategori" defaultValue={kategori}>
                      <SelectTrigger className="w-full md:w-50 bg-slate-50/50 dark:bg-slate-800">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {KATEGORI_PAKET.map((kat) => (
                          <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="submit" variant="default" className="shrink-0">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Package Grid */}
            {paketsWithPhotos.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paketsWithPhotos.map((p) => (
                  <Card key={p.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col">
                    {/* Image Header */}
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {p.foto ? (
                        <Image
                          src={p.foto} // ✅ Sekarang Base64 string, aman untuk <Image>
                          alt={p.namaPaket}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized // ✅ Penting: skip Next.js Image Optimization untuk Base64
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                          <span className="text-xs italic">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white hover:bg-white border-none shadow-sm backdrop-blur-sm">
                          {p.kategori}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xl font-bold line-clamp-1 text-slate-900 dark:text-slate-100">
                        {p.namaPaket}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                        {p.menuPaket}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-primary">
                          {formatRupiah(p.hargaPaket)}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">/ porsi</span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-0 mt-auto">
                      <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <PaketFormDialog
                          paket={{
                            id: p.id,
                            namaPaket: p.namaPaket,
                            menuPaket: p.menuPaket,
                            kategori: p.kategori,
                            hargaPaket: p.hargaPaket,
                            foto: p.foto, // ✅ Base64 string, compatible dengan component
                          }}
                          mode="edit"
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Paket tidak ditemukan</h3>
                  <p className="text-sm text-muted-foreground max-w-75 text-center mt-1">
                    {search || kategori !== "all"
                      ? "Coba ubah filter atau kata kunci pencarian Anda."
                      : "Belum ada data paket katering. Klik tombol 'Tambah Paket' untuk memulai."}
                  </p>
                  {(search || kategori !== "all") && (
                    <Button variant="link" className="mt-2" asChild>
                      <a href="/paket">Reset Filter</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Footer Stats */}
            <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-800">
               <p className="text-xs text-muted-foreground italic">
                Menampilkan {paketsWithPhotos.length} paket katering
              </p>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">System Ready</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
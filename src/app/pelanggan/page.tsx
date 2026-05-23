// src/app/pelanggan/page.tsx
import { auth } from "@/lib/auth";
import { getPelanggans } from "@/app/actions/pelanggan-actions";
import { PelangganFormDialog } from "@/components/pelanggan/pelanggan-form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { SearchBar } from "@/components/pelanggan/search-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import fungsi pembantu dari image-utils untuk melakukan konversi di sisi server
import { bufferToDataUrl, detectMimeType } from "@/lib/image-utils";

interface PelangganPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PelangganPage({ searchParams }: PelangganPageProps) {
  // 1. Ambil session di server-side
  const session = await auth();
  const params = await searchParams;
  const search = params?.q || "";
  
  // 2. Fetch data mentah pelanggan dari database
  const rawPelanggans = await getPelanggans(search);

  // 3. Konversi Uint8Array / Buffer menjadi Base64 Data URL string yang aman dikirim ke Client Component
  const pelanggans = rawPelanggans.map((p) => {
    let fotoUrl: string | null = null;
    
    if (p.foto) {
      // Deteksi otomatis format gambar (png/jpg/webp) lalu konversi ke Base64 data URL string
      const mimeType = detectMimeType(Buffer.from(p.foto));
      fotoUrl = bufferToDataUrl(p.foto, mimeType);
    }

    return {
      ...p,
      foto: fotoUrl, // Sekarang bertipe 'string | null' (Plain Object), bukan Uint8Array lagi!
    };
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar - Menggunakan role dari session */}
      <Sidebar userRole={session?.user?.level} currentPath="/pelanggan" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Sekarang mengirim session.user agar dropdown profil muncul */}
        <Header user={session?.user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Title & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pelanggan</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4" />
                  Kelola dan pantau data pelanggan katering Anda.
                </p>
              </div>
              <PelangganFormDialog mode="create" />
            </div>

            {/* Filter & Search Section */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <SearchBar defaultValue={search} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="border-b bg-white dark:bg-slate-900 py-4">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-lg font-semibold">Daftar Pelanggan</CardTitle>
                   <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">
                     Total: {pelanggans.length}
                   </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHead className="w-95">Nama Pelanggan</TableHead>
                      <TableHead className="hidden md:table-cell">Kontak</TableHead>
                      <TableHead className="hidden lg:table-cell">Alamat Utama</TableHead>
                      <TableHead className="w-32">Status Akun</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pelanggans.length > 0 ? (
                      pelanggans.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {p.foto ? (
                                <Image 
                                  src={p.foto} 
                                  alt={p.namaPelanggan}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm">
                                  <span className="text-primary font-bold text-sm">
                                    {p.namaPelanggan.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{p.namaPelanggan}</span>
                                <span className="text-xs text-muted-foreground md:hidden">
                                  {p.noTelp}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400 font-medium">
                            {p.noTelp || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell max-w-50">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm truncate text-slate-600 dark:text-slate-400" title={p.alamat1 || ""}>
                                {p.alamat1 || "-"}
                              </p>
                              {(p.address2 || p.address3) && (
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase border-slate-200 text-slate-500">
                                    +{ (p.address2 ? 1 : 0) + (p.address3 ? 1 : 0) } Alamat lain
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {p.email && p.password ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 rounded-md text-[10px] uppercase">
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-slate-500 border-none px-2 py-0.5 rounded-md text-[10px] uppercase">
                                Offline
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <PelangganFormDialog 
                              pelanggan={{
                                id: p.id,
                                namaPelanggan: p.namaPelanggan,
                                alamat1: p.alamat1,
                                alamat2: p.address2,
                                alamat3: p.address3,
                                noTelp: p.noTelp,
                                foto: p.foto, // Mengirimkan URL string murni yang aman ke Client Component
                              }}
                              mode="edit"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                              <UserPlus className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Pelanggan tidak ditemukan</h3>
                            <p className="text-sm text-muted-foreground max-w-62.5 mx-auto mt-1">
                              {search 
                                ? `Hasil untuk "${search}" tidak ditemukan.` 
                                : "Mulailah dengan menambahkan pelanggan baru ke sistem Anda."}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Stats Footer */}
            <p className="text-xs text-muted-foreground text-center italic pb-4">
              Data diperbarui secara otomatis. Menampilkan {pelanggans.length} entri.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
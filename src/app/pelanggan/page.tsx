// src/app/pelanggan/page.tsx
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
import { UserPlus } from "lucide-react";
import Image from "next/image";
import { SearchBar } from "@/components/pelanggan/search-bar";

interface PelangganPageProps {
  searchParams: Promise<{ q?: string }>; // ✅ Type harus Promise
}

export default async function PelangganPage({ searchParams }: PelangganPageProps) {
  // ✅ FIX 1: Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;
  const search = params?.q || "";
  
  const pelanggans = await getPelanggans(search);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pelanggan</h2>
          <p className="text-muted-foreground">
            Kelola data pelanggan katering Anda.
          </p>
        </div>
        <PelangganFormDialog mode="create" />
      </div>

      {/* Search Bar */}
      <SearchBar defaultValue={search} />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Telepon</TableHead>
              <TableHead className="hidden lg:table-cell">Alamat</TableHead>
              <TableHead>Status Akun</TableHead> {/* ✅ Header Baru */}
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pelanggans.length > 0 ? (
              pelanggans.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {p.foto ? (
                        <Image 
                          src={p.foto} 
                          alt={p.namaPelanggan}
                          className="h-10 w-10 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {p.namaPelanggan.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.namaPelanggan}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {p.noTelp}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.noTelp || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-xs">
                    <p className="text-sm truncate" title={p.alamat1 || ""}>
                      {p.alamat1 || "-"}
                    </p>
                    {(p.address2 || p.address3) && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        +{(p.address2 ? 1 : 0) + (p.address3 ? 1 : 0)} alamat
                      </Badge>
                    )}
                  </TableCell>
                  
                  {/* ✅ Kolom Status Akun yang Ditambahkan */}
                  <TableCell>
                    {p.email && p.password ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        ✅ Sudah Punya Akun
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        ⚪ Belum Daftar
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <PelangganFormDialog 
                        pelanggan={{
                          id: p.id,
                          namaPelanggan: p.namaPelanggan,
                          alamat1: p.alamat1,
                          alamat2: p.address2,
                          alamat3: p.address3,
                          noTelp: p.noTelp,
                          foto: p.foto,
                        }}
                        mode="edit"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                {/* ✅ colSpan diubah jadi 5 karena jumlah kolom bertambah */}
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UserPlus className="h-8 w-8 mb-2 opacity-50" />
                    <p>
                      {search 
                        ? "Tidak ada pelanggan yang cocok dengan pencarian." 
                        : "Belum ada pelanggan. Tambah yang pertama!"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats Footer */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {pelanggans.length} pelanggan
        {search && ` untuk pencarian "${search}"`}
      </div>
    </div>
  );
}
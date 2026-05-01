/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/pengiriman/page.tsx
import { auth } from "@/lib/auth";
import { getPengirimanList, getPesananMenungguKirim } from "@/app/actions/pengiriman-actions";
import { PengirimanFormDialog } from "@/components/pengiriman/pengiriman-form-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { STATUS_KIRIM } from "@/lib/validations/pengiriman";

interface PengirimanPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function PengirimanPage({ searchParams }: PengirimanPageProps) {
  const session = await auth();
  const params = await searchParams;
  const search = params?.q || "";
  const status = params?.status || "all";
  
  const userRole = session?.user?.level;
  const kurirId = userRole === "kuri" ? session?.user?.id : undefined;
  
  // Kurir hanya lihat pesanan yang di-assign ke mereka atau yang menunggu kurir
  const pengirimanList = kurirId 
    ? await getPesananMenungguKirim(kurirId)
    : await getPengirimanList(search, status, kurirId);

  // Status config for display
  const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    "Belum_Dikirim": { label: "Belum Dikirim", icon: <Clock className="h-4 w-4 text-gray-500" /> },
    "Sedang_Dikirim": { label: "Sedang Dikirim", icon: <Truck className="h-4 w-4 text-blue-500" /> },
    "Tiba_Ditujuan": { label: "Tiba Ditujuan", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {userRole === "kuri" ? "Tugas Pengiriman" : "Manajemen Pengiriman"}
          </h2>
          <p className="text-muted-foreground">
            {userRole === "kuri" 
              ? "Kelola pengiriman yang ditugaskan kepada Anda." 
              : "Pantau status pengiriman pesanan katering."}
          </p>
        </div>
        {userRole !== "kuri" && <PengirimanFormDialog mode="create" />}
      </div>

      {/* Filters (only for admin/owner) */}
      {userRole !== "kuri" && (
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama pelanggan..."
              className="pl-10"
              defaultValue={search}
              name="q"
            />
          </div>
          
          <Select name="status" defaultValue={status}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {STATUS_KIRIM.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
        </form>
      )}

      {/* Delivery List/Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pesanan</TableHead>
              <TableHead className="hidden md:table-cell">Pelanggan</TableHead>
              <TableHead className="hidden lg:table-cell">Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Kurir</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pengirimanList.length > 0 ? (
              pengirimanList.map((item: any) => {
                // Handle both getPengirimanList and getPesananMenungguKirim return types
                const pengiriman = item.pemesanan ? item : { pemesanan: item, ...item.pengiriman };
                const p = pengiriman.pemesanan;
                
                return (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-mono text-xs">#{p.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {p.detailPemesanans.length} item • {formatDate(p.tanggalAcara)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="font-medium">{p.pelanggan.namaPelanggan}</div>
                      {p.pelanggan.noTelp && (
                        <div className="text-xs text-muted-foreground">{p.pelanggan.noTelp}</div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                        <span className="truncate max-w-50">
                          {p.pelanggan.alamat1?.slice(0, 50)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {statusConfig[pengiriman.statusKirim]?.icon}
                        <Badge className={getStatusColor(pengiriman.statusKirim)}>
                          {statusConfig[pengiriman.statusKirim]?.label || pengiriman.statusKirim.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {/* Bukti foto indicator */}
                      {pengiriman.buktiFoto && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          📷 Bukti terupload
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {pengiriman.kurir?.name || (
                        <span className="text-muted-foreground text-sm">Belum diassign</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <PengirimanFormDialog 
                        pengiriman={pengiriman}
                        mode="edit"
                        isKurir={userRole === "kuri"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Truck className="h-8 w-8 mb-2 opacity-50" />
                    <p>
                      {search || status !== "all"
                        ? "Tidak ada pengiriman yang cocok dengan filter."
                        : userRole === "kuri"
                          ? "Tidak ada tugas pengiriman untuk Anda saat ini."
                          : "Belum ada data pengiriman."}
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
        Menampilkan {pengirimanList.length} pengiriman
        {(search || status !== "all") && " (dengan filter)"}
      </div>
    </div>
  );
}
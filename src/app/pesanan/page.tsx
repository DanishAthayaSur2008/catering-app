// src/app/pesanan/page.tsx
import { getPesanan } from "@/app/actions/pesanan-actions";
import { PesananFormDialog } from "@/components/pesanan/pesanan-form-dialog";
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
import { Search, ShoppingCart, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatRupiah, formatDate, getStatusColor } from "@/lib/utils";
import { STATUS_PESANAN } from "@/lib/validations/pesanan";

interface PesananPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function PesananPage({ searchParams }: PesananPageProps) {
  const params = await searchParams;
  const search = params?.q || "";
  const status = params?.status || "all";
  
  const pesananList = await getPesanan(search, status);

  // Status icon mapping - ✅ FIX: Use React.ReactNode instead of JSX
  const statusIcons: Record<string, React.ReactNode> = {
    "Menunggu_Konfirmasi": <Clock className="h-4 w-4 text-yellow-500" />,
    "Sedang_Diproses": <Package className="h-4 w-4 text-blue-500" />,
    "Menunggu_Kurir": <Truck className="h-4 w-4 text-purple-500" />,
    "Selesai": <CheckCircle className="h-4 w-4 text-green-500" />,
    "Dibatalkan": <XCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pesanan</h2>
          <p className="text-muted-foreground">
            Kelola pesanan katering dan pantau statusnya.
          </p>
        </div>
        <PesananFormDialog mode="create" />
      </div>

      {/* Filters */}
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
            {STATUS_PESANAN.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
      </form>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead className="hidden md:table-cell">Tanggal</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pesananList.length > 0 ? (
              pesananList.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">#{p.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.pelanggan.namaPelanggan}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.detailPemesanans.length} item
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDate(p.tanggalAcara)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {p.detailPemesanans.slice(0, 2).map((d) => (
                        <div key={d.id} className="text-xs flex items-center gap-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-37.5">
                            {d.paket.namaPaket} × {d.jumlah}
                          </span>
                        </div>
                      ))}
                      {p.detailPemesanans.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{p.detailPemesanans.length - 2} lainnya
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatRupiah(p.totalHarga)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {statusIcons[p.statusPesanan]}
                      <Badge className={getStatusColor(p.statusPesanan)}>
                        {p.statusPesanan.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <PesananFormDialog 
                        pesanan={{
                          id: p.id,
                          idPelanggan: p.idPelanggan,
                          tanggalAcara: p.tanggalAcara,
                          statusPesanan: p.statusPesanan,
                          totalHarga: p.totalHarga,
                          pelanggan: p.pelanggan,
                          detailPemesanans: p.detailPemesanans,
                        }}
                        mode="edit"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
                    <p>
                      {search || status !== "all"
                        ? "Tidak ada pesanan yang cocok dengan filter."
                        : "Belum ada pesanan. Buat yang pertama!"}
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
        Menampilkan {pesananList.length} pesanan
        {(search || status !== "all") && " (dengan filter)"}
      </div>
    </div>
  );
}
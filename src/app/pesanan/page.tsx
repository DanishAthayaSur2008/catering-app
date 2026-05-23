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
import {
  Search,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Filter,
  ClipboardList
} from "lucide-react";
import { formatRupiah, formatDate, getStatusColor } from "@/lib/utils";
import { bufferToBase64 } from "@/lib/image-utils";
import { STATUS_PESANAN } from "@/lib/validations/pesanan";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PesananPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function PesananPage({ searchParams }: PesananPageProps) {
  const session = await auth();
  const params = await searchParams;
  const search = params?.q || "";
  const status = params?.status || "all";

  const pesananList = await getPesanan(search, status);

  // Status icon mapping
  const statusIcons: Record<string, React.ReactNode> = {
    "Menunggu_Konfirmasi": <Clock className="h-3.5 w-3.5" />,
    "Sedang_Diproses": <Package className="h-3.5 w-3.5" />,
    "Menunggu_Kurir": <Truck className="h-3.5 w-3.5" />,
    "Selesai": <CheckCircle className="h-3.5 w-3.5" />,
    "Dibatalkan": <XCircle className="h-3.5 w-3.5" />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar - Menggunakan role dari session */}
      <Sidebar userRole={session?.user?.level} currentPath="/pesanan" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Sekarang mengirim session.user agar dropdown profil muncul */}
        <Header user={session?.user} />

        {/* Main Content - Tengah */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Title & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pesanan</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <ClipboardList className="h-4 w-4" />
                  Pantau dan kelola seluruh transaksi pesanan katering.
                </p>
              </div>
              {/* ✅ SOLUSI ERROR 1: Kirim fallback objek kosong/default agar tipe data 'create' terpenuhi */}
              <PesananFormDialog
                mode="create"
                pesanan={{
                  id: 0,
                  idPelanggan: 0,
                  tanggalAcara: new Date(),
                  statusPesanan: "Menunggu_Konfirmasi",
                  totalHarga: 0,
                  pelanggan: { id: 0, namaPelanggan: "Baru" },
                  detailPemesanans: []
                }}
              />
            </div>

            {/* Filter Section */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <form className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama pelanggan..."
                      className="pl-10 bg-slate-50/50 dark:bg-slate-800"
                      defaultValue={search}
                      name="q"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select name="status" defaultValue={status}>
                      <SelectTrigger className="w-full md:w-50 bg-slate-50/50 dark:bg-slate-800">
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {STATUS_PESANAN.map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="capitalize">{s.replace(/_/g, " ")}</span>
                          </SelectItem>
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

            {/* Orders Table Section */}
            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="border-b bg-white dark:bg-slate-900 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Riwayat Transaksi</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    {pesananList.length} Total Pesanan
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    {/* Mengatur padding vertikal (atas-bawah) untuk semua isi header row */}
                    <TableRow className="[&>th]:py-3.5 [&>th]:px-4">
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead className="hidden lg:table-cell">Detail Menu</TableHead>
                      <TableHead className="hidden md:table-cell">Jadwal Acara</TableHead>
                      <TableHead className="text-right">Total Tagihan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesananList.length > 0 ? (
                      pesananList.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="font-mono text-[11px] font-bold text-slate-400">
                            #{p.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {p.pelanggan?.namaPelanggan ?? "Tanpa Pelanggan"}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {p.detailPemesanans.length} Jenis Paket
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-col gap-1">
                              {p.detailPemesanans.slice(0, 1).map((d) => (
                                <div key={d.id} className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <Package className="h-3 w-3" />
                                  <span className="truncate max-w-37.5">
                                    {d.paket?.namaPaket ?? "Menu Terhapus"} ({d.jumlah}x)
                                  </span>
                                </div>
                              ))}
                              {p.detailPemesanans.length > 1 && (
                                <span className="text-[10px] text-primary font-medium hover:underline cursor-default">
                                  +{p.detailPemesanans.length - 1} paket lainnya...
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {formatDate(p.tanggalAcara)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                            {formatRupiah(p.totalHarga)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(p.statusPesanan)} border-none px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit text-[10px] uppercase font-bold tracking-tight shadow-sm`}>
                              {statusIcons[p.statusPesanan]}
                              {p.statusPesanan.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <PesananFormDialog
                              pesanan={{
                                id: p.id,
                                idPelanggan: p.idPelanggan,
                                tanggalAcara: p.tanggalAcara,
                                statusPesanan: p.statusPesanan,
                                totalHarga: p.totalHarga,
                                // ✅ SOLUSI ERROR 2: Berikan nilai objek aman jika pelanggan dari DB mendadak null
                                pelanggan: p.pelanggan ? {
                                  id: p.pelanggan.id,
                                  namaPelanggan: p.pelanggan.namaPelanggan,
                                  foto: p.pelanggan.foto ? bufferToBase64(p.pelanggan.foto) : null
                                } : { id: 0, namaPelanggan: "Tanpa Nama", foto: null },
                                // ✅ Mengamankan array detail & objek paket di dalamnya jika bernilai null
                                detailPemesanans: p.detailPemesanans.map((d) => ({
                                  id: d.id,
                                  idPaket: d.idPaket,
                                  jumlah: d.jumlah,
                                  subtotal: d.subtotal,
                                  paket: d.paket ? {
                                    id: d.paket.id,
                                    namaPaket: d.paket.namaPaket,
                                    hargaPaket: d.paket.hargaPaket,
                                    foto: d.paket.foto ? bufferToBase64(d.paket.foto) : null
                                  } : { id: 0, namaPaket: "Paket Terhapus", hargaPaket: 0, foto: null }
                                })),
                              }}
                              mode="edit"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                              <ShoppingCart className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Pesanan tidak ditemukan</h3>
                            <p className="text-sm text-muted-foreground max-w-62.5 mx-auto mt-1">
                              {search || status !== "all"
                                ? "Hasil pencarian tidak ditemukan. Coba reset filter."
                                : "Belum ada pesanan masuk. Tambah pesanan baru untuk memulai."}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Footer Stats */}
            <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-muted-foreground italic uppercase tracking-widest">
                Real-time Order Monitoring
              </p>
              <p className="text-xs font-medium text-slate-500">
                Showing {pesananList.length} transactions
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/pengiriman/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getPengirimanList,
  getKurirOptions,
  approvePengirimanSelesai
} from "@/app/actions/pengiriman-actions";
import { PengirimanFormDialog } from "@/components/pengiriman/pengiriman-form-dialog";
import { CopyIconButton } from "@/components/pengiriman/copy-icon-button"; // ✅ FIX: Import Komponen Client Terpisah
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Truck, CheckCircle, Clock, FileCheck } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { STATUS_KIRIM } from "@/lib/validations/pengiriman";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { bufferToDataUrl } from "@/lib/image-utils";

interface PengirimanPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function PengirimanPage({ searchParams }: PengirimanPageProps) {
  const session = await auth();

  if (!session || (session.user.level !== "admin" && session.user.level !== "owner")) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const search = params?.q || "";
  const status = params?.status || "all";

  const userRole = session.user.level;

  const [rawPengirimanList, kurirOptions] = await Promise.all([
    getPengirimanList(search, status),
    getKurirOptions()
  ]);

  // ✅ Ubah objek Uint8Array/Buffer menjadi Plain String Data URL di sisi Server Component
  const pengirimanList = rawPengirimanList.map((item: any) => {
    const pengiriman = item.pemesanan ? item : { pemesanan: item, ...item.pengiriman };

    let fotoUrlString: string | null = null;
    if (pengiriman.buktiFoto) {
      try {
        fotoUrlString = bufferToDataUrl(pengiriman.buktiFoto as Buffer);
      } catch (e) {
        console.error("Gagal mengonversi buktiFoto:", e);
      }
    }

    return {
      ...item,
      buktiFoto: fotoUrlString,
      ...(item.pengiriman ? {
        pengiriman: {
          ...item.pengiriman,
          buktiFoto: fotoUrlString
        }
      } : {})
    };
  });

  const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    "Belum_Dikirim": { label: "Belum Dikirim", icon: <Clock className="h-4 w-4 text-gray-500" /> },
    "Sedang_Dikirim": { label: "Sedang Dikirim", icon: <Truck className="h-4 w-4 text-blue-500" /> },
    "Tiba_Ditujuan": { label: "Tiba Ditujuan", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <Sidebar userRole={userRole} currentPath="/pengiriman" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Manajemen Pengiriman
                </h1>
                <p className="text-muted-foreground mt-1">
                  Assign kurir, pantau status, and approve pengiriman selesai.
                </p>
              </div>
              <PengirimanFormDialog mode="create" kurirOptions={kurirOptions} />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <form className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama pelanggan atau ID pesanan..."
                    className="pl-10"
                    defaultValue={search}
                    name="q"
                  />
                </div>

                <div className="flex gap-2">
                  <Select name="status" defaultValue={status}>
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {STATUS_KIRIM.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button type="submit" variant="default">Filter</Button>
                </div>
              </form>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead className="hidden lg:table-cell">No. Resi</TableHead>
                    <TableHead className="hidden lg:table-cell">Paket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Kurir</TableHead>
                    <TableHead>Bukti</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengirimanList.length > 0 ? (
                    pengirimanList.map((item: any) => {
                      const pengiriman = item.pemesanan ? item : { pemesanan: item, ...item.pengiriman };
                      const p = pengiriman.pemesanan;
                      const fotoUrl = pengiriman.buktiFoto;

                      return (
                        <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <TableCell className="font-mono text-xs font-bold text-primary">#{p.id}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{p.pelanggan.namaPelanggan}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(p.tanggalAcara)}</div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {pengiriman.noResi ? (
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {pengiriman.noResi}
                                </code>
                                {/* ✅ FIXED: Menggunakan komponen Client Side khusus salin resi berupa ikon */}
                                <CopyIconButton text={pengiriman.noResi!} />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Belum ada</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="space-y-1">
                              {p.detailPemesanans.slice(0, 2).map((d: any) => (
                                <div key={d.id} className="text-xs">• {d.paket.namaPaket} ×{d.jumlah}</div>
                              ))}
                              {p.detailPemesanans.length > 2 && (
                                <div className="text-xs text-muted-foreground">+{p.detailPemesanans.length - 2} lainnya</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                {statusConfig[pengiriman.statusKirim]?.icon}
                                <Badge className={`${getStatusColor(pengiriman.statusKirim)} border-none shadow-none`}>
                                  {statusConfig[pengiriman.statusKirim]?.label || pengiriman.statusKirim.replace(/_/g, " ")}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {pengiriman.kurir?.name ? (
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                  {pengiriman.kurir.name.charAt(0)}
                                </div>
                                <span className="text-sm">{pengiriman.kurir.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Belum diassign</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {pengiriman.buktiFoto ? (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                                <FileCheck className="h-3 w-3 mr-1" /> Ada
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* APPROVE BUTTON */}
                              {pengiriman.statusKirim === "Sedang_Dikirim" && pengiriman.buktiFoto && (
                                <form action={async () => {
                                  "use server";
                                  await approvePengirimanSelesai(pengiriman.id);
                                }}>
                                  <Button type="submit" size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </form>
                              )}

                              {/* EDIT BUTTON */}
                              <PengirimanFormDialog
                                pengiriman={pengiriman}
                                mode="edit"
                                kurirOptions={kurirOptions}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Truck className="h-10 w-10 mb-2 opacity-20" />
                          <p className="font-medium">Tidak ada pengiriman aktif</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/pengiriman/pengiriman-form-dialog.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, User, Package, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { DetailLogistikFields } from "./detail-logistik-fields";

import {
  upsertPengiriman,
  deletePengiriman,
  getPesananBelumDikirim,
} from "@/app/actions/pengiriman-actions";
import {
  type ActionResponse,
} from "@/lib/validations/pengiriman";
import { formatRupiah } from "@/lib/utils";

// ✅ Daftarkan field baru ke dalam sistem tipe React Hook Form
type PengirimanFormValues = {
  idPesan: number;
  kurirId: number | null; // Pastikan tipenya mendukung null jika kurir opsional
  noResi: string;
  alamatTujuan: string;
  estimasiTiba: string;
};

interface PemesananOption {
  id: number;
  totalHarga: number;
  tanggalAcara: Date | string;
  statusPesanan: string;
  pelanggan: {
    id: number;
    namaPelanggan: string;
    alamat1: string | null;
    noTelp: string | null;
  };
  detailPemesanans: Array<{
    id: number;
    jumlah: number;
    subtotal: number;
    paket: {
      id: number;
      namaPaket: string;
      menuPaket: string | null;
      hargaPaket: number;
    };
  }>;
}

interface PengirimanFormDialogProps {
  pengiriman?: {
    id: number;
    idPesan: number;
    statusKirim: string;
    tanggalKirim: Date | string | null;
    buktiFoto: any | null;
    kurirId: number | null;
    kurir: { id: number; name: string; email: string } | null;
    pemesanan: PemesananOption;
    noResi?: string | null;
    alamatTujuan?: string | null;
    estimasiTiba?: Date | string | null;
  };
  mode?: "create" | "edit";
  kurirOptions?: Array<{ id: number; name: string; email: string }>;
}

export function PengirimanFormDialog({ pengiriman, mode = "create", kurirOptions = [] }: PengirimanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pesananOptions, setPesananOptions] = useState<PemesananOption[]>([]);
  const [selectedPesanan, setSelectedPesanan] = useState<PemesananOption | null>(null);

  // Load daftar pesanan yang belum dikirim saat dialong terbuka (mode create)
  useEffect(() => {
    if (open && mode === "create") {
      getPesananBelumDikirim().then(setPesananOptions);
    }
  }, [open, mode]);

  // ✅ Inisialisasi Hook Form dengan struktur data yang lengkap dan aman
  const form = useForm<PengirimanFormValues>({
    defaultValues: {
      idPesan: pengiriman?.idPesan || 0,
      kurirId: pengiriman?.kurirId || null,
      noResi: pengiriman?.noResi || "",
      alamatTujuan: pengiriman?.alamatTujuan || "",
      estimasiTiba: pengiriman?.estimasiTiba
        ? new Date(pengiriman.estimasiTiba).toISOString().split("T")[0]
        : "",
    },
  });

  // Sinkronisasi data form kembali jika props pengiriman berubah (Mode Edit)
  useEffect(() => {
    if (pengiriman && mode === "edit") {
      form.reset({
        idPesan: pengiriman.idPesan,
        kurirId: pengiriman.kurirId,
        noResi: pengiriman.noResi || "",
        alamatTujuan: pengiriman.alamatTujuan || "",
        estimasiTiba: pengiriman.estimasiTiba
          ? new Date(pengiriman.estimasiTiba).toISOString().split("T")[0]
          : "",
      });
    }
  }, [pengiriman, mode, form]);

  const handlePesananChange = (idPesan: string) => {
    const id = Number(idPesan);
    const pesanan = pesananOptions.find(p => p.id === id) || null;
    setSelectedPesanan(pesanan);
    form.setValue("idPesan", id);
  };

  // ✅ Submit handler tunggal yang mengirimkan data kurir beserta resi secara utuh ke Server Action
  async function onSubmit(values: PengirimanFormValues) {
    startTransition(async () => {
      const payload = {
        id: pengiriman?.id, // Kirimkan ID jika dalam mode edit agar Prisma melakukan update
        idPesan: values.idPesan,
        kurirId: values.kurirId ? Number(values.kurirId) : null, // 👈 FORCE KONVERSI KE NUMBER / NULL
        statusKirim: (pengiriman?.statusKirim || "Belum_Dikirim") as any,
        noResi: values.noResi || null,
        alamatTujuan: values.alamatTujuan || null,
        estimasiTiba: values.estimasiTiba ? new Date(values.estimasiTiba) : null,
      };

      const result: ActionResponse = await upsertPengiriman(payload as any);

      if (result.success) {
        toast.success(result.message || "Data pengiriman berhasil disimpan!");
        setOpen(false);
        if (mode === "create") {
          form.reset();
          setSelectedPesanan(null);
        }
      } else if (result.errors) {
        const fieldErrors = result.errors as Record<string, string[]>;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          messages?.forEach((msg: string) => {
            form.setError(field as keyof PengirimanFormValues, { message: msg });
          });
        });
      } else {
        toast.error(result.message || "Terjadi kesalahan proses penyimpanan data");
      }
    });
  }

  async function handleDelete() {
    if (!pengiriman) return;

    startTransition(async () => {
      const result = await deletePengiriman(pengiriman.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  const displayPesanan = mode === "edit" ? pengiriman?.pemesanan : selectedPesanan;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {mode === "create" ? (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Atur Pengiriman
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Pekerjakan Kurir" : "Update Assign & Detail Pengiriman"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Pilih pesanan yang perlu dikirim, tentukan kurir dan lengkapi detail pengiriman."
                : "Perbarui informasi tugas kurir serta resi pelacakan pesanan ini."}
            </DialogDescription>
          </DialogHeader>

          {displayPesanan && (
            <div className="space-y-4 mb-4">
              {/* Customer Info */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{displayPesanan.pelanggan.namaPelanggan}</p>
                      <p className="text-sm text-muted-foreground">{displayPesanan.pelanggan.noTelp}</p>
                      <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{displayPesanan.pelanggan.alamat1}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package List */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Package className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-slate-900">Paket yang Dikirim</p>
                      {displayPesanan.detailPemesanans?.map((d) => (
                        <div key={d.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">{d.paket?.namaPaket}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{d.paket?.menuPaket}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">×{d.jumlah}</p>
                            <p className="text-xs text-muted-foreground">{formatRupiah(d.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">{formatRupiah(displayPesanan.totalHarga)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="idPesan"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Pilih Pesanan untuk Dikirim *</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(Number(val));
                          handlePesananChange(val);
                        }}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pesanan..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {pesananOptions.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">#{p.id} - {p.pelanggan.namaPelanggan}</span>
                                <span className="text-xs text-muted-foreground">
                                  📅 {new Date(p.tanggalAcara).toLocaleDateString("id-ID")} • 💰 {formatRupiah(p.totalHarga)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {pesananOptions.length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Tidak ada pesanan yang perlu dikirim.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* ✅ Dropdown Pilih Kurir - Perbaikan sinkronisasi variabel */}
              <FormField
                control={form.control}
                name="kurirId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Kurir untuk Dipekerjakan</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        // Jika memilih "null" (Kosongkan), set ke null. Jika ada isinya, paksa ke Number.
                        field.onChange(val === "null" || !val ? null : Number(val));
                      }}
                      // Pastikan value default adalah "null" jika kurirId bernilai null atau kosong
                      value={field.value ? String(field.value) : "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kurir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null" className="text-muted-foreground italic">
                          Belum Ditugaskan (Kosongkan)
                        </SelectItem>
                        {kurirOptions && kurirOptions.length > 0 ? (
                          kurirOptions.map((k) => (
                            <SelectItem key={k.id} value={String(k.id)}>
                              {k.name} ({k.email})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-center text-muted-foreground">
                            Tidak ada data kurir yang tersedia.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ SECTION: DETAIL PENGIRIMAN AMAN DARI ERROR PASSED TO PROPS */}
              <DetailLogistikFields form={form} />

              {/* ✅ Footer Aksi Utama */}
              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    disabled={isPending}
                    className="sm:mr-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Tugas
                  </Button>
                )}

                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !displayPesanan}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : mode === "create" ? "Pekerjakan" : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* dialog delete konfirmasi */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pengiriman?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Hubungan tugas kurir untuk pesanan #{pengiriman?.idPesan} akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
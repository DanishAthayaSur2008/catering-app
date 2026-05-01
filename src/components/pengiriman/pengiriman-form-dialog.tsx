/* eslint-disable react-hooks/incompatible-library */
// src/components/pengiriman/pengiriman-form-dialog.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Upload, Truck, CheckCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  upsertPengiriman,
  updateStatusPengiriman,
  uploadBuktiFoto,
  deletePengiriman,
  getKurirOptions,
} from "@/app/actions/pengiriman-actions";
import {
  pengirimanSchema,
  type PengirimanFormData,
  type ActionResponse,
  STATUS_KIRIM,
} from "@/lib/validations/pengiriman";
import { formatRupiah, formatDate, getStatusColor } from "@/lib/utils";
import Image from "next/image";

interface PengirimanFormDialogProps {
  pengiriman?: {
    id: number;
    idPesan: number;
    statusKirim: string;
    tanggalKirim: Date | string | null;
    buktiFoto: string | null;
    kurirId: number | null;
    kurir: { id: number; name: string } | null;
    pemesanan: {
      id: number;
      totalHarga: number;
      tanggalAcara: Date | string;
      pelanggan: { id: number; namaPelanggan: string; noTelp: string | null };
      detailPemesanans: Array<{
        id: number;
        jumlah: number;
        subtotal: number;
        paket: { id: number; namaPaket: string; hargaPaket: number };
      }>;
    };
  };
  mode?: "create" | "edit";
  isKurir?: boolean; // Flag untuk view kurir-only
}

export function PengirimanFormDialog({ pengiriman, mode = "create", isKurir = false }: PengirimanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [kurirOptions, setKurirOptions] = useState<Array<{ id: number; name: string; email: string }>>([]);

  const form = useForm<PengirimanFormData>({
    resolver: zodResolver(pengirimanSchema),
    defaultValues: {
      idPesan: pengiriman?.idPesan || 0,
      statusKirim: pengiriman?.statusKirim || "Belum_Dikirim",
      tanggalKirim: pengiriman?.tanggalKirim ? new Date(pengiriman.tanggalKirim).toISOString().split("T")[0] : "",
      buktiFoto: pengiriman?.buktiFoto || "",
      kurirId: pengiriman?.kurirId || undefined,
    },
  });

  // Load kurir options when dialog opens (only for admin/owner)
  useEffect(() => {
    if (open && !isKurir) {
      getKurirOptions().then(setKurirOptions);
    }
  }, [open, isKurir]);

  async function onSubmit(values: PengirimanFormData) {
    startTransition(async () => {
      const result: ActionResponse = await upsertPengiriman(values);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      } else if (result.errors) {
        const fieldErrors = result.errors as Record<string, string[]>;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          messages?.forEach((msg: string) => {
            form.setError(field as keyof PengirimanFormData, { message: msg });
          });
        });
      } else {
        toast.error(result.message || "Terjadi kesalahan");
      }
    });
  }

  // Quick status update for kurir
  async function handleQuickStatusUpdate(newStatus: string) {
    if (!pengiriman) return;

    startTransition(async () => {
      const result = await updateStatusPengiriman(pengiriman.id, newStatus);

      if (result.success) {
        toast.success(result.message);
        // Refresh form state
        form.setValue("statusKirim", newStatus);
        if (newStatus === "Tiba_Ditujuan") {
          form.setValue("tanggalKirim", new Date().toISOString().split("T")[0]);
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  // Upload bukti foto
  async function handleUploadBukti(fotoUrl: string) {
    if (!pengiriman) return;

    startTransition(async () => {
      const result = await uploadBuktiFoto(pengiriman.id, fotoUrl);

      if (result.success) {
        toast.success(result.message);
        form.setValue("buktiFoto", fotoUrl);
      } else {
        toast.error(result.message);
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

  // Status badge config
  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    "Belum_Dikirim": {
      label: "Belum Dikirim",
      icon: <Clock className="h-4 w-4 text-gray-500" />,
      color: "bg-gray-100 text-gray-800"
    },
    "Sedang_Dikirim": {
      label: "Sedang Dikirim",
      icon: <Truck className="h-4 w-4 text-blue-500" />,
      color: "bg-blue-100 text-blue-800"
    },
    "Tiba_Ditujuan": {
      label: "Tiba Ditujuan",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      color: "bg-green-100 text-green-800"
    },
  };

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

        <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Atur Pengiriman Baru" : "Update Pengiriman"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Assign kurir dan atur status pengiriman."
                : "Perbarui status dan upload bukti pengiriman."}
            </DialogDescription>
          </DialogHeader>

          {/* Order Summary Card */}
          {pengiriman?.pemesanan && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Pesanan #{pengiriman.pemesanan.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {pengiriman.pemesanan.pelanggan.namaPelanggan}
                    </p>
                  </div>
                  <Badge className={getStatusColor(pengiriman.statusKirim)}>
                    {statusConfig[pengiriman.statusKirim]?.label || pengiriman.statusKirim}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p>📅 Tanggal Acara: {formatDate(pengiriman.pemesanan.tanggalAcara)}</p>
                  <p>📦 {pengiriman.pemesanan.detailPemesanans.length} item</p>
                  <p className="font-semibold text-primary">
                    Total: {formatRupiah(pengiriman.pemesanan.totalHarga)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Status Pengiriman */}
              <FormField
                control={form.control}
                name="statusKirim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pengiriman *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_KIRIM.map((status) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              {statusConfig[status]?.icon}
                              {statusConfig[status]?.label || status.replace(/_/g, " ")}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Status Buttons for Kurir */}
              {isKurir && (
                <div className="flex gap-2">
                  {STATUS_KIRIM.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={form.watch("statusKirim") === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(status)}
                      disabled={isPending}
                      className="flex-1"
                    >
                      {statusConfig[status]?.icon}
                      <span className="ml-1 text-xs">{statusConfig[status]?.label}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Tanggal Kirim */}
              <FormField
                control={form.control}
                name="tanggalKirim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pengiriman</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assign Kurir (only for admin/owner) */}
              {!isKurir && (
                <FormField
                  control={form.control}
                  name="kurirId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Kurir</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kurir" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kurirOptions.map((k) => (
                            <SelectItem key={k.id} value={String(k.id)}>
                              {k.name} ({k.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Upload Bukti Foto */}
              <FormField
                control={form.control}
                name="buktiFoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Bukti Foto</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com/bukti.jpg"
                            {...field}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => field.value && handleUploadBukti(field.value)}
                            disabled={!field.value || isPending}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        {field.value && (
                          <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                            <Image
                              src={field.value}
                              alt="Bukti Pengiriman"
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Upload foto ke Imgur/Cloudinary, lalu paste URL-nya di sini.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                {mode === "edit" && !isKurir && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    disabled={isPending}
                    className="sm:mr-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                )}

                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                {!isKurir && (
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : mode === "create" ? "Simpan" : "Perbarui"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pengiriman?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data pengiriman untuk pesanan #{pengiriman?.idPesan} akan dihapus.
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
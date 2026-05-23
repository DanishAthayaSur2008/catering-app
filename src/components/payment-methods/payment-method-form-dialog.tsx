// src/components/payment-methods/payment-method-form-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  createJenisPembayaran,
  updateJenisPembayaran,
  createDetailJenisPembayaran,
  updateDetailJenisPembayaran,
} from "@/app/actions/payment-method-actions";

type FormMode = "create-jenis" | "edit-jenis" | "create-detail" | "edit-detail";

interface PaymentMethodFormDialogProps {
  mode: FormMode;
  idJenisPembayaran?: number;
  jenisPembayaran?: {
    id: number;
    namaPembayaran: string;
  };
  detailJenisPembayaran?: {
    id: number;
    tempatPembayaran: string | null;
    noRekening: string | null;
    logoPembayaran: string | null; // ✅ FIXED: Diubah menjadi string murni agar aman dikirim antar Server-Client
  };
  children?: React.ReactNode;
}

const jenisSchema = z.object({
  namaPembayaran: z.string().min(2, "Nama metode pembayaran minimal 2 karakter"),
});

const detailSchema = z.object({
  tempatPembayaran: z.string().min(2, "Nama bank atau e-wallet minimal 2 karakter"),
  noRekening: z.string().optional(),
  logoPembayaran: z.any().optional(),
});

type JenisFormData = z.infer<typeof jenisSchema>;
type DetailFormData = z.infer<typeof detailSchema>;

export function PaymentMethodFormDialog({
  mode,
  idJenisPembayaran,
  jenisPembayaran,
  detailJenisPembayaran,
  children,
}: PaymentMethodFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [keepExistingLogo, setKeepExistingLogo] = useState<boolean>(true);

  // ✅ FIXED: Langsung membaca string base64 hasil serialisasi aman dari Server Actions
  const existingLogoUrl = detailJenisPembayaran?.logoPembayaran || null;

  const jenisForm = useForm<JenisFormData>({
    resolver: zodResolver(jenisSchema),
    defaultValues: {
      namaPembayaran: jenisPembayaran?.namaPembayaran || "",
    },
  });

  const detailForm = useForm<DetailFormData>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      tempatPembayaran: detailJenisPembayaran?.tempatPembayaran || "",
      noRekening: detailJenisPembayaran?.noRekening || "",
      logoPembayaran: undefined,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setPreviewLogo(null);
      setKeepExistingLogo(true);
      jenisForm.reset();
      detailForm.reset();
    }
  };

  async function onSubmitJenis(values: JenisFormData) {
    startTransition(async () => {
      let result;
      if (mode === "create-jenis") {
        result = await createJenisPembayaran(values);
      } else {
        result = await updateJenisPembayaran(jenisPembayaran!.id, values);
      }

      if (result.success) {
        toast.success(result.message);
        handleOpenChange(false);
      } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, msgs]) => {
          msgs?.forEach((msg) =>
            jenisForm.setError(field as keyof JenisFormData, { message: msg })
          );
        });
      } else {
        toast.error(result.message);
      }
    });
  }

  async function onSubmitDetail(values: DetailFormData) {
    startTransition(async () => {
      let result;

      if (mode === "create-detail") {
        if (!idJenisPembayaran) {
          toast.error("ID Jenis Pembayaran tidak ditemukan");
          return;
        }

        result = await createDetailJenisPembayaran({
          idJenisPembayaran: idJenisPembayaran,
          tempatPembayaran: values.tempatPembayaran,
          noRekening: values.noRekening,
          logoPembayaran: previewLogo, 
        });
      } else {
        result = await updateDetailJenisPembayaran(detailJenisPembayaran!.id, {
          tempatPembayaran: values.tempatPembayaran,
          noRekening: values.noRekening,
          logoPembayaran: previewLogo, 
          keepExistingLogo: keepExistingLogo,
        });
      }

      if (result.success) {
        toast.success(result.message);
        handleOpenChange(false);
      } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, msgs]) => {
          msgs?.forEach((msg) =>
            detailForm.setError(field as keyof DetailFormData, { message: msg })
          );
        });
      } else {
        toast.error(result.message);
      }
    });
  }

  const isJenisMode = mode === "create-jenis" || mode === "edit-jenis";

  const titles: Record<FormMode, string> = {
    "create-jenis": "Tambah Metode Pembayaran",
    "edit-jenis": "Edit Metode Pembayaran",
    "create-detail": "Tambah Opsi Pembayaran",
    "edit-detail": "Edit Opsi Pembayaran",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            {mode.includes("edit") ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            {mode === "create-jenis" && "Masukkan nama metode pembayaran (contoh: Transfer Bank, E-Wallet, COD)."}
            {mode === "edit-jenis" && "Perbarui nama metode pembayaran."}
            {mode === "create-detail" && "Tambahkan detail rekening/QRIS untuk metode ini."}
            {mode === "edit-detail" && "Perbarui detail rekening/QRIS."}
          </DialogDescription>
        </DialogHeader>

        {isJenisMode ? (
          <Form {...jenisForm}>
            <form onSubmit={jenisForm.handleSubmit(onSubmitJenis)} className="space-y-4">
              <FormField
                control={jenisForm.control}
                name="namaPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Metode Pembayaran *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Transfer Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Batal</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...detailForm}>
            <form onSubmit={detailForm.handleSubmit(onSubmitDetail)} className="space-y-4">
              <FormField
                control={detailForm.control}
                name="tempatPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Bank / E-Wallet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: BCA, GoPay" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailForm.control}
                name="noRekening"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Rekening / QRIS</FormLabel>
                    <FormControl>
                      <Input placeholder="8820-1234-567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailForm.control}
                name="logoPembayaran"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Logo Bank / E-Wallet (Opsional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setPreviewLogo(event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                                onChange(file);
                                setKeepExistingLogo(false);
                              }
                            }}
                            className="flex-1"
                            {...rest}
                          />
                          {(previewLogo || (existingLogoUrl && keepExistingLogo)) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                onChange(null);
                                setPreviewLogo(null);
                                setKeepExistingLogo(false);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {((previewLogo) || (existingLogoUrl && keepExistingLogo)) && (
                          <div className="relative w-full h-20 rounded-lg overflow-hidden border bg-muted">
                            <Image
                              src={previewLogo || existingLogoUrl || ""}
                              alt="Preview Logo"
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Upload logo (PNG/JPG). Maksimal 1MB.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Batal</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
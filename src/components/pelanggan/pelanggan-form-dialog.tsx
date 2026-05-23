/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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

import {
  createPelanggan,
  updatePelanggan,
  deletePelanggan
} from "@/app/actions/pelanggan-actions";
import {
  pelangganSchema,
  type PelangganFormData,
  type ActionResponse
} from "@/lib/validations/pelanggan";

interface PelangganFormDialogProps {
  pelanggan?: {
    id: number;
    namaPelanggan: string;
    alamat1: string | null;
    alamat2: string | null;
    alamat3: string | null;
    noTelp: string | null;
    foto: string | null;
  };
  mode?: "create" | "edit";
}

export function PelangganFormDialog({ pelanggan, mode = "create" }: PelangganFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PelangganFormData>({
    resolver: zodResolver(pelangganSchema),
    defaultValues: {
      nama_pelanggan: pelanggan?.namaPelanggan || "",
      alamat1: pelanggan?.alamat1 || "",
      alamat2: pelanggan?.alamat2 || "",
      alamat3: pelanggan?.alamat3 || "",
      no_telp: pelanggan?.noTelp || "",
      foto: undefined, // Mulai dengan kosong untuk input file baru
    },
  });

  async function onSubmit(values: PelangganFormData) {
    startTransition(async () => {
      // 🛠️ BUNGKUS KE FORMDATA AGAR SESUAI DENGAN SERVER ACTIONS
      const formData = new FormData();
      formData.append("nama_pelanggan", values.nama_pelanggan);
      formData.append("no_telp", values.no_telp);
      formData.append("alamat1", values.alamat1);
      if (values.alamat2) formData.append("alamat2", values.alamat2);
      if (values.alamat3) formData.append("alamat3", values.alamat3);
      
      // Masukkan file jika ada file baru yang dipilih
      if (values.foto instanceof File) {
        formData.append("foto", values.foto);
      }

      // Jika dalam mode edit, kirimkan juga ID pelanggan di dalam FormData
      if (mode === "edit" && pelanggan) {
        formData.append("id", pelanggan.id.toString());
      }

      const result: ActionResponse = mode === "create"
        ? await createPelanggan(formData)
        : await updatePelanggan(formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      } else if (result.errors) {
        const fieldErrors = result.errors as Record<string, string[]>;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          messages?.forEach((msg: string) => {
            form.setError(field as keyof PelangganFormData, { message: msg });
          });
        });
      } else {
        toast.error(result.message || "Terjadi kesalahan");
      }
    });
  }

  async function handleDelete() {
    if (!pelanggan) return;

    startTransition(async () => {
      const result = await deletePelanggan(pelanggan.id);

      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {mode === "create" ? (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pelanggan
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Tambah Pelanggan Baru" : "Edit Data Pelanggan"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Isi data pelanggan di bawah ini." : "Perbarui informasi pelanggan."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Nama Pelanggan */}
              <FormField
                control={form.control}
                name="nama_pelanggan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pelanggan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Budi Santoso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* No Telepon */}
              <FormField
                control={form.control}
                name="no_telp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon *</FormLabel>
                    <FormControl>
                      <Input placeholder="081234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alamat 1 (Wajib) */}
              <FormField
                control={form.control}
                name="alamat1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Utama *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alamat 2 */}
              <FormField
                control={form.control}
                name="alamat2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Tambahan 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Patokan lokasi / Alamat pengiriman alternatif" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alamat 3 */}
              <FormField
                control={form.control}
                name="alamat3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Tambahan 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Catatan pengiriman tambahan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Foto File Upload - 📸 KINI MENGGUNAKAN INPUT FILE NATIVE */}
              <FormField
                control={form.control}
                name="foto"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Foto Pelanggan</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onChange(file); // Set data objek file langsung ke React Hook Form
                        }}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                {mode === "edit" && (
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
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : mode === "create" ? "Simpan" : "Perbarui"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data pelanggan{" "}
              <strong>{pelanggan?.namaPelanggan}</strong> akan dihapus permanen.
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
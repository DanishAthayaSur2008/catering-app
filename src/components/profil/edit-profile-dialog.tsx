// src/components/profil/edit-profile-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { updateProfile } from "@/app/actions/profile-actions";
import {
  pelangganSchema,
  type PelangganFormData,
  type ActionResponse,
} from "@/lib/validations/pelanggan";

interface EditProfileDialogProps {
  profile: {
    id: number;
    namaPelanggan: string;
    alamat1: string | null;
    address2: string | null;
    address3: string | null;
    noTelp: string | null;
    foto: string | null;
  };
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PelangganFormData>({
    resolver: zodResolver(pelangganSchema),
    defaultValues: {
      nama_pelanggan: profile.namaPelanggan,
      alamat1: profile.alamat1 || "",
      alamat2: profile.address2 || "",
      alamat3: profile.address3 || "",
      no_telp: profile.noTelp || "",
      foto: profile.foto || "",
    },
  });

  async function onSubmit(formData: PelangganFormData) {
    startTransition(async () => {
      const result: ActionResponse = await updateProfile(formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else if (result.errors) {
        // Fix: Menggunakan casting ke keyof PelangganFormData agar tidak 'any'
        Object.entries(result.errors).forEach(([field, msgs]) => {
          msgs?.forEach((msg) =>
            form.setError(field as keyof PelangganFormData, { message: msg })
          );
        });
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profil</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama_pelanggan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama lengkap" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="no_telp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 08123456789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Utama</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Alamat lengkap pengiriman" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alamat2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat 2 (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alamat3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat 3 (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
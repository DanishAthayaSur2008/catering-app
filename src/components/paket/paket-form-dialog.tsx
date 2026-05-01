"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";

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

// ✅ HANYA import functions dari actions
import { 
  createPaket, 
  updatePaket, 
  deletePaket,
} from "@/app/actions/paket-actions";
// ✅ ActionResponse di-import dari validations (sudah di-export di sana)
import { 
  paketSchema, 
  type PaketFormData,
  type ActionResponse,
  KATEGORI_PAKET,
} from "@/lib/validations/paket";
import Image from "next/image";

interface PaketFormDialogProps {
  paket?: {
    id: number;
    namaPaket: string;
    menuPaket: string;
    kategori: string;
    hargaPaket: number;
    foto: string | null;
  };
  mode?: "create" | "edit";
}

export function PaketFormDialog({ paket, mode = "create" }: PaketFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PaketFormData>({
    resolver: zodResolver(paketSchema),
    defaultValues: {
      nama_paket: paket?.namaPaket || "",
      menu_paket: paket?.menuPaket || "",
      kategori: paket?.kategori || "Pernikahan",
      harga_paket: paket?.hargaPaket ? String(paket.hargaPaket) : "",
      foto: paket?.foto || "",
    },
  });

  const formatHargaInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(numbers));
  };

  async function onSubmit(values: PaketFormData) {
    startTransition(async () => {
      const result: ActionResponse = mode === "create" 
        ? await createPaket(values)
        : await updatePaket(paket!.id, values);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      } else if (result.errors) {
        const fieldErrors = result.errors as Record<string, string[]>;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          messages?.forEach((msg: string) => {
            form.setError(field as keyof PaketFormData, { message: msg });
          });
        });
      } else {
        toast.error(result.message || "Terjadi kesalahan");
      }
    });
  }

  async function handleDelete() {
    if (!paket) return;
    
    startTransition(async () => {
      const result = await deletePaket(paket.id);
      
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
              Tambah Paket
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
              {mode === "create" ? "Tambah Paket Baru" : "Edit Paket"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Isi detail paket katering di bawah ini." 
                : "Perbarui informasi paket."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="nama_paket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Paket *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Paket Nasi Box Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Acara *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KATEGORI_PAKET.map((kat) => (
                          <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="menu_paket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Menu *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nasi putih, ayam goreng, sambal, lalapan, kerupuk, buah..." 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harga_paket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga per Porsi *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          type="text"
                          placeholder="25.000"
                          className="pl-10"
                          value={field.value ? formatHargaInput(field.value) : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            field.onChange(raw);
                          }}
                          onBlur={() => {
                            if (field.value) {
                              field.onChange(formatHargaInput(field.value));
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Foto Paket</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input placeholder="https://example.com/foto-paket.jpg" {...field} />
                        {field.value && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border bg-muted">
                            <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                            <Image 
                              src={field.value} 
                              alt="Preview"
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
                      Gunakan URL gambar dari Unsplash, Imgur, atau hosting Anda.
                    </p>
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Paket{" "}
              <strong>{paket?.namaPaket}</strong> akan dihapus permanen.
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
/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Minus } from "lucide-react";

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
  createPesanan, 
  updatePesanan, 
  deletePesanan,
  getPelangganOptions,
  getPaketOptions,
} from "@/app/actions/pesanan-actions";
import { 
  pesananSchema, 
  type PesananFormData,
  type ActionResponse,
  STATUS_PESANAN,
} from "@/lib/validations/pesanan";
import { formatRupiah } from "@/lib/utils";

interface PesananFormDialogProps {
  pesanan?: {
    id: number;
    idPelanggan: number;
    tanggalAcara: Date | string;
    statusPesanan: string;
    totalHarga: number;
    pelanggan: { id: number; namaPelanggan: string };
    detailPemesanans: Array<{
      id: number;
      idPaket: number;
      jumlah: number;
      subtotal: number;
      paket: { id: number; namaPaket: string; hargaPaket: number };
    }>;
  };
  mode?: "create" | "edit";
}

export function PesananFormDialog({ pesanan, mode = "create" }: PesananFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pelangganOptions, setPelangganOptions] = useState<Array<{id: number; namaPelanggan: string}>>([]);
  const [paketOptions, setPaketOptions] = useState<Array<{id: number; namaPaket: string; hargaPaket: number; kategori: string}>>([]);

  const form = useForm<PesananFormData>({
    resolver: zodResolver(pesananSchema),
    defaultValues: {
      idPelanggan: pesanan?.idPelanggan || undefined,
      tanggalAcara: pesanan?.tanggalAcara ? new Date(pesanan.tanggalAcara).toISOString().split("T")[0] : "",
      statusPesanan: pesanan?.statusPesanan || "Menunggu_Konfirmasi",
      detailPemesanans: pesanan?.detailPemesanans.map((d) => ({
        idPaket: d.idPaket,
        jumlah: d.jumlah,
        subtotal: d.subtotal,
      })) || [{ idPaket: 0, jumlah: 1, subtotal: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detailPemesanans",
  });

  // Load options when dialog opens
  useEffect(() => {
    if (open) {
      getPelangganOptions().then(setPelangganOptions);
      getPaketOptions().then(setPaketOptions);
    }
  }, [open]);

  // Calculate subtotal when package or quantity changes
  const calculateSubtotal = (idPaket: number, jumlah: number) => {
    const pkg = paketOptions.find((p) => p.id === idPaket);
    return pkg ? pkg.hargaPaket * jumlah : 0;
  };

  // Calculate grand total
  const grandTotal = form.watch("detailPemesanans")?.reduce(
    (sum, item) => sum + (item.subtotal || 0), 
    0
  ) || 0;

  async function onSubmit(values: PesananFormData) {
    startTransition(async () => {
      // Ensure all subtotals are calculated
      const processedValues = {
        ...values,
        detailPemesanans: values.detailPemesanans.map((item) => ({
          ...item,
          subtotal: calculateSubtotal(item.idPaket, item.jumlah),
        })),
      };

      const result: ActionResponse = mode === "create" 
        ? await createPesanan(processedValues)
        : await updatePesanan(pesanan!.id, processedValues);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      } else if (result.errors) {
        const fieldErrors = result.errors as Record<string, string[]>;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          messages?.forEach((msg: string) => {
            form.setError(field as keyof PesananFormData, { message: msg });
          });
        });
      } else {
        toast.error(result.message || "Terjadi kesalahan");
      }
    });
  }

  async function handleDelete() {
    if (!pesanan) return;
    
    startTransition(async () => {
      const result = await deletePesanan(pesanan.id);
      
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
              Buat Pesanan
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
              {mode === "create" ? "Buat Pesanan Baru" : "Edit Pesanan"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Isi detail pesanan katering di bawah ini." 
                : "Perbarui informasi pesanan."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Pelanggan */}
              <FormField
                control={form.control}
                name="idPelanggan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pelanggan *</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(Number(val))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pelanggan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pelangganOptions.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.namaPelanggan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tanggal Acara */}
              <FormField
                control={form.control}
                name="tanggalAcara"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Acara *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status (hanya untuk edit) */}
              {mode === "edit" && (
                <FormField
                  control={form.control}
                  name="statusPesanan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Pesanan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_PESANAN.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Detail Items - Multi Package */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Paket Katering *</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => append({ idPaket: 0, jumlah: 1, subtotal: 0 })}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Tambah Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-3">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Package Select */}
                        <FormField
                          control={form.control}
                          name={`detailPemesanans.${index}.idPaket`}
                          render={({ field: itemField }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">Paket</FormLabel>
                              <Select 
                                onValueChange={(val) => {
                                  const pkgId = Number(val);
                                  itemField.onChange(pkgId);
                                  // Auto-calculate subtotal
                                  const qty = form.getValues(`detailPemesanans.${index}.jumlah`) || 1;
                                  const subtotal = calculateSubtotal(pkgId, qty);
                                  form.setValue(`detailPemesanans.${index}.subtotal`, subtotal);
                                }}
                                defaultValue={String(itemField.value)}
                              >
                                <FormControl>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Pilih paket" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {paketOptions.map((pkg) => (
                                    <SelectItem key={pkg.id} value={String(pkg.id)}>
                                      <div className="flex justify-between w-full">
                                        <span>{pkg.namaPaket}</span>
                                        <Badge variant="outline" className="ml-2">
                                          {formatRupiah(pkg.hargaPaket)}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Quantity */}
                        <FormField
                          control={form.control}
                          name={`detailPemesanans.${index}.jumlah`}
                          render={({ field: itemField }) => (
                            <FormItem className="w-24">
                              <FormLabel className="text-xs">Jumlah</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  className="text-sm"
                                  {...itemField}
                                  onChange={(e) => {
                                    const qty = Number(e.target.value);
                                    itemField.onChange(qty);
                                    // Auto-calculate subtotal
                                    const pkgId = form.getValues(`detailPemesanans.${index}.idPaket`);
                                    const subtotal = calculateSubtotal(pkgId, qty);
                                    form.setValue(`detailPemesanans.${index}.subtotal`, subtotal);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Remove Button */}
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6 text-red-500 hover:text-red-700"
                            onClick={() => remove(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                        
                      <div className="text-right text-sm font-medium text-primary">
                        Subtotal: {formatRupiah(form.watch(`detailPemesanans.${index}.subtotal`) || 0)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Grand Total */}
              <div className="flex justify-end border-t pt-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Pesanan</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatRupiah(grandTotal)}
                  </p>
                </div>
              </div>

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
                  ) : mode === "create" ? "Buat Pesanan" : "Perbarui"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesanan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pesanan #{pesanan?.id} 
              akan dihapus permanen beserta semua detail itemnya.
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
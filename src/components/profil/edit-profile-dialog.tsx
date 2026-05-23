// src/components/profil/edit-profile-dialog.tsx
"use client";
import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/app/actions/profile-actions";
import { pelangganSchema, type PelangganFormData, type ActionResponse } from "@/lib/validations/pelanggan";

interface EditProfileDialogProps {
  profile: {
    id: number;
    namaPelanggan: string;
    alamat1: string | null;
    address2: string | null;
    address3: string | null;
    noTelp: string | null;
    foto: string | null; // ✅ Sekarang Base64 string, bukan Buffer object
  };
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.foto);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PelangganFormData>({
    resolver: zodResolver(pelangganSchema),
    defaultValues: {
      nama_pelanggan: profile.namaPelanggan || "",
      alamat1: profile.alamat1 || "",
      alamat2: profile.address2 || "",
      alamat3: profile.address3 || "",
      no_telp: profile.noTelp || "",
    },
  });

  async function onSubmit(data: PelangganFormData) {
    const formData = new FormData();
    formData.append("nama_pelanggan", data.nama_pelanggan);
    formData.append("no_telp", data.no_telp);
    formData.append("alamat1", data.alamat1);
    formData.append("alamat2", data.alamat2 || "");
    formData.append("alamat3", data.alamat3 || "");

    if (selectedFile) {
      formData.append("foto", selectedFile);
    }

    startTransition(async () => {
      const result: ActionResponse = await updateProfile(formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        form.reset();
      } else if (result.errors) {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File terlalu besar", { description: "Maksimal 2MB" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const displayImageSrc = previewUrl;

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) {
        setPreviewUrl(profile.foto);
        setSelectedFile(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl font-bold shadow-sm">Edit Profil</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Perbarui Profil</DialogTitle>
          <DialogDescription>Silakan perbarui informasi profil dan alamat Anda.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 relative">
                  {displayImageSrc ? (
                    <Image 
                      src={displayImageSrc} 
                      alt="Preview" 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-white" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>

            <FormField 
              control={form.control} 
              name="nama_pelanggan" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nama Lengkap</FormLabel>
                  <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="no_telp" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nomor Telepon</FormLabel>
                  <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="alamat1" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Alamat Utama</FormLabel>
                  <FormControl><Textarea {...field} className="rounded-xl resize-none" rows={3} /></FormControl>
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
                    <FormLabel className="font-bold text-[10px] uppercase text-slate-400">Alamat 2 (Ops)</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl text-xs" /></FormControl>
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="alamat3" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[10px] uppercase text-slate-400">Alamat 3 (Ops)</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl text-xs" /></FormControl>
                  </FormItem>
                )} 
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending} className="rounded-xl bg-slate-900 font-bold px-8">
                {isPending ? <Loader2 className="animate-spin mr-2" /> : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
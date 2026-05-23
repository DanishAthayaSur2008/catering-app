// src/components/pesan/order-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Loader2, Calendar, MessageSquare, Utensils, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createPesananCustomer } from "@/app/actions/pesan-actions";
import { formatRupiah, cn } from "@/lib/utils";
import Image from "next/image";

type Package = {
  id: number;
  namaPaket: string;
  hargaPaket: number;
  menuPaket?: string | null;
  foto?: string | null;
  kategori: string;
};

export function OrderForm({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [tanggalAcara, setTanggalAcara] = useState("");
  const [catatan, setCatatan] = useState("");

  const updateQty = (id: number, delta: number) => {
    setCart(prev => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const pkg = packages.find(p => p.id === Number(id));
    return sum + (pkg ? pkg.hargaPaket * qty : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) return toast.error("Pilih minimal 1 paket");
    if (!tanggalAcara) return toast.error("Pilih tanggal acara");

    startTransition(async () => {
      const items = Object.entries(cart).map(([id, qty]) => ({
        idPaket: Number(id),
        jumlah: qty,
        subtotal: 0 
      }));

      const res = await createPesananCustomer({ items, tanggalAcara, catatan });

      if (res.success && res.id) {
        toast.success(res.message);
        window.location.href = `/pembayaran?id=${res.id}`;
      } else {
        toast.error(res.message || "Terjadi kesalahan");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
      {/* 🍱 LIST PAKET (Kiri) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Pilih Menu Katering
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            {packages.length} Menu Tersedia
          </span>
        </div>

        <div className="grid gap-4">
          {packages.map(pkg => {
            const hasQty = (cart[pkg.id] || 0) > 0;
            return (
              <Card 
                key={pkg.id} 
                className={cn(
                  "overflow-hidden transition-all duration-300 border-2",
                  hasQty ? "border-orange-500 shadow-md ring-1 ring-orange-100" : "border-transparent bg-white shadow-sm hover:border-slate-200"
                )}
              >
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  {/* Foto Paket */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-slate-100 shrink-0">
                    {pkg.foto ? (
                      <Image 
                        src={pkg.foto} 
                        alt={pkg.namaPaket} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Utensils className="h-10 w-10" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-white/90 text-slate-900 backdrop-blur-sm border-none font-bold text-[10px]">
                      {pkg.kategori}
                    </Badge>
                  </div>

                  {/* Info Paket */}
                  <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-black text-lg text-slate-900 leading-tight">{pkg.namaPaket}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 font-medium">
                        {pkg.menuPaket || "Set menu katering lengkap dengan nasi, lauk, sayur, dan pelengkap lainnya."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-lg font-black text-orange-600">
                        {formatRupiah(pkg.hargaPaket)}
                        <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase">/ Porsi</span>
                      </p>

                      {/* Counter */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
                          onClick={() => updateQty(pkg.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-black text-slate-800">{cart[pkg.id] || 0}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
                          onClick={() => updateQty(pkg.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 📋 RINGKASAN (Kanan) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
          <ShoppingCart className="h-5 w-5 text-orange-500" />
          Detail Pesanan
        </h2>

        <Card className="border-none shadow-xl shadow-slate-200/60 bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Input Tanggal */}
            <div className="space-y-3">
              <Label className="font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Tanggal Pengiriman
              </Label>
              <Input 
                type="date" 
                value={tanggalAcara} 
                onChange={e => setTanggalAcara(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
                className="rounded-xl border-slate-200 h-11 font-medium focus:ring-orange-500"
                required 
              />
            </div>

            {/* Input Catatan */}
            <div className="space-y-3">
              <Label className="font-bold text-slate-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Catatan Khusus
              </Label>
              <Textarea 
                placeholder="Contoh: Sambal dipisah, request jam antar, atau info lokasi..." 
                value={catatan} 
                onChange={e => setCatatan(e.target.value)} 
                className="min-h-24 rounded-xl border-slate-200 focus:ring-orange-500" 
              />
            </div>

            {/* List Item Terpilih */}
            <div className="border-t border-dashed border-slate-200 pt-6 space-y-3">
              {Object.entries(cart).length > 0 ? (
                Object.entries(cart).map(([id, qty]) => {
                  const pkg = packages.find(p => p.id === Number(id));
                  return pkg ? (
                    <div key={id} className="flex justify-between items-center animate-in fade-in slide-in-from-right-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{pkg.namaPaket}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{qty} Porsi x {formatRupiah(pkg.hargaPaket)}</span>
                      </div>
                      <span className="font-black text-slate-700 text-sm">{formatRupiah(pkg.hargaPaket * qty)}</span>
                    </div>
                  ) : null;
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400 font-medium italic">Belum ada menu yang dipilih</p>
                </div>
              )}
            </div>

            {/* Total Harga */}
            <div className="border-t border-slate-100 pt-6 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</p>
                <p className="text-2xl font-black text-orange-600 tracking-tighter leading-none">
                  {formatRupiah(total)}
                </p>
              </div>
              <Tag className="h-8 w-8 text-slate-100" />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isPending || Object.keys(cart).length === 0 || !tanggalAcara}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-5 w-5" />
              )}
              {isPending ? "Memproses..." : "Pesan Sekarang"}
            </Button>
            
            <p className="text-[10px] text-slate-400 text-center font-bold px-4">
              Dengan memesan, Anda menyetujui syarat & ketentuan pengantaran katering kami.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
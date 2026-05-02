"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPesananCustomer } from "@/app/actions/pesan-actions";
import { formatRupiah } from "@/lib/utils";
import { Paket } from "@prisma/client"; // ✅ Import tipe langsung dari Prisma

export function OrderForm({ packages }: { packages: Paket[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [tanggalAcara, setTanggalAcara] = useState("");
  const [catatan, setCatatan] = useState("");

  const updateQty = (id: number, delta: number) => {
    setCart(prev => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      if (newQty === 0) {
        const { [id]: _omitted, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  // ✅ Auto-hitung total real-time di client (pakai hargaPaket)
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const pkg = packages.find(p => p.id === Number(id));
    // ✅ Prisma Decimal → convert ke number untuk kalkulasi JS
    return sum + (pkg ? Number(pkg.hargaPaket) * qty : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) return toast.error("Pilih minimal 1 paket");
    if (!tanggalAcara) return toast.error("Pilih tanggal acara");

    startTransition(async () => {
      const items = Object.entries(cart).map(([id, qty]) => ({
        idPaket: Number(id),
        jumlah: qty,
        subtotal: 0 // Server akan hitung ulang untuk keamanan
      }));

      const res = await createPesananCustomer({ items, tanggalAcara, catatan });
      if (res.success) {
        toast.success(res.message);
        router.push("/pesanan");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="text-center space-y-2 py-6">
        <h1 className="text-3xl font-bold">Pesan Katering</h1>
        <p className="text-muted-foreground">Pilih paket, atur jumlah, dan pesan untuk acara Anda.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List Paket */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Daftar Paket Tersedia</h2>
          <div className="grid gap-3">
            {packages.map(pkg => (
              <Card key={pkg.id} className="hover:shadow-md transition-all border-l-4 border-l-primary">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{pkg.namaPaket}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pkg.menuPaket || "Paket katering lengkap"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {pkg.kategori}
                      </span>
                      <p className="text-primary font-medium">
                        {formatRupiah(Number(pkg.hargaPaket))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => updateQty(pkg.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg">
                      {cart[pkg.id] || 0}
                    </span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => updateQty(pkg.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {packages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Belum ada paket tersedia. Hubungi admin untuk info lebih lanjut.
              </p>
            )}
          </div>
        </div>

        {/* Ringkasan & Checkout */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ringkasan Pesanan</h2>
          <Card className="sticky top-24">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Tanggal Acara *</Label>
                <Input 
                  type="date" 
                  value={tanggalAcara} 
                  onChange={e => setTanggalAcara(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea 
                  placeholder="Contoh: Alergi, permintaan khusus, lokasi drop-off, dll." 
                  value={catatan} 
                  onChange={e => setCatatan(e.target.value)} 
                  className="min-h-20" 
                />
              </div>
              
              <div className="border-t pt-3 space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(cart).length > 0 ? (
                  Object.entries(cart).map(([id, qty]) => {
                    const pkg = packages.find(p => p.id === Number(id));
                    if (!pkg) return null;
                    const itemTotal = Number(pkg.hargaPaket) * qty;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span>{pkg.namaPaket} ×{qty}</span>
                        <span className="font-medium">{formatRupiah(itemTotal)}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada paket dipilih
                  </p>
                )}
              </div>
              
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base" 
                disabled={isPending || Object.keys(cart).length === 0 || !tanggalAcara}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buat Pesanan Sekarang
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Pesanan akan masuk ke dashboard admin untuk konfirmasi & penjadwalan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
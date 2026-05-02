// src/components/pembayaran/payment-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Wallet, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// ✅ Hapus Input karena tidak digunakan (fix eslint)
import { createPembayaran } from "@/app/actions/pembayaran-actions";
import { formatRupiah } from "@/lib/utils";
import { METODE_PEMBAYARAN } from "@/types/enums";

type Pesanan = {
  id: number;
  totalHarga: number;
  tanggalAcara: Date;
  detailPemesanans: Array<{ paket: { namaPaket: string }; jumlah: number; subtotal: number }>;
  statusPembayaran?: string | null;
  statusPesanan?: string | null;
};

// Definisi tipe berdasarkan nilai dari Enum METODE_PEMBAYARAN
type MetodePembayaranType = typeof METODE_PEMBAYARAN[keyof typeof METODE_PEMBAYARAN];

export function PaymentForm({ pesanan }: { pesanan: Pesanan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // ✅ FIX: Gunakan typeof untuk merujuk pada tipe data Enum
  const [metode, setMetode] = useState<MetodePembayaranType>(METODE_PEMBAYARAN.TRANSFER_BANK);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createPembayaran({
        idPemesanan: pesanan.id,
        metodePembayaran: metode,
      });
      if (res.success) {
        toast.success("Pembayaran berhasil dikonfirmasi!");
        router.push("/pesanan-saya"); // Sesuaikan route-nya
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Konfirmasi Pembayaran</h1>
      
      <Card>
        <CardHeader><CardTitle>Ringkasan Pesanan #{pesanan.id}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {pesanan.detailPemesanans.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{d.paket.namaPaket} ×{d.jumlah}</span>
              <span className="font-medium">{formatRupiah(d.subtotal)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(pesanan.totalHarga)}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Metode Pembayaran</CardTitle></CardHeader>
          <CardContent>
            {/* ✅ FIX: Ganti 'any' dengan casting ke tipe yang benar */}
            <RadioGroup 
              value={metode} 
              onValueChange={(v) => setMetode(v as MetodePembayaranType)} 
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 w-full">
                  <RadioGroupItem value={METODE_PEMBAYARAN.TRANSFER_BANK} />
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Transfer Bank</p>
                    <p className="text-xs text-muted-foreground">BCA, Mandiri, BNI</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 w-full">
                  <RadioGroupItem value={METODE_PEMBAYARAN.E_WALLET} />
                  <Wallet className="h-5 w-5" />
                  <div>
                    <p className="font-medium">E-Wallet</p>
                    <p className="text-xs text-muted-foreground">GoPay, OVO, DANA</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 w-full">
                  <RadioGroupItem value={METODE_PEMBAYARAN.COD} />
                  <Truck className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Bayar di Tempat (COD)</p>
                    <p className="text-xs text-muted-foreground">Tunai saat pengiriman</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Memproses..." : "Konfirmasi Pembayaran"}
        </Button>
      </form>
    </div>
  );
}
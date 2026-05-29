// src/components/pembayaran/payment-form.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard, Wallet, Truck, Loader2, CheckCircle2, Copy, Receipt, Banknote, Upload, Image as ImageIcon, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { createPembayaran, getPaymentMethods } from "@/app/actions/pembayaran-actions";
import { formatRupiah, cn } from "@/lib/utils";
import Image from 'next/image';
import { bufferToBase64 } from "@/lib/image-utils";

type Pesanan = {
  id: number;
  totalHarga: number;
  tanggalAcara: Date;
  detailPemesanans: Array<{ 
    paket: { namaPaket: string }; 
    jumlah: number; 
    subtotal: number 
  }>;
};

type PaymentMethod = {
  id: number;
  namaPembayaran: string;
  detailJenisPembayarans: Array<{
    id: number;
    tempatPembayaran: string | null;
    noRekening: string | null;
    logoPembayaran: Buffer | Uint8Array | string | null; // ✅ FIX: Diperbarui agar menerima tipe data Buffer/Bytes dari Prisma
  }>;
};

export function PaymentForm({ pesanan }: { pesanan: Pesanan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ✅ 1. DYNAMIC FETCH SEKARANG AMAN TANPA TYPE ERROR
  useEffect(() => {
    getPaymentMethods().then((data) => {
      setPaymentMethods(data as unknown as PaymentMethod[]);
    });
  }, []);

  // Helper untuk mendapatkan icon metode pembayaran secara dinamis
  const getMethodIcon = (namaPembayaran: string) => {
    const nama = namaPembayaran.toUpperCase();
    if (nama.includes("COD")) {
      return <Truck className="h-6 w-6" />;
    } else if (nama.includes("E-WALLET") || nama.includes("WALLET")) {
      return <Wallet className="h-6 w-6" />;
    } else {
      return <Banknote className="h-6 w-6" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File terlalu besar", { description: "Maksimal 5MB" });
        return;
      }
      setBuktiFile(file);
      
      // 🛠️ CARA BARU: Langsung buat blob URL instan untuk preview lokal di browser
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // 🔄 PROSES BACKGROUND: Tetap konversi ke Base64 untuk dikirim ke Server Actions saat submit
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Kita simpan base64 ini ke state previewUrl atau state khusus saat submit
        setPreviewUrl(base64String); 
      };
      reader.readAsDataURL(file); // Mengubah file langsung jadi data:image/...;base64
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nomor rekening berhasil disalin!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethodId) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    startTransition(async () => {
      const buktiBase64 = previewUrl || undefined;

      const res = await createPembayaran({
        idPemesanan: pesanan.id,
        idJenisPembayaran: selectedMethodId,
        idDetailJenisPembayaran: selectedDetailId || undefined,
        metodePembayaran: paymentMethods.find(m => m.id === selectedMethodId)?.namaPembayaran || "",
        buktiFoto: buktiBase64,
      });

      if (res.success) {
        toast.success(res.message);
        router.push("/pesanan-saya");
      } else {
        toast.error(res.message);
      }
    });
  };

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
  const selectedDetail = selectedMethod?.detailJenisPembayarans.find(d => d.id === selectedDetailId);

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
      {/* 💳 PILIHAN METODE PEMBAYARAN (Kiri) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Metode Pembayaran
          </h2>
        </div>

        <RadioGroup 
          value={selectedMethodId?.toString()} 
          onValueChange={(v) => {
            setSelectedMethodId(Number(v));
            setSelectedDetailId(null); 
          }}
          className="grid gap-4"
        >
          {paymentMethods.map((method) => (
            <div key={method.id} className="relative">
              <RadioGroupItem 
                value={method.id.toString()} 
                id={`method-${method.id}`} 
                className="peer sr-only" 
              />
              <Label 
                htmlFor={`method-${method.id}`}
                className={cn(
                  "flex flex-col p-5 border-2 rounded-3xl cursor-pointer transition-all duration-300 bg-white",
                  selectedMethodId === method.id 
                    ? "border-blue-600 ring-4 ring-blue-50" 
                    : "border-slate-100 hover:border-slate-200 shadow-sm"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    selectedMethodId === method.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {getMethodIcon(method.namaPembayaran)}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 leading-none mb-1">
                      {method.namaPembayaran}
                    </p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                      {method.detailJenisPembayarans.length} opsi tersedia
                    </p>
                  </div>
                  {selectedMethodId === method.id && (
                    <CheckCircle2 className="h-6 w-6 text-blue-600 animate-in zoom-in" />
                  )}
                </div>
                
                {/* ✅ FIX LOGIKAL MAP LOGO: Konversi Buffer ke Base64 Data URL sebelum di-render */}
                {selectedMethodId === method.id && method.detailJenisPembayarans.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Pilih Opsi Rekening/Tujuan:</p>
                    {method.detailJenisPembayarans.map((detail) => {
                      
                      // 🛠️ Proses Konversi Logo Pembayaran
                      let finalLogoUrl: string | null = null;
                      if (detail.logoPembayaran) {
                        if (typeof detail.logoPembayaran === "string") {
                          finalLogoUrl = detail.logoPembayaran;
                        } else {
                          const base64Str = Buffer.isBuffer(detail.logoPembayaran)
                            ? detail.logoPembayaran.toString("base64")
                            : Buffer.from(detail.logoPembayaran as Uint8Array).toString("base64");
                          finalLogoUrl = `data:image/png;base64,${base64Str}`;
                        }
                      }

                      return (
                        <Button
                          key={detail.id}
                          type="button"
                          variant={selectedDetailId === detail.id ? "default" : "outline"}
                          className={cn(
                            "w-full h-auto p-4 justify-start rounded-2xl border transition-all duration-200",
                            selectedDetailId === detail.id 
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" 
                              : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
                          )}
                          onClick={(e) => {
                            e.preventDefault(); 
                            setSelectedDetailId(detail.id);
                          }}
                        >
                          {finalLogoUrl && (
                            <Image
                              src={finalLogoUrl} 
                              alt={detail.tempatPembayaran || "Logo"} 
                              width={32}
                              height={32}
                              className="w-8 h-8 mr-3 rounded-lg object-contain bg-white p-0.5 border border-slate-100" 
                              unoptimized
                            />
                          )}
                          <div className="text-left flex-1">
                            <p className="font-bold leading-tight">{detail.tempatPembayaran}</p>
                            {detail.noRekening && (
                              <p className={cn(
                                "text-xs font-mono mt-0.5",
                                selectedDetailId === detail.id ? "text-blue-100" : "text-slate-500"
                              )}>
                                {detail.noRekening}
                              </p>
                            )}
                          </div>
                          {selectedDetailId === detail.id && (
                            <CheckCircle2 className="h-5 w-5 text-white ml-auto" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {selectedMethodId === method.id && selectedDetail && (
                  <div className="mt-4 bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100/80 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {selectedDetail.tempatPembayaran}
                        </p>
                        {selectedDetail.noRekening && (
                          <p className="text-lg font-black text-slate-800 font-mono tracking-tight">
                            {selectedDetail.noRekening}
                          </p>
                        )}
                        <p className="text-xs font-bold text-slate-500">
                          A/N Katering Berkah Jaya
                        </p>
                      </div>
                      {selectedDetail.noRekening && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(selectedDetail.noRekening!);
                          }} 
                          className="rounded-xl font-bold gap-2 bg-white text-slate-700 shadow-sm border-slate-200"
                        >
                          <Copy className="h-3 w-3" /> Salin
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* ✅ UPLOAD BUKTI FOTO (hanya untuk non-COD) */}
        {selectedMethod && !selectedMethod.namaPembayaran.toUpperCase().includes("COD") && (
          <Card className="border-blue-200 bg-blue-50/50 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Upload Bukti Pembayaran</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 bg-white rounded-xl border-slate-200 h-11"
                    required
                  />
                  {buktiFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setBuktiFile(null);
                        setPreviewUrl(null);
                      }}
                      className="rounded-xl hover:bg-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {previewUrl && (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border bg-white shadow-inner mt-2">
                    <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-slate-300" />
                    <Image 
                      src={previewUrl} 
                      alt="Preview Bukti"
                      fill
                      className="object-contain relative z-10 p-2"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Upload screenshot transfer / e-wallet resmi. Format gambar, maksimal 5MB.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 🧾 RINGKASAN TAGIHAN (Kanan) */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          Ringkasan Tagihan
        </h2>

        <Card className="border-none shadow-xl shadow-slate-200/60 bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              {pesanan.detailPemesanans.map((d, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{d.paket.namaPaket}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{d.jumlah} Porsi</p>
                  </div>
                  <span className="font-black text-slate-700 text-sm">{formatRupiah(d.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 pt-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Total yang harus dibayar
                  </p>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter leading-none mt-1">
                    {formatRupiah(pesanan.totalHarga)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>ID Pesanan</span>
                <span className="text-slate-700">#{pesanan.id}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>Status</span>
                <span className="text-orange-500 underline decoration-orange-200 underline-offset-4">
                  Menunggu Pembayaran
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              {isPending ? "Memverifikasi..." : "Konfirmasi Pembayaran"}
            </Button>

            <p className="text-[10px] text-slate-400 text-center font-bold px-4 leading-relaxed">
              Setelah klik konfirmasi, tim kami akan memvalidasi pembayaran Anda dalam waktu maksimal 15 menit.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
// src/app/menu/page.tsx
import { prisma } from "@/lib/prisma";
import { CustomerHeader } from "@/components/layout/customer-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import Image from "next/image";

// Helper: Convert Buffer (Bytes) ke Base64 Data URL
function bufferToBase64(buffer: Buffer | Uint8Array | string | null, mimeType = "image/jpeg"): string | null {
  if (!buffer) return null;
  if (typeof buffer === "string") return buffer;
  try {
    const base64 = Buffer.isBuffer(buffer) 
      ? buffer.toString("base64")
      : Buffer.from(buffer).toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function MenuPage() {
  const packages = await prisma.paket.findMany({
    where: { statusPaket: "aktif" },
    orderBy: { namaPaket: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <CustomerHeader />
      <main className="container py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Menu Katering</h1>
          <p className="text-slate-500">Pilih paket catering terbaik untuk acara spesial Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const fotoUrl = bufferToBase64(pkg.foto as Buffer | Uint8Array | string | null);
            return (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-none shadow-lg">
                <div className="h-48 bg-slate-200 relative">
                  {fotoUrl ? (
                    <Image src={fotoUrl} alt={pkg.namaPaket} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                    {pkg.kategori}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{pkg.namaPaket}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-3">{pkg.menuPaket}</p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-slate-500">Harga per porsi</p>
                      <p className="text-lg font-bold text-orange-600">{formatRupiah(pkg.hargaPaket)}</p>
                    </div>
                    {/* Tombol ini akan mengarah ke halaman /pesan nanti */}
                    {/* <Button size="sm">Pilih Paket</Button> */}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {packages.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p>Belum ada paket katering yang tersedia.</p>
          </div>
        )}
      </main>
    </div>
  );
}
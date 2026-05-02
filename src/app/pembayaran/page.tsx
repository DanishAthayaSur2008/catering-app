// src/app/pembayaran/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { PaymentForm } from "@/components/pembayaran/payment-form";
import { STATUS_PEMBAYARAN } from "@/types/enums";

export default async function PembayaranPage({ searchParams }: { searchParams: { id?: string } }) {
  const session = await auth();
  
  // ✅ Validasi session
  if (session?.user?.level !== "pelanggan") redirect("/auth/login");
  if (!searchParams?.id) redirect("/pesan");

  const orderId = parseInt(searchParams.id, 10);
  const idPelanggan = parseInt(session.user.id, 10);

  if (Number.isNaN(orderId) || Number.isNaN(idPelanggan)) {
    redirect("/pesan");
  }

  // ✅ Query pesanan milik user ini saja
  const pesanan = await prisma.pemesanan.findUnique({
    where: { 
      id: orderId, 
      idPelanggan 
    },
    include: {
      detailPemesanans: { include: { paket: true } },
    }
  });

  if (!pesanan) notFound();

  // ✅ Jika sudah lunas, jangan bayari ulang
  if (pesanan.statusPembayaran === STATUS_PEMBAYARAN.LUNAS) {
    redirect("/pesanan-saya");
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <main className="container py-6">
        <PaymentForm pesanan={pesanan} />
      </main>
    </div>
  );
}
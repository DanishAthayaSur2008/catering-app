import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { OrderForm } from "@/components/pesan/order-form";
import { STATUS_PAKET } from "@/types/enums";


export default async function PesanPage() {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") redirect("/auth/login");

  // ✅ Hanya ambil paket aktif untuk ditampilkan ke customer
  const packages = await prisma.paket
    .findMany({
      where: {
        // Hapus statusPaket, atau tambahkan field ini ke schema jika memang butuh
        statusPaket: STATUS_PAKET.AKTIF, // Hanya ambil paket yang aktif
      },
      orderBy: { namaPaket: "asc" },
      select: {
        id: true,
        namaPaket: true,
        menuPaket: true, // ✅ Wajib
        kategori: true, // ✅ Wajib
        hargaPaket: true, // ✅ Bukan 'harga'
        foto: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    .then((data) =>
      data.map((p) => ({
        ...p,
        harga: p.hargaPaket,
      })),
    );

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <main className="container py-6">
        <OrderForm packages={packages} />
      </main>
    </div>
  );
}

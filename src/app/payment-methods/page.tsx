/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/payment-methods/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  getPaymentMethodsAdmin,
  deleteJenisPembayaran,
  deleteDetailJenisPembayaran,
} from "@/app/actions/payment-method-actions";
import { PaymentMethodFormDialog } from "@/components/payment-methods/payment-method-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, CreditCard, Wallet, Truck } from "lucide-react";
import { bufferToBase64 } from "@/lib/image-utils";
import Image from "next/image";

export default async function PaymentMethodsAdminPage() {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    redirect("/auth/login");
  }

  const paymentMethods = await getPaymentMethodsAdmin();

  const getMethodIcon = (nama: string) => {
    if (nama.toLowerCase().includes("cod")) return <Truck className="h-4 w-4" />;
    if (nama.toLowerCase().includes("e-wallet") || nama.toLowerCase().includes("qris")) return <Wallet className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Kelola Metode Pembayaran</h2>
            <p className="text-muted-foreground">Tambah, edit, atau hapus metode pembayaran yang tersedia untuk pelanggan.</p>
          </div>
          <PaymentMethodFormDialog mode="create-jenis" />
        </div>

        {/* List Payment Methods */}
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getMethodIcon(method.namaPembayaran)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.namaPembayaran}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {method.detailJenisPembayarans.length} opsi tersedia • {method._count.pemesanans} pesanan menggunakan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentMethodFormDialog
                    mode="edit-jenis"
                    jenisPembayaran={{ id: method.id, namaPembayaran: method.namaPembayaran }}
                  />
                  <form action={async () => {
                    "use server";
                    await deleteJenisPembayaran(method.id);
                  }}>
                    <Button type="submit" variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* List Details */}
                {method.detailJenisPembayarans.map((detail) => {
                  const logoUrl = bufferToBase64(detail.logoPembayaran as Buffer | null);

                  return (
                    <div key={detail.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={detail.tempatPembayaran || ""}
                            className="w-10 h-10 rounded object-contain"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                            No Logo
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{detail.tempatPembayaran}</p>
                          {detail.noRekening && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{detail.noRekening}</code>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <PaymentMethodFormDialog
                          mode="edit-detail"
                          detailJenisPembayaran={detail as any}
                          idJenisPembayaran={method.id}
                        />
                        <form action={async () => {
                          "use server";
                          await deleteDetailJenisPembayaran(detail.id);
                        }}>
                          <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })}

                {/* Add Detail Button */}
                <PaymentMethodFormDialog mode="create-detail" idJenisPembayaran={method.id}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Opsi {method.namaPembayaran}
                  </Button>
                </PaymentMethodFormDialog>
              </CardContent>
            </Card>
          ))}

          {paymentMethods.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Belum ada metode pembayaran.</p>
                <PaymentMethodFormDialog mode="create-jenis">
                  <Button variant="link" className="mt-2">Tambah Metode Pembayaran</Button>
                </PaymentMethodFormDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
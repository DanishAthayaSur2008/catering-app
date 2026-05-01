// src/app/page.tsx - PUBLIC LANDING PAGE
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingCart, Truck, Star } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Catering Premium <span className="text-primary">Untuk Setiap Momen</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Pesan katering berkualitas untuk pernikahan, selametan, ulang tahun, 
          atau acara kantor. Praktis, lezat, dan terpercaya.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/register">Daftar Sekarang</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Sudah Punya Akun?</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Paket Beragam</h3>
              <p className="text-sm text-muted-foreground">
                Pilih dari berbagai paket: Nasi Box, Prasmanan, hingga Catering Pernikahan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Pesan Mudah</h3>
              <p className="text-sm text-muted-foreground">
                Pilih paket, tentukan jumlah, dan pesan dalam hitungan menit
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Truck className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Pengiriman Terjamin</h3>
              <p className="text-sm text-muted-foreground">
                Pantau status pengiriman real-time hingga pesanan tiba
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <Star className="h-8 w-8 mx-auto text-yellow-500 mb-4" />
          <blockquote className="text-lg italic mb-4">
            &quot;Pesan catering untuk acara kantor, datang tepat waktu dan rasanya enak! 
            Pasti order lagi.&quot;
          </blockquote>
          <p className="font-medium">— Budi S., Customer Setia</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground border-t">
        <p>© 2024 Catering Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}